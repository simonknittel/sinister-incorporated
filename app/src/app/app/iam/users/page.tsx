import { authenticatePage } from "@/auth/server";
import { SuspenseWithErrorBoundaryTile } from "@/common/components/SuspenseWithErrorBoundaryTile";
import { Template } from "@/iam/components/Template";
import { Tile } from "@/users/components/Tile";
import { type Metadata } from "next";

export const metadata: Metadata = {
  title: "Benutzer - IAM | S.A.M. - Sinister Incorporated",
};

export default async function Page() {
  const authentication = await authenticatePage("/app/users");
  await authentication.authorizePage("user", "read");

  return (
    <Template>
      <SuspenseWithErrorBoundaryTile>
        <Tile />
      </SuspenseWithErrorBoundaryTile>
    </Template>
  );
}
