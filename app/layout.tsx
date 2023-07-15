import './globals.css'
import Navbar from './components/navbar'

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
    <html lang="en">
      <body className="antialiased max-w-xl flex flex-col mx-4 mt-8 lg:mx-auto">
        <main>
          <Navbar />
          {children}
        </main>
      </body>
    </html>
  )
}
