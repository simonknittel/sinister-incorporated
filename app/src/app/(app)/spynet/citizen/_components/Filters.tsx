import UnknownFilterButton from "./UnknownFilterButton";

interface Props {
  searchParams: URLSearchParams;
}

const Filters = ({ searchParams }: Props) => {
  return (
    <div className="flex gap-4 items-center">
      <p>Filter</p>
      <UnknownFilterButton />
    </div>
  );
};

export default Filters;
