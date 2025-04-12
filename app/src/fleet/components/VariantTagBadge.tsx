import { Badge } from "@/common/components/Badge";
import type { VariantTag } from "@prisma/client";

type Props = Readonly<{
  className?: string;
  tag: VariantTag;
}>;

export const VariantTagBadge = ({ className, tag }: Props) => {
  return (
    <Badge
      label={tag.key}
      value={tag.value}
      showLabel={true}
      className={className}
    />
  );
};
