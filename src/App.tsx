import { Routes, Route, BrowserRouter } from 'react-router-dom'
import Footer from './components/Footer'
import RoomPage from './pages/chatRoom/RoomPage'
import HomePage from './pages/home/HomePage'
import LoginPage from './pages/login/LoginPage'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/room" element={<RoomPage />} />
        <Route path="/login" element={<LoginPage />} />
      </Routes>
      <Footer />
    </BrowserRouter>
  )
}
