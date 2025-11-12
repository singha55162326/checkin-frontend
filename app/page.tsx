import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-50 to-zinc-100 dark:from-zinc-900 dark:to-black text-zinc-900 dark:text-zinc-100 font-sans flex items-center justify-center p-4">
      <div className="max-w-4xl mx-auto text-center">
        <h1 className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 dark:from-indigo-400 dark:via-purple-400 dark:to-pink-400 mb-6">
          Employee Check-in System
        </h1>
        
        <p className="text-xl text-zinc-600 dark:text-zinc-400 mb-10 max-w-2xl mx-auto">
          Seamlessly manage employee attendance with real-time check-ins and location tracking.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          <div className="bg-white dark:bg-zinc-800/80 backdrop-blur-sm rounded-2xl shadow-lg p-8 border border-zinc-200 dark:border-zinc-700 transition-all duration-300 hover:shadow-xl">
            <div className="w-16 h-16 bg-indigo-100 dark:bg-indigo-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-8 h-8 text-indigo-600 dark:text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h2 className="text-2xl font-semibold mb-4 text-zinc-800 dark:text-white">Track Attendance</h2>
            <p className="text-zinc-600 dark:text-zinc-400 mb-6">
              Monitor employee check-ins and check-outs with precise timestamps and location data.
            </p>
            <Link href="/dashboard" className="inline-block px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-medium rounded-xl shadow-sm transition-all duration-200 transform hover:scale-105">
              View Dashboard
            </Link>
          </div>
          
          <div className="bg-white dark:bg-zinc-800/80 backdrop-blur-sm rounded-2xl shadow-lg p-8 border border-zinc-200 dark:border-zinc-700 transition-all duration-300 hover:shadow-xl">
            <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-8 h-8 text-emerald-600 dark:text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <h2 className="text-2xl font-semibold mb-4 text-zinc-800 dark:text-white">Secure & Reliable</h2>
            <p className="text-zinc-600 dark:text-zinc-400 mb-6">
              Enterprise-grade security to protect your employee data and attendance records.
            </p>
            <Link href="/dashboard" className="inline-block px-6 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-medium rounded-xl shadow-sm transition-all duration-200 transform hover:scale-105">
              Get Started
            </Link>
          </div>
        </div>
        
        <div className="bg-white dark:bg-zinc-800/80 backdrop-blur-sm rounded-2xl shadow-lg p-8 border border-zinc-200 dark:border-zinc-700 max-w-3xl mx-auto">
          <h2 className="text-2xl font-semibold mb-4 text-zinc-800 dark:text-white">Key Features</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-12 h-12 bg-amber-100 dark:bg-amber-900/30 rounded-full flex items-center justify-center mx-auto mb-3">
                <svg className="w-6 h-6 text-amber-600 dark:text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <h3 className="font-medium text-zinc-800 dark:text-white mb-1">Location Tracking</h3>
              <p className="text-sm text-zinc-600 dark:text-zinc-400">GPS coordinates for each check-in</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-3">
                <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="font-medium text-zinc-800 dark:text-white mb-1">Real-time Updates</h3>
              <p className="text-sm text-zinc-600 dark:text-zinc-400">Instant attendance tracking</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center mx-auto mb-3">
                <svg className="w-6 h-6 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h3 className="font-medium text-zinc-800 dark:text-white mb-1">Detailed Reports</h3>
              <p className="text-sm text-zinc-600 dark:text-zinc-400">Comprehensive analytics</p>
            </div>
          </div>
        </div>
        
        <footer className="mt-12 text-center text-zinc-500 dark:text-zinc-400 text-sm">
          © {new Date().getFullYear()} Employee Check-in System. All rights reserved.
        </footer>
      </div>
    </div>
  );
}