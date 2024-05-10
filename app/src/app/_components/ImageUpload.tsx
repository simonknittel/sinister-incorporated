"use client";

import clsx from "clsx";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState, type ChangeEventHandler } from "react";
import toast from "react-hot-toast";
import { FaSpinner } from "react-icons/fa";
import { env } from "../../env.mjs";
import useUpload from "../../lib/useUpload";

type Props = Readonly<{
  className?: string;
  resourceType: string;
  resource: {
    id: string;
    name: string;
    imageId?: string | null;
  };
  size: 16 | 32 | 64 | 128;
}>;

export const ImageUpload = ({
  className,
  resourceType,
  resource,
  size,
}: Props) => {
  const { setFile, upload, setUpload } = useUpload();
  const router = useRouter();
  const [isPending, setIsPending] = useState(false);

  useEffect(() => {
    if (!upload) return;

    fetch(`/api/${resourceType}/${resource.id}`, {
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
        setIsPending(false);
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [upload]);

  const changeHandler: ChangeEventHandler<HTMLInputElement> = (e) => {
    if (e.target.files && e.target.files.length > 0 && e.target.files[0]) {
      setIsPending(true);
      setFile(e.target.files[0]);
    }
  };

  return (
    <div className={clsx(className, "inline-block relative")}>
      <div
        className={clsx(
          "aspect-square flex items-center justify-center rounded border border-neutral-700 overflow-hidden flex-shrink-0",
          {
            "after:content-['Logo'] after:object-center after:text-neutral-500":
              !resource.imageId && !isPending,
            "w-4 h-4": size === 16,
            "w-8 h-8": size === 32,
            "w-16 h-16": size === 64,
            "w-32 h-32": size === 128,
          },
        )}
      >
        {resource.imageId && !isPending && (
          <Image
            src={`https://${env.NEXT_PUBLIC_R2_PUBLIC_URL}/${resource.imageId}`}
            alt={`Logo of ${resource.name}`}
            width={size}
            height={size}
            className="max-w-full max-h-full"
          />
        )}

        {isPending && (
          <FaSpinner className="animate-spin text-sinister-red-500" />
        )}
      </div>

      <input
        type="file"
        onChange={changeHandler}
        accept="image/*"
        disabled={isPending}
        className="absolute inset-0 cursor-pointer opacity-0"
      />
    </div>
  );
};
