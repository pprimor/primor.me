import Image from 'next/image'
import warning from '@/public/warning.svg'

export default function WorkInProgress() {
  return (
    <section className="flex flex-col items-center justify-center pt-8">
      <Image src={warning} alt="warning sign" priority />
      <h1 className="text-2xl">
        This page is a work in progress.
      </h1>
    </section>
  )
}