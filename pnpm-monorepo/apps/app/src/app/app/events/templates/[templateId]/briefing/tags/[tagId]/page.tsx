import { requireAuthenticationPage } from "@/modules/auth/server";
import { SuspenseWithErrorBoundaryTile } from "@/modules/common/components/SuspenseWithErrorBoundaryTile";
import { toTemplateContainer } from "@/modules/events/utils/eventContainer";
import { WikiTagPageContent } from "@/modules/wiki/components/WikiTagPageContent";
import { getEventWikiContext } from "@/modules/wiki/queries/getEventWikiContext";
import { getWikiTagPages } from "@/modules/wiki/queries/getWikiTagPages";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

type Params =
  PageProps<"/app/events/templates/[templateId]/briefing/tags/[tagId]">["params"];

/**
 * Metadata runs independently of the layout's 404 gate. The wrapper applies
 * the briefing gate itself — otherwise the tag name would reach the document
 * title for viewers the layout turns away.
 */
export const generateMetadata = async (
  props: PageProps<"/app/events/templates/[templateId]/briefing/tags/[tagId]">,
): Promise<Metadata> => {
  const { templateId, tagId } = await props.params;
  const context = await getEventWikiContext(toTemplateContainer(templateId));
  if (!context) return {};

  const tagPages = await getWikiTagPages(context, tagId);
  if (!tagPages) return {};
  return { title: `Tag: ${tagPages.name}` };
};

/** Pages of one tag inside a template's briefing blueprint */
export default async function Page(
  props: PageProps<"/app/events/templates/[templateId]/briefing/tags/[tagId]">,
) {
  await requireAuthenticationPage(
    "/app/events/templates/[templateId]/briefing/tags/[tagId]",
  );

  return (
    <SuspenseWithErrorBoundaryTile>
      <TagPageList params={props.params} />
    </SuspenseWithErrorBoundaryTile>
  );
}

interface TagPageListProps {
  readonly params: Params;
}

const TagPageList = async ({ params }: TagPageListProps) => {
  const { templateId, tagId } = await params;
  const context = await getEventWikiContext(toTemplateContainer(templateId));
  if (!context) notFound();

  const tagPages = await getWikiTagPages(context, tagId);
  if (!tagPages) notFound();

  return <WikiTagPageContent tagName={tagPages.name} pages={tagPages.pages} />;
};
