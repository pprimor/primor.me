'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { links } from '@/lib/data';
import Link from 'next/link';

export default function Header() {
  return (
    <header className='z-[999] relative'>
      <motion.div 
        className="fixed top-0 left-1/2 h-[4rem] w-full rounded-none border border-white border-opacity-40 bg-white bg-opacity-80 shadow-lg shadow-black/3 backdrop-blur-[0.5rem] sm:top-6 sm:h-[3rem] sm:w-[36rem] sm:rounded-full"
        initial={{ x: '-50%', y: -100, opacity: 0 }}
        animate={{ x: '-50%', y: 0, opacity: 1 }}
      />
      <nav className='flex fixed top-0 left-1/2 h-10 -translate-x-1/2 sm:top-[1.5rem] sm:h-[initial] sm:py-0'>
        <ul className='flex w-[22rem] flex-wrap items-center justify-center gap-y-1 text-[1rem] font-medium text-gray-500 sm:w-[initial] sm:flex-nowrap sm:gap-3'>
          {links.map((link) => (
            <motion.li 
              key={link.hash} 
              className='flex h-3/4 items-center'
              initial={{ y: -100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
            >
              <Link href={link.hash} className='flex w-full items-center justify-center px-3 py-3 hover:text-gray-950 transition'>
                {link.name}
              </Link>
            </motion.li>
          ))}
        </ul>
      </nav>
    </header>
  );
}
