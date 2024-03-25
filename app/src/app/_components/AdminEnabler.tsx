"use client";

import clsx from "clsx";
import { useRouter } from "next/navigation";

interface Props {
  enabled?: boolean;
}

export const AdminEnabler = ({ enabled = false }: Readonly<Props>) => {
  const router = useRouter();

  const handleClick = () => {
    if (enabled) {
      document.cookie = `enableAdmin=; path=/; max-age=0;`;
    } else {
      document.cookie = `enableAdmin=enableAdmin; path=/; max-age=${
        60 * 60 * 24 * 7
      };`;
    }

    router.refresh();
  };

  return (
    <button
      className={clsx(
        "fixed top-4 left-1/2 -translate-x-1/2 backdrop-blur z-50 max-w-xs p-4 rounded gap-4 justify-between transition-colors",
        {
          "bg-green-500/50 hover:bg-green-500/100": !enabled,
          "bg-red-500/50 hover:bg-red-500/100": enabled,
        },
      )}
      onClick={handleClick}
    >
      Admin {enabled ? "deaktivieren" : "aktivieren"}
    </button>
  );
};
