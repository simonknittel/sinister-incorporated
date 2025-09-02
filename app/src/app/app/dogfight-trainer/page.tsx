import { requireAuthenticationPage } from "@/auth/server";
import { IframePage } from "@/common/components/IframePage";
import { type Metadata } from "next";

export const revalidate = 86400; // 24 hours

export const metadata: Metadata = {
  title: "Dogfight Trainer | S.A.M. - Sinister Incorporated",
};

export default async function Page() {
  await requireAuthenticationPage("/app/dogfight-trainer");

  return <IframePage url="/dogfight-trainer" />;
}
