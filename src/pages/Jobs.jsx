import { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { getAllLeads } from '../api/leads'
import { logout } from '../api/auth'
import Navbar from '../components/Navbar'
import Sidebar from '../components/Sidebar'

const JOB_STATUSES = ['Booked', 'Fitted', 'Invoiced']

const formatDate = (iso) =>
  new Date(iso).toLocaleDateString('en-GB', { weekday: 'short', day: '2-digit', month: 'short', year: 'numeric' })

export default function Jobs() {
  const [leads, setLeads] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    const fetchLeads = async () => {
      try {
        setLeads(await getAllLeads())
      } catch (err) {
        setError('Failed to load jobs')
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

  const groups = useMemo(() => {
    const jobs = leads.filter((l) => JOB_STATUSES.includes(l.status))
    const scheduled = jobs.filter((l) => l.installDate).sort((a, b) => a.installDate.localeCompare(b.installDate))
    const unscheduled = jobs.filter((l) => !l.installDate)

    const byDate = []
    scheduled.forEach((lead) => {
      const last = byDate[byDate.length - 1]
      if (last && last.date === lead.installDate) {
        last.leads.push(lead)
      } else {
        byDate.push({ date: lead.installDate, leads: [lead] })
      }
    })

    return { byDate, unscheduled }
  }, [leads])

  if (loading) return <p className="loading">Loading jobs...</p>
  if (error) return <p className="error">{error}</p>

  return (
    <div>
      <Navbar onLogout={handleLogout} />
      <div className="app-body">
        <Sidebar />
        <div className="dashboard-container">
          <div className="dashboard-header">
            <h1>Jobs</h1>
          </div>

          {groups.byDate.length === 0 && groups.unscheduled.length === 0 && (
            <p className="activity-empty">No booked, fitted, or invoiced jobs yet.</p>
          )}

          {groups.byDate.map((group) => (
            <div className="job-group" key={group.date}>
              <div className="job-group-date">{formatDate(group.date)}</div>
              <div className="job-cards">
                {group.leads.map((lead) => (
                  <div className="job-card" key={lead.id} onClick={() => navigate(`/leads/${lead.id}`)}>
                    <div className="job-card-top">
                      <span className="job-card-name">{lead.name}</span>
                      <span className={`status-badge status-${lead.status.toLowerCase()}`}>{lead.status}</span>
                    </div>
                    <div className="job-card-meta">{lead.postcode} &middot; {lead.material} &middot; {lead.size}</div>
                  </div>
                ))}
              </div>
            </div>
          ))}

          {groups.unscheduled.length > 0 && (
            <div className="job-group">
              <div className="job-group-date job-group-date-muted">No install date set</div>
              <div className="job-cards">
                {groups.unscheduled.map((lead) => (
                  <div className="job-card" key={lead.id} onClick={() => navigate(`/leads/${lead.id}`)}>
                    <div className="job-card-top">
                      <span className="job-card-name">{lead.name}</span>
                      <span className={`status-badge status-${lead.status.toLowerCase()}`}>{lead.status}</span>
                    </div>
                    <div className="job-card-meta">{lead.postcode} &middot; {lead.material} &middot; {lead.size}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
