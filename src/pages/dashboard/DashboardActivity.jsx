import React from 'react';
import { Link } from 'react-router-dom';
import {
  History,
  AlertCircle,
  ArrowRight,
  ShieldCheck,
  CreditCard,
  Building2,
  FileText,
  Clock,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';
import './DashboardActivity.css';

export const DashboardActivity = ({ activities = [], pendingItems = [] }) => {
  return (
    <div className="dashboard-activity-grid">
      {/* Panel 1: Recent Platform Activity */}
      <div className="activity-panel-card">
        <div className="panel-header">
          <div className="panel-title-wrap">
            <History size={18} className="panel-title-icon" />
            <h3 className="panel-title">Recent Platform Activity</h3>
          </div>
          <span className="panel-count-badge">{activities.length} Events</span>
        </div>

        <div className="panel-items-list">
          {activities.length === 0 ? (
            <div className="activity-empty-state">
              <CheckCircle2 size={24} className="text-muted" />
              <span>No recent activity logged in demonstration cache.</span>
            </div>
          ) : (
            activities.map((act) => {
              const bulletClass =
                act.type === 'warning'
                  ? 'bullet-warning'
                  : act.type === 'success'
                  ? 'bullet-success'
                  : '';

              return (
                <div key={act.id} className="activity-item-row">
                  <div className={`activity-icon-bullet ${bulletClass}`}>
                    {act.type === 'warning' ? (
                      <AlertTriangle size={14} />
                    ) : act.type === 'success' ? (
                      <CheckCircle2 size={14} />
                    ) : (
                      <Clock size={14} />
                    )}
                  </div>
                  <div className="activity-info">
                    <div className="activity-row-top">
                      <span className="activity-title">{act.title}</span>
                      <span className="activity-time">{act.timestamp}</span>
                    </div>
                    <span className="activity-desc">{act.description}</span>
                    {act.actor && (
                      <span className="activity-actor-tag">{act.actor}</span>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Panel 2: Pending Items (Actionable) */}
      <div className="activity-panel-card">
        <div className="panel-header">
          <div className="panel-title-wrap">
            <AlertCircle size={18} className="panel-title-icon" />
            <h3 className="panel-title">Pending Items Requiring Action</h3>
          </div>
          <span className="panel-count-badge badge-urgent">
            {pendingItems.length} Urgent
          </span>
        </div>

        <div className="panel-items-list">
          {pendingItems.length === 0 ? (
            <div className="activity-empty-state">
              <CheckCircle2 size={24} className="text-muted" />
              <span>All clear! No pending audits or open flags.</span>
            </div>
          ) : (
            pendingItems.map((item) => {
              const badgeClass =
                item.severity === 'critical'
                  ? 'sev-critical'
                  : item.severity === 'warning'
                  ? 'sev-warning'
                  : 'sev-info';

              return (
                <Link
                  key={item.id}
                  to={item.link}
                  className="pending-item-row"
                  title={`Navigate to ${item.title}`}
                >
                  <div className="pending-info">
                    <span className="pending-title">{item.title}</span>
                    <span className="pending-subtitle">{item.subtitle}</span>
                  </div>
                  <div className="pending-action-col">
                    <span className={`pending-badge ${badgeClass}`}>
                      {item.badgeText}
                    </span>
                    <ArrowRight size={15} className="pending-arrow" />
                  </div>
                </Link>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

export default DashboardActivity;
