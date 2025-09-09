import { requireAuthenticationPage } from "@/auth/server";
import { IframeLayout } from "@/common/components/layouts/iframe/IframeLayout";
import { type Metadata } from "next";

export const revalidate = 86400; // 24 hours

export const metadata: Metadata = {
  title: "Dogfight Trainer | S.A.M. - Sinister Incorporated",
};

export default async function Page() {
  await requireAuthenticationPage("/app/dogfight-trainer");

  return <IframeLayout src="/dogfight-trainer" />;
}
