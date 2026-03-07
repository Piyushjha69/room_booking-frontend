"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth-context";
import { ProtectedAdminRoute } from "@/components/protected-admin-route";
import { Button } from "@/components/button";
import { DataTable } from "@/components/data-table";
import { Modal } from "@/components/modal";

interface User {
  id: string;
  email: string;
  name: string;
  role: "USER" | "ADMIN";
  createdAt: string;
}

function AdminUsersContent() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [newRole, setNewRole] = useState<"USER" | "ADMIN">("USER");
  const [submitting, setSubmitting] = useState(false);

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem("accessToken");
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/users`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        setUsers(data.data || []);
      }
    } catch (error) {
      console.error("Failed to fetch users:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleUpdateRole = async () => {
    if (!selectedUser) return;
    
    setSubmitting(true);
    setMessage(null);

    try {
      const token = localStorage.getItem("accessToken");
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/users/${selectedUser.id}/role`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ role: newRole }),
      });

      if (response.ok) {
        setMessage({ type: "success", text: "User role updated successfully!" });
        setShowRoleModal(false);
        fetchUsers();
      } else {
        const errorData = await response.json();
        setMessage({ type: "error", text: errorData.message || "Failed to update role" });
      }
    } catch (error) {
      setMessage({ type: "error", text: "Error updating role" });
    } finally {
      setSubmitting(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      router.push("/login");
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  const columns = [
    { key: "name", label: "Name" },
    { key: "email", label: "Email" },
    {
      key: "role",
      label: "Role",
      render: (value: string) => (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
          value === "ADMIN" ? "bg-purple-100 text-purple-800" : "bg-gray-100 text-gray-800"
        }`}>
          {value}
        </span>
      ),
    },
    {
      key: "createdAt",
      label: "Joined",
      render: (value: string) => new Date(value).toLocaleDateString(),
    },
  ];

  const actions = (row: User) => (
    <div className="flex justify-end gap-2">
      <Button 
        variant="secondary" 
        onClick={() => {
          setSelectedUser(row);
          setNewRole(row.role as "USER" | "ADMIN");
          setShowRoleModal(true);
        }}
        className="px-3 py-1 text-sm"
      >
        Change Role
      </Button>
    </div>
  );

  return (
    <ProtectedAdminRoute>
      <div className="min-h-screen bg-gray-50">
        <nav className="bg-white shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16">
              <div className="flex items-center">
                <h1 className="text-2xl font-bold text-gray-900">Manage Users</h1>
              </div>
              <div className="flex items-center">
                <span className="text-sm text-gray-600 mr-4">{user?.name || user?.email}</span>
                <Button variant="secondary" onClick={handleLogout} className="w-auto px-4">Logout</Button>
              </div>
            </div>
          </div>
        </nav>

        <main className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
          {message && (
            <div className={`mb-4 p-4 rounded ${message.type === "success" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
              {message.text}
            </div>
          )}

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">All Users</h2>
            </div>

            <Modal
              isOpen={showRoleModal}
              onClose={() => setShowRoleModal(false)}
              title="Change User Role"
              footer={
                <>
                  <Button variant="secondary" onClick={() => setShowRoleModal(false)}>Cancel</Button>
                  <Button onClick={handleUpdateRole} isLoading={submitting}>Update</Button>
                </>
              }
            >
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Select Role</label>
                <select
                  value={newRole}
                  onChange={(e) => setNewRole(e.target.value as "USER" | "ADMIN")}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="USER">User</option>
                  <option value="ADMIN">Admin</option>
                </select>
              </div>
              {selectedUser && (
                <p className="text-sm text-gray-600">
                  Changing role for: <strong>{selectedUser.name}</strong> ({selectedUser.email})
                </p>
              )}
            </Modal>

            <DataTable 
              columns={columns} 
              data={users} 
              actions={actions} 
              emptyMessage="No users found" 
            />
          </div>
        </main>
      </div>
    </ProtectedAdminRoute>
  );
}

export default function AdminUsersPage() {
  return <AdminUsersContent />;
}
