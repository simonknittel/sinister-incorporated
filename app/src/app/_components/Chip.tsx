import { type ReactNode } from "react";

interface Props {
  children: ReactNode;
  title?: string;
}

export const Chip = ({ children, title }: Readonly<Props>) => {
  return (
    <span
      className="rounded bg-neutral-700 py-1 px-2 text-sm text-neutral-50"
      title={title || children?.toString()}
    >
      {children}
    </span>
  );
};
