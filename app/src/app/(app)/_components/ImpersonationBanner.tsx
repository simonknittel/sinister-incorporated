"use client";

import { type Role } from "@prisma/client";
import { useRouter } from "next/navigation";

interface Props {
  role: Role;
}

const ImpersonationBanner = ({ role }: Props) => {
  const router = useRouter();

  const handleClick = () => {
    document.cookie = `impersonate=; path=/; max-age=0;`;
    router.refresh();
  };

  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 bg-red-500/50 backdrop-blur z-50 flex w-[calc(100%-2rem)] max-w-xl p-4 rounded gap-4 justify-between">
      <p>
        Du siehst die Seite aus der Sicht der Rolle &quot;{role.name}&quot;.
      </p>

      <button onClick={handleClick} className="hover:underline" type="button">
        Beenden
      </button>
    </div>
  );
};

export default ImpersonationBanner;
