import { useLocation, useNavigate } from 'react-router-dom'

const NAV_ITEMS = [
  { label: 'Leads', path: '/' },
  { label: 'Jobs', path: '/jobs' },
  { label: 'Reports', path: '/reports' },
]

export default function Sidebar() {
  const location = useLocation()
  const navigate = useNavigate()

  return (
    <aside className="sidebar">
      <nav className="sidebar-nav">
        {NAV_ITEMS.map((item) => (
          <div
            key={item.path}
            className={`sidebar-link ${location.pathname === item.path ? 'active' : ''}`}
            onClick={() => navigate(item.path)}
          >
            {item.label}
          </div>
        ))}
      </nav>
    </aside>
  )
}
