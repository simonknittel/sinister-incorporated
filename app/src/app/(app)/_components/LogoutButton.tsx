"use client";

import { signOut } from "next-auth/react";
import { useState } from "react";
import { FaSignOutAlt, FaSpinner } from "react-icons/fa";
import Button from "../../_components/Button";

const LogoutButton = () => {
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
    >
      {isLoggingOut ? <FaSpinner className="animate-spin" /> : <FaSignOutAlt />}
    </Button>
  );
};

export default LogoutButton;
