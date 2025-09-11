"use client";

import { type Operation } from "@prisma/client";
import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useState } from "react";
import toast from "react-hot-toast";
import { FaSignOutAlt, FaSpinner } from "react-icons/fa";

interface Props {
  operation: Operation;
}

const RemoveParticipation = ({ operation }: Readonly<Props>) => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const queryClient = useQueryClient();

  const handleClick = async () => {
    setIsLoading(true);

    try {
      const response = await fetch(`/api/operation-member/${operation.id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        router.refresh();
        toast.success("Erfolgreich verlassen");
        await queryClient.invalidateQueries({
          queryKey: ["operation-members", operation.id],
        });
      } else {
        toast.error("Beim Verlassen ist ein Fehler aufgetreten.");
      }
    } catch (error) {
      toast.error("Beim Verlassen ist ein Fehler aufgetreten.");
      console.error(error);
    }

    setIsLoading(false);
  };

  return (
    <button
      type="button"
      onClick={() => void handleClick()}
      disabled={isLoading}
      title="Operation verlassen"
      className="text-neutral-500 hover:text-neutral-300 px-2"
    >
      {isLoading ? <FaSpinner className="animate-spin" /> : <FaSignOutAlt />}
    </button>
  );
};

export default RemoveParticipation;
