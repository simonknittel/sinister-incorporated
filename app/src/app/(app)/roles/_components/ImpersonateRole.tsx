"use client";

import { type Role } from "@prisma/client";
import { useRouter } from "next/navigation";
import { RiSpyFill } from "react-icons/ri";
import Button from "~/app/_components/Button";

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
    <Button
      title="Rolle simulieren"
      onClick={() => void handleClick()}
      variant="tertiary"
    >
      <RiSpyFill /> Simulieren
    </Button>
  );
};

export default ImpersonateRole;
