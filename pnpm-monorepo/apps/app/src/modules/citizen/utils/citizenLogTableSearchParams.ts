import { filterCheckboxListParsers } from "@/modules/common/utils/filterCheckboxListParsers";
import { CitizenLogTableSort } from "@sam-monorepo/domain";
import { createLoader, createSerializer, parseAsStringEnum } from "nuqs/server";

export const citizenLogTableParsers = {
  ...filterCheckboxListParsers,
  sort: parseAsStringEnum(Object.values(CitizenLogTableSort)).withDefault(
    CitizenLogTableSort.CreatedAtDescending,
  ),
};

export const loadCitizenLogTableSearchParams = createLoader(
  citizenLogTableParsers,
);

export const serializeCitizenLogTableSearchParams = createSerializer(
  citizenLogTableParsers,
);
