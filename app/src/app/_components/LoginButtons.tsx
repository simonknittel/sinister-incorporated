"use client";

import { type BuiltInProviderType } from "next-auth/providers";
import { signIn, type LiteralUnion } from "next-auth/react";
import { useState } from "react";
import { FaSpinner } from "react-icons/fa";
import Button from "../../components/Button";

interface Props {
  activeProviders: LiteralUnion<BuiltInProviderType>[];
}

const LoginButtons = ({ activeProviders }: Props) => {
  const [isLoggingIn, setIsLoggingIn] = useState<string | null>(null);

  const handleClick = async (provider: LiteralUnion<BuiltInProviderType>) => {
    setIsLoggingIn(provider);
    await signIn(provider);
  };

  return (
    <>
      {activeProviders.includes("azure-ad-b2c") && (
        <Button
          onClick={() => void handleClick("azure-ad-b2c")}
          disabled={Boolean(isLoggingIn)}
        >
          {isLoggingIn === "azure-ad-b2c" ? (
            <FaSpinner className="animate-spin" />
          ) : (
            "Login with Microsoft"
          )}
        </Button>
      )}

      {activeProviders.includes("google") && (
        <Button
          onClick={() => void handleClick("google")}
          disabled={Boolean(isLoggingIn)}
        >
          {isLoggingIn === "google" ? (
            <FaSpinner className="animate-spin" />
          ) : (
            "Login with Google"
          )}
        </Button>
      )}

      {activeProviders.includes("github") && (
        <Button
          onClick={() => void handleClick("github")}
          disabled={Boolean(isLoggingIn)}
        >
          {isLoggingIn === "github" ? (
            <FaSpinner className="animate-spin" />
          ) : (
            "Login with GitHub"
          )}
        </Button>
      )}
    </>
  );
};

export default LoginButtons;
