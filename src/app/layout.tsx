import type { Metadata } from "next";
import "./globals.css";

import Footer from "@/components/Footer";


export const metadata: Metadata = {

  title:"RED TOH",

  description:
  "Smart Agriculture Learning Platform"

};



export default function RootLayout({

children,

}: Readonly<{

children: React.ReactNode;

}>) {


return (

<html lang="en">

<body>




<main
className="
min-h-screen
bg-[#F5F1E8]
"
>

{children}

</main>


<Footer />


</body>


</html>

);

}
