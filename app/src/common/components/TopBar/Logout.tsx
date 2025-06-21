"use client";

import { signOut } from "next-auth/react";
import { useState } from "react";
import { FaSpinner } from "react-icons/fa";
import { RiLogoutCircleRLine } from "react-icons/ri";
import Button from "../Button";

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
    <Button
      type="button"
      variant="secondary"
      onClick={() => void handleClick()}
      title="Abmelden"
      disabled={isLoggingOut}
      className={className}
    >
      Abmelden
      {isLoggingOut ? (
        <FaSpinner className="animate-spin" />
      ) : (
        <RiLogoutCircleRLine />
      )}
    </Button>
  );
};
