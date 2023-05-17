"use client";

import { type Role } from "@prisma/client";
import { useRouter } from "next/navigation";
import { RiSpyFill } from "react-icons/ri";

interface Props {
  role: Role;
}

const ImpersonateRole = ({ role }: Props) => {
  const router = useRouter();

  const handleClick = () => {
    document.cookie = `impersonate=${role.id}; path=/; max-age=3600;`;
    router.refresh();
  };

  return (
    <button
      className="text-neutral-500 hover:text-neutral-300 px-2"
      type="button"
      title="Rolle simulieren"
      onClick={() => void handleClick()}
    >
      <RiSpyFill />
    </button>
  );
};

export default ImpersonateRole;
