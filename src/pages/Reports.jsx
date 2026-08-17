import { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { getAllLeads } from '../api/leads'
import { logout } from '../api/auth'
import Navbar from '../components/Navbar'
import Sidebar from '../components/Sidebar'
import { STATUSES, SOURCES } from '../constants'

const currency = (n) => `£${n.toLocaleString('en-GB', { maximumFractionDigits: 0 })}`

export default function Reports() {
  const [leads, setLeads] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    const fetchLeads = async () => {
      try {
        setLeads(await getAllLeads())
      } catch (err) {
        setError('Failed to load leads')
      } finally {
        setLoading(false)
      }
    }
    fetchLeads()
  }, [])

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const stats = useMemo(() => {
    const total = leads.length
    const byStatus = STATUSES.map((status) => {
      const count = leads.filter((l) => l.status === status).length
      return { label: status, count, pct: total ? (count / total) * 100 : 0 }
    })

    const bySource = SOURCES.map((source) => {
      const count = leads.filter((l) => l.source === source).length
      return { label: source, count, pct: total ? (count / total) * 100 : 0 }
    }).filter((s) => s.count > 0)

    const pipelineValue = leads
      .filter((l) => l.status !== 'Lost')
      .reduce((sum, l) => sum + (parseFloat(l.quoteValue) || 0), 0)

    const wonValue = leads
      .filter((l) => ['Booked', 'Fitted', 'Invoiced'].includes(l.status))
      .reduce((sum, l) => sum + (parseFloat(l.quoteValue) || 0), 0)

    const lostCount = leads.filter((l) => l.status === 'Lost').length
    const wonCount = leads.filter((l) => ['Booked', 'Fitted', 'Invoiced'].includes(l.status)).length
    const closedCount = wonCount + lostCount
    const winRate = closedCount ? (wonCount / closedCount) * 100 : 0

    return { total, byStatus, bySource, pipelineValue, wonValue, winRate }
  }, [leads])

  if (loading) return <p className="loading">Loading reports...</p>
  if (error) return <p className="error">{error}</p>

  return (
    <div>
      <Navbar onLogout={handleLogout} />
      <div className="app-body">
        <Sidebar />
        <div className="dashboard-container">
          <div className="dashboard-header">
            <h1>Reports</h1>
          </div>

          <div className="stat-cards">
            <div className="stat-card">
              <div className="stat-card-label">Total Leads</div>
              <div className="stat-card-value">{stats.total}</div>
            </div>
            <div className="stat-card">
              <div className="stat-card-label">Pipeline Value</div>
              <div className="stat-card-value">{currency(stats.pipelineValue)}</div>
            </div>
            <div className="stat-card">
              <div className="stat-card-label">Won Value</div>
              <div className="stat-card-value">{currency(stats.wonValue)}</div>
            </div>
            <div className="stat-card">
              <div className="stat-card-label">Win Rate</div>
              <div className="stat-card-value">{stats.winRate.toFixed(0)}%</div>
            </div>
          </div>

          <div className="report-panels">
            <div className="report-panel">
              <h2>Leads by Status</h2>
              <div className="bar-list">
                {stats.byStatus.map((row) => (
                  <div className="bar-row" key={row.label}>
                    <span className="bar-row-label">{row.label}</span>
                    <div className="bar-track">
                      <div
                        className={`bar-fill status-${row.label.toLowerCase()}-fill`}
                        style={{ width: `${row.pct}%` }}
                      />
                    </div>
                    <span className="bar-row-count">{row.count}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="report-panel">
              <h2>Leads by Source</h2>
              <div className="bar-list">
                {stats.bySource.map((row) => (
                  <div className="bar-row" key={row.label}>
                    <span className="bar-row-label">{row.label}</span>
                    <div className="bar-track">
                      <div className="bar-fill bar-fill-accent" style={{ width: `${row.pct}%` }} />
                    </div>
                    <span className="bar-row-count">{row.count}</span>
                  </div>
                ))}
                {stats.bySource.length === 0 && <p className="activity-empty">No source data yet.</p>}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
