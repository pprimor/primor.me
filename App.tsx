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
      <div className="bg-gradient-to-br from-pink-300 via-purple-300 to-blue-300 dark:from-pink-900 dark:via-purple-900 dark:to-blue-900 absolute top-[-6rem] -z-10 right-[10rem] h-[30rem] w-[30rem] rounded-full blur-[10rem] sm:w-[70rem] opacity-60" />
      <div className="bg-gradient-to-br from-cyan-300 via-blue-300 to-indigo-300 dark:from-cyan-900 dark:via-blue-900 dark:to-indigo-900 absolute top-[-6rem] -z-10 left-[-35rem] h-[30rem] w-[50rem] rounded-full blur-[10rem] sm:w-[70rem] md:left-[-30rem] lg:left-[-25rem] xl:left-[-15rem] 2xl:left-[-5rem] opacity-50" />
      
      {/* PageProof green effect - positioned behind Experience section */}
      <div 
        className="absolute top-[100rem] sm:top-[100rem] -z-10 left-1/2 -translate-x-1/2 h-[30rem] w-[45rem] rounded-full blur-[10rem] opacity-70 dark:opacity-50"
        style={{
          background: "linear-gradient(-270deg, #0f6f31 0%, #128739 40%)",
        }}
      />
    
      
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


