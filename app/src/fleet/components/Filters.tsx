import { BooleanFilter } from "@/common/components/BooleanFilter";

export const Filters = () => {
  return (
    <div className="flex gap-4 items-center">
      <p>Filter</p>

      <BooleanFilter identifier="flight_ready">Flight ready</BooleanFilter>
    </div>
  );
};
