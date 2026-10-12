import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  LifeBuoy,
  ArrowLeft,
  User,
  Clock,
  Send,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { PageHeader } from '../../components/layout/PageHeader';
import { StatusBadge } from '../../components/common/StatusBadge';
import { Button } from '../../components/common/Button';
import { Select } from '../../components/common/Select';
import { storageService } from '../../services/storageService';
import { useApp } from '../../context/AppContext';
import { useToast } from '../../context/ToastContext';
import { formatDateTime } from '../../utils/formatters';
import { TICKET_STATUSES, TICKET_PRIORITIES } from '../../utils/constants';
import '../../styles/support.css';

export const TicketDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { dataVersion, triggerRefresh } = useApp();
  const { addToast } = useToast();

  const [ticket, setTicket] = useState(null);
  const [newNote, setNewNote] = useState('');
  const [resolutionText, setResolutionText] = useState('');

  useEffect(() => {
    const found = storageService.getTicketById(id);
    if (found) {
      setTicket(found);
      setResolutionText(found.resolution || '');
    }
  }, [id, dataVersion]);

  if (!ticket) {
    return (
      <div className="card">
        <div className="empty-state">
          <h3>Ticket Not Found</h3>
          <p>No support escalation matching ID {id}.</p>
          <Button variant="primary" onClick={() => navigate('/support')}>
            Back to Support Queue
          </Button>
        </div>
      </div>
    );
  }

  const handleUpdateTicket = (fields) => {
    const updated = { ...ticket, ...fields };
    storageService.saveTicket(updated);
    triggerRefresh();
    addToast({
      type: 'success',
      title: 'Ticket Updated',
      message: 'Changes saved to ticket queue.'
    });
  };

  const handleAddNote = (e) => {
    e.preventDefault();
    if (!newNote.trim()) return;

    const now = new Date().toISOString().replace('T', ' ').slice(0, 16);
    const newHistory = [
      ...(ticket.history || []),
      {
        sender: 'Marcus Vance (Super Admin)',
        text: newNote,
        date: now
      }
    ];

    handleUpdateTicket({ history: newHistory });
    setNewNote('');
  };

  const handleSaveResolution = () => {
    handleUpdateTicket({
      resolution: resolutionText,
      status: 'Resolved'
    });
    addToast({
      type: 'success',
      title: 'Resolution Recorded',
      message: 'Ticket has been marked as Resolved.'
    });
  };

  return (
    <div className="dashboard-container">
      <PageHeader
        title={`Ticket ${ticket.id}: ${ticket.subject}`}
        description={`Raised by ${ticket.raisedBy} • ${ticket.companyName}`}
        badge={<StatusBadge status={ticket.status} />}
        actions={
          <Button variant="secondary" icon={ArrowLeft} onClick={() => navigate('/support')}>
            Back to Queue
          </Button>
        }
      />

      <div className="subscription-details-grid">
        {/* Left Column: Details & Discussion */}
        <div className="flex flex-col gap-6">
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">Issue Description</h3>
              <span className={`priority-badge priority-${ticket.priority.toLowerCase()}`}>
                {ticket.priority} Priority
              </span>
            </div>
            <p className="text-primary line-height-relaxed">
              {ticket.description}
            </p>
          </div>

          {/* Timeline Feed */}
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">Internal Notes & Activity Feed</h3>
            </div>

            <div className="timeline-feed">
              {(ticket.history || []).map((entry, index) => (
                <div key={index} className="timeline-entry">
                  <div className="timeline-dot"></div>
                  <div className="flex items-center gap-2">
                    <span className="timeline-author">{entry.sender}</span>
                    <span className="timeline-date">• {entry.date}</span>
                  </div>
                  <div className="timeline-body">{entry.text}</div>
                </div>
              ))}
            </div>

            <form onSubmit={handleAddNote} className="flex gap-2 mt-4">
              <input
                type="text"
                className="form-input"
                placeholder="Post an internal staff update or note..."
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
              />
              <Button variant="primary" type="submit" icon={Send}>
                Post
              </Button>
            </form>
          </div>

          {/* Resolution Card */}
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">Official Resolution Summary</h3>
            </div>
            <div className="form-group">
              <textarea
                className="form-textarea"
                placeholder="Document resolution outcome for customer knowledge base..."
                value={resolutionText}
                onChange={(e) => setResolutionText(e.target.value)}
              />
            </div>
            <div className="flex justify-end">
              <Button
                variant="primary"
                icon={CheckCircle2}
                onClick={handleSaveResolution}
              >
                Mark as Resolved
              </Button>
            </div>
          </div>
        </div>

        {/* Right Column: Metadata & Controls */}
        <div className="flex flex-col gap-6">
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">Ticket Controls</h3>
            </div>

            <div className="flex flex-col gap-4">
              <Select
                label="Ticket Status"
                value={ticket.status}
                onChange={(e) => handleUpdateTicket({ status: e.target.value })}
                options={TICKET_STATUSES}
              />

              <Select
                label="Priority Level"
                value={ticket.priority}
                onChange={(e) => handleUpdateTicket({ priority: e.target.value })}
                options={TICKET_PRIORITIES}
              />

              <Select
                label="Assigned Staff"
                value={ticket.assignedStaff}
                onChange={(e) => handleUpdateTicket({ assignedStaff: e.target.value })}
                options={[
                  'Marcus Vance (Super Admin)',
                  'Elena Rostova (Finance)',
                  'Karthik Rao (Verification)',
                  'Sophia Patel (Support)',
                  'Technical Ops'
                ]}
              />

              <div className="company-info-grid grid-single-col border-t pt-3 gap-2">
                <div className="info-item">
                  <span className="info-label">Category</span>
                  <span className="info-value">{ticket.category}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Created Date</span>
                  <span className="info-value">{formatDateTime(ticket.createdDate)}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Last Updated</span>
                  <span className="info-value">{formatDateTime(ticket.updatedDate)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
