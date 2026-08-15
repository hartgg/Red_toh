import Button from "./Button";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export default function Pagination({
  currentPage,
  totalPages,
  onPageChange,
}: PaginationProps) {

  if (totalPages <= 1) {
    return null;
  }


  const pages = Array.from(
    {
      length: totalPages,
    },
    (_, index) => index + 1
  );


  return (
    <div
      className="
        mt-8
        flex
        flex-wrap
        items-center
        justify-center
        gap-2
      "
    >
      <Button
        variant="outline"
        disabled={currentPage === 1}
        onClick={() =>
          onPageChange(currentPage - 1)
        }
      >
        ก่อนหน้า
      </Button>


      {pages.map((page) => (
        <Button
          key={page}
          variant={
            currentPage === page
              ? "primary"
              : "outline"
          }
          onClick={() =>
            onPageChange(page)
          }
        >
          {page}
        </Button>
      ))}


      <Button
        variant="outline"
        disabled={
          currentPage === totalPages
        }
        onClick={() =>
          onPageChange(currentPage + 1)
        }
      >
        ถัดไป
      </Button>
    </div>
  );
}