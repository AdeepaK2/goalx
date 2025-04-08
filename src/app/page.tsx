// app/page.tsx
import Header from '../components/Header'
import Achievements from '../components/Achievements'
import OurStory from '../components/OurStory'
import RegistrationButtons from '../components/RegistrationButtons'
import Statistics from '../components/Statistics'
import TopDonations from '../components/TopDonations'
import Reviews from '../components/Reviews'
import Footer from '../components/Footer'

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between">
      <Header />
      <Achievements />
      <OurStory />
      <RegistrationButtons />
      <Statistics />
      <TopDonations />
      <Reviews />
      <Footer />
    </main>
  )
}

