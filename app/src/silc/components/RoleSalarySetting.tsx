import { Tile } from "@/common/components/Tile";
import { SilcSettingKey } from "@prisma/client";
import clsx from "clsx";
import { getRoleSalaries, getSilcSetting } from "../queries";
import { RoleSalariesClient } from "./RoleSalariesClient";

interface Props {
  readonly className?: string;
}

export const RoleSalaries = async ({ className }: Props) => {
  const [salaries, auecConversionRate] = await Promise.all([
    getRoleSalaries(),
    getSilcSetting(SilcSettingKey.AUEC_CONVERSION_RATE),
  ]);

  return (
    <Tile heading="Gehälter" className={clsx(className)}>
      <RoleSalariesClient
        initialSalaries={salaries}
        auecConversionRate={parseInt(auecConversionRate?.value || "0")}
      />
    </Tile>
  );
};
