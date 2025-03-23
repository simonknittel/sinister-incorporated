import clsx from "clsx";
import type { PositionType } from "../Position";
import { useLineupOrder } from "./Context";

type Props = Readonly<{
  className?: string;
  position: PositionType;
  order: "before" | "after";
  parentPositions: PositionType["id"][];
  groupLevel: number;
}>;

export const DragTarget = ({
  className,
  position,
  order,
  parentPositions,
  groupLevel,
}: Props) => {
  const { isDragging, handleDragEnd } = useLineupOrder();

  if (!isDragging) return null;
  if (isDragging.id === position.id) return null;
  if (parentPositions.includes(isDragging.id)) return null;

  return (
    <div className={clsx("relative", className)}>
      <div
        className={clsx(
          "h-8 hover:border-green-500 hover:from-green-900 absolute left-0 right-0",
          {
            "hover:border-t-[2px] top-0 bg-gradient-to-b": order === "before",
            "hover:border-b-[2px] bottom-0 bg-gradient-to-t": order === "after",
            "right-0":
              order === "before" || (order === "after" && groupLevel >= 4),
            "right-1/2": order === "after" && groupLevel < 4,
          },
        )}
        onMouseUp={(e) => handleDragEnd(e, position, order)}
      />

      {order === "after" && groupLevel < 4 && (
        <div
          className="h-8 hover:border-green-500 hover:from-green-900 absolute left-[calc(50%+1px)] right-0 hover:border-b-[2px] bottom-0 bg-gradient-to-t"
          onMouseUp={(e) => handleDragEnd(e, position, "inside")}
        />
      )}
    </div>
  );
};
