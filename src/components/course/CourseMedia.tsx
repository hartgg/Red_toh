"use client";

import Image from "next/image";
import { useEffect, useMemo } from "react";

interface CourseMediaProps {
  imageFile: File | null;
  setImageFile: (file: File | null) => void;
  disabled?: boolean;
}

const allowedImageTypes = [
  "image/jpeg",
  "image/png",
  "image/webp",
];

const maxImageSize = 5 * 1024 * 1024;

export default function CourseMedia({
  imageFile,
  setImageFile,
  disabled = false,
}: CourseMediaProps) {
  const previewUrl = useMemo(() => {
    if (!imageFile) {
      return null;
    }

    return URL.createObjectURL(imageFile);
  }, [imageFile]);

  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  function handleFileChange(
    e: React.ChangeEvent<HTMLInputElement>
  ) {
    const file = e.target.files?.[0] ?? null;

    if (!file) {
      return;
    }

    if (!allowedImageTypes.includes(file.type)) {
      alert("รองรับเฉพาะไฟล์ JPG, PNG และ WEBP");
      e.target.value = "";
      return;
    }

    if (file.size > maxImageSize) {
      alert("ขนาดรูปต้องไม่เกิน 5MB");
      e.target.value = "";
      return;
    }

    setImageFile(file);
  }

  function handleRemoveImage() {
    setImageFile(null);
  }

  function formatFileSize(bytes: number) {
    if (bytes < 1024) {
      return `${bytes} B`;
    }

    if (bytes < 1024 * 1024) {
      return `${(bytes / 1024).toFixed(1)} KB`;
    }

    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }

  return (
    <div>
      <label className="mb-2 block font-medium text-[#14532D]">
        รูปปกคอร์ส
      </label>

      <label
        className={`
          flex
          cursor-pointer
          flex-col
          items-center
          justify-center
          rounded-3xl
          border-2
          border-dashed
          border-green-200
          bg-green-50
          p-6
          transition
          hover:border-[#14532D]
          hover:bg-green-100
          ${disabled ? "cursor-not-allowed opacity-60" : ""}
        `}
      >
        {previewUrl ? (
          <div className="w-full">
            <Image
              src={previewUrl}
              alt="ตัวอย่างรูปปกคอร์ส"
              width={1200}
              height={700}
              className="h-72 w-full rounded-2xl object-cover"
            />

            <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="font-medium text-[#14532D]">
                  {imageFile?.name}
                </p>

                {imageFile && (
                  <p className="mt-1 text-sm text-gray-500">
                    {formatFileSize(imageFile.size)}
                  </p>
                )}
              </div>

              <button
                type="button"
                disabled={disabled}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleRemoveImage();
                }}
                className="
                  rounded-xl
                  border
                  border-red-200
                  px-4
                  py-2
                  text-sm
                  font-medium
                  text-red-600
                  transition
                  hover:bg-red-50
                  disabled:cursor-not-allowed
                  disabled:opacity-50
                "
              >
                ลบรูป
              </button>
            </div>

            <p className="mt-3 text-center text-sm text-gray-500">
              คลิกเพื่อเลือกรูปใหม่
            </p>
          </div>
        ) : (
          <>
            <div className="text-5xl" aria-hidden="true">
              รูป
            </div>

            <p className="mt-4 font-semibold text-[#14532D]">
              คลิกเพื่ออัปโหลดรูปปก
            </p>

            <p className="mt-2 text-sm text-gray-500">
              JPG, PNG, WEBP
            </p>

            <p className="mt-1 text-xs text-gray-400">
              ขนาดไม่เกิน 5MB
            </p>
          </>
        )}

        <input
          hidden
          type="file"
          accept="image/jpeg,image/png,image/webp"
          disabled={disabled}
          onChange={handleFileChange}
        />
      </label>
    </div>
  );
}
