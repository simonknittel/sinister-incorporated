"use client";

import { type Session } from "next-auth";
import { SessionProvider } from "next-auth/react";
import { type ReactNode } from "react";

type Props = Readonly<{
  children?: ReactNode;
  session: Session;
}>;

export const SessionProviderContainer = ({ children, session }: Props) => {
  return <SessionProvider session={session}>{children}</SessionProvider>;
};
