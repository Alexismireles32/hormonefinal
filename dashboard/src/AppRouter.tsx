import React from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { App } from './App'
import { HomePage } from './pages/HomePage'
export function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/cortisol" element={<App />} />
      </Routes>
    </BrowserRouter>
  )
}
