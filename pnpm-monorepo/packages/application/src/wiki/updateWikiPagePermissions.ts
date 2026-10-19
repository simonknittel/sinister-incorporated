import {
  WikiPageAccessType,
  WikiPageEditability,
  WikiPageUploadability,
  WikiPageVisibility,
} from "@sam-monorepo/database/client";
import {
  AuditEventType,
  collectWikiPageDescendants,
  createWikiPagePermissionResolver,
  resolveWikiPageReadRoleIds,
  type AuditEventInput,
} from "@sam-monorepo/domain";
import * as z from "zod";
import type { Actor } from "../actor.js";
import type { ApplicationContext } from "../context.js";
import {
  ForbiddenError,
  NotFoundError,
  ValidationError,
  rethrowRecordNotFound,
} from "../errors.js";
import { idSchema } from "../pagination.js";
import { withSpan } from "../withSpan.js";
import type { WikiContextPage } from "./wikiContext.js";
import {
  WikiErrorMessage,
  WikiRolesCannotReadParentError,
} from "./wikiErrors.js";
import { collectWikiPageRolePrunes } from "./wikiPageRolePrunes.js";
import {
  findWikiPermissionRoles,
  toWikiPageViewerOfCitizen,
} from "./wikiPermissionRoles.js";
import { loadWikiScope } from "./wikiScope.js";
import { WikiScopeKind } from "./wikiScopeKind.js";

/** Where the owner of a page comes from */
export enum WikiPageOwnerMode {
  /** The owner of the nearest ancestor with an owner */
  Inherit = "inherit",
  /** An own owner */
  Explicit = "explicit",
}

/** The most roles of one access type on one page: a limit for the request */
const MAXIMUM_WIKI_PAGE_ACCESS_ROLES = 50;

const accessRoleIdsSchema = z
  .array(idSchema)
  .max(MAXIMUM_WIKI_PAGE_ACCESS_ROLES);

export const updateWikiPagePermissionsInputSchema = z.object({
  page_id: idSchema,
  visibility: z.enum(WikiPageVisibility),
  editability: z.enum(WikiPageEditability),
  image_uploadability: z.enum(WikiPageUploadability),
  attachment_uploadability: z.enum(WikiPageUploadability),
  read_role_ids: accessRoleIdsSchema,
  edit_role_ids: accessRoleIdsSchema,
  admin_role_ids: accessRoleIdsSchema,
  /**
   * Each cascade resets the tier of all descendants to INHERIT and removes
   * their role lists of that tier
   */
  cascade_visibility: z.boolean(),
  cascade_editability: z.boolean(),
  /** Removes the manager roles of all descendants (there is no tier) */
  cascade_admin_roles: z.boolean(),
  cascade_image_uploadability: z.boolean(),
  cascade_attachment_uploadability: z.boolean(),
  /** Resets the owner of all descendants to the inherited owner */
  cascade_owner: z.boolean(),
  owner_mode: z.enum(WikiPageOwnerMode),
  /** Required for `WikiPageOwnerMode.Explicit` */
  new_owner_id: idSchema.optional(),
});

export type UpdateWikiPagePermissionsInput = z.infer<
  typeof updateWikiPagePermissionsInputSchema
>;

export interface UpdateWikiPagePermissionsOutput {
  readonly page_id: string;
  /**
   * The number of the descendants that lost role access entries, because
   * the roles cannot read the page above them after the update
   */
  readonly pruned_page_count: number;
}

/** The audit value of a tier that a cascade does not change */
const UNCHANGED_TIER = "unchanged";

/**
 * Updates the permissions and the owner of a page of the global wiki, and
 * optionally of all its descendants
 *
 * @throws NotFoundError when the page is not a page of the global wiki or
 * is in the trash
 * @throws ForbiddenError when the actor cannot manage the page
 * @throws ValidationError for a combination that the page cannot have
 * @throws WikiRolesCannotReadParentError when a selected role cannot read
 * the parent page
 */
export const updateWikiPagePermissions = (
  context: ApplicationContext,
  actor: Actor,
  input: UpdateWikiPagePermissionsInput,
): Promise<UpdateWikiPagePermissionsOutput> =>
  withSpan(context, "updateWikiPagePermissions", async () => {
    const scope = await loadWikiScope(context, actor, {
      kind: WikiScopeKind.Wiki,
    });
    const page = scope?.pagesById.get(input.page_id);
    if (!scope || !page || page.deletedAt)
      throw new NotFoundError(WikiErrorMessage.PageNotFound);
    if (!scope.permissions.get(page.id)?.canAdmin)
      throw new ForbiddenError("The actor cannot manage the wiki page");

    /**
     * A top-level page cannot inherit: there is nothing to inherit from. A
     * child page cannot be public: the read access only narrows downwards,
     * thus "public" below a restricted page is a promise that the resolver
     * cannot keep.
     */
    if (
      !page.parentId &&
      (input.visibility === WikiPageVisibility.INHERIT ||
        input.editability === WikiPageEditability.INHERIT ||
        input.image_uploadability === WikiPageUploadability.INHERIT ||
        input.attachment_uploadability === WikiPageUploadability.INHERIT)
    )
      throw new ValidationError("A top-level page cannot inherit a tier");

    /**
     * The parent comes from the scope, and the write takes no lock of the
     * tree: a move of the page below a parent at the same time makes the
     * PUBLIC write fail the CHECK constraint `WikiPage_public_top_level_check`
     * (a known defect)
     */
    if (page.parentId && input.visibility === WikiPageVisibility.PUBLIC)
      throw new ValidationError("A child page cannot be public");

    /**
     * The inherited owner comes from the ancestors (child pages only: a
     * top-level page without an own owner has only the managers of
     * `wiki;manage`). An own owner must be an existing citizen. A deleted
     * citizen is accepted too (a known defect).
     */
    const newOwnerId =
      input.owner_mode === WikiPageOwnerMode.Inherit
        ? null
        : (input.new_owner_id ?? null);
    if (input.owner_mode === WikiPageOwnerMode.Explicit) {
      if (!newOwnerId)
        throw new ValidationError("An own owner needs a citizen");

      const owner = await context.prisma.citizen.findUnique({
        where: { id: newOwnerId },
        select: { id: true },
      });
      if (!owner) throw new ValidationError("The owner does not exist");
    }
    if (!page.parentId && !newOwnerId)
      throw new ValidationError("A top-level page needs an own owner");

    const roles = await findWikiPermissionRoles(context);
    const readRoleIds = [...new Set(input.read_role_ids)];
    const editRoleIds = [...new Set(input.edit_role_ids)];
    const adminRoleIds = [...new Set(input.admin_role_ids)];

    /**
     * Nobody gets access to a page that they cannot reach: each role and the
     * own owner must be able to read the parent. The pickers offer only such
     * roles, thus this finds the entries that lost their access to the
     * parent in the meantime. The names of the roles help more than a part
     * of the selection that disappears silently.
     */
    if (page.parentId) {
      const allowedRoleIds = resolveWikiPageReadRoleIds(
        scope.allPages,
        roles,
        page.parentId,
      );
      const rejectedRoleIds = [
        ...new Set([
          ...readRoleIds,
          ...editRoleIds,
          ...adminRoleIds,
        ]).difference(allowedRoleIds),
      ];
      if (rejectedRoleIds.length > 0)
        throw new WikiRolesCannotReadParentError(
          rejectedRoleIds.map(
            (roleId) =>
              roles.find((role) => role.id === roleId)?.name ?? roleId,
          ),
        );

      if (newOwnerId) {
        const ownerViewer = await toWikiPageViewerOfCitizen(
          context,
          newOwnerId,
        );
        const ownerCanReachPage = createWikiPagePermissionResolver(
          scope.allPages,
          ownerViewer,
        ).get(page.parentId)?.canRead;
        if (!ownerCanReachPage)
          throw new ValidationError(WikiErrorMessage.OwnerCannotReadParent);
      }
    }

    const roleAccess = [
      ...readRoleIds.map((roleId) => ({
        pageId: page.id,
        roleId,
        type: WikiPageAccessType.READ,
      })),
      ...editRoleIds.map((roleId) => ({
        pageId: page.id,
        roleId,
        type: WikiPageAccessType.EDIT,
      })),
      ...adminRoleIds.map((roleId) => ({
        pageId: page.id,
        roleId,
        type: WikiPageAccessType.ADMIN,
      })),
    ];

    /**
     * The manager of a page manages its full subtree, thus there is no
     * descendant that the actor cannot change
     */
    const descendantIds = collectWikiPageDescendants(scope.pages, page.id);

    const anyCascade =
      input.cascade_visibility ||
      input.cascade_editability ||
      input.cascade_admin_roles ||
      input.cascade_image_uploadability ||
      input.cascade_attachment_uploadability;

    const ownerCascadeIds = input.cascade_owner
      ? descendantIds.filter((id) => scope.pagesById.get(id)?.ownerId !== null)
      : [];

    /**
     * The descendants whose role access gives nothing after the update,
     * because this page or a cascade narrowed their access. The prunes come
     * from the pages as they are after the update. The descendants in the
     * trash are included, thus a restore cannot bring dead entries back.
     */
    const cascadedIds = new Set(descendantIds);
    const ownerCascadeIdSet = new Set(ownerCascadeIds);
    const updatedPages: WikiContextPage[] = scope.allPages.map((entry) => {
      if (entry.id === page.id)
        return {
          ...entry,
          visibility: input.visibility,
          editability: input.editability,
          imageUploadability: input.image_uploadability,
          attachmentUploadability: input.attachment_uploadability,
          ownerId: newOwnerId,
          roleAccess: roleAccess.map(({ roleId, type }) => ({ roleId, type })),
        };

      if (!cascadedIds.has(entry.id)) return entry;

      return {
        ...entry,
        visibility: input.cascade_visibility
          ? WikiPageVisibility.INHERIT
          : entry.visibility,
        editability: input.cascade_editability
          ? WikiPageEditability.INHERIT
          : entry.editability,
        imageUploadability: input.cascade_image_uploadability
          ? WikiPageUploadability.INHERIT
          : entry.imageUploadability,
        attachmentUploadability: input.cascade_attachment_uploadability
          ? WikiPageUploadability.INHERIT
          : entry.attachmentUploadability,
        ownerId: ownerCascadeIdSet.has(entry.id) ? null : entry.ownerId,
        roleAccess: entry.roleAccess.filter(
          (access) =>
            !(
              input.cascade_visibility &&
              access.type === WikiPageAccessType.READ
            ) &&
            !(
              input.cascade_editability &&
              access.type === WikiPageAccessType.EDIT
            ) &&
            !(
              input.cascade_admin_roles &&
              access.type === WikiPageAccessType.ADMIN
            ),
        ),
      };
    });

    const prunes = collectWikiPageRolePrunes(
      updatedPages,
      roles,
      collectWikiPageDescendants(scope.allPages, page.id),
    );

    const { prisma } = context;
    const hasDescendants = descendantIds.length > 0;
    await rethrowRecordNotFound(
      () =>
        prisma.$transaction([
          prisma.wikiPage.update({
            where: { id: page.id },
            data: {
              visibility: input.visibility,
              editability: input.editability,
              imageUploadability: input.image_uploadability,
              attachmentUploadability: input.attachment_uploadability,
              ownerId: newOwnerId,
              updatedById: actor.citizen?.id ?? null,
            },
          }),
          ...(ownerCascadeIds.length > 0
            ? [
                prisma.wikiPage.updateMany({
                  where: { id: { in: ownerCascadeIds } },
                  data: { ownerId: null },
                }),
              ]
            : []),
          prisma.wikiPageRoleAccess.deleteMany({ where: { pageId: page.id } }),
          prisma.wikiPageRoleAccess.createMany({ data: roleAccess }),
          ...(hasDescendants && input.cascade_visibility
            ? [
                prisma.wikiPage.updateMany({
                  where: { id: { in: descendantIds } },
                  data: { visibility: WikiPageVisibility.INHERIT },
                }),
                prisma.wikiPageRoleAccess.deleteMany({
                  where: {
                    pageId: { in: descendantIds },
                    type: WikiPageAccessType.READ,
                  },
                }),
              ]
            : []),
          ...(hasDescendants && input.cascade_editability
            ? [
                prisma.wikiPage.updateMany({
                  where: { id: { in: descendantIds } },
                  data: { editability: WikiPageEditability.INHERIT },
                }),
                prisma.wikiPageRoleAccess.deleteMany({
                  where: {
                    pageId: { in: descendantIds },
                    type: WikiPageAccessType.EDIT,
                  },
                }),
              ]
            : []),
          /** Manage has no tier to reset, only the additional manager roles */
          ...(hasDescendants && input.cascade_admin_roles
            ? [
                prisma.wikiPageRoleAccess.deleteMany({
                  where: {
                    pageId: { in: descendantIds },
                    type: WikiPageAccessType.ADMIN,
                  },
                }),
              ]
            : []),
          /** The upload tiers have no role lists to remove */
          ...(hasDescendants && input.cascade_image_uploadability
            ? [
                prisma.wikiPage.updateMany({
                  where: { id: { in: descendantIds } },
                  data: { imageUploadability: WikiPageUploadability.INHERIT },
                }),
              ]
            : []),
          ...(hasDescendants && input.cascade_attachment_uploadability
            ? [
                prisma.wikiPage.updateMany({
                  where: { id: { in: descendantIds } },
                  data: {
                    attachmentUploadability: WikiPageUploadability.INHERIT,
                  },
                }),
              ]
            : []),
          ...(prunes.length > 0
            ? [
                prisma.wikiPageRoleAccess.deleteMany({
                  where: {
                    OR: prunes.map((prune) => ({
                      pageId: prune.pageId,
                      roleId: { in: prune.roleIds },
                    })),
                  },
                }),
              ]
            : []),
        ]),
      WikiErrorMessage.PageNotFound,
    );

    const auditEvents: AuditEventInput[] = [
      {
        type: AuditEventType.WIKI_PAGE_PERMISSIONS_UPDATED,
        data: {
          pageId: page.id,
          visibility: input.visibility,
          editability: input.editability,
          imageUploadability: input.image_uploadability,
          attachmentUploadability: input.attachment_uploadability,
          readRoleIds,
          /**
           * The system log keeps these two lists as the form sent them,
           * with duplicates
           */
          editRoleIds: input.edit_role_ids,
          adminRoleIds: input.admin_role_ids,
          cascaded: false,
        },
        createdById: actor.userId,
      },
      ...(anyCascade
        ? descendantIds.map((id): AuditEventInput => ({
            type: AuditEventType.WIKI_PAGE_PERMISSIONS_UPDATED,
            data: {
              pageId: id,
              visibility: input.cascade_visibility
                ? WikiPageVisibility.INHERIT
                : UNCHANGED_TIER,
              editability: input.cascade_editability
                ? WikiPageEditability.INHERIT
                : UNCHANGED_TIER,
              imageUploadability: input.cascade_image_uploadability
                ? WikiPageUploadability.INHERIT
                : UNCHANGED_TIER,
              attachmentUploadability: input.cascade_attachment_uploadability
                ? WikiPageUploadability.INHERIT
                : UNCHANGED_TIER,
              readRoleIds: [],
              editRoleIds: [],
              adminRoleIds: [],
              cascaded: true,
            },
            createdById: actor.userId,
          }))
        : []),
      ...prunes.map((prune): AuditEventInput => ({
        type: AuditEventType.WIKI_PAGE_ROLE_ACCESS_PRUNED,
        data: {
          pageId: prune.pageId,
          removedRoleIds: prune.roleIds,
          trigger: "PERMISSIONS_UPDATED",
        },
        createdById: actor.userId,
      })),
      ...(newOwnerId !== page.ownerId
        ? [
            {
              type: AuditEventType.WIKI_PAGE_OWNERSHIP_TRANSFERRED,
              data: {
                pageId: page.id,
                previousOwnerId: page.ownerId,
                newOwnerId,
                cascaded: false,
              },
              createdById: actor.userId,
            } satisfies AuditEventInput,
          ]
        : []),
      ...ownerCascadeIds.map((id): AuditEventInput => ({
        type: AuditEventType.WIKI_PAGE_OWNERSHIP_TRANSFERRED,
        data: {
          pageId: id,
          previousOwnerId: scope.pagesById.get(id)?.ownerId ?? null,
          newOwnerId: null,
          cascaded: true,
        },
        createdById: actor.userId,
      })),
    ];
    await context.audit.create(auditEvents);

    return { page_id: page.id, pruned_page_count: prunes.length };
  });
