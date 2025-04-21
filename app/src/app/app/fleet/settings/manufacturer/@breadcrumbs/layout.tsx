import { type ReactNode } from "react";

interface Props {
  readonly children?: ReactNode;
}

export default function Layout({ children }: Props) {
  return <div className="flex gap-2">{children}</div>;
}
