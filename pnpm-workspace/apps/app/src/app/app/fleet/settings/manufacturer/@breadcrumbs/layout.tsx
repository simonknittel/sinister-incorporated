import { type ReactNode } from "react";

type Props = Readonly<{
  children?: ReactNode;
}>;

export default function Layout({ children }: Props) {
  return <div className="flex gap-2">{children}</div>;
}
