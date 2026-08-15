interface WelcomeBannerProps {
  name: string;
}

export default function WelcomeBanner({
  name,
}: WelcomeBannerProps) {
  return (
    <section
      className="
        rounded-3xl
        bg-gradient-to-r
        from-[#14532D]
        to-[#166534]
        p-8
        text-white
        shadow-lg
      "
    >
      <p className="text-sm opacity-90">
        ยินดีต้อนรับกลับ
      </p>

      <h1 className="mt-2 text-3xl font-bold">
        👨‍🌾 สวัสดี {name}
      </h1>

      <p className="mt-4 max-w-2xl text-green-100">
        จัดการคอร์สเรียน อัปโหลดบทเรียน และแบ่งปันความรู้ด้านการเกษตรให้กับผู้เรียนทั่วประเทศผ่าน RED TOH
      </p>
    </section>
  );
}