import { requireAuthenticationPage } from "@/auth/server";
import { IframeLayout } from "@/common/components/layouts/iframe/IframeLayout";
import { type Metadata } from "next";

export const revalidate = 86400; // 24 hours

export const metadata: Metadata = {
  title: "SILO-Anfrage | S.A.M. - Sinister Incorporated",
};

export default async function Page() {
  await requireAuthenticationPage("/app/silo-request");

  return (
    <IframeLayout url="https://docs.google.com/forms/d/e/1FAIpQLSeHEgpv4GmnZhu7MS2aQc9zgETWQw8tusJ7oaGLsyuHeD1LMw/viewform" />
  );
}
