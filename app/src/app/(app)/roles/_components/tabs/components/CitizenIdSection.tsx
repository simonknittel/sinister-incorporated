import clsx from "clsx";
import { useFormContext } from "react-hook-form";
import YesNoCheckbox from "~/app/_components/YesNoCheckbox";
import { type FormValues } from "~/app/_lib/auth/FormValues";

interface Props {
  className?: string;
}

export const CitizenIdSection = ({ className }: Readonly<Props>) => {
  const { register } = useFormContext<FormValues>();

  return (
    <div className={clsx(className)}>
      <h4 className="font-bold">Citizen IDs</h4>

      <div className="border border-neutral-700 p-4 rounded mt-2 grid grid-cols-3">
        <div>
          <h5 className="font-bold mb-2">Erstellen</h5>
          <YesNoCheckbox register={register("citizenId.create")} />
        </div>

        <div>
          <h5 className="font-bold mb-2">Löschen</h5>
          <YesNoCheckbox register={register("citizenId.delete")} />
        </div>

        <div>
          <h5 className="font-bold mb-2">Bestätigen</h5>
          <YesNoCheckbox register={register("citizenId.confirm")} />
        </div>
      </div>
    </div>
  );
};
