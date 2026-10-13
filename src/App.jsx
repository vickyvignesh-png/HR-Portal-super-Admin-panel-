import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ToastProvider } from './context/ToastContext';
import { AppProvider, useApp } from './context/AppContext';
import { SuperAdminLayout } from './components/layout/SuperAdminLayout';

// Pages
import { Login } from './pages/login/Login';
import { Dashboard } from './pages/dashboard/Dashboard';
import { CompanyDetails } from './pages/companies/CompanyDetails';
import { CompanySubscription } from './pages/subscriptions/CompanySubscription';
import { PostedJobs } from './pages/jobs/PostedJobs';
import { ReportedJobs } from './pages/jobs/ReportedJobs';
import { CandidateManagement } from './pages/candidates/CandidateManagement';
import { SubscriptionPlans } from './pages/plans/SubscriptionPlans';
import { PaymentsInvoices } from './pages/billing/PaymentsInvoices';
import { CompanyUsage } from './pages/usage/CompanyUsage';
import { PlatformReports } from './pages/reports/PlatformReports';
import { Support } from './pages/support/Support';
import { RolesPermissions } from './pages/access/RolesPermissions';
import { PlatformSettings } from './pages/settings/PlatformSettings';
import { AuditSecurity } from './pages/security/AuditSecurity';
import { NotFound } from './pages/NotFound';

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useApp();
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

export const App = () => {
  return (
    <ToastProvider>
      <AppProvider>
        <BrowserRouter>
          <Routes>
            {/* Public Login Route */}
            <Route path="/login" element={<Login />} />

            {/* Protected Super Admin Application */}
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <SuperAdminLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<Dashboard />} />
              <Route path="dashboard" element={<Navigate to="/" replace />} />

              {/* Module 2: Company Details */}
              <Route path="companies" element={<CompanyDetails />} />
              <Route path="companies/:id" element={<CompanyDetails />} />

              {/* Module 3: Company Subscription */}
              <Route path="subscriptions" element={<CompanySubscription />} />
              <Route path="subscriptions/:id" element={<CompanySubscription />} />

              {/* Job Management */}
              <Route path="jobs/posted" element={<PostedJobs />} />
              <Route path="jobs/reported" element={<ReportedJobs />} />
              <Route path="jobs" element={<Navigate to="/jobs/posted" replace />} />

              {/* Candidate Management */}
              <Route path="candidates" element={<CandidateManagement />} />

              {/* Module 4: Subscription Plans */}
              <Route path="plans" element={<SubscriptionPlans />} />

              {/* Module 5: Payments & Invoices */}
              <Route path="billing" element={<PaymentsInvoices />} />
              <Route path="payments" element={<Navigate to="/billing" replace />} />

              {/* Module 6: Company Usage */}
              <Route path="usage" element={<CompanyUsage />} />

              {/* Module 7: Platform Reports */}
              <Route path="reports" element={<PlatformReports />} />

              {/* Module 8: Support */}
              <Route path="support" element={<Support />} />

              {/* Module 9: Roles & Permissions */}
              <Route path="access" element={<RolesPermissions />} />
              <Route path="permissions" element={<Navigate to="/access" replace />} />

              {/* Module 10: Platform Settings */}
              <Route path="settings" element={<PlatformSettings />} />

              {/* Module 11: Audit & Security */}
              <Route path="security" element={<AuditSecurity />} />
              <Route path="audit" element={<Navigate to="/security" replace />} />

              {/* 404 Fallback */}
              <Route path="*" element={<NotFound />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </AppProvider>
    </ToastProvider>
  );
};

export default App;
