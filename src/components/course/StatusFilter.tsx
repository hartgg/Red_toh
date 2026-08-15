interface StatusFilterProps {
  value: string;
  onChange: (value: string) => void;
  options?: string[];
}

export default function StatusFilter({
  value,
  onChange,
  options = ["ทั้งหมด", "เผยแพร่", "Draft"],
}: StatusFilterProps) {
  return (
    <select
      value={value}
      onChange={(event) =>
        onChange(event.target.value)
      }
      className="
        w-full
        rounded-2xl
        border
        border-green-200
        bg-white
        px-4
        py-3
        text-sm
        outline-none
        transition
        focus:border-[#14532D]
        focus:ring-2
        focus:ring-green-100
        md:w-56
      "
    >
      {options.map((option) => (
        <option
          key={option}
          value={option}
        >
          {option}
        </option>
      ))}
    </select>
  );
}
