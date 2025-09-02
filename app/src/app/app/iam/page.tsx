import { requireAuthenticationPage } from "@/auth/server";
import { getNavigationItems } from "@/iam/components/Navigation/getNavigationItems";
import { type Metadata } from "next";
import { forbidden, redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "IAM | S.A.M. - Sinister Incorporated",
};

export default async function Page() {
  await requireAuthenticationPage("/app/iam");

  const pages = await getNavigationItems();
  if (!pages?.[0]) forbidden();

  redirect(pages[0].path);
}
