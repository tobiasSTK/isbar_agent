import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import IndexPage from './pages/index'
import HomePage from './pages/home'
// import { ThemeProvider } from "./components/theme-provider"
// import Page from '@/pages/page'
import "./App.css"

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<IndexPage />} />
        <Route path="/home" element={<HomePage />} />
        {/* <Route path="/page" element={<Page />} /> */}
      </Routes>
    </Router>
  )
}
