"use client";

import { useAuthentication } from "@/auth/hooks/useAuthentication";
import { Button2 } from "@/common/components/Button2";
import { Link } from "@/common/components/Link";
import { CreateRoleButton } from "@/roles/components/CreateRole/CreateRoleButton";
import clsx from "clsx";
import { usePathname } from "next/navigation";
import { useState, type ReactNode } from "react";
import { FaBars } from "react-icons/fa";
import { useNavigationItems } from "./useNavigationItems";

interface Props {
  readonly className?: string;
}

export const Navigation = ({ className }: Props) => {
  const authentication = useAuthentication();
  if (!authentication || !authentication.session.entity)
    throw new Error("Forbidden");

  const [isOpen, setIsOpen] = useState(false);
  const pages = useNavigationItems();

  const showRoleManage = authentication.authorize("role", "manage");

  return (
    <div className={clsx(className)}>
      <div className="flex gap-2">
        <Button2
          type="button"
          onClick={() => setIsOpen((prev) => !prev)}
          variant="secondary"
          className="flex-1 md:hidden"
        >
          <FaBars />
          Navigation
        </Button2>

        {showRoleManage && <CreateRoleButton className="flex-1" />}
      </div>

      <div
        className={clsx("flex flex-col gap-[2px]", {
          "hidden md:flex": !isOpen,
          "mt-4": showRoleManage,
        })}
      >
        <nav className="background-secondary rounded-primary p-2 flex flex-col gap-1">
          {pages?.map((page) => (
            <Item key={page.path} page={page} />
          ))}
        </nav>
      </div>
    </div>
  );
};

interface ItemProps {
  readonly className?: string;
  readonly page: {
    path: string;
    name: string;
    icon?: ReactNode;
  };
}

const Item = ({ className, page }: ItemProps) => {
  const pathname = usePathname();

  const isActive = page.path === pathname;

  return (
    <Link
      key={page.path}
      href={page.path}
      className={clsx(
        "rounded-secondary hover:bg-neutral-800 active:bg-neutral-700 py-1 px-2",
        {
          "bg-neutral-800": isActive,
        },
        className,
      )}
    >
      {page.icon}
      {page.name}
    </Link>
  );
};
