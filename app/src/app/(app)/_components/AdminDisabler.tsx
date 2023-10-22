"use client";

import clsx from "clsx";
import { useRouter } from "next/navigation";

interface Props {
  disabled?: boolean;
}

const AdminDisabler = ({ disabled = false }: Readonly<Props>) => {
  const router = useRouter();

  const handleClick = () => {
    if (disabled) {
      document.cookie = `disableAdmin=; path=/; max-age=0;`;
    } else {
      document.cookie = `disableAdmin=disableAdmin; path=/; max-age=${
        60 * 60 * 24 * 7
      };`;
    }

    router.refresh();
  };

  return (
    <button
      className={clsx(
        "fixed top-4 left-1/2 -translate-x-1/2 backdrop-blur z-50 max-w-xs p-4 rounded gap-4 justify-between opacity-50 hover:opacity-100 transition-opacity",
        {
          "bg-green-500/50": disabled,
          "bg-red-500/50": !disabled,
        },
      )}
      onClick={handleClick}
    >
      Admin {disabled ? "aktivieren" : "deaktivieren"}
    </button>
  );
};

export default AdminDisabler;
