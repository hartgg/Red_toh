import {
  BookOpen,
  LayoutDashboard,
  PlusCircle,
  User,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

export interface FarmerMenuItem {
  name: string;
  href: string;
  icon: LucideIcon;
}

export const farmerMenus: FarmerMenuItem[] = [
  {
    name: "แดชบอร์ด",
    href: "/farmer/dashboard",
    icon: LayoutDashboard,
  },
  {
    name: "คอร์สของฉัน",
    href: "/farmer/articles",
    icon: BookOpen,
  },
  {
    name: "สร้างคอร์ส",
    href: "/farmer/articles/create",
    icon: PlusCircle,
  },
  {
    name: "โปรไฟล์",
    href: "/farmer/profile",
    icon: User,
  },
];
