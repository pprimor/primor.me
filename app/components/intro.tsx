'use client';

import Image from 'next/image';
import React from 'react';
import { motion } from 'framer-motion';
import me from '@/public/images/me.png';
import pageproof from '@/public/images/pageproof-logo.svg';

export default function Intro() {
  return (
    <section className='mb-30 max-w-[50rem] text-center sm:mb-0'>
      <div className='flex items-center justify-center'>
        <div className='relative'>
          <motion.div
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: 'tween', duration: 0.5}}
          >
            <Image 
              src={me} 
              alt='Pedro Primor'
              width={200}
              height={200}
              className='w-24 object-cover drop-shadow-xl'
            />
          </motion.div>
        </div>
      </div>
      <motion.p
        className='mb-10 mt-4 px-4 text-2xl font-medium !leading-[1.5] sm:text-4xl'
        initial={{ opacity: 0, y: 100 }}
        animate={{ opacity: 1, y: 0 }}
      >
        Hey there 👋, I&rsquo;m <b>Pedro</b>. I&rsquo;m a software engineer based in Portugal 🇵🇹 and I&rsquo;m currently working at <a href='https://pageproof.com' className='font-bold hover:underline'>PageProof</a> as a Junior Software Engineer.
      </motion.p>
    </section>
  );
}