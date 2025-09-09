import { requireAuthenticationPage } from "@/auth/server";
import { IframeLayout } from "@/common/components/layouts/IframeLayout";
import { getDocuments } from "@/documents/utils/queries";
import { type Metadata } from "next";
import { notFound } from "next/navigation";

export const revalidate = 86400; // 24 hours

export const metadata: Metadata = {
  title: "Onboarding | S.A.M. - Sinister Incorporated",
};

export default async function Page({
  params,
}: PageProps<"/app/documents/[...slug]">) {
  await requireAuthenticationPage("/app/documents/[...slug]");

  const { slug } = await params;

  const categories = await getDocuments();

  const document = categories
    .flatMap((category) => category.documents)
    .find((document) => document.slug === slug[0]);

  if (!document) notFound();

  return (
    <IframeLayout
      src={document.href}
      iframeProps={{
        sandbox: "allow-scripts allow-same-origin allow-forms allow-downloads",
      }}
    />
  );
}
