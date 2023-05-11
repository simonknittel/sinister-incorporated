import {
  type OperationMember,
  type OperationUnit,
  type Ship,
  type User,
  type Variant,
} from "@prisma/client";
import clsx from "clsx";

interface Props {
  type:
    | "squadron-flight-1-leader"
    | "squadron-flight-1-wingman"
    | "squadron-flight-2"
    | "squadron-flight-2-wingman";
  member: OperationMember & {
    user: User;
    ship: Ship & {
      variant: Variant;
    };
  };
  unit: OperationUnit;
}

const positions = {
  "squadron-flight-1-leader": "Flight Leader",
  "squadron-flight-1-wingman": "1 Wingman",
  "squadron-flight-2": "2",
  "squadron-flight-2-wingman": "2 Wingman",
};

const SquadronFlightPosition = ({ type, member, unit }: Props) => {
  return (
    <li className="aspect-square text-center">
      <p>
        {unit.title}-{positions[type]}
      </p>

      <p className="text-neutral-500 text-sm">{member.user.name}</p>

      <div
        className={clsx({
          "bg-neutral-800 aspect-square rounded mt-2 flex items-center justify-center":
            true,
        })}
      >
        {member.ship.variant.name}
      </div>
    </li>
  );
};

export default SquadronFlightPosition;
