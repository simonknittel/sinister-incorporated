"use client";

import { signOut } from "next-auth/react";
import { useState } from "react";
import { FaSpinner } from "react-icons/fa";
import { RiLogoutCircleRLine } from "react-icons/ri";
import Button from "./Button";

interface Props {
  className?: string;
}

export const LogoutButton = ({ className }: Props) => {
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleClick = async () => {
    setIsLoggingOut(true);
    await signOut({
      callbackUrl: "/",
    });
  };

  return (
    <Button
      onClick={() => void handleClick()}
      variant="secondary"
      title="Abmelden"
      iconOnly={true}
      disabled={isLoggingOut}
      className={className}
    >
      {isLoggingOut ? (
        <FaSpinner className="animate-spin" />
      ) : (
        <RiLogoutCircleRLine />
      )}
    </Button>
  );
};
