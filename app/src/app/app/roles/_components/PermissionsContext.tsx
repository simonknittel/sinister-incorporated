"use client";

import { type PermissionString, type Role } from "@prisma/client";
import type { FormEvent, ReactNode } from "react";
import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";

interface PermissionsContextInterface {
  register: (permissionString: string) => {
    name: string;
    defaultChecked: boolean;
  };
  handleSubmit: (e: FormEvent<HTMLFormElement>) => Promise<void>;
  isLoading: boolean;
  permissionStrings: string[];
}

const PermissionsContext = createContext<
  PermissionsContextInterface | undefined
>(undefined);

type Props = Readonly<{
  children: ReactNode;
  role: Role & {
    permissionStrings: Array<PermissionString>;
  };
}>;

export const PermissionsProvider = ({ children, role }: Props) => {
  const [isLoading, setIsLoading] = useState(false);

  const permissionStrings = useMemo(
    () =>
      role.permissionStrings.map(
        (permissionString) => permissionString.permissionString,
      ),
    [role.permissionStrings],
  );

  const register = useCallback(
    (permissionString: string) => {
      return {
        name: permissionString,
        defaultChecked: permissionStrings.includes(permissionString),
      };
    },
    [permissionStrings],
  );

  const handleSubmit = useCallback(
    async (e: FormEvent<HTMLFormElement>) => {
      setIsLoading(true);

      try {
        const permissionStrings = Array.from(
          new FormData(e.currentTarget).keys(),
        );

        const response = await fetch(`/api/role/${role.id}/permissions`, {
          method: "POST",
          body: JSON.stringify(permissionStrings),
        });

        if (!response.ok)
          throw new Error("Beim Speichern ist ein Fehler aufgetreten.");
      } catch (error) {
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    [role.id],
  );

  const value = useMemo(
    () => ({
      register,
      handleSubmit,
      isLoading,
      permissionStrings,
    }),
    [register, handleSubmit, isLoading, permissionStrings],
  );

  return (
    <PermissionsContext.Provider value={value}>
      {children}
    </PermissionsContext.Provider>
  );
};

/**
 * Check for undefined since the defaultValue of the context is undefined. If
 * it's still undefined, the provider component is missing.
 */
export function usePermissionsContext() {
  const context = useContext(PermissionsContext);
  if (!context) throw new Error("Provider missing!");
  return context;
}
