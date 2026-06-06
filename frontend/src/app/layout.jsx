import { Inter, Mulish } from "next/font/google";
import "./globals.css";
import MobileBottomNav from "../components/MobileBottomNav";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const mulish = Mulish({
  variable: "--font-mulish",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800", "900"],
});

export const metadata = {
  title: "Commerce Gyan | Best Coaching Center in Katrasgarh",
  description: "Join Commerce Gyan for the best coaching in Commerce, B.Com, CA, CMA, CS Foundation, and School Classes in Katrasgarh. Learn from Tabarak Sir.",
  keywords: "Commerce Gyan, Coaching Center Katrasgarh, Commerce Classes Katras, CA Foundation, CMA Foundation, CS Foundation, B.Com Coaching",
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${mulish.variable} h-full antialiased`}
    >
      <body className="font-sans min-h-full flex flex-col">
        <div className="flex-1 pb-16 lg:pb-0">{children}</div>
        <MobileBottomNav />
      </body>
    </html>
  );
}
