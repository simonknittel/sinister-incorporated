import { env } from "@/env";
import type { Manufacturer, Variant } from "@prisma/client";
import clsx from "clsx";
import Image from "next/image";

type Props = Readonly<{
  className?: string;
  variant: Variant;
  manufacturer: Manufacturer;
}>;

export const VariantWithLogo = ({
  className,
  variant,
  manufacturer,
}: Props) => {
  return (
    <div className={clsx("flex items-center gap-2", className)}>
      {manufacturer.imageId ? (
        <Image
          src={`https://${env.NEXT_PUBLIC_R2_PUBLIC_URL}/${manufacturer.imageId}`}
          alt={`Logo of ${manufacturer.name}`}
          width={48}
          height={48}
          className="flex-none size-[48px] object-contain object-center"
          title={`Logo of ${manufacturer.name}`}
        />
      ) : (
        <div className="flex-none size-[48px]"></div>
      )}

      <div
        className="whitespace-nowrap text-ellipsis overflow-hidden"
        title={variant.name}
      >
        {variant.name}
      </div>
    </div>
  );
};
