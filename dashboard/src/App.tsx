import React from 'react';
import { CalendarIcon, InfoIcon, HomeIcon, PlusIcon, FileTextIcon, SunIcon } from 'lucide-react';
export function App() {
  return <div className="w-full min-h-screen bg-white relative overflow-hidden">
      {/* Decorative blurred circles */}
      <div className="absolute top-20 right-10 w-20 h-20 rounded-full bg-yellow-300 blur-2xl opacity-60"></div>
      <div className="absolute top-16 right-24 w-16 h-16 rounded-full bg-blue-300 blur-2xl opacity-60"></div>
      <div className="absolute top-32 right-4 w-24 h-24 rounded-full bg-purple-300 blur-2xl opacity-60"></div>
      <div className="absolute top-24 right-40 w-12 h-12 rounded-full bg-green-200 blur-xl opacity-60"></div>
      <div className="absolute top-40 right-20 w-16 h-16 rounded-full bg-purple-400 blur-2xl opacity-60"></div>
      {/* Header */}
      <div className="flex justify-between items-center px-6 py-4 relative z-10">
        <h1 className="text-3xl font-bold">Cortisol</h1>
        <img src="/eli3.webp" alt="Profile" className="w-12 h-12 rounded-full object-cover" />
      </div>
      {/* Toggle buttons */}
      <div className="flex gap-2 px-6 mb-4 relative z-10">
        <button className="bg-black text-white px-6 py-1 rounded-full text-sm font-medium">
          D
        </button>
        <button className="bg-gray-100 text-black px-6 py-1 rounded-full text-sm font-medium">
          W
        </button>
        <button className="bg-gray-100 text-black px-6 py-1 rounded-full text-sm font-medium">
          M
        </button>
      </div>
      {/* Date selector */}
      <div className="mx-6 mb-4 bg-blue-100 rounded-lg p-3 flex justify-between items-center relative z-10">
        <span className="font-medium">May 16, 2025</span>
        <CalendarIcon size={20} />
      </div>
      {/* Main content card */}
      <div className="mx-6 bg-white rounded-2xl p-5 shadow-sm relative z-10">
        {/* Hormone Trend header */}
        <div className="flex justify-between items-center mb-4">
          <h2 className="font-medium">Hormone trend</h2>
          <InfoIcon size={20} />
        </div>
        {/* Current reading */}
        <div className="mb-4">
          <div className="text-4xl font-bold">
            0.5 <span className="text-base font-normal">ng/mL</span>
          </div>
        </div>
        {/* Chart */}
        <div className="relative h-56 mb-4">
          {/* Y-axis labels */}
          <div className="absolute right-0 top-0 bottom-6 flex flex-col justify-between text-xs text-gray-400">
            <span>10</span>
            <span>8</span>
            <span>6</span>
            <span>4</span>
            <span>2</span>
            <span>0</span>
          </div>
          {/* Chart area */}
          <div className="absolute left-0 right-8 top-0 bottom-6">
            <svg className="w-full h-full" viewBox="0 0 300 200" preserveAspectRatio="none">
              {/* Grid lines */}
              <line x1="0" y1="0" x2="300" y2="0" stroke="#f0f0f0" strokeWidth="1" />
              <line x1="0" y1="40" x2="300" y2="40" stroke="#f0f0f0" strokeWidth="1" />
              <line x1="0" y1="80" x2="300" y2="80" stroke="#f0f0f0" strokeWidth="1" />
              <line x1="0" y1="120" x2="300" y2="120" stroke="#f0f0f0" strokeWidth="1" />
              <line x1="0" y1="160" x2="300" y2="160" stroke="#f0f0f0" strokeWidth="1" />
              <line x1="0" y1="200" x2="300" y2="200" stroke="#f0f0f0" strokeWidth="1" />
              {/* Shaded area */}
              <path d="M 0 10 L 50 30 L 100 60 L 150 90 L 200 120 L 250 140 L 300 160 L 300 200 L 0 200 Z" fill="#93c5fd" opacity="0.3" />
              {/* Line */}
              <path d="M 0 10 L 50 30 L 100 60 L 150 90 L 200 120 L 250 140 L 300 160" stroke="#000" strokeWidth="2" fill="none" />
              {/* Data points */}
              <circle cx="0" cy="10" r="4" fill="#000" />
              <circle cx="250" cy="140" r="4" fill="#000" />
              {/* Vertical line at current time */}
              <line x1="250" y1="0" x2="250" y2="200" stroke="#666" strokeWidth="1" strokeDasharray="2,2" />
            </svg>
            {/* Time label */}
            <div className="absolute top-0 left-[83%] text-xs text-gray-500 -translate-x-1/2 whitespace-nowrap">
              May 16, 9:10PM
            </div>
            <div className="absolute top-4 left-[83%] text-xs font-medium -translate-x-1/2">
              10
            </div>
            {/* Wake up time indicator */}
            <div className="absolute bottom-8 left-0 flex items-center gap-1 text-xs">
              <SunIcon size={14} />
              <span className="font-medium">Wake up time</span>
              <span className="text-gray-500">6:10AM</span>
            </div>
          </div>
          {/* X-axis labels */}
          <div className="absolute bottom-0 left-0 right-8 flex justify-between text-xs text-gray-400">
            <span>6AM</span>
            <span>12PM</span>
            <span>6PM</span>
            <span>12AM</span>
          </div>
        </div>
        {/* Bottom reading */}
        <div className="border-t pt-4 flex justify-between items-center">
          <div>
            <div className="text-xs text-gray-500 mb-1">
              9:30 PM | May 16, 2025
            </div>
            <div className="text-2xl font-bold">
              0.5 <span className="text-sm font-normal">ng/mL</span>
            </div>
          </div>
          <div className="text-sm">Within range</div>
        </div>
      </div>
      {/* Bottom navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t flex items-center justify-around py-3 px-6 z-50">
        <button className="flex flex-col items-center">
          <HomeIcon size={24} />
          <span className="text-xs mt-1">Home</span>
        </button>
        <button className="w-14 h-14 bg-black rounded-full flex items-center justify-center -mt-6">
          <PlusIcon size={28} color="white" />
        </button>
        <button className="flex flex-col items-center">
          <FileTextIcon size={24} />
          <span className="text-xs mt-1">Plans</span>
        </button>
      </div>
    </div>;
}