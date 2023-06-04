import Link from "next/link";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";

interface Props {
  totalPages: number;
  currentPage: number;
  searchParams: URLSearchParams;
}

const Pagination = ({ totalPages, currentPage, searchParams }: Props) => {
  const prevSearchParams = new URLSearchParams(searchParams);
  prevSearchParams.set("page", (currentPage - 1).toString());

  const nextSearchparams = new URLSearchParams(searchParams);
  nextSearchparams.set("page", (currentPage + 1).toString());

  return (
    <div className="flex h-11">
      {currentPage > 1 ? (
        <Link
          href={`/spynet/citizen?${prevSearchParams.toString()}`}
          className="rounded-l border border-sinister-red-500 hover:border-sinister-red-300 text-sinister-red-500 hover:text-sinister-red-300 flex items-center w-11 justify-center"
          prefetch={false}
        >
          <FaChevronLeft />
        </Link>
      ) : (
        <span className="rounded-l border border-neutral-500 text-neutral-500 flex items-center w-11 justify-center">
          <FaChevronLeft />
        </span>
      )}

      <span className="border-y w-20 flex items-center justify-center border-neutral-500">
        {currentPage} / {totalPages}
      </span>

      {currentPage + 1 <= totalPages ? (
        <Link
          href={`/spynet/citizen?${nextSearchparams.toString()}`}
          className="rounded-r border border-sinister-red-500 hover:border-sinister-red-300 text-sinister-red-500 hover:text-sinister-red-300 flex items-center w-11 justify-center"
          prefetch={false}
        >
          <FaChevronRight />
        </Link>
      ) : (
        <span className="rounded-r border border-neutral-500 text-neutral-500 flex items-center w-11 justify-center">
          <FaChevronRight />
        </span>
      )}
    </div>
  );
};

export default Pagination;
