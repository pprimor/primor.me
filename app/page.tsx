import Image from 'next/image'
import WorkInProgress from './components/wip'
import Intro from './components/intro'

export default function Home() {
  return (
    <main>
      <Intro />
      <WorkInProgress />
    </main>
  )
}
