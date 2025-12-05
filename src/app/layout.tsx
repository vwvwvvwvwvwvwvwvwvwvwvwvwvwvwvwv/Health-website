import { Fredoka } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/Navbar";

const fredoka = Fredoka({ subsets: ["latin"], weight: ["400", "600"] });

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN">
      <body className={`${fredoka.className} bg-yellow-50 text-toon-dark`}>
        <Navbar />
        {children}
      </body>
    </html>
  );
}
