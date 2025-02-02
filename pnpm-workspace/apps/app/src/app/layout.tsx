import { AnalyticsLoader } from "@/common/components/AnalyticsLoader";
import ToasterContainer from "@/common/components/ToasterContainer";
import { env } from "@/env";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { type Metadata } from "next";
import { type ReactNode } from "react";
import "../styles/globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(env.BASE_URL),
};

interface Props {
  children: ReactNode;
}

export default function RootLayout({ children }: Readonly<Props>) {
  return (
    <html lang="de">
      <body className="bg-neutral-800 text-neutral-50">
        {children}
        <ToasterContainer />
        <AnalyticsLoader />
        <SpeedInsights />
      </body>
    </html>
  );
}
