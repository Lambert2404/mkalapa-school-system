import { useEffect, useState } from 'react'
import {
  Users, UserCheck, AlertTriangle, Wheat, Leaf, Banknote, MessageSquareText, MessageSquareX,
} from 'lucide-react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, Legend,
} from 'recharts'

import reportService from '../services/reportService.js'
import DashboardCard from '../components/DashboardCard.jsx'
import ChartCard from '../components/ChartCard.jsx'
import LoadingSpinner from '../components/LoadingSpinner.jsx'
import EmptyState from '../components/EmptyState.jsx'
import { formatTSh, formatKG, monthLabel, statusBadgeClass, statusLabel } from '../utils/format.js'

const PIE_COLORS = ['#B3412C', '#2C5C43']

export default function Dashboard() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let mounted = true
    setLoading(true)
    reportService.dashboard()
      .then((res) => { if (mounted) setData(res.data) })
      .catch((err) => { if (mounted) setError(err.friendlyMessage || 'Unable to load dashboard data.') })
      .finally(() => { if (mounted) setLoading(false) })
    return () => { mounted = false }
  }, [])

  if (loading) return <LoadingSpinner label="Loading dashboard..." fullPage />
  if (error) return <EmptyState title="Couldn't load dashboard" description={error} icon={AlertTriangle} />
  if (!data) return null

  const completionPie = [
    { name: 'With Debt', value: data.students_with_debt },
    { name: 'Completed', value: data.students_completed },
  ]

  const monthlyTrend = data.monthly_summary.map((m) => ({
    label: `${monthLabel(m.month)} ${m.year}`,
    mahindi_debt: Number(m.mahindi_debt || 0),
    mboga_debt: Number(m.mboga_debt || 0),
    cash_debt: Number(m.cash_debt || 0),
  }))

  const classDebt = data.class_debt_summary.map((c) => ({
    class_name: c.student__class_name,
    mahindi: Number(c.total_mahindi_debt || 0),
    mboga: Number(c.total_mboga_debt || 0),
    cash: Number(c.total_cash_debt || 0),
    students: c.student_count,
  }))

  return (
    <div className="space-y-6">
      {/* A. Top-level cards */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <DashboardCard label="Total Students" value={data.total_students} icon={Users} tone="forest" />
        <DashboardCard label="Students With Debt" value={data.students_with_debt} icon={AlertTriangle} tone="brick" />
        <DashboardCard label="Students Completed" value={data.students_completed} icon={UserCheck} tone="forest" />
        <DashboardCard label="SMS Sent" value={data.sms_sent} icon={MessageSquareText} tone="forest" />
        <DashboardCard label="Total Mahindi Debt" value={formatKG(data.total_mahindi_debt)} icon={Wheat} tone="maize" />
        <DashboardCard label="Total Mboga Debt" value={formatKG(data.total_mboga_debt)} icon={Leaf} tone="maize" />
        <DashboardCard label="Total Cash Debt" value={formatTSh(data.total_cash_debt)} icon={Banknote} tone="brick" />
        <DashboardCard label="SMS Failed" value={data.sms_failed} icon={MessageSquareX} tone="brick" />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {/* B. Debt summary donut */}
        <ChartCard title="Debt Summary" subtitle="Students with debt vs. completed">
          {data.students_with_debt + data.students_completed === 0 ? (
            <EmptyState title="No contribution records yet" />
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={completionPie} dataKey="value" nameKey="name" innerRadius={55} outerRadius={85} paddingAngle={2}>
                  {completionPie.map((entry, idx) => (
                    <Cell key={entry.name} fill={PIE_COLORS[idx % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend verticalAlign="bottom" height={24} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </ChartCard>

        {/* F. Monthly debt trend */}
        <ChartCard title="Monthly Debt Trend" subtitle="Mahindi & Mboga in KG, Cash in TSh" >
          {monthlyTrend.length === 0 ? (
            <EmptyState title="No monthly data yet" />
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={monthlyTrend}>
                <CartesianGrid stroke="#E1E3DA" vertical={false} />
                <XAxis dataKey="label" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Line type="monotone" dataKey="mahindi_debt" name="Mahindi (KG)" stroke="#C99A1F" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="mboga_debt" name="Mboga (KG)" stroke="#2C5C43" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          )}
        </ChartCard>

        {/* G. Class-by-class debt summary */}
        <ChartCard title="Cash Debt by Class" subtitle="TSh outstanding per class">
          {classDebt.length === 0 ? (
            <EmptyState title="No debt records yet" />
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={classDebt}>
                <CartesianGrid stroke="#E1E3DA" vertical={false} />
                <XAxis dataKey="class_name" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip formatter={(v) => formatTSh(v)} />
                <Bar dataKey="cash" name="Cash Debt" fill="#B3412C" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </ChartCard>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {/* C. Students with highest debt */}
        <div className="card overflow-hidden">
          <div className="border-b border-border px-5 py-4">
            <h3 className="font-display text-sm font-semibold text-ink">Students With Highest Debt</h3>
          </div>
          {data.top_debtors.length === 0 ? (
            <EmptyState title="No students have outstanding contributions." />
          ) : (
            <div className="divide-y divide-border">
              {data.top_debtors.map((s, i) => (
                <div key={i} className="flex items-center justify-between px-5 py-3">
                  <div>
                    <p className="text-sm font-medium text-ink">{s.student__full_name}</p>
                    <p className="text-xs text-muted">{s.student__class_name} {s.student__stream} · {monthLabel(s.month)} {s.year}</p>
                  </div>
                  <div className="text-right text-xs text-muted">
                    {s.mahindi_debt > 0 && <span className="mr-2">{formatKG(s.mahindi_debt)} Mahindi</span>}
                    {s.mboga_debt > 0 && <span className="mr-2">{formatKG(s.mboga_debt)} Mboga</span>}
                    {s.cash_debt > 0 && <span className="font-semibold text-brick-600">{formatTSh(s.cash_debt)}</span>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* D & E. Recent activity */}
        <div className="card overflow-hidden">
          <div className="border-b border-border px-5 py-4">
            <h3 className="font-display text-sm font-semibold text-ink">Recent Activity</h3>
          </div>
          <div className="divide-y divide-border">
            {data.recent_sms.length === 0 && data.recent_contributions.length === 0 && (
              <EmptyState title="No recent activity" />
            )}
            {data.recent_sms.slice(0, 4).map((s, i) => (
              <div key={`sms-${i}`} className="flex items-center justify-between px-5 py-3">
                <div>
                  <p className="text-sm font-medium text-ink">SMS to {s.student__full_name}</p>
                  <p className="text-xs text-muted">{s.message_type.replace('_', ' ')}</p>
                </div>
                <span className={statusBadgeClass(s.status)}>{statusLabel(s.status)}</span>
              </div>
            ))}
            {data.recent_contributions.slice(0, 4).map((c, i) => (
              <div key={`contrib-${i}`} className="flex items-center justify-between px-5 py-3">
                <div>
                  <p className="text-sm font-medium text-ink">{c.student__full_name}</p>
                  <p className="text-xs text-muted">{monthLabel(c.month)} {c.year} contribution recorded</p>
                </div>
                <span className={statusBadgeClass(c.status)}>{statusLabel(c.status)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
