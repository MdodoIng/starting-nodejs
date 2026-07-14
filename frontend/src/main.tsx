import React from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom'
import App from './App'
import Login from './pages/Login'
import Signup from './pages/Signup'
import Users from './pages/Users'
import Protected from './pages/Protected'
import './styles.css'

const Root = () => (
  <BrowserRouter>
    <Routes>
      <Route path="/" element={<App />}>
        <Route index element={<Login />} />
        <Route path="signup" element={<Signup />} />
        <Route path="users" element={<Users />} />
        <Route path="protected" element={<Protected />} />
      </Route>
    </Routes>
  </BrowserRouter>
)

createRoot(document.getElementById('root')!).render(<Root />)
