"use client";
import React from "react";
import { useUsers } from "./hooks/useUsers";
import { UserForm } from "./components/UserForm";
import { UserTable } from "./components/UserTable";
import { StatsChart } from "./components/StatsChart";
import { ExportTable } from "./components/ExportTable";
import { Toast } from "./components/Toast";

export default function Home() {
  const { usersQuery, createMut, updateMut, deleteMut, chartQuery, summaryQuery, exportQuery } = useUsers();

  const [editing, setEditing] = React.useState<
    | null
    | { id: number; email: string; role: "admin" | "user"; status: "active" | "inactive" }
  >(null);

  const [toast, setToast] = React.useState<string>("");
  React.useEffect(() => {
    if (createMut.isError && (createMut.error as any)?.message) {
      try {
        const parsed = JSON.parse((createMut.error as any).message);
        if (parsed?.message) setToast(parsed.message);
        else setToast((createMut.error as any).message);
      } catch {
        setToast((createMut.error as any).message);
      }
    }
  }, [createMut.isError, createMut.error]);

  return (
    <div className="p-6 space-y-6 max-w-6xl mx-auto text-gray-900">
      {toast && <Toast message={toast} onClose={() => setToast("")} />}
      <header className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div className="flex items-center gap-3">
          {/* Dashboard icon */}
        {/* Dashboard icon (Nucleo align-left-2) */}
        <i className="ni ni-align-left-2 text-blue-600 text-2xl" aria-hidden="true"></i>
          <div>
            <h1 className="text-2xl font-semibold">User Dashboard</h1>
            {summaryQuery.data && (
              <div className="mt-1 flex gap-4 text-sm">
                <span className="inline-flex items-center gap-1">
                  {/* Users (group of people icon) */}
                  <svg xmlns="http://www.w3.org/2000/svg" fill="#2563eb" viewBox="0 0 20 20" className="h-4 w-4">
                    <path d="M13 7a3 3 0 11-6 0 3 3 0 016 0zm-2 5a7 7 0 00-7 7h2a5 5 0 0110 0h2a7 7 0 00-7-7z" />
                  </svg>
                  Total: {summaryQuery.data.totalUsers}
                </span>
                <span className="inline-flex items-center gap-1">
                  {/* Active users (check badge icon) */}
                  <svg xmlns="http://www.w3.org/2000/svg" fill="#16a34a" viewBox="0 0 20 20" className="h-4 w-4">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.293a1 1 0 00-1.414-1.414L9 11.586 7.707 10.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  Active: {summaryQuery.data.activeUsers}
                </span>
                <span className="inline-flex items-center gap-1">
                  {/* Admin users (shield icon) */}
                  <svg xmlns="http://www.w3.org/2000/svg" fill="#1e293b" viewBox="0 0 20 20" className="h-4 w-4">
                    <path d="M10.868 2.05a1 1 0 00-.736 0c-2.09.814-5.598 1.56-7.45 1.924A1 1 0 002 4.962v5.89c0 5.125 5.305 6.88 7.132 7.306a1 1 0 00.46 0c1.827-.426 7.132-2.181 7.132-7.306v-5.89a1 1 0 00-.682-.988c-1.852-.364-5.36-1.11-7.45-1.923z" />
                  </svg>
                  Admins: {summaryQuery.data.adminUsers}
                </span>
              </div>
            )}
          </div>
        </div>
        <div />
      </header>

      <section className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-4">
          <div className="rounded border bg-white p-4">
            <h2 className="mb-3 text-sm font-medium">Create User</h2>
            <UserForm
              submitting={createMut.isPending}
              onSubmit={(v) => createMut.mutate(v)}
            />
          </div>

          <div className="rounded border bg-white p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-medium">Users</h2>
              {usersQuery.isLoading && <span className="text-xs text-gray-500">Loading…</span>}
            </div>
            {usersQuery.error && <div className="text-sm text-red-600">{(usersQuery.error as any).message}</div>}
            {Array.isArray(usersQuery.data) && usersQuery.data.length > 0 ? (
              <UserTable
                users={usersQuery.data}
                onEdit={(u) => setEditing(u)}
                onDelete={(u) => deleteMut.mutate(u.id)}
              />
            ) : (
              <div className="rounded border bg-white p-4 text-sm text-gray-700">
                No exported users to display. Create a new one using the form above.
              </div>
            )}

            {editing && (
              <div className="rounded border bg-white p-4">
                <h3 className="mb-3 text-sm font-medium">Update User</h3>
                <UserForm
                  initial={editing}
                  submitting={updateMut.isPending}
                  onSubmit={(v) => updateMut.mutate({ id: editing.id, input: v })}
                />
                <div className="mt-2 flex justify-end">
                  <button className="text-sm text-gray-600 hover:underline" onClick={() => setEditing(null)}>Cancel</button>
                </div>
              </div>
            )}

            <div className="rounded border bg-white p-4 space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-medium">Exported Users (Protobuf)</h2>
                {exportQuery.isLoading && <span className="text-xs text-gray-500">Loading…</span>}
              </div>
              {exportQuery.error && <div className="text-sm text-red-600">{(exportQuery.error as any).message}</div>}
              {exportQuery.data && (
                <ExportTable users={exportQuery.data.users} />
              )}
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded border bg-white p-4">
            <h2 className="mb-3 text-sm font-medium">Activity</h2>
            <StatsChart data={chartQuery.data || []} />
          </div>
        </div>
      </section>
    </div>
  );
}
