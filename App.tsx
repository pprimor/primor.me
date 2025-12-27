import React from 'react';
import './src/globals.css';
import { Toaster } from 'react-hot-toast';
import Header from './src/components/Header';
import Footer from './src/components/Footer';
import ThemeSwitcher from './src/components/ThemeSwitcher';
import ActiveSectionContextProvider from './src/context/active-section-context';
import ThemeContextProvider from './src/context/theme-context';
import Home from './src/page';

export default function App() {
  return (
    <>
      <div className="bg-[#ffdada] dark:bg-[#946263] absolute top-[-6rem] -z-10 right-[10rem] h-[30rem] w-[30rem] rounded-full blur-[10rem] sm:w-[70rem]" />
      <div className="bg-[#ecf2ff] dark:bg-[#676694] absolute top-[-6rem] -z-10 left-[-35rem] h-[30rem] w-[50rem] rounded-full blur-[10rem] sm:w-[70rem] md:left-[-30rem] lg:left-[-25rem] xl:left-[-15rem] 2xl:left-[-5rem]" />
      <ThemeContextProvider>
        <ActiveSectionContextProvider>
          <Header />
          <Toaster position="bottom-center" />
          <Home />
          <Footer />
          <ThemeSwitcher />
        </ActiveSectionContextProvider>
      </ThemeContextProvider>
    </>
  );
}


