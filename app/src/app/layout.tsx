import { type ReactNode } from "react";
import "../styles/globals.css";
import ToasterContainer from "./_components/ToasterContainer";

interface Props {
  children: ReactNode;
}

export default function RootLayout({ children }: Props) {
  return (
    <html className="h-full" lang="de">
      <body className="h-full bg-neutral-800 text-neutral-50">
        {children}
        <ToasterContainer />
        {/* <AnalyticsContainer /> */}
      </body>
    </html>
  );
}
