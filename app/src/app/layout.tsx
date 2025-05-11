import { AnalyticsLoader } from "@/common/components/AnalyticsLoader";
import ToasterContainer from "@/common/components/ToasterContainer";
import { env } from "@/env";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { type Metadata } from "next";
import { getLocale } from "next-intl/server";
import { type ReactNode } from "react";
import "../styles/globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(env.BASE_URL),
};

interface Props {
  children: ReactNode;
}

export default async function RootLayout({ children }: Readonly<Props>) {
  const locale = await getLocale();

  return (
    <html lang={locale}>
      <body className="bg-neutral-800 text-text-primary">
        {children}
        <ToasterContainer />
        <AnalyticsLoader />
        <SpeedInsights sampleRate={0.5} />
      </body>
    </html>
  );
}
