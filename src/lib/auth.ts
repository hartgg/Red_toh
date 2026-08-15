import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export type ProfileRole =
  | "admin"
  | "farmer"
  | "farmer_pending"
  | "student";

export interface UserProfile {
  id: string;
  email: string | null;
  role: ProfileRole;
  full_name: string | null;
}

function getRoleHome(role: string | null | undefined) {
  if (role === "admin") {
    return "/admin/dashboard";
  }

  if (role === "farmer") {
    return "/farmer/dashboard";
  }

  if (role === "farmer_pending") {
    return "/farmer/pending";
  }

  if (role === "student") {
    return "/student/dashboard";
  }

  return "/login";
}

export async function getCurrentUser() {

  const supabase = await createClient();


  const {
    data: { user },
  } = await supabase.auth.getUser();


  if (!user) {
    redirect("/login");
  }


  const { 
    data: profile, 
    error 
  } = await supabase
    .from("profiles")
    .select("id, email, role, full_name")
    .eq("id", user.id)
    .single<UserProfile>();


  if (error || !profile) {
    redirect("/login");
  }


  return {
    user,
    profile,
  };
}



export async function requireAdmin() {

  const { user, profile } = await getCurrentUser();


  if (profile.role !== "admin") {
    redirect(getRoleHome(profile.role));
  }


  return {
    user,
    profile,
  };
}



export async function requireFarmer() {

  const { user, profile } = await getCurrentUser();


  if (profile.role !== "farmer") {
    redirect(getRoleHome(profile.role));
  }


  return {
    user,
    profile,
  };
}



export async function requireStudent() {

  const { user, profile } = await getCurrentUser();


  if (profile.role !== "student") {
    redirect(getRoleHome(profile.role));
  }


  return {
    user,
    profile,
  };
}



export async function requireFarmerPending() {

  const { user, profile } = await getCurrentUser();


  if (profile.role !== "farmer_pending") {
    redirect(getRoleHome(profile.role));
  }


  return {
    user,
    profile,
  };
}
