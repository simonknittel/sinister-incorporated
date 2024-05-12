import { type ReactNode } from "react";

type Props = Readonly<{
  children?: ReactNode;
  breadcrumbs?: ReactNode;
}>;

export default function Layout({ children, breadcrumbs }: Props) {
  return (
    <div className="p-2 lg:p-8 pt-20">
      <div className="mb-4">{breadcrumbs}</div>

      {children}
    </div>
  );
}
