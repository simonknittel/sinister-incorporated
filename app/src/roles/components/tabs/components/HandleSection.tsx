import YesNoCheckbox from "@/common/components/form/YesNoCheckbox";
import clsx from "clsx";
import { usePermissionsContext } from "../../PermissionsContext";

interface Props {
  className?: string;
}

const HandleSection = ({ className }: Readonly<Props>) => {
  const { register } = usePermissionsContext();

  return (
    <div className={clsx(className)}>
      <h4 className="font-bold">Handles</h4>

      <div className="border border-neutral-700 p-4 rounded-secondary mt-2 grid grid-cols-3">
        <div>
          <h5 className="font-bold mb-2">Erstellen</h5>
          <YesNoCheckbox {...register("handle;create")} />
        </div>

        <div>
          <h5 className="font-bold mb-2">Löschen</h5>
          <YesNoCheckbox {...register("handle;delete")} />
        </div>

        <div>
          <h5 className="font-bold mb-2">Bestätigen</h5>
          <YesNoCheckbox {...register("handle;confirm")} />
        </div>
      </div>
    </div>
  );
};

export default HandleSection;
