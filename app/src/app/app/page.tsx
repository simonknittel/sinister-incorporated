import { requireAuthenticationPage } from "@/modules/auth/server";
import { type Metadata } from "next";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "S.A.M. - Sinister Incorporated",
};

export default async function Page() {
  await requireAuthenticationPage("/app");

  redirect("/app/dashboard");
}
