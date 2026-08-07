import { Routes, Route, BrowserRouter } from 'react-router-dom'
import Footer from './components/Footer'
import RoomPage from './pages/chatRoom/RoomPage'
import HomePage from './pages/home/HomePage'
import LoginPage from './pages/login/LoginPage'
import SignupPage from './pages/signup/SignupPage'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/room" element={<RoomPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
      </Routes>
      <Footer />
    </BrowserRouter>
  )
}
