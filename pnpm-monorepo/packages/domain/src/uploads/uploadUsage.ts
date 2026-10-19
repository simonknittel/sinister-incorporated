/**
 * Where an upload is referenced. `Unused` is not a usage: it is the absence
 * of all usages. `listUploadUsages` never gives it. Only the usage filter and
 * the badge of an upload without a reference use it.
 *
 * Each other type is one usage relation of the `Upload` model. The rule of
 * the upload usage is `UPLOAD_USAGE_RELATIONS` (`uploadUsageRelations.ts`).
 */
export enum UploadUsageType {
  RoleIcon = "roleIcon",
  RoleThumbnail = "roleThumbnail",
  ManufacturerLogo = "manufacturerLogo",
  EventCover = "eventCover",
  EventTemplateCover = "eventTemplateCover",
  WikiPageIcon = "wikiPageIcon",
  WikiPageAttachment = "wikiPageAttachment",
  WikiPageSnapshot = "wikiPageSnapshot",
  Unused = "unused",
}

/**
 * The labels of the upload manager. The audit event of a deleted upload
 * writes them into its `locations`, thus a changed label changes only the
 * new audit events.
 */
export const UPLOAD_USAGE_TYPE_LABELS: Readonly<
  Record<UploadUsageType, string>
> = {
  [UploadUsageType.RoleIcon]: "Rollen-Icon",
  [UploadUsageType.RoleThumbnail]: "Rollen-Thumbnail",
  [UploadUsageType.ManufacturerLogo]: "Hersteller-Bild",
  [UploadUsageType.EventCover]: "Event-Titelbild",
  [UploadUsageType.EventTemplateCover]: "Vorlagen-Titelbild",
  [UploadUsageType.WikiPageIcon]: "Wiki-Icon",
  [UploadUsageType.WikiPageAttachment]: "Wiki-Bild/-Anhang",
  [UploadUsageType.WikiPageSnapshot]: "Wiki-Snapshot",
  [UploadUsageType.Unused]: "Unbenutzt",
};

interface UploadUsageNamedResource {
  readonly id: string;
  readonly name: string;
}

/** A wiki page with the fields of its route */
export interface UploadUsageWikiPage {
  readonly id: string;
  readonly title: string;
  readonly slug: string;
  readonly eventId: string | null;
  readonly templateId: string | null;
}

/** The usage relations of an upload */
export interface UploadUsageSource {
  readonly roleIcons: readonly UploadUsageNamedResource[];
  readonly roleThumbnails: readonly UploadUsageNamedResource[];
  readonly manufacturers: readonly UploadUsageNamedResource[];
  readonly eventCovers: readonly UploadUsageNamedResource[];
  readonly eventTemplateCovers: readonly UploadUsageNamedResource[];
  readonly wikiPageIcons: readonly UploadUsageWikiPage[];
  /** One link for each page, also when the page uses the upload two times */
  readonly wikiPageLinks: readonly { readonly page: UploadUsageWikiPage }[];
  readonly wikiPageSnapshotLinks: readonly {
    readonly snapshot: { readonly page: UploadUsageWikiPage };
  }[];
}

interface UploadUsageLocationFields {
  /** Unique in the usages of one upload, for the React keys */
  readonly key: string;
  /** The name of the resource, for example the name of the role */
  readonly label: string;
}

/** One place where an upload is referenced */
export type UploadUsageLocation = UploadUsageLocationFields &
  (
    | {
        readonly type:
          | UploadUsageType.RoleIcon
          | UploadUsageType.RoleThumbnail
          | UploadUsageType.ManufacturerLogo
          | UploadUsageType.EventCover
          | UploadUsageType.EventTemplateCover;
        readonly resource: { readonly id: string };
      }
    | {
        readonly type:
          | UploadUsageType.WikiPageIcon
          | UploadUsageType.WikiPageAttachment
          | UploadUsageType.WikiPageSnapshot;
        readonly resource: UploadUsageWikiPage;
      }
  );

/**
 * The snapshots of a page often use the same upload many times. The usage is
 * the page, one time.
 */
const getSnapshotPages = (
  links: UploadUsageSource["wikiPageSnapshotLinks"],
) => [
  ...new Map(
    links.map(({ snapshot }) => [snapshot.page.id, snapshot.page]),
  ).values(),
];

/**
 * All places where an upload is referenced, in the sequence of the upload
 * manager. An empty result means that the upload is unused, and the nightly
 * cleanup deletes it.
 */
export const listUploadUsages = (
  upload: UploadUsageSource,
): UploadUsageLocation[] => [
  ...upload.roleIcons.map((role) => ({
    type: UploadUsageType.RoleIcon as const,
    key: `${UploadUsageType.RoleIcon}:${role.id}`,
    label: role.name,
    resource: { id: role.id },
  })),

  ...upload.roleThumbnails.map((role) => ({
    type: UploadUsageType.RoleThumbnail as const,
    key: `${UploadUsageType.RoleThumbnail}:${role.id}`,
    label: role.name,
    resource: { id: role.id },
  })),

  ...upload.manufacturers.map((manufacturer) => ({
    type: UploadUsageType.ManufacturerLogo as const,
    key: `${UploadUsageType.ManufacturerLogo}:${manufacturer.id}`,
    label: manufacturer.name,
    resource: { id: manufacturer.id },
  })),

  ...upload.eventCovers.map((event) => ({
    type: UploadUsageType.EventCover as const,
    key: `${UploadUsageType.EventCover}:${event.id}`,
    label: event.name,
    resource: { id: event.id },
  })),

  ...upload.eventTemplateCovers.map((template) => ({
    type: UploadUsageType.EventTemplateCover as const,
    key: `${UploadUsageType.EventTemplateCover}:${template.id}`,
    label: template.name,
    resource: { id: template.id },
  })),

  ...upload.wikiPageIcons.map((page) => ({
    type: UploadUsageType.WikiPageIcon as const,
    key: `${UploadUsageType.WikiPageIcon}:${page.id}`,
    label: page.title,
    resource: page,
  })),

  ...upload.wikiPageLinks.map(({ page }) => ({
    type: UploadUsageType.WikiPageAttachment as const,
    key: `${UploadUsageType.WikiPageAttachment}:${page.id}`,
    label: page.title,
    resource: page,
  })),

  ...getSnapshotPages(upload.wikiPageSnapshotLinks).map((page) => ({
    type: UploadUsageType.WikiPageSnapshot as const,
    key: `${UploadUsageType.WikiPageSnapshot}:${page.id}`,
    label: page.title,
    resource: page,
  })),
];
