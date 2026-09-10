import { useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import Sidebar from '../components/Sidebar.jsx'
import Navbar from '../components/Navbar.jsx'

const TITLES = {
  '/dashboard': 'Dashboard',
  '/students': 'Students',
  '/spreadsheet': 'Spreadsheet',
  '/contributions': 'Contributions',
  '/debts': 'Debts',
  '/sms': 'SMS Management',
  '/reports': 'Reports',
  '/settings': 'Settings',
}

function pageTitle(pathname) {
  if (TITLES[pathname]) return TITLES[pathname]
  if (pathname.startsWith('/students/')) return 'Student Profile'
  return 'Mkalapa Secondary School'
}

export default function MainLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const location = useLocation()

  return (
    <div className="flex min-h-screen bg-canvas">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex min-h-screen flex-1 flex-col lg:pl-0">
        <Navbar title={pageTitle(location.pathname)} onMenuClick={() => setSidebarOpen(true)} />
        <main className="flex-1 p-4 sm:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
