import React from 'react';
import { HomeIcon, PlusIcon, FileTextIcon, MessageSquareIcon, SparklesIcon, MoonIcon, ActivityIcon, DropletIcon, BrainIcon, UtensilsIcon, CheckCircle2Icon } from 'lucide-react';
export function HomePage() {
  return <div className="w-full min-h-screen bg-white relative overflow-hidden pb-24">
      {/* Decorative blurred circles */}
      <div className="absolute top-20 right-10 w-20 h-20 rounded-full bg-yellow-300 blur-2xl opacity-60"></div>
      <div className="absolute top-16 right-24 w-16 h-16 rounded-full bg-blue-300 blur-2xl opacity-60"></div>
      <div className="absolute top-32 right-4 w-24 h-24 rounded-full bg-purple-300 blur-2xl opacity-60"></div>
      <div className="absolute top-24 right-40 w-12 h-12 rounded-full bg-green-200 blur-xl opacity-60"></div>
      <div className="absolute top-40 right-20 w-16 h-16 rounded-full bg-purple-400 blur-2xl opacity-60"></div>
      {/* Header with user name */}
      <div className="flex justify-between items-center px-6 py-4 relative z-10">
        <div>
          <h1 className="text-3xl font-bold">Welcome back,</h1>
          <h2 className="text-3xl font-bold">Eli</h2>
        </div>
        <img src="/eli3.webp" alt="Profile" className="w-12 h-12 rounded-full object-cover" />
      </div>
      {/* ReadyScore Card */}
      <div className="mx-6 mb-4 bg-white rounded-2xl p-6 shadow-sm relative z-10">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium">ReadyScore</h3>
          <SparklesIcon size={20} />
        </div>
        <div className="flex items-center gap-6 mb-6">
          {/* Circular progress */}
          <div className="relative w-32 h-32">
            <svg className="w-32 h-32 -rotate-90" viewBox="0 0 120 120">
              {/* Background circle */}
              <circle cx="60" cy="60" r="50" stroke="#f0f0f0" strokeWidth="12" fill="none" />
              {/* Progress circle */}
              <circle cx="60" cy="60" r="50" stroke="#000" strokeWidth="12" fill="none" strokeDasharray={`${68 / 100 * 314} 314`} strokeLinecap="round" />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <div className="text-3xl font-bold">68</div>
                <div className="text-xs text-gray-500">out of 100</div>
              </div>
            </div>
          </div>
          {/* Description */}
          <div className="flex-1">
            <p className="text-sm text-gray-600 mb-2">
              Your body is performing well today. Keep up the good habits!
            </p>
            <div className="text-xs text-gray-500">Updated 2 hours ago</div>
          </div>
        </div>
        {/* Score breakdown cards */}
        <div className="grid grid-cols-3 gap-2">
          {/* Emotional */}
          <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-2">
            <div className="text-[10px] text-purple-700 mb-0.5 font-medium">
              Emotional
            </div>
            <div className="text-xl font-bold text-purple-900">7</div>
            <div className="text-[10px] text-purple-600">/10</div>
          </div>
          {/* Physical */}
          <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-2">
            <div className="text-[10px] text-green-700 mb-0.5 font-medium">
              Physical
            </div>
            <div className="text-xl font-bold text-green-900">8</div>
            <div className="text-[10px] text-green-600">/10</div>
          </div>
          {/* Intellectual */}
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-2">
            <div className="text-[10px] text-blue-700 mb-0.5 font-medium">
              Intellectual
            </div>
            <div className="text-xl font-bold text-blue-900">6</div>
            <div className="text-[10px] text-blue-600">/10</div>
          </div>
        </div>
      </div>
      {/* Ask Chatbot Preview */}
      <div className="mx-6 mb-4 bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 rounded-2xl p-6 shadow-sm relative z-10 overflow-hidden">
        <div className="absolute inset-0 opacity-50" style={{
        background: 'linear-gradient(45deg, #dbeafe, #f3e8ff, #fce7f3, #dbeafe)',
        backgroundSize: '400% 400%',
        animation: 'gradientShift 15s ease infinite'
      }}></div>
        <style>
          {`
            @keyframes gradientShift {
              0% {
                background-position: 0% 50%;
              }
              50% {
                background-position: 100% 50%;
              }
              100% {
                background-position: 0% 50%;
              }
            }
          `}
        </style>
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-black rounded-full flex items-center justify-center">
              <MessageSquareIcon size={20} color="white" />
            </div>
            <h3 className="text-lg font-medium">Ask anything</h3>
          </div>
          <p className="text-sm text-gray-600 mb-4">
            Get personalized insights about your hormones, sleep, and wellness.
          </p>
          <div className="bg-white rounded-lg p-3 flex items-center gap-2">
            <span className="text-sm text-gray-400">
              "How can I improve my cortisol levels?"
            </span>
          </div>
        </div>
      </div>
      {/* Hormonal Age Section */}
      <div className="mx-6 mb-4 bg-white rounded-2xl p-6 shadow-sm relative z-10">
        <h3 className="text-lg font-medium mb-4">Hormonal Age</h3>
        <div className="flex items-end justify-between mb-4">
          <div>
            <div className="text-5xl font-bold mb-1">24</div>
            <div className="text-sm text-gray-500">years old</div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-medium text-green-600 mb-1">-3</div>
            <div className="text-xs text-gray-500">vs chronological age</div>
          </div>
        </div>
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs text-gray-600">Optimal range</span>
            <span className="text-xs font-medium">20-26 years</span>
          </div>
          <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-green-400 to-green-600 rounded-full" style={{
            width: '65%'
          }}></div>
          </div>
        </div>
        <p className="text-xs text-gray-500 mt-3">
          Your hormonal profile suggests your body is functioning 3 years
          younger than your actual age.
        </p>
      </div>
      {/* Impact Section */}
      <div className="mx-6 mb-4 bg-white rounded-2xl p-6 shadow-sm relative z-10">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium">Today's Impact</h3>
          <span className="text-sm text-gray-500">3/5 completed</span>
        </div>
        <p className="text-xs text-gray-600 mb-4">
          Track your daily habits to see how they affect your hormones
        </p>
        {/* Habit items */}
        <div className="space-y-3">
          {/* Sleep */}
          <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl">
            <div className="w-10 h-10 bg-indigo-500 rounded-full flex items-center justify-center flex-shrink-0">
              <MoonIcon size={20} color="white" />
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-medium">Sleep</span>
                <CheckCircle2Icon size={18} className="text-green-600" />
              </div>
              <div className="text-xs text-gray-600">8 hours</div>
            </div>
          </div>
          {/* Exercise */}
          <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-orange-50 to-red-50 rounded-xl">
            <div className="w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center flex-shrink-0">
              <ActivityIcon size={20} color="white" />
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-medium">Exercise</span>
                <CheckCircle2Icon size={18} className="text-green-600" />
              </div>
              <div className="text-xs text-gray-600">30 min cardio</div>
            </div>
          </div>
          {/* Hydration */}
          <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl">
            <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
              <DropletIcon size={20} color="white" />
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-medium">Hydration</span>
                <CheckCircle2Icon size={18} className="text-green-600" />
              </div>
              <div className="text-xs text-gray-600">6/8 glasses</div>
            </div>
          </div>
          {/* Meditation */}
          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl opacity-60">
            <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center flex-shrink-0">
              <BrainIcon size={20} color="white" />
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-medium">Meditation</span>
                <div className="w-5 h-5 border-2 border-gray-300 rounded-full"></div>
              </div>
              <div className="text-xs text-gray-500">Not completed</div>
            </div>
          </div>
          {/* Healthy Meals */}
          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl opacity-60">
            <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center flex-shrink-0">
              <UtensilsIcon size={20} color="white" />
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-medium">Healthy Meals</span>
                <div className="w-5 h-5 border-2 border-gray-300 rounded-full"></div>
              </div>
              <div className="text-xs text-gray-500">Not completed</div>
            </div>
          </div>
        </div>
        {/* Add habit button */}
        <button className="w-full mt-4 py-3 border-2 border-dashed border-gray-300 rounded-xl text-sm font-medium text-gray-600 hover:border-gray-400 hover:text-gray-700 transition-colors">
          + Add new habit
        </button>
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