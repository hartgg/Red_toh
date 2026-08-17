import SearchBox from "./SearchBox";
import SortDropdown from "./SortDropdown";
import StatusFilter from "./StatusFilter";

interface CourseToolbarProps {
  search: string;
  status: string;
  sort: string;
  statusOptions?: string[];
  sortOptions?: string[];
  onSearchChange: (value: string) => void;
  onStatusChange: (value: string) => void;
  onSortChange: (value: string) => void;
}

export default function CourseToolbar({
  search,
  status,
  sort,
  statusOptions,
  sortOptions,
  onSearchChange,
  onStatusChange,
  onSortChange,
}: CourseToolbarProps) {
  return (
    <div className="mb-8 flex flex-col gap-4 rounded-3xl border border-[#2E7D32]/15 bg-[#FFFDF7] p-5 shadow-sm lg:flex-row lg:items-center lg:justify-between">
      <div className="flex-1">
        <SearchBox
          value={search}
          onChange={onSearchChange}
        />
      </div>

      <div className="flex flex-col gap-4 md:flex-row">
        <StatusFilter
          value={status}
          options={statusOptions}
          onChange={onStatusChange}
        />

        <SortDropdown
          value={sort}
          options={sortOptions}
          onChange={onSortChange}
        />
      </div>
    </div>
  );
}
