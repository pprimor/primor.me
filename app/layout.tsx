import Header from './components/header'
import './globals.css'
import { Inter } from 'next/font/google'

const inter = Inter({subsets: ['latin']})

export const metadata = {
  title: 'Pedro Primor',
  description: 'Pedro is a software engineer based in Lisbon, Portugal. He is currently working at PageProof as a Junior Software Engineer.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-gray-50 text-gray-950 relative pt-28 sm:pt-36`}>
        <div className='bg-[#ffdada] absolute top-[-6rem] -z-10 right-[10rem] h-[30rem] w-[30rem] rounded-full blur-[10rem] sm:w-[70rem]'/>
        <div className='bg-[#ecf2ff] absolute top-[-6rem] -z-10 left-[-35rem] h-[30rem] w-[50rem] rounded-full blur-[10rem] sm:w-[70rem] md:left-[-30rem] lg:left-[-25rem] xl:left-[-15rem] 2xl:left-[-5rem]'/>
        <Header />  
        {children}
      </body>
    </html>
  )
}
