import React from 'react';
import './app/globals.css';
import { Toaster } from 'react-hot-toast';
import Header from './app/components/header';
import Footer from './app/components/footer';
import ThemeSwitcher from './app/components/theme-switcher';
import ActiveSectionContextProvider from './app/context/active-section-context';
import ThemeContextProvider from './app/context/theme-context';
import Home from './app/page';

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


