import YesNoCheckbox from "@/common/components/form/YesNoCheckbox";
import { Link } from "@/common/components/Link";
import { env } from "@/env";
import clsx from "clsx";
import Image from "next/image";
import { getRoles } from "../queries";

const GRID_COLS = "grid-cols-[256px_repeat(2,32px)]";

interface Props {
  readonly className?: string;
}

export const PermissionMatrix = async ({ className }: Props) => {
  const roles = await getRoles(true);

  return (
    <section
      className={clsx(
        "p-4 lg:p-8 rounded-primary background-secondary overflow-hidden",
        className,
      )}
    >
      <table className="w-full">
        <thead>
          <tr
            className={clsx(
              "grid gap-2 text-left text-neutral-500 -mx-2 text-sm h-32",
              GRID_COLS,
            )}
          >
            <th className="font-normal whitespace-nowrap flex justify-center items-end">
              <div className="-rotate-45 w-0">
                <span>Rolle</span>
              </div>
            </th>

            <th className="font-normal whitespace-nowrap flex justify-center items-end">
              <div className="-rotate-45 w-0">
                <span>Documents - Onboarding</span>
              </div>
            </th>

            <th className="font-normal whitespace-nowrap flex justify-center items-end">
              <div className="-rotate-45 w-0">
                <span>Documents - Alliance</span>
              </div>
            </th>
          </tr>
        </thead>

        <tbody className="flex flex-col gap-2">
          {roles.map((role) => (
            <tr
              key={role.id}
              className={clsx("grid items-center gap-2 -mx-2", GRID_COLS)}
            >
              <td className="h-8 overflow-hidden">
                <Link
                  href={`/app/roles/${role.id}`}
                  className="flex items-center gap-2 hover:bg-neutral-800 px-2 rounded h-full"
                  prefetch={false}
                >
                  {role.icon ? (
                    <div className="aspect-square size-4 flex items-center justify-center rounded overflow-hidden flex-none">
                      <Image
                        src={`https://${env.NEXT_PUBLIC_R2_PUBLIC_URL}/${role.icon.id}`}
                        alt=""
                        width={16}
                        height={16}
                        className="max-w-full max-h-full"
                        unoptimized={["image/svg+xml", "image/gif"].includes(
                          role.icon.mimeType,
                        )}
                        loading="lazy"
                      />
                    </div>
                  ) : (
                    <div className="size-4 flex-none" />
                  )}

                  <p className="overflow-hidden text-ellipsis whitespace-nowrap text-sm">
                    {role.name}
                  </p>
                </Link>
              </td>

              <td>
                <YesNoCheckbox yesLabel="" noLabel="" />
              </td>

              <td>
                <YesNoCheckbox yesLabel="" noLabel="" />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
};
