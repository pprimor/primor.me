import { Toaster } from "react-hot-toast";
import Header from "./components/header";
import ActiveSectionContextProvider from "./context/active-section-context";
import "./globals.css";
import { Inter } from "next/font/google";
import Footer from "./components/footer";
import ThemeSwitcher from "./components/theme-switcher";
import ThemeContextProvider from "./context/theme-context";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Pedro Primor",
  description:
    "Pedro is a software engineer based in Lisbon, Portugal. He is currently working at PageProof as a Junior Software Engineer.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="!scroll-smooth">
      <body
        className={`${inter.className} bg-gray-50 text-gray-950 relative py-28 sm:py-36 dark:bg-gray-900 dark:text-gray-50 dark:text-opacity-90`}
      >
        <div className="bg-[#ffdada] dark:bg-[#946263] absolute top-[-6rem] -z-10 right-[10rem] h-[30rem] w-[30rem] rounded-full blur-[10rem] sm:w-[70rem]" />
        <div className="bg-[#ecf2ff] dark:bg-[#676694] absolute top-[-6rem] -z-10 left-[-35rem] h-[30rem] w-[50rem] rounded-full blur-[10rem] sm:w-[70rem] md:left-[-30rem] lg:left-[-25rem] xl:left-[-15rem] 2xl:left-[-5rem]" />
        <ThemeContextProvider>
          <ActiveSectionContextProvider>
            <Header />
            <Toaster position="bottom-center" />
            {children}
            <Footer />
          </ActiveSectionContextProvider>
          <ThemeSwitcher />
        </ThemeContextProvider>
      </body>
    </html>
  );
}
