import { requireAuthenticationPage } from "@/auth/server";
import { IframeLayout } from "@/common/components/layouts/IframeLayout";
import { type Metadata } from "next";

export const revalidate = 86400; // 24 hours

export const metadata: Metadata = {
  title: "Onboarding | S.A.M. - Sinister Incorporated",
};

export default async function Page() {
  await requireAuthenticationPage("/app/onboarding");

  return (
    <IframeLayout
      src="https://cloud.sinister-incorporated.de/index.php/s/7gZRw8y93aE3Nky"
      iframeProps={{
        sandbox: "allow-scripts allow-same-origin allow-forms allow-downloads",
      }}
    />
  );
}
