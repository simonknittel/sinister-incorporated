import clsx from "clsx";
import { useFormContext } from "react-hook-form";
import { type FormValues } from "../../../../../../lib/auth/FormValues";
import YesNoCheckbox from "../../../../../_components/YesNoCheckbox";

interface Props {
  className?: string;
}

const LastSeenSection = ({ className }: Readonly<Props>) => {
  const { register } = useFormContext<FormValues>();

  return (
    <div className={clsx(className)}>
      <h4 className="font-bold">Zuletzt gesehen</h4>

      <div className="border border-neutral-700 p-4 rounded mt-2 grid grid-cols-3">
        <div>
          <h5 className="font-bold mb-2">Lesen</h5>
          <YesNoCheckbox register={register("lastSeen.read")} />
        </div>
      </div>
    </div>
  );
};

export default LastSeenSection;
