import { env } from "@/env";
import type { Manufacturer, Variant } from "@prisma/client";
import clsx from "clsx";
import Image from "next/image";

type Props = Readonly<{
  className?: string;
  variant: Variant;
  manufacturer: Manufacturer;
  size?: 32 | 48;
}>;

export const VariantWithLogo = ({
  className,
  variant,
  manufacturer,
  size = 48,
}: Props) => {
  return (
    <div className={clsx("flex items-center gap-2", className)}>
      {manufacturer.imageId ? (
        <Image
          src={`https://${env.NEXT_PUBLIC_R2_PUBLIC_URL}/${manufacturer.imageId}`}
          alt={`Logo of ${manufacturer.name}`}
          width={size}
          height={size}
          className={clsx("flex-none object-contain object-center", {
            "size-[32px]": size === 32,
            "size-[48px]": size === 48,
          })}
          title={`Logo of ${manufacturer.name}`}
        />
      ) : (
        <div
          className={clsx("flex-none", {
            "size-[32px]": size === 32,
            "size-[48px]": size === 48,
          })}
        ></div>
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
