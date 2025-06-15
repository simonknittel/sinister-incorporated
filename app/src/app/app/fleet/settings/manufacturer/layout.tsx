import { type ReactNode } from "react";

interface Props {
  readonly children?: ReactNode;
  readonly breadcrumbs?: ReactNode;
}

export default function Layout({ children, breadcrumbs }: Props) {
  return (
    <div className="p-4 pb-20 lg:p-6">
      <div className="mb-4 text-xl">{breadcrumbs}</div>

      {children}
    </div>
  );
}
