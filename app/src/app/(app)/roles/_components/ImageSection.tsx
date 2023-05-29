"use client";

import { type Role } from "@prisma/client";
import clsx from "clsx";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState, type ChangeEventHandler } from "react";
import toast from "react-hot-toast";
import { FaSpinner } from "react-icons/fa";
import useUpload from "~/app/_lib/useUpload";
import { env } from "~/env.mjs";

interface Props {
  className?: string;
  role: Role;
}

const ImageSection = ({ className, role }: Props) => {
  const { setFile, upload, setUpload } = useUpload();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!upload) return;

    fetch(`/api/role/${role.id}`, {
      method: "PATCH",
      body: JSON.stringify({
        imageId: upload,
      }),
    })
      .then((response) => response.json())
      .then(() => {
        router.refresh();
        toast.success("Erfolgreich hochgeladen");
      })
      .catch((error) => {
        console.error(error);
        toast.error("Beim Upload ist ein Fehler aufgetreten.");
      })
      .finally(() => {
        setUpload(null);
        setIsLoading(false);
      });
  }, [upload]);

  const changeHandler: ChangeEventHandler<HTMLInputElement> = (e) => {
    if (e.target.files && e.target.files.length > 0 && e.target.files[0]) {
      setIsLoading(true);
      setFile(e.target.files[0]);
    }
  };

  return (
    <div className={clsx(className, "border border-neutral-700 p-4 rounded")}>
      <p className="font-bold">Bild</p>

      <div className="flex gap-4 items-center mt-4">
        <div className="aspect-square w-16 h-16 flex items-center justify-center rounded border border-neutral-500 overflow-hidden flex-shrink-0">
          {role.imageId && !isLoading && (
            <Image
              src={`https://${env.NEXT_PUBLIC_R2_PUBLIC_URL}/${role.imageId}`}
              alt=""
              width={64}
              height={64}
              className="max-w-full max-h-full"
            />
          )}
          {isLoading && (
            <FaSpinner className="animate-spin text-sinister-red-500" />
          )}
        </div>

        <input
          type="file"
          onChange={changeHandler}
          accept="image/*"
          disabled={isLoading}
        />
      </div>
    </div>
  );
};

export default ImageSection;
