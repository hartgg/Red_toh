"use client";

import Image from "next/image";
import { useState } from "react";
import type { FormEvent } from "react";

import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import { createClient } from "@/lib/supabase/client";
import type {
  HomepageGoalCardImage,
  HomepageGoalKey,
} from "@/types/homepageGoalCard";

interface AdminHomepageGoalCardsFormProps {
  goalImages: HomepageGoalCardImage[];
}

interface GoalCardState {
  goal: HomepageGoalKey;
  title: string;
  imageUrl: string | null;
  imageFile: File | null;
}

interface GoalCardUpsert {
  goal: HomepageGoalKey;
  image_url: string | null;
}

const allowedImageTypes = [
  "image/jpeg",
  "image/png",
  "image/webp",
];

const maxImageSize = 5 * 1024 * 1024;

const goalCardConfig: Array<{
  goal: HomepageGoalKey;
  title: string;
}> = [
  {
    goal: "primary",
    title: "อาชีพหลัก",
  },
  {
    goal: "secondary",
    title: "อาชีพเสริม",
  },
  {
    goal: "income",
    title: "รายได้ที่คาดหวัง",
  },
];

function getImageExtension(file: File) {
  const nameExtension = file.name
    .split(".")
    .pop()
    ?.toLowerCase();

  if (nameExtension) {
    return nameExtension;
  }

  if (file.type === "image/png") {
    return "png";
  }

  if (file.type === "image/webp") {
    return "webp";
  }

  return "jpg";
}

function createInitialCards(
  goalImages: HomepageGoalCardImage[]
): GoalCardState[] {
  return goalCardConfig.map((config) => {
    const savedGoalImage = goalImages.find(
      (item) => item.goal === config.goal
    );

    return {
      goal: config.goal,
      title: config.title,
      imageUrl: savedGoalImage?.image_url ?? null,
      imageFile: null,
    };
  });
}

export default function AdminHomepageGoalCardsForm({
  goalImages,
}: AdminHomepageGoalCardsFormProps) {
  const supabase = createClient();
  const [cards, setCards] = useState<GoalCardState[]>(
    createInitialCards(goalImages)
  );
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  function updateCard(
    goal: HomepageGoalKey,
    values: Partial<GoalCardState>
  ) {
    setCards((currentCards) =>
      currentCards.map((card) =>
        card.goal === goal
          ? {
              ...card,
              ...values,
            }
          : card
      )
    );
    setMessage("");
    setErrorMessage("");
  }

  async function uploadGoalImage(card: GoalCardState) {
    if (!card.imageFile) {
      return card.imageUrl;
    }

    if (!allowedImageTypes.includes(card.imageFile.type)) {
      throw new Error(
        `รูป ${card.title} ต้องเป็นไฟล์ JPG, PNG หรือ WEBP`
      );
    }

    if (card.imageFile.size > maxImageSize) {
      throw new Error(
        `รูป ${card.title} ต้องมีขนาดไม่เกิน 5MB`
      );
    }

    const fileExt = getImageExtension(card.imageFile);
    const filePath = `homepage-goals/${card.goal}-${Date.now()}.${fileExt}`;

    const { error: uploadError } =
      await supabase.storage
        .from("article-images")
        .upload(filePath, card.imageFile, {
          upsert: true,
        });

    if (uploadError) {
      throw new Error(uploadError.message);
    }

    const { data } = supabase.storage
      .from("article-images")
      .getPublicUrl(filePath);

    return data.publicUrl;
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setSaving(true);
    setMessage("");
    setErrorMessage("");

    try {
      const rows: GoalCardUpsert[] = [];

      for (const card of cards) {
        const imageUrl = await uploadGoalImage(card);

        rows.push({
          goal: card.goal,
          image_url: imageUrl,
        });
      }

      const { error } = await supabase
        .from("homepage_goal_cards")
        .upsert(rows, {
          onConflict: "goal",
        });

      if (error) {
        throw new Error(error.message);
      }

      setCards((currentCards) =>
        currentCards.map((card) => {
          const savedRow = rows.find(
            (row) => row.goal === card.goal
          );

          return {
            ...card,
            imageUrl: savedRow?.image_url ?? null,
            imageFile: null,
          };
        })
      );

      setMessage("บันทึกรูปเป้าหมายหน้าแรกสำเร็จ");
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "บันทึกไม่สำเร็จ"
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <Card>
      <form
        onSubmit={handleSubmit}
        className="space-y-6"
      >
        <div>
          <h2 className="text-2xl font-bold text-[#14532D]">
            รูปเป้าหมายหน้าแรก
          </h2>

          <p className="mt-2 text-gray-600">
            อัปโหลดรูปสำหรับ อาชีพหลัก / อาชีพเสริม / รายได้ที่คาดหวัง
          </p>

          <p className="mt-2 rounded-2xl bg-green-50 px-4 py-3 text-sm font-semibold text-green-800">
            ขนาดรูปแนะนำ: 1280 × 720 px หรือ 1920 × 1080 px
            สัดส่วน 16:9
          </p>
        </div>

        <div className="grid gap-5 lg:grid-cols-3">
          {cards.map((card) => (
            <div
              key={card.goal}
              className="rounded-3xl border border-green-100 bg-green-50/50 p-5"
            >
              <h3 className="font-bold text-[#14532D]">
                {card.title}
              </h3>

              <label className="mt-4 block text-sm font-medium text-[#14532D]">
                รูปภาพ
              </label>

              <p className="mt-1 text-xs text-gray-500">
                ใช้รูปแนวนอน 16:9 ขนาดแนะนำ 1280 × 720 px
              </p>

              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                disabled={saving}
                onChange={(event) =>
                  updateCard(card.goal, {
                    imageFile:
                      event.target.files?.[0] ?? null,
                  })
                }
                className="mt-2 w-full rounded-2xl border border-green-200 bg-white px-4 py-3 text-sm"
              />

              {card.imageUrl && (
                <div className="relative mt-4 aspect-video overflow-hidden rounded-2xl bg-white">
                  <Image
                    src={card.imageUrl}
                    alt={`รูป ${card.title}`}
                    fill
                    sizes="(max-width: 1024px) 100vw, 33vw"
                    className="object-cover"
                  />
                </div>
              )}
            </div>
          ))}
        </div>

        {errorMessage && (
          <p className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {errorMessage}
          </p>
        )}

        {message && (
          <p className="rounded-2xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
            {message}
          </p>
        )}

        <div className="flex justify-end border-t border-green-100 pt-6">
          <Button
            type="submit"
            disabled={saving}
          >
            {saving
              ? "กำลังบันทึก..."
              : "บันทึกรูปเป้าหมาย"}
          </Button>
        </div>
      </form>
    </Card>
  );
}
