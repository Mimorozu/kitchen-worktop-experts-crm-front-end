import { useNavigate } from 'react-router-dom'

export default function Navbar({ onLogout }) {
  const navigate = useNavigate()

  return (
    <nav className="navbar">
      <div className="navbar-brand" onClick={() => navigate('/')}>
        Kitchen Worktop Experts — CRM
      </div>
      <div className="navbar-actions">
        <button onClick={() => navigate('/leads/new')}>+ New Lead</button>
        <button className="logout-btn" onClick={onLogout}>Log Out</button>
      </div>
    </nav>
  )
}