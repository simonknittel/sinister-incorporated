import { getExternalAppBySlug } from "@/modules/apps/utils/queries";
import { requireAuthenticationPage } from "@/modules/auth/server";
import { DefaultLayout } from "@/modules/common/components/layouts/DefaultLayout";
import { IframeLayout } from "@/modules/common/components/layouts/IframeLayout";
import { generateMetadataWithTryCatch } from "@/modules/common/utils/generateMetadataWithTryCatch";
import { notFound } from "next/navigation";

type Params = Promise<{
  slug: string[];
}>;

export const generateMetadata = generateMetadataWithTryCatch(
  async (props: { params: Params }) => {
    const { slug } = await props.params;
    const app = await getExternalAppBySlug(slug[0]);
    if (!app) notFound();

    return {
      title: `${app.name} | S.A.M. - Sinister Incorporated`,
      description: app.description || undefined,
    };
  },
);

export default async function Page({
  params,
}: PageProps<"/app/external/[...slug]">) {
  await requireAuthenticationPage("/app/external/[...slug]");

  const { slug } = await params;
  const app = await getExternalAppBySlug(slug[0]);
  if (!app) notFound();

  let iframeUrl: string;
  if (slug.length > 1) {
    if (!app.pages || app.pages.length <= 0) notFound();

    const currentPageSlug = slug.slice(1).join("/");
    const page = app.pages
      .filter((page) => "slug" in page)
      .find((page) => page.slug === currentPageSlug);
    if (!page || !("iframeUrl" in page) || !page.iframeUrl) notFound();
    iframeUrl = page.iframeUrl;
  } else {
    iframeUrl = app.defaultPage.iframeUrl;
  }

  const pages = app.pages
    ?.filter((page) => "slug" in page || "externalUrl" in page)
    .map((page) => {
      if ("slug" in page && page.slug) {
        return {
          ...page,
          url: `/app/external/${app.slug}/${page.slug}`,
        };
      }

      if ("externalUrl" in page && page.externalUrl) {
        return {
          ...page,
          url: page.externalUrl,
          external: true,
        };
      }

      throw new Error("Page must have either a slug or an externalUrl");
    });

  return (
    <DefaultLayout title={app.name} pages={pages} slug={`external/${app.slug}`}>
      <IframeLayout src={iframeUrl} />
    </DefaultLayout>
  );
}
