import {
  type OperationMember,
  type OperationUnit,
  type Ship,
  type User,
  type Variant,
} from "@prisma/client";
import clsx from "clsx";
import CreateSquadronFlight from "./CreateSquadronFlight";
import DeleteUnit from "./DeleteUnit";
import EditUnit from "./EditUnit";
import SquadronFlightTile from "./SquadronFlightTile";

interface Props {
  className?: string;
  unit: OperationUnit & {
    members: (OperationMember & {
      user: User;
      ship?: (Ship & { variant: Variant }) | null;
    })[];
    childUnits: (OperationUnit & {
      members: (OperationMember & {
        user: User;
        ship?: (Ship & { variant: Variant }) | null;
      })[];
    })[];
  };
}

const SquadronTile = ({ className, unit }: Readonly<Props>) => {
  return (
    <section className={clsx(className, "pt-4")}>
      <div className="flex gap-2">
        <h3 className="font-bold text-lg">{unit.title}</h3>

        <div className="flex">
          <EditUnit unit={unit} />
          <DeleteUnit unit={unit} />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 mt-4">
        {unit.childUnits
          .sort((a, b) => a.title.localeCompare(b.title))
          .map((childUnit) => (
            <SquadronFlightTile key={childUnit.id} unit={childUnit} />
          ))}

        {unit.childUnits.length < 3 && (
          <CreateSquadronFlight parentUnit={unit} />
        )}
      </div>
    </section>
  );
};

export default SquadronTile;
