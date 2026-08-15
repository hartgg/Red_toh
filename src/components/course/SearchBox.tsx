"use client";

interface SearchBoxProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export default function SearchBox({
  value,
  onChange,
  placeholder = "ค้นหาคอร์ส...",
}: SearchBoxProps) {
  return (
    <div className="w-full">
      <input
        type="text"
        value={value}
        onChange={(event) =>
          onChange(event.target.value)
        }
        placeholder={placeholder}
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
        "
      />
    </div>
  );
}
