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
        border-[#2E7D32]/25
        bg-[#FFFDF7]
        px-4
        py-3
        text-sm
        outline-none
        transition
        focus:border-[#C63228]
        focus:ring-2
        focus:ring-[#C63228]/10
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
