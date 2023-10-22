"use client";

import { type Session } from "next-auth";
import { SessionProvider } from "next-auth/react";
import { type ReactNode } from "react";

interface Props {
  children: ReactNode;
  session: Session;
}

const SessionProviderContainer = ({ children, session }: Readonly<Props>) => {
  return <SessionProvider session={session}>{children}</SessionProvider>;
};

export default SessionProviderContainer;
