import clsx from "clsx";
import { useFormContext } from "react-hook-form";
import { type FormValues } from "../../../../../../_lib/auth/FormValues";
import YesNoCheckbox from "../../../../../_components/YesNoCheckbox";

interface Props {
  className?: string;
}

export const CommunityMonikerSection = ({ className }: Readonly<Props>) => {
  const { register } = useFormContext<FormValues>();

  return (
    <div className={clsx(className)}>
      <h4 className="font-bold">Community Monikers</h4>

      <div className="border border-neutral-700 p-4 rounded mt-2 grid grid-cols-3">
        <div>
          <h5 className="font-bold mb-2">Erstellen</h5>
          <YesNoCheckbox register={register("community-moniker.create")} />
        </div>

        <div>
          <h5 className="font-bold mb-2">Löschen</h5>
          <YesNoCheckbox register={register("community-moniker.delete")} />
        </div>

        <div>
          <h5 className="font-bold mb-2">Bestätigen</h5>
          <YesNoCheckbox register={register("community-moniker.confirm")} />
        </div>
      </div>
    </div>
  );
};
