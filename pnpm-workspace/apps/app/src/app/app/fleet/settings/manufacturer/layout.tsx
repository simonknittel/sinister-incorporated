import { type ReactNode } from "react";

type Props = Readonly<{
  children?: ReactNode;
  breadcrumbs?: ReactNode;
}>;

export default function Layout({ children, breadcrumbs }: Props) {
  return (
    <div className="p-4 pb-20 lg:p-8">
      <div className="mb-4">{breadcrumbs}</div>

      {children}
    </div>
  );
}
