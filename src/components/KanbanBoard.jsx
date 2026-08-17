import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { STATUSES } from '../constants'

export default function KanbanBoard({ leads, onStatusChange }) {
  const navigate = useNavigate()
  const [dragLeadId, setDragLeadId] = useState(null)
  const [overStatus, setOverStatus] = useState(null)

  const handleDrop = (status) => {
    if (dragLeadId) onStatusChange(dragLeadId, status)
    setDragLeadId(null)
    setOverStatus(null)
  }

  return (
    <div className="kanban-board">
      {STATUSES.map((status) => {
        const columnLeads = leads.filter((l) => l.status === status)
        return (
          <div
            key={status}
            className={`kanban-column ${overStatus === status ? 'drag-over' : ''}`}
            onDragOver={(e) => {
              e.preventDefault()
              setOverStatus(status)
            }}
            onDragLeave={() => setOverStatus((s) => (s === status ? null : s))}
            onDrop={() => handleDrop(status)}
          >
            <div className="kanban-column-header">
              <span>{status}</span>
              <span className="kanban-count">{columnLeads.length}</span>
            </div>
            <div className="kanban-column-body">
              {columnLeads.map((lead) => (
                <div
                  key={lead.id}
                  className="kanban-card"
                  draggable
                  onDragStart={() => setDragLeadId(lead.id)}
                  onDragEnd={() => setDragLeadId(null)}
                  onClick={() => navigate(`/leads/${lead.id}`)}
                >
                  <div className="kanban-card-name">{lead.name}</div>
                  <div className="kanban-card-meta">{lead.postcode} &middot; {lead.material}</div>
                  {lead.quoteValue && <div className="kanban-card-quote">£{lead.quoteValue}</div>}
                </div>
              ))}
              {columnLeads.length === 0 && <div className="kanban-empty">No leads</div>}
            </div>
          </div>
        )
      })}
    </div>
  )
}
