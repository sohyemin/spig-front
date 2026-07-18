import Header from './components/Header'
import Hero from './components/Hero'
import Features from './components/Features'
import ChatbotWidget from './components/ChatbotWidget'
import Footer from './components/Footer'

export default function App() {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      <main>
        <Hero />
        <Features />
        <ChatbotWidget />
      </main>
      <Footer />
    </div>
  )
}
