import { type ReactNode } from "react";
import "../styles/globals.css";
import AnalyticsContainer from "./_components/AnalyticsContainer";
import ToasterContainer from "./_components/ToasterContainer";

interface Props {
  children: ReactNode;
}

export default function RootLayout({ children }: Props) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-slate-800 text-white">
        {children}
        <ToasterContainer />
        <AnalyticsContainer />
      </body>
    </html>
  );
}
