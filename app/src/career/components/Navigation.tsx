"use client";

import { Link } from "@/common/components/Link";
import type { Flow } from "@prisma/client";
import clsx from "clsx";
import { usePathname } from "next/navigation";

interface Props {
  readonly className?: string;
  readonly flows: Flow[];
}

export const Navigation = ({ className, flows }: Props) => {
  const pathname = usePathname();

  return (
    <div className={clsx("flex justify-center", className)}>
      {flows
        .toSorted((a, b) => (a.position ?? 0) - (b.position ?? 0))
        .map((flow) => (
          <Link
            key={flow.id}
            href={`/app/career/${flow.id}`}
            className={clsx(
              "first:rounded-l last:rounded-r border border-sinister-red-700 h-8 flex items-center justify-center px-3 gap-2 uppercase",
              {
                "bg-sinister-red-500 text-white":
                  pathname === `/app/career/${flow.id}`,
                "text-sinister-red-500 hover:text-sinister-red-300 hover:border-sinister-red-300":
                  pathname !== `/app/career/${flow.id}`,
              },
            )}
          >
            {flow.name}
          </Link>
        ))}
    </div>
  );
};
