import clsx from "clsx";
import { useFormContext } from "react-hook-form";
import YesNoCheckbox from "~/app/_components/YesNoCheckbox";
import { type FormValues } from "~/app/_lib/auth/FormValues";

interface Props {
  className?: string;
}

const DiscordIdSection = ({ className }: Readonly<Props>) => {
  const { register } = useFormContext<FormValues>();

  return (
    <div className={clsx(className)}>
      <h4 className="font-bold">Discord IDs</h4>

      <div className="border border-neutral-700 p-4 rounded mt-2 grid grid-cols-4">
        <div>
          <h5 className="font-bold mb-2">Erstellen</h5>
          <YesNoCheckbox register={register("discordId.create")} />
        </div>

        <div>
          <h5 className="font-bold mb-2">Einsehen</h5>
          <YesNoCheckbox register={register("discordId.read")} />
        </div>

        <div>
          <h5 className="font-bold mb-2">Löschen</h5>
          <YesNoCheckbox register={register("discordId.delete")} />
        </div>

        <div>
          <h5 className="font-bold mb-2">Bestätigen</h5>
          <YesNoCheckbox register={register("discordId.confirm")} />
        </div>
      </div>
    </div>
  );
};

export default DiscordIdSection;
