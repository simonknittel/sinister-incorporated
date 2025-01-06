import { Link } from "@/common/components/Link";
import { isOpenAIEnabled } from "@/common/utils/isOpenAIEnabled";
import { env } from "@/env";
import clsx from "clsx";
import Image from "next/image";
import { getRoles } from "../queries";
import { Create } from "./Create";

type Props = Readonly<{
  className?: string;
}>;

export const RolesTile = async ({ className }: Props) => {
  const roles = await getRoles();

  return (
    <section
      className={clsx(
        className,
        "max-w-4xl p-4 lg:p-8 rounded-2xl bg-neutral-800/50 ",
      )}
    >
      {roles.map((role) => (
        <Link
          key={role.id}
          href={`/app/roles/${role.id}`}
          className="flex items-center gap-2 hover:bg-neutral-800 p-2 rounded"
        >
          {role.iconId && (
            <div className="aspect-square w-8 h-8 flex items-center justify-center rounded overflow-hidden">
              <Image
                src={`https://${env.NEXT_PUBLIC_R2_PUBLIC_URL}/${role.iconId}`}
                alt=""
                width={32}
                height={32}
                className="max-w-full max-h-full"
              />
            </div>
          )}

          <p className="font-bold">{role.name}</p>
        </Link>
      ))}

      {roles.length <= 0 && (
        <p className="text-neutral-500 italic">Keine Rollen vorhanden</p>
      )}

      <Create
        className="mt-4"
        enableSuggestions={await isOpenAIEnabled("RoleNameSuggestions")}
      />
    </section>
  );
};
