import clsx from "clsx";
import YesNoCheckbox from "../../../../../_components/YesNoCheckbox";
import { usePermissionsContext } from "../../PermissionsContext";

type Props = Readonly<{
  className?: string;
}>;

export const OrganizationMembershipSection = ({ className }: Props) => {
  const { register } = usePermissionsContext();

  return (
    <div className={clsx(className)}>
      <h4 className="font-bold">Mitglieder</h4>

      <div className="border border-neutral-700 p-4 rounded mt-2 grid grid-cols-4">
        <div>
          <h5 className="font-bold mb-2">Lesen</h5>
          <YesNoCheckbox {...register("organizationMembership;read")} />
        </div>

        <div>
          <h5 className="font-bold mb-2">Lesen (Redacted)</h5>
          <YesNoCheckbox
            {...register(
              "organizationMembership;read;alsoVisibilityRedacted=true",
            )}
          />
        </div>

        <div>
          <h5 className="font-bold mb-2">Erstellen</h5>
          <YesNoCheckbox {...register("organizationMembership;create")} />
        </div>

        <div>
          <h5 className="font-bold mb-2">Löschen</h5>
          <YesNoCheckbox {...register("organizationMembership;delete")} />
        </div>
      </div>
    </div>
  );
};
