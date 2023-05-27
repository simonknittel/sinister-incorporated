"use client";

import { useRouter } from "next/navigation";

interface Props {
  disabled?: boolean;
}

const AdminDisabler = ({ disabled = false }: Props) => {
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
    <div className="fixed top-4 left-1/2 -translate-x-1/2 bg-red-500/50 backdrop-blur z-50 flex w-[calc(100%-2rem)] max-w-xs p-4 rounded gap-4 justify-between">
      <p>Admin</p>

      <div className="flex gap-2">
        {disabled ? (
          <button
            onClick={handleClick}
            className="hover:underline"
            type="button"
          >
            Aktivieren
          </button>
        ) : (
          <button
            onClick={handleClick}
            className="hover:underline"
            type="button"
          >
            Deaktivieren
          </button>
        )}
      </div>
    </div>
  );
};

export default AdminDisabler;
