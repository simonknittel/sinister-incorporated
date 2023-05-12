import {
  type OperationMember,
  type OperationUnit,
  type Ship,
  type User,
  type Variant,
} from "@prisma/client";
import clsx from "clsx";
import Image from "next/image";
import f7hornetImage from "../../../../../assets/ships/f7-hornet.png";

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
  status: "green" | "yellow" | "red";
}

const positions = {
  "squadron-flight-1-leader": "Flight Leader",
  "squadron-flight-1-wingman": "1 Wingman",
  "squadron-flight-2": "2",
  "squadron-flight-2-wingman": "2 Wingman",
};

const SquadronFlightPosition = ({
  type,
  member,
  unit,
  status = "green",
}: Props) => {
  return (
    <li className="aspect-square text-center">
      <p className="whitespace-nowrap text-ellipsis overflow-hidden">
        {unit.title}-{positions[type]}
      </p>

      <p className="text-neutral-500 text-sm whitespace-nowrap text-ellipsis overflow-hidden">
        {member.user.name}
      </p>

      <div className="aspect-square rounded mt-2 flex flex-col items-center justify-center gap-4 p-4 lg:p-8 relative">
        <Image src={f7hornetImage} alt="" className="rotate-90 sepia" />

        <p className="text-neutral-500 text-sm whitespace-nowrap text-ellipsis overflow-hidden">
          {member.ship.variant.name}
        </p>

        <div
          className={clsx("absolute inset-0 backdrop-saturate-[1]", {
            "backdrop-hue-rotate-[60deg]": status === "green",
            "backdrop-hue-rotate-[30deg]": status === "yellow",
            "backdrop-hue-rotate-[0deg]": status === "red",
          })}
        />
      </div>
    </li>
  );
};

export default SquadronFlightPosition;
