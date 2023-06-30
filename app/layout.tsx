import './globals.css'
import { Inter } from 'next/font/google'
import I18nextProvider from '@/app/components/providers/I18nextProviderWrapper';

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'Pedro Primor',
  description: '',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <I18nextProvider>
      <html lang="en">
        <body className={inter.className}>
            <main className="flex flex-col items-center justify-center min-h-screen py-2">
              {children}
            </main>
        </body>
      </html>
    </I18nextProvider>
  )
}
