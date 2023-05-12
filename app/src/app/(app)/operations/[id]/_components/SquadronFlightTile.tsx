import {
  type OperationMember,
  type OperationUnit,
  type Ship,
  type User,
  type Variant,
} from "@prisma/client";
import clsx from "clsx";
import DeleteUnit from "./DeleteUnit";
import EditUnit from "./EditUnit";
import SquadronFlightPosition from "./SquadronFlightPosition";
import SquadronFlightPositionEmpty from "./SquadronFlightPositionEmpty";

interface Props {
  className?: string;
  unit: OperationUnit & {
    members: (OperationMember & {
      user: User;
      ship?: (Ship & { variant: Variant }) | null;
    })[];
  };
}

const SquadronFlightTile = ({ className, unit }: Props) => {
  const oneLeader = unit.members.find(
    (member) => member.title === "1 Flight Lead"
  );
  const oneWingman = unit.members.find(
    (member) => member.title === "1 Wingman"
  );
  const two = unit.members.find((member) => member.title === "2");
  const twoWingman = unit.members.find(
    (member) => member.title === "2 Wingman"
  );

  return (
    <article className={clsx(className, "rounded bg-neutral-900")}>
      <div className="flex justify-between">
        <h4 className="font-bold bg-neutral-950 py-2 px-4 rounded-br">
          {unit.title}
        </h4>

        <div className="flex">
          <EditUnit unit={unit} />
          <DeleteUnit unit={unit} />
        </div>
      </div>

      <ol className="grid grid-cols-2 grid-rows-2 gap-4 lg:gap-8 p-4 pb-0 lg:p-8 lg:pb-0">
        {oneLeader ? (
          <SquadronFlightPosition
            unit={unit}
            member={oneLeader}
            type="squadron-flight-1-leader"
          />
        ) : (
          <SquadronFlightPositionEmpty
            unit={unit}
            type="squadron-flight-1-leader"
          />
        )}

        {oneWingman ? (
          <SquadronFlightPosition
            unit={unit}
            member={oneWingman}
            type="squadron-flight-1-wingman"
          />
        ) : (
          <SquadronFlightPositionEmpty
            unit={unit}
            type="squadron-flight-1-wingman"
          />
        )}

        {two ? (
          <SquadronFlightPosition
            unit={unit}
            member={two}
            type="squadron-flight-2"
          />
        ) : (
          <SquadronFlightPositionEmpty unit={unit} type="squadron-flight-2" />
        )}

        {twoWingman ? (
          <SquadronFlightPosition
            unit={unit}
            member={twoWingman}
            type="squadron-flight-2-wingman"
          />
        ) : (
          <SquadronFlightPositionEmpty
            unit={unit}
            type="squadron-flight-2-wingman"
          />
        )}
      </ol>
    </article>
  );
};

export default SquadronFlightTile;
