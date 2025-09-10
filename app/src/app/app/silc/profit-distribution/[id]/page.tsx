import { requireAuthenticationPage } from "@/auth/server";
import { type Metadata } from "next";

export const metadata: Metadata = {
  title: "Gewinnausschüttung - SILC | S.A.M. - Sinister Incorporated",
};

export default async function Page({
  params,
}: PageProps<"/app/silc/profit-distribution/[id]">) {
  await requireAuthenticationPage("/app/silc/profit-distribution/[id]");

  const { id } = await params;

  return <>{id}</>;
}
