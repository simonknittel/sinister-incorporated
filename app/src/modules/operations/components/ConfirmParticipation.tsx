"use client";

import { type Operation } from "@prisma/client";
import { useQueryClient } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import toast from "react-hot-toast";
import { FaCheck, FaSpinner } from "react-icons/fa";

interface Props {
  operation: Operation;
}

const ConfirmParticipation = ({ operation }: Readonly<Props>) => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const { data: session } = useSession();
  const queryClient = useQueryClient();

  const handleClick = async () => {
    setIsLoading(true);

    try {
      const response = await fetch(`/api/operation-member/${operation.id}`, {
        method: "PATCH",
        body: JSON.stringify({
          status: "confirmed",
          userId: session!.user.id,
        }),
      });

      if (response.ok) {
        router.refresh();
        toast.success("Erfolgreich bestätigt");
        await queryClient.invalidateQueries({
          queryKey: ["operation-members", operation.id],
        });
      } else {
        toast.error("Beim Bestätigen ist ein Fehler aufgetreten.");
      }
    } catch (error) {
      toast.error("Beim Bestätigen ist ein Fehler aufgetreten.");
      console.error(error);
    }

    setIsLoading(false);
  };

  return (
    <button
      type="button"
      onClick={() => void handleClick()}
      disabled={isLoading}
      title="Anwesenheit bestätigen"
      className="text-neutral-500 hover:text-neutral-300 px-2"
    >
      {isLoading ? <FaSpinner className="animate-spin" /> : <FaCheck />}
    </button>
  );
};

export default ConfirmParticipation;
