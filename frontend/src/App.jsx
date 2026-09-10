import { Routes, Route, Navigate } from 'react-router-dom'
import { ToastProvider } from './hooks/useToast.jsx'
import MainLayout from './layouts/MainLayout.jsx'

import Dashboard from './pages/Dashboard.jsx'
import Students from './pages/Students.jsx'
import StudentProfile from './pages/StudentProfile.jsx'
import Spreadsheet from './pages/Spreadsheet.jsx'
import Contributions from './pages/Contributions.jsx'
import Debts from './pages/Debts.jsx'
import SMSManagement from './pages/SMSManagement.jsx'
import Reports from './pages/Reports.jsx'
import SettingsPage from './pages/Settings.jsx'

export default function App() {
  return (
    <ToastProvider>
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route element={<MainLayout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/students" element={<Students />} />
          <Route path="/students/:id" element={<StudentProfile />} />
          <Route path="/spreadsheet" element={<Spreadsheet />} />
          <Route path="/contributions" element={<Contributions />} />
          <Route path="/debts" element={<Debts />} />
          <Route path="/sms" element={<SMSManagement />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Route>
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </ToastProvider>
  )
}
