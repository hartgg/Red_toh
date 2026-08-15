import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

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

export async function updateSession(
  request: NextRequest
) {

  const response = NextResponse.next({
    request,
  });

  const pathname = request.nextUrl.pathname;


  const supabase = createServerClient(

    process.env.NEXT_PUBLIC_SUPABASE_URL!,

    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    
    {
      cookies: {

        getAll() {

          return request.cookies.getAll();

        },


        setAll(cookiesToSet) {

          cookiesToSet.forEach(
            ({ name, value, options }) => {

              request.cookies.set(
                name,
                value
              );


              response.cookies.set(
                name,
                value,
                options
              );

            }
          );

        },

      },

    }

  );


  // Refresh session
const {
  data: {
    user,
  },
} = await supabase.auth.getUser();


if (!user) {

  if (pathname === "/farmer/register") {
    return response;
  }

  return NextResponse.redirect(
    new URL("/login", request.url)
  );

}


const { data: profile } = await supabase
  .from("profiles")
  .select("role")
  .eq("id", user.id)
  .single();

const roleHome = getRoleHome(profile?.role);


if (
  pathname.startsWith("/admin")
  &&
  profile?.role !== "admin"
) {

  return NextResponse.redirect(
    new URL(roleHome, request.url)
  );

}



if (
  pathname === "/farmer/register"
) {

  return response;

}



if (
  pathname.startsWith("/farmer")
  &&
  pathname !== "/farmer/pending"
  &&
  profile?.role !== "farmer"
) {

  return NextResponse.redirect(
    new URL(roleHome, request.url)
  );

}



if (
  pathname === "/farmer/pending"
  &&
  profile?.role !== "farmer_pending"
) {

  return NextResponse.redirect(
    new URL(roleHome, request.url)
  );

}



if (
  pathname.startsWith("/student")
  &&
  profile?.role !== "student"
) {

  return NextResponse.redirect(
    new URL(roleHome, request.url)
  );

}


  return response;

}
