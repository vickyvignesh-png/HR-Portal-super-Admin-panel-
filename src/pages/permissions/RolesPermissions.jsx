import React, { useState, useMemo } from 'react';
import {
  ShieldCheck,
  Plus,
  Eye,
  Edit2,
  Users,
  Shield,
  CheckCircle,
  AlertCircle,
  KeyRound,
  RotateCcw
} from 'lucide-react';
import { PageHeader } from '../../components/layout/PageHeader';
import { DataTable } from '../../components/common/DataTable';
import { SearchBar } from '../../components/common/SearchBar';
import { Pagination } from '../../components/common/Pagination';
import { StatusBadge } from '../../components/common/StatusBadge';
import { Button } from '../../components/common/Button';
import { Modal } from '../../components/common/Modal';
import { Input } from '../../components/common/Input';
import { Select } from '../../components/common/Select';
import { storageService } from '../../services/storageService';
import { useApp } from '../../context/AppContext';
import { useToast } from '../../context/ToastContext';
import { formatDate } from '../../utils/formatters';
import './RolesPermissions.css';

const AVAILABLE_PERMISSIONS = ['View', 'Create', 'Edit', 'Approve', 'Export'];

export const RolesPermissions = () => {
  const { dataVersion, triggerRefresh } = useApp();
  const { addToast } = useToast();

  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 8;

  // In-page modals (ZERO URL changes on View/Edit)
  const [isCreateRoleModalOpen, setIsCreateRoleModalOpen] = useState(false);
  const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false);
  const [viewingUser, setViewingUser] = useState(null);
  const [editingUser, setEditingUser] = useState(null);

  // Create Role Form state
  const [roleForm, setRoleForm] = useState({
    name: '',
    description: '',
    permissions: ['View']
  });
  const [roleErrors, setRoleErrors] = useState({});

  // Add / Edit User Form state
  const [userForm, setUserForm] = useState({
    id: '',
    name: '',
    email: '',
    mobile: '',
    role: '',
    status: 'Active',
    twoFactorEnabled: true
  });
  const [userErrors, setUserErrors] = useState({});

  const roles = useMemo(() => {
    return storageService.getRoles();
  }, [dataVersion]);

  const adminUsers = useMemo(() => {
    return storageService.getAdminUsers();
  }, [dataVersion]);

  // Filtering users
  const filteredUsers = useMemo(() => {
    let result = [...adminUsers];

    if (searchTerm) {
      const lower = searchTerm.toLowerCase().trim();
      result = result.filter(
        (u) =>
          (u.name && u.name.toLowerCase().includes(lower)) ||
          (u.email && u.email.toLowerCase().includes(lower)) ||
          (u.id && u.id.toLowerCase().includes(lower)) ||
          (u.role && u.role.toLowerCase().includes(lower))
      );
    }

    if (roleFilter) {
      result = result.filter((u) => u.role === roleFilter);
    }

    return result;
  }, [adminUsers, searchTerm, roleFilter]);

  const totalPages = Math.ceil(filteredUsers.length / pageSize) || 1;
  const paginatedUsers = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredUsers.slice(start, start + pageSize);
  }, [filteredUsers, currentPage]);

  // Step 1: Create Role
  const handleOpenCreateRole = () => {
    setRoleForm({
      name: '',
      description: '',
      permissions: ['View']
    });
    setRoleErrors({});
    setIsCreateRoleModalOpen(true);
  };

  const handleTogglePermission = (perm) => {
    setRoleForm((prev) => {
      const exists = prev.permissions.includes(perm);
      return {
        ...prev,
        permissions: exists
          ? prev.permissions.filter((p) => p !== perm)
          : [...prev.permissions, perm]
      };
    });
  };

  const handleSaveRole = (e) => {
    e.preventDefault();
    const errors = {};
    if (!roleForm.name.trim()) {
      errors.name = 'Role Name is required';
    } else {
      const lower = roleForm.name.trim().toLowerCase();
      const duplicate = roles.some((r) => r.name.toLowerCase() === lower);
      if (duplicate) {
        errors.name = 'A role with this name already exists';
      }
    }

    if (roleForm.permissions.length === 0) {
      errors.permissions = 'Select at least one permission entitlement';
    }

    if (Object.keys(errors).length > 0) {
      setRoleErrors(errors);
      return;
    }

    storageService.saveRole({
      name: roleForm.name.trim(),
      description: roleForm.description.trim() || 'Custom administrator role',
      permissions: roleForm.permissions
    });

    triggerRefresh();
    setIsCreateRoleModalOpen(false);
    addToast({
      type: 'success',
      title: 'Role Created',
      message: `Role "${roleForm.name.trim()}" was created and is available for user assignment.`
    });
  };

  // Step 2: Add User (Requires at least one role to exist)
  const handleOpenAddUser = () => {
    if (roles.length === 0) {
      addToast({
        type: 'error',
        title: 'Role Required',
        message: 'Please create a role before creating administrative users.'
      });
      return;
    }

    setUserForm({
      id: '',
      name: '',
      email: '',
      mobile: '',
      role: roles[0]?.name || '',
      status: 'Active',
      twoFactorEnabled: true
    });
    setUserErrors({});
    setIsAddUserModalOpen(true);
  };

  const handleOpenEditUser = (user) => {
    setEditingUser(user);
    setUserForm({ ...user });
    setUserErrors({});
  };

  const handleSaveUser = (e) => {
    e.preventDefault();
    const errors = {};
    if (!userForm.name.trim()) errors.name = 'Full Name is required';
    if (!userForm.email.trim()) {
      errors.email = 'Email Address is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(userForm.email)) {
      errors.email = 'Please provide a valid email';
    }
    if (!userForm.role) {
      errors.role = 'Role selection is compulsory';
    } else if (!roles.some((r) => r.name === userForm.role)) {
      errors.role = 'Selected role does not exist';
    }

    if (Object.keys(errors).length > 0) {
      setUserErrors(errors);
      return;
    }

    storageService.saveAdminUser(userForm);
    triggerRefresh();

    if (viewingUser && viewingUser.id === userForm.id) {
      setViewingUser(userForm);
    }

    setIsAddUserModalOpen(false);
    setEditingUser(null);
    addToast({
      type: 'success',
      title: editingUser ? 'User Updated' : 'User Added',
      message: `${userForm.name} profile saved with role ${userForm.role}.`
    });
  };

  // Table Columns
  const tableColumns = [
    {
      key: 'sNo',
      label: 'S.No',
      sortable: false,
      render: (_, index, sNo) => (
        <span className="font-medium text-secondary">
          {typeof sNo === 'number' && !isNaN(sNo)
            ? sNo
            : (Number(currentPage || 1) - 1) * Number(pageSize || 10) + (typeof index === 'number' && !isNaN(index) ? index : 0) + 1}
        </span>
      )
    },
    {
      key: 'id',
      label: 'User ID',
      render: (r) => <span className="font-semibold text-primary">{r.id}</span>
    },
    {
      key: 'name',
      label: 'Full Name',
      render: (r) => (
        <div>
          <span className="font-semibold">{r.name}</span>
          <div className="text-muted text-xs">{r.email}</div>
        </div>
      )
    },
    {
      key: 'mobile',
      label: 'Mobile',
      render: (r) => r.mobile || 'Not provided'
    },
    {
      key: 'role',
      label: 'Assigned Role',
      render: (r) => (
        <span className="perm-chip">{r.role}</span>
      )
    },
    {
      key: 'status',
      label: 'Status',
      render: (r) => <StatusBadge status={r.status} />
    },
    {
      key: 'action',
      label: 'Action',
      sortable: false,
      render: (r) => (
        <div className="access-action-icons">
          <button
            type="button"
            className="access-action-btn"
            title="View User Details"
            aria-label="View User Details"
            onClick={() => setViewingUser(r)}
          >
            <Eye size={16} />
          </button>
          <button
            type="button"
            className="access-action-btn"
            title="Edit User"
            aria-label="Edit User"
            onClick={() => handleOpenEditUser(r)}
          >
            <Edit2 size={16} />
          </button>
        </div>
      )
    }
  ];

  return (
    <div className="access-container">
      <PageHeader
        title="Roles & Permissions"
        actions={
          <div className="access-header-buttons">
            <Button
              variant="secondary"
              icon={Shield}
              onClick={handleOpenCreateRole}
            >
              Create Role
            </Button>
            <Button
              variant="primary"
              icon={Plus}
              onClick={handleOpenAddUser}
              disabled={roles.length === 0}
              title={roles.length === 0 ? 'Create at least one role first' : 'Add administrator'}
            >
              Add User
            </Button>
          </div>
        }
      />

      {/* Role Summary / Role Management Section */}
      <div className="roles-summary-section">
        <div className="roles-summary-header">
          <div className="roles-summary-title">
            <ShieldCheck size={18} className="text-blue" />
            <span>Defined System Roles ({roles.length})</span>
          </div>
          <span className="text-xs text-muted">
            Administrators must belong to an active role before system assignment.
          </span>
        </div>

        <div className="roles-cards-grid">
          {roles.map((role) => (
            <div key={role.id || role.name} className="role-card-item">
              <div className="role-card-top">
                <span className="role-name-bold">{role.name}</span>
                <span className="text-xs text-muted">{role.id}</span>
              </div>
              <p className="role-desc-text">{role.description}</p>
              <div className="role-perms-chips">
                {(role.permissions || ['View']).map((perm) => (
                  <span key={perm} className="perm-chip">
                    {perm}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Separate Toolbar above table with clear gap */}
      <div className="table-toolbar">
        <div className="table-toolbar-left">
          <SearchBar
            value={searchTerm}
            onChange={(val) => {
              setSearchTerm(val);
              setCurrentPage(1);
            }}
            placeholder="Search"
          />

          <select
            className="filter-select"
            value={roleFilter}
            onChange={(e) => {
              setRoleFilter(e.target.value);
              setCurrentPage(1);
            }}
            aria-label="Filter by role"
          >
            <option value="">All Roles</option>
            {roles.map((r) => (
              <option key={r.name} value={r.name}>
                {r.name}
              </option>
            ))}
          </select>

          {(searchTerm || roleFilter) && (
            <button
              type="button"
              className="reset-filters-btn"
              onClick={() => {
                setSearchTerm('');
                setRoleFilter('');
                setCurrentPage(1);
              }}
              title="Reset filters"
            >
              <RotateCcw size={14} />
              <span>Reset Filters</span>
            </button>
          )}
        </div>
      </div>

      {/* Admin Users Table */}
      <div className="table-container">
        <DataTable
          columns={tableColumns}
          data={paginatedUsers}
          currentPage={currentPage}
          pageSize={pageSize}
          emptyTitle="No administrator users found"
          emptyDescription="No users match the search and role filters."
          emptyActionLabel="Clear Filters"
          onEmptyAction={() => {
            setSearchTerm('');
            setRoleFilter('');
          }}
        />

        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={filteredUsers.length}
          pageSize={pageSize}
          onPageChange={setCurrentPage}
        />
      </div>

      {/* STEP 1: CREATE ROLE MODAL */}
      {isCreateRoleModalOpen && (
        <Modal
          isOpen={isCreateRoleModalOpen}
          onClose={() => setIsCreateRoleModalOpen(false)}
          title="Create Security Role"
          size="md"
          footer={
            <div className="flex justify-end gap-2 w-full">
              <Button variant="secondary" onClick={() => setIsCreateRoleModalOpen(false)}>
                Cancel
              </Button>
              <Button variant="primary" onClick={handleSaveRole}>
                Save Role
              </Button>
            </div>
          }
        >
          <form onSubmit={handleSaveRole} className="flex flex-col gap-4">
            <Input
              label="Role Name"
              required
              value={roleForm.name}
              onChange={(e) => {
                setRoleForm({ ...roleForm, name: e.target.value });
                if (roleErrors.name) setRoleErrors({ ...roleErrors, name: null });
              }}
              error={roleErrors.name}
              placeholder="e.g. Compliance Auditor"
            />
            <Input
              label="Role Description"
              value={roleForm.description}
              onChange={(e) => setRoleForm({ ...roleForm, description: e.target.value })}
              placeholder="Specific job responsibilities and authority bounds"
            />

            <div>
              <label className="form-label">
                Module Permissions <span className="required-star">*</span>
              </label>
              {roleErrors.permissions && (
                <span className="form-error mb-2">{roleErrors.permissions}</span>
              )}
              <div className="permissions-matrix-form">
                {AVAILABLE_PERMISSIONS.map((perm) => (
                  <div key={perm} className="permission-row-box">
                    <span className="permission-row-label">{perm} Permission</span>
                    <label className="perm-chk-label">
                      <input
                        type="checkbox"
                        checked={roleForm.permissions.includes(perm)}
                        onChange={() => handleTogglePermission(perm)}
                      />
                      <span>Grant {perm}</span>
                    </label>
                  </div>
                ))}
              </div>
            </div>
          </form>
        </Modal>
      )}

      {/* STEP 2: ADD / EDIT USER MODAL */}
      {(isAddUserModalOpen || editingUser) && (
        <Modal
          isOpen={Boolean(isAddUserModalOpen || editingUser)}
          onClose={() => {
            setIsAddUserModalOpen(false);
            setEditingUser(null);
          }}
          title={editingUser ? `Edit Administrator — ${editingUser.name}` : 'Add Administrator User'}
          size="md"
          footer={
            <div className="flex justify-end gap-2 w-full">
              <Button
                variant="secondary"
                onClick={() => {
                  setIsAddUserModalOpen(false);
                  setEditingUser(null);
                }}
              >
                Cancel
              </Button>
              <Button variant="primary" onClick={handleSaveUser}>
                {editingUser ? 'Save Changes' : 'Add User'}
              </Button>
            </div>
          }
        >
          <form onSubmit={handleSaveUser} className="flex flex-col gap-4">
            <Input
              label="Full Name"
              required
              value={userForm.name}
              onChange={(e) => setUserForm({ ...userForm, name: e.target.value })}
              error={userErrors.name}
              placeholder="e.g. Samantha Wright"
            />
            <Input
              label="Email Address"
              type="email"
              required
              value={userForm.email}
              onChange={(e) => setUserForm({ ...userForm, email: e.target.value })}
              error={userErrors.email}
              placeholder="samantha@hrportal.example.com"
            />
            <Input
              label="Mobile Number"
              value={userForm.mobile || ''}
              onChange={(e) => setUserForm({ ...userForm, mobile: e.target.value })}
              placeholder="+91 98450 67890"
            />
            <Select
              label="Assigned Role"
              required
              value={userForm.role}
              onChange={(e) => setUserForm({ ...userForm, role: e.target.value })}
              options={roles.map((r) => r.name)}
              error={userErrors.role}
            />
            <Select
              label="Account Status"
              value={userForm.status}
              onChange={(e) => setUserForm({ ...userForm, status: e.target.value })}
              options={['Active', 'Suspended', 'Pending']}
            />
            <div className="checkbox-row">
              <input
                type="checkbox"
                id="twoFactorSetting"
                checked={Boolean(userForm.twoFactorEnabled)}
                onChange={(e) => setUserForm({ ...userForm, twoFactorEnabled: e.target.checked })}
              />
              <label htmlFor="twoFactorSetting">Require Multi-Factor Authentication (MFA)</label>
            </div>
          </form>
        </Modal>
      )}

      {/* VIEW USER DETAILS MODAL (No URL Change) */}
      {viewingUser && (
        <Modal
          isOpen={Boolean(viewingUser)}
          onClose={() => setViewingUser(null)}
          title={`Administrator Profile — ${viewingUser.name}`}
          size="md"
          footer={
            <div className="flex justify-end w-full">
              <Button variant="primary" onClick={() => setViewingUser(null)}>
                Close
              </Button>
            </div>
          }
        >
          <div className="flex flex-col gap-3">
            <div className="p-4 bg-subtle rounded-lg flex flex-col gap-2">
              <div><strong>User ID:</strong> {viewingUser.id}</div>
              <div><strong>Full Name:</strong> {viewingUser.name}</div>
              <div><strong>Official Email:</strong> {viewingUser.email}</div>
              <div><strong>Mobile:</strong> {viewingUser.mobile || 'Not provided'}</div>
              <div><strong>Role:</strong> <span className="perm-chip">{viewingUser.role}</span></div>
              <div><strong>Status:</strong> <StatusBadge status={viewingUser.status} /></div>
              <div><strong>MFA Protected:</strong> {viewingUser.twoFactorEnabled ? 'Enabled' : 'Disabled'}</div>
              <div><strong>Last Activity:</strong> {viewingUser.lastLogin || 'Recent'}</div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default RolesPermissions;
