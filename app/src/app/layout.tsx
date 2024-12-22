import ToasterContainer from "@/common/components/ToasterContainer";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { type Metadata } from "next";
import dynamic from "next/dynamic";
import { type ReactNode } from "react";
import { env } from "../env.mjs";
import "../styles/globals.css";

const AnalyticsContainer = dynamic(
  () => import("@/common/components/AnalyticsContainer"),
  { ssr: false },
);

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
        <AnalyticsContainer />
        <SpeedInsights />
      </body>
    </html>
  );
}
