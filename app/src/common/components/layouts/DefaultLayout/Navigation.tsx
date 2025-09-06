"use client";

import { useAuthentication } from "@/auth/hooks/useAuthentication";
import { Button2 } from "@/common/components/Button2";
import { Link } from "@/common/components/Link";
import clsx from "clsx";
import { usePathname } from "next/navigation";
import { useState, type ReactNode } from "react";
import { FaBars } from "react-icons/fa";

export interface Page {
  path: string;
  name: string;
  icon?: ReactNode;
  external?: boolean;
}

interface Props {
  readonly pages: Page[];
}

export const Navigation = ({ pages }: Props) => {
  const authentication = useAuthentication();
  if (!authentication || !authentication.session.entity)
    throw new Error("Forbidden");

  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <div className="lg:hidden">
        <Button2
          type="button"
          onClick={() => setIsOpen((prev) => !prev)}
          variant="secondary"
        >
          <FaBars />
          <span className="hidden sm:inline">Navigation</span>
        </Button2>
      </div>

      <nav
        className={clsx(
          "flex-col lg:flex-row gap-[2px] bg-black lg:bg-transparent px-2 lg:px-0 pb-2 lg:pb-0 border-b lg:border-b-0 border-neutral-800",
          {
            "flex fixed lg:static top-12 left-0 right-0": isOpen,
            "hidden lg:flex": !isOpen,
          },
        )}
      >
        {pages?.map((page) => (
          <Item key={page.path} page={page} />
        ))}
      </nav>
    </>
  );
};

interface ItemProps {
  readonly className?: string;
  readonly page: Page;
}

const Item = ({ className, page }: ItemProps) => {
  const pathname = usePathname();

  const isActive = page.path === pathname;

  return (
    <Link
      key={page.path}
      href={page.path}
      className={clsx(
        "rounded-secondary hover:bg-neutral-800 active:bg-neutral-700 py-1 px-2 flex gap-2 items-center [&>svg]:text-xs [&>svg]:opacity-50",
        {
          "bg-neutral-800": isActive,
        },
        className,
      )}
      {...(page.external ? { target: "_blank", rel: "noreferrer" } : {})}
    >
      {page.icon}
      {page.name}
    </Link>
  );
};
