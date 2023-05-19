"use client";

import { experimental_useFormStatus as useFormStatus } from "react-dom";
import { FaSave, FaSpinner } from "react-icons/fa";
import Button from "~/app/_components/Button";

const AddNoteSubmitSA = () => {
  const { pending } = useFormStatus();

  return (
    <Button
      type="submit"
      disabled={pending}
      className="rounded-l-none h-full"
      title="Hinzufügen"
    >
      {pending ? <FaSpinner className="animate-spin" /> : <FaSave />}
    </Button>
  );
};

export default AddNoteSubmitSA;
