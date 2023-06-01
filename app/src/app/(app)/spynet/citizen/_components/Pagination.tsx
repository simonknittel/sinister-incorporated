import clsx from "clsx";

interface Props {
  className?: string;
}

const Pagination = ({ className }: Props) => {
  return (
    <div className={clsx(className)}>
      <p>Pagination</p>
    </div>
  );
};

export default Pagination;
