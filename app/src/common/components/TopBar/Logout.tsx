"use client";

import clsx from "clsx";
import { signOut } from "next-auth/react";
import { useState } from "react";
import { FaSpinner } from "react-icons/fa";
import { RiLogoutCircleRLine } from "react-icons/ri";

interface Props {
  readonly className?: string;
}

export const Logout = ({ className }: Props) => {
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleClick = async () => {
    setIsLoggingOut(true);
    await signOut({
      callbackUrl: "/",
    });
  };

  return (
    <button
      type="button"
      onClick={() => void handleClick()}
      title="Abmelden"
      disabled={isLoggingOut}
      className={clsx(
        "text-interaction-500 hover:text-interaction-300 focus-visible:text-interaction-300",
        className,
      )}
    >
      {isLoggingOut ? (
        <FaSpinner className="animate-spin" />
      ) : (
        <RiLogoutCircleRLine />
      )}
    </button>
  );
};
