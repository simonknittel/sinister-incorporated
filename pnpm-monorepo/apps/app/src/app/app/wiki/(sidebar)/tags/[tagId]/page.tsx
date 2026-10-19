import { requireAuthenticationPage } from "@/modules/auth/server";
import { SuspenseWithErrorBoundaryTile } from "@/modules/common/components/SuspenseWithErrorBoundaryTile";
import { WikiTagPageContent } from "@/modules/wiki/components/WikiTagPageContent";
import { getWikiContext } from "@/modules/wiki/queries/getWikiContext";
import { getWikiTagPages } from "@/modules/wiki/queries/getWikiTagPages";
import type { Metadata } from "next";
import { forbidden, notFound } from "next/navigation";

type Params = PageProps<"/app/wiki/tags/[tagId]">["params"];

export const generateMetadata = async (
  props: PageProps<"/app/wiki/tags/[tagId]">,
): Promise<Metadata> => {
  const [context, { tagId }] = await Promise.all([
    getWikiContext(),
    props.params,
  ]);
  if (!context) return {};

  const tagPages = await getWikiTagPages(context, tagId);
  if (!tagPages) return {};
  return { title: `Tag: ${tagPages.name}` };
};

export default async function Page(props: PageProps<"/app/wiki/tags/[tagId]">) {
  await requireAuthenticationPage("/app/wiki");

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
  const [context, { tagId }] = await Promise.all([getWikiContext(), params]);
  if (!context) forbidden();

  const tagPages = await getWikiTagPages(context, tagId);
  if (!tagPages) notFound();

  return <WikiTagPageContent tagName={tagPages.name} pages={tagPages.pages} />;
};
