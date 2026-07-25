import { Routes, Route, BrowserRouter } from 'react-router-dom'
import Footer from './components/Footer'
import RoomPage from './pages/chatRoom/RoomPage'
import HomePage from './pages/home/HomePage'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/room" element={<RoomPage />} />
      </Routes>
      <Footer />
    </BrowserRouter>
  )
}
