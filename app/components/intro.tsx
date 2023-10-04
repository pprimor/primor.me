import Image from 'next/image';
import React from 'react';
import me from '@/public/images/me.png';

export default function Intro() {
  return (
    <section>
      <div className='flex items-center justify-center'>
        <div className='relative'>
          <Image 
            src={me} 
            alt='Pedro Primor'
            width={200}
            height={200}
            className='w-24 object-cover drop-shadow-xl'
          />
        </div>
      </div>
    </section>
  );
}