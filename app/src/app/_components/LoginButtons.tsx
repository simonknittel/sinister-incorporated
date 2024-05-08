"use client";

import { type BuiltInProviderType } from "next-auth/providers";
import { signIn, type LiteralUnion } from "next-auth/react";
import { useState } from "react";
import { FaSpinner } from "react-icons/fa";
import { RiLoginCircleLine } from "react-icons/ri";
import Button from "./Button";

interface Props {
  activeProviders: LiteralUnion<BuiltInProviderType>[];
}

const LoginButtons = ({ activeProviders }: Readonly<Props>) => {
  const [isLoggingIn, setIsLoggingIn] = useState<string | null>(null);

  const handleClick = async (provider: LiteralUnion<BuiltInProviderType>) => {
    setIsLoggingIn(provider);
    await signIn(provider);
  };

  return (
    <>
      {activeProviders.includes("discord") && (
        <Button
          onClick={() => void handleClick("discord")}
          disabled={Boolean(isLoggingIn)}
          variant="secondary"
        >
          {isLoggingIn === "discord" ? (
            <FaSpinner className="animate-spin" />
          ) : (
            <>
              Login
              <RiLoginCircleLine />
            </>
          )}
        </Button>
      )}
    </>
  );
};

export default LoginButtons;
