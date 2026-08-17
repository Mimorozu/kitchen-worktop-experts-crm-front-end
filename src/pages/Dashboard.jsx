import { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { getAllLeads, updateLead } from '../api/leads'
import { logout } from '../api/auth'
import Navbar from '../components/Navbar'
import Sidebar from '../components/Sidebar'
import KanbanBoard from '../components/KanbanBoard'
import { STATUSES } from '../constants'

const todayISO = () => new Date().toISOString().slice(0, 10)

const isDue = (lead) =>
  lead.followUpDate && lead.followUpDate <= todayISO() && lead.status !== 'Fitted' &&
  lead.status !== 'Invoiced' && lead.status !== 'Lost'

export default function Dashboard() {
  const [leads, setLeads] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [view, setView] = useState('table')
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [sortKey, setSortKey] = useState('createdAt')
  const [sortDir, setSortDir] = useState('desc')
  const navigate = useNavigate()

  useEffect(() => {
    const fetchLeads = async () => {
      try {
        const data = await getAllLeads()
        setLeads(data)
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

  const handleStatusChange = async (leadId, status) => {
    const prev = leads
    setLeads((ls) => ls.map((l) => (l.id === leadId ? { ...l, status } : l)))
    try {
      await updateLead(leadId, { status })
    } catch (err) {
      setLeads(prev)
      setError('Failed to update status')
    }
  }

  const handleSort = (key) => {
    if (sortKey === key) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortKey(key)
      setSortDir('asc')
    }
  }

  const visibleLeads = useMemo(() => {
    const term = search.trim().toLowerCase()
    let result = leads.filter((lead) => {
      const matchesTerm = !term ||
        lead.name?.toLowerCase().includes(term) ||
        lead.email?.toLowerCase().includes(term) ||
        lead.postcode?.toLowerCase().includes(term)
      const matchesStatus = !statusFilter || lead.status === statusFilter
      return matchesTerm && matchesStatus
    })

    result = [...result].sort((a, b) => {
      const av = a[sortKey] ?? ''
      const bv = b[sortKey] ?? ''
      if (av < bv) return sortDir === 'asc' ? -1 : 1
      if (av > bv) return sortDir === 'asc' ? 1 : -1
      return 0
    })

    return result
  }, [leads, search, statusFilter, sortKey, sortDir])

  const dueCount = useMemo(() => leads.filter(isDue).length, [leads])

  const sortIndicator = (key) => (sortKey === key ? (sortDir === 'asc' ? ' ▲' : ' ▼') : '')

  if (loading) return <p className="loading">Loading leads...</p>
  if (error) return <p className="error">{error}</p>

  return (
    <div>
      <Navbar onLogout={handleLogout} />
      <div className="app-body">
        <Sidebar />
        <div className="dashboard-container">
          <div className="dashboard-header">
            <h1>Leads</h1>
            <div className="dashboard-header-actions">
              <div className="view-toggle">
                <button
                  className={view === 'table' ? 'active' : ''}
                  onClick={() => setView('table')}
                >
                  Table
                </button>
                <button
                  className={view === 'board' ? 'active' : ''}
                  onClick={() => setView('board')}
                >
                  Board
                </button>
              </div>
              <button onClick={() => navigate('/leads/new')}>+ New Lead</button>
            </div>
          </div>

          <div className="dashboard-toolbar">
            <input
              type="text"
              className="search-input"
              placeholder="Search name, email, postcode..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
              <option value="">All statuses</option>
              {STATUSES.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
            {dueCount > 0 && (
              <span className="due-badge">{dueCount} follow-up{dueCount > 1 ? 's' : ''} due</span>
            )}
          </div>

          {view === 'table' ? (
            <table className="leads-table">
              <thead>
                <tr>
                  <th className="sortable" onClick={() => handleSort('name')}>Name{sortIndicator('name')}</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th className="sortable" onClick={() => handleSort('postcode')}>Postcode{sortIndicator('postcode')}</th>
                  <th className="sortable" onClick={() => handleSort('material')}>Material{sortIndicator('material')}</th>
                  <th>Size</th>
                  <th className="sortable" onClick={() => handleSort('status')}>Status{sortIndicator('status')}</th>
                  <th className="sortable" onClick={() => handleSort('createdAt')}>Date{sortIndicator('createdAt')}</th>
                </tr>
              </thead>
              <tbody>
                {visibleLeads.map((lead) => (
                  <tr
                    key={lead.id}
                    onClick={() => navigate(`/leads/${lead.id}`)}
                    className="lead-row"
                  >
                    <td>
                      {lead.name}
                      {isDue(lead) && <span className="due-dot" title="Follow-up due" />}
                    </td>
                    <td>{lead.email}</td>
                    <td>{lead.phone}</td>
                    <td>{lead.postcode}</td>
                    <td>{lead.material}</td>
                    <td>{lead.size}</td>
                    <td>
                      <span className={`status-badge status-${lead.status.toLowerCase()}`}>
                        {lead.status}
                      </span>
                    </td>
                    <td>{new Date(lead.createdAt).toLocaleDateString('en-GB')}</td>
                  </tr>
                ))}
                {visibleLeads.length === 0 && (
                  <tr>
                    <td colSpan={8} className="empty-cell">No leads match your filters.</td>
                  </tr>
                )}
              </tbody>
            </table>
          ) : (
            <KanbanBoard leads={visibleLeads} onStatusChange={handleStatusChange} />
          )}
        </div>
      </div>
    </div>
  )
}
