import FarmerProfileForm from "@/components/FarmerProfileForm";
import Container from "@/components/ui/Container";
import SectionTitle from "@/components/ui/SectionTitle";
import { requireFarmer } from "@/lib/auth";

export default async function FarmerProfile() {
  const { user } = await requireFarmer();

  return (
    <Container className="py-8">
      <SectionTitle
        title="โปรไฟล์เกษตรกร"
        subtitle="ข้อมูลนี้ช่วยให้ผู้เรียนรู้จักผู้สอนและพื้นที่ทำการเกษตรของคุณ"
      />

      <FarmerProfileForm userId={user.id} />
    </Container>
  );
}
