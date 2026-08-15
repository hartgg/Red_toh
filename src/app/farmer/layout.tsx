import { ReactNode } from "react";

import FarmerLayoutShell from "@/components/FarmerLayoutShell";

export default function FarmerLayout({
  children,
}: {
  children: ReactNode;
}) {
  return <FarmerLayoutShell>{children}</FarmerLayoutShell>;
}
