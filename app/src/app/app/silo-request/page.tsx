import { authenticatePage } from "@/auth/server";
import { IframePage } from "@/common/components/IframePage";
import { type Metadata } from "next";

export const revalidate = 86400; // 24 hours

export const metadata: Metadata = {
  title: "SILO-Anfrage | S.A.M. - Sinister Incorporated",
};

export default async function Page() {
  await authenticatePage("/app/silo-request");

  return (
    <IframePage url="https://docs.google.com/forms/d/e/1FAIpQLSeHEgpv4GmnZhu7MS2aQc9zgETWQw8tusJ7oaGLsyuHeD1LMw/viewform" />
  );
}
