"use client";

import { type Series } from "@prisma/client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import toast from "react-hot-toast";
import { FaSpinner, FaTrash } from "react-icons/fa";

interface Props {
  series: Series;
}

const DeleteSeriesButton = ({ series }: Props) => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleClick = async () => {
    setIsLoading(true);

    try {
      const confirmation = window.confirm(
        `You are about to remove "${series.name}". Do you want to continue?`
      );

      if (!confirmation) {
        setIsLoading(false);
        return;
      }

      const response = await fetch(`/api/series/${series.id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        router.refresh();
        toast.success("Successfully deleted");
      } else {
        toast.error("There has been an error while deleting.");
      }
    } catch (error) {
      toast.error("There has been an error while deleting.");
      console.error(error);
    }

    setIsLoading(false);
  };

  return (
    <button
      title="Delete"
      disabled={isLoading}
      onClick={() => void handleClick()}
      type="button"
      className="px-4 py-2 border-l-2 border-neutral-900 text-neutral-500 hover:text-neutral-50"
    >
      {isLoading ? <FaSpinner className="animate-spin" /> : <FaTrash />}
    </button>
  );
};

export default DeleteSeriesButton;
