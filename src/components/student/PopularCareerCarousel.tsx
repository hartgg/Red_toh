"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import clsx from "clsx";

export interface PopularCareerSlide {
  id: string;
  title: string;
  description: string;
  imageUrl: string | null;
}

interface PopularCareerCarouselProps {
  slides: PopularCareerSlide[];
}

const fallbackSlides: PopularCareerSlide[] = [
  {
    id: "rice",
    title: "ปลูกข้าวอินทรีย์",
    description: "เริ่มต้นอาชีพเกษตรที่คนไทยคุ้นเคย",
    imageUrl: null,
  },
  {
    id: "fruit",
    title: "สวนผลไม้",
    description: "ต่อยอดพื้นที่ว่างให้เป็นรายได้ประจำ",
    imageUrl: null,
  },
  {
    id: "fish",
    title: "เลี้ยงปลา",
    description: "อาชีพเสริมที่เริ่มได้แบบค่อยเป็นค่อยไป",
    imageUrl: null,
  },
];

export default function PopularCareerCarousel({
  slides,
}: PopularCareerCarouselProps) {
  const displaySlides =
    slides.length > 0 ? slides.slice(0, 3) : fallbackSlides;
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      setActiveIndex(
        (currentIndex) =>
          (currentIndex + 1) % displaySlides.length
      );
    }, 5000);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [displaySlides.length]);

  return (
    <section className="overflow-hidden bg-gray-200 md:rounded-3xl">
      <div className="relative aspect-[5/2] md:aspect-[4/1]">
        {displaySlides.map((slide, index) => {
          const isActive = index === activeIndex;

          return (
            <div
              key={slide.id}
              className={clsx(
                "absolute inset-0 transition-opacity duration-700",
                isActive ? "opacity-100" : "opacity-0"
              )}
              aria-hidden={!isActive}
            >
              {slide.imageUrl ? (
                <Image
                  src={slide.imageUrl}
                  alt={slide.title}
                  fill
                  sizes="100vw"
                  className="object-cover"
                />
              ) : (
                <div className="h-full w-full bg-gray-200" />
              )}
            </div>
          );
        })}

        <div className="absolute bottom-5 left-1/2 flex -translate-x-1/2 gap-2">
          {displaySlides.map((slide, index) => (
            <button
              key={slide.id}
              type="button"
              onClick={() => setActiveIndex(index)}
              className={clsx(
                "h-3 rounded-full transition-all",
                index === activeIndex
                  ? "w-9 bg-white"
                  : "w-3 bg-white/70"
              )}
              aria-label={`ดูภาพที่ ${index + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
