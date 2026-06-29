import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getAllLeads } from '../api/leads'
import { logout } from '../api/auth'
import Navbar from '../components/Navbar'

export default function Dashboard() {
  const [leads, setLeads] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
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

  if (loading) return <p className="loading">Loading leads...</p>
  if (error) return <p className="error">{error}</p>

  return (
    <div>
      <Navbar onLogout={handleLogout} />
      <div className="dashboard-container">
        <div className="dashboard-header">
          <h1>Leads</h1>
          <button onClick={() => navigate('/leads/new')}>+ New Lead</button>
        </div>
        <table className="leads-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Postcode</th>
              <th>Material</th>
              <th>Size</th>
              <th>Status</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            {leads.map((lead) => (
              <tr
                key={lead.id}
                onClick={() => navigate(`/leads/${lead.id}`)}
                className="lead-row"
              >
                <td>{lead.name}</td>
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
          </tbody>
        </table>
      </div>
    </div>
  )
}