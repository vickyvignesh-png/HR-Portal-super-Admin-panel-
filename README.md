# HR Portal — Super Admin Frontend

A modern, responsive, and interactive enterprise Super Admin Management Portal built with **React**, **JavaScript ES6+**, **Vite**, and **Pure CSS**.

This frontend application is completely client-side with full persistence powered by browser `localStorage`. No external backend, PostgreSQL, Python, or database setup is needed.

---

## 🎨 Brand Design & Guidelines

- **Primary Blue**: `#2563EB`
- **Secondary White**: `#FFFFFF`
- **Main Background**: `#F8FAFC`
- **Primary Text**: `#0F172A`
- **Secondary Text**: `#64748B`
- **Border**: `#E2E8F0`
- **Success**: `#16A34A`
- **Warning**: `#D97706`
- **Error**: `#DC2626`

> **Strict CSS Rule**: 100% of styles are maintained in separate `.css` files with CSS variables. Zero inline CSS or `style={{ ... }}` expressions are used. No Tailwind or CSS-in-JS dependencies.

---

## 🚀 Implemented Modules (All 11 Modules)

1. **Dashboard (`/`)**
   - KPI metric summaries for Companies, Subscriptions, Payments, and Aggregate Platform Operations.
   - Interactive Recharts Area & Pie visualizations.
   - Pending Super Admin work queue (verifications, failed payments, support escalations, renewals).
   - Date range selector & activity telemetry feed.

2. **Company Details (`/companies`, `/companies/:id`)**
   - 24 company metadata fields: Tenant ID, Legal Entity, Industry, GSTIN, CIN/PAN, contact info.
   - Search by name, ID, email, GSTIN with multi-criteria filters.
   - Simulated GST compliance verification with live feedback and state change.
   - Register demo company modal.
   - Sensitive status updates (Activate, Suspend, Block, Close) requiring audit reason.

3. **Company Subscription (`/subscriptions`, `/subscriptions/:id`)**
   - Plan tiers, term dates, auto-renewal flags, trial deadlines, and grace period countdowns.
   - Detailed fee breakdown (plan amount, discount, tax, total).
   - Cancel and Reactivate actions with confirmation and audit tracking.

4. **Subscription Plans (`/plans`, `/plans/new`, `/plans/:id/edit`)**
   - Tier catalog cards & comprehensive quota comparison matrix.
   - Create and Edit plan forms with quota validation.
   - Feature entitlement switches (Employer Mobile App, Reports, Add-ons).

5. **Payments & Invoices (`/billing`, `/invoices/:id`)**
   - Settlement records, payment gateways (Stripe, Razorpay), transaction references.
   - Failure diagnostic reasons.
   - Simulated refund workflow with modal confirmation.
   - Printable invoice layout (`window.print()`) and PDF export using `jsPDF`.

6. **Company Usage (`/usage`)**
   - Tenant resource consumption tracking (Jobs, alerts, resumes, seats, storage).
   - Class-based visual progress bars with high-usage warning flags (>90%).
   - Filter by threshold and export to CSV.

7. **Platform Reports (`/reports`)**
   - Business intelligence tabs: Revenue & Financials, Registrations & Tenants, Aggregate Usage.
   - Interactive Recharts charts (Area, Bar, Line).
   - Printable view and CSV export.

8. **Support (`/support`, `/support/:id`)**
   - Ticket escalation management with priority indicators (Critical, High, Medium, Low).
   - Timeline discussion feed, internal notes, resolution documentation, and staff assignments.

9. **Roles & Permissions (`/access`)**
   - Internal Super Admin user management (Marcus Vance, Elena Rostova, etc.).
   - Granular Role & Permission Access Control Matrix.

10. **Platform Settings (`/settings`)**
    - Master taxonomy tag lists: Job Categories, Skills, Industries, Locations, Employment Types, Work Modes, Qualifications.
    - Automated notification policy toggles (Email, SMS, high-usage alerts).
    - System defaults (currency, trial duration, tax rate).

11. **Audit & Security (`/security`)**
    - Tamper-evident operational audit trail capturing user, module, action, IP, timestamp, and justification.
    - Value Delta modal displaying before-and-after change diffs.
    - Security & Authentication telemetry logs.

---

## 🛠️ Tech Stack & Dependencies

- **Framework**: React 18 + Vite 6
- **Routing**: React Router DOM v6
- **Icons**: Lucide React
- **Data Visualization**: Recharts
- **PDF Generation**: jsPDF
- **Styling**: Pure CSS with CSS Custom Properties (`src/styles/`)

---

## 📦 Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Run Development Server
```bash
npm run dev
```

The application runs at **`http://localhost:3000`**.

### 3. Build for Production
```bash
npm run build
```

---

## 🔄 Local Persistence & Demo Reset

All edits, new companies, status changes, plans, and settings automatically persist in browser `localStorage`. To restore factory mock demonstration records at any time, click the **"Reset Demo Data"** button located in the Topbar navigation.