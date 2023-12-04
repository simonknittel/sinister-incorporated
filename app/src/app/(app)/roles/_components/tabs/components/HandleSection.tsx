import clsx from "clsx";
import { useFormContext } from "react-hook-form";
import { type FormValues } from "~/_lib/auth/FormValues";
import YesNoCheckbox from "~/app/_components/YesNoCheckbox";

interface Props {
  className?: string;
}

const HandleSection = ({ className }: Readonly<Props>) => {
  const { register } = useFormContext<FormValues>();

  return (
    <div className={clsx(className)}>
      <h4 className="font-bold">Handles</h4>

      <div className="border border-neutral-700 p-4 rounded mt-2 grid grid-cols-3">
        <div>
          <h5 className="font-bold mb-2">Erstellen</h5>
          <YesNoCheckbox register={register("handle.create")} />
        </div>

        <div>
          <h5 className="font-bold mb-2">Löschen</h5>
          <YesNoCheckbox register={register("handle.delete")} />
        </div>

        <div>
          <h5 className="font-bold mb-2">Bestätigen</h5>
          <YesNoCheckbox register={register("handle.confirm")} />
        </div>
      </div>
    </div>
  );
};

export default HandleSection;
