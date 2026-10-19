import { requireAuthenticationPage } from "@/modules/auth/server";
import { SuspenseWithErrorBoundaryTile } from "@/modules/common/components/SuspenseWithErrorBoundaryTile";
import { toEventContainer } from "@/modules/events/utils/eventContainer";
import { WikiTagPageContent } from "@/modules/wiki/components/WikiTagPageContent";
import { getEventWikiContext } from "@/modules/wiki/queries/getEventWikiContext";
import { getWikiTagPages } from "@/modules/wiki/queries/getWikiTagPages";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

type Params = PageProps<"/app/events/[id]/briefing/tags/[tagId]">["params"];

/**
 * Metadata runs independently of the layout's 404 gate. The wrapper applies
 * the briefing gate itself — otherwise the tag name would reach the document
 * title for viewers the layout turns away.
 */
export const generateMetadata = async (
  props: PageProps<"/app/events/[id]/briefing/tags/[tagId]">,
): Promise<Metadata> => {
  const { id, tagId } = await props.params;
  const context = await getEventWikiContext(toEventContainer(id));
  if (!context) return {};

  const tagPages = await getWikiTagPages(context, tagId);
  if (!tagPages) return {};
  return { title: `Tag: ${tagPages.name}` };
};

/**
 * Pages of one event wiki tag — the briefing's counterpart of the global
 * wiki's tag route, scoped to the event's own tags.
 */
export default async function Page(
  props: PageProps<"/app/events/[id]/briefing/tags/[tagId]">,
) {
  await requireAuthenticationPage("/app/events/[id]/briefing/tags/[tagId]");

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
  const { id, tagId } = await params;
  const context = await getEventWikiContext(toEventContainer(id));
  if (!context) notFound();

  const tagPages = await getWikiTagPages(context, tagId);
  if (!tagPages) notFound();

  return <WikiTagPageContent tagName={tagPages.name} pages={tagPages.pages} />;
};
