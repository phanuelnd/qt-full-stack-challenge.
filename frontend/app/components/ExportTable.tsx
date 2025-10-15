"use client";
import React from "react";

export interface ExportUserRow {
  id: number;
  email: string;
  role: string;
  status: string;
  createdAt: string;
}

export function ExportTable({ users }: { users?: ExportUserRow[] }) {
  const rows = Array.isArray(users) ? users : [];
  if (rows.length === 0) {
    return (
      <div className="rounded border bg-white p-4 text-sm text-gray-700">
        Message: No exported users to display. Create a new one in above form.
      </div>
    );
  }
  return (
    <div className="overflow-x-auto rounded border bg-white">
      <table className="min-w-full text-sm">
        <thead className="bg-gray-100 text-left">
          <tr>
            <th className="px-4 py-2">Email</th>
            <th className="px-4 py-2">Role</th>
            <th className="px-4 py-2">Status</th>
            <th className="px-4 py-2">Created</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((u) => (
            <tr key={`export-${u.id}`} className="border-t">
              <td className="px-4 py-2">{u.email}</td>
              <td className="px-4 py-2 capitalize">{u.role}</td>
              <td className="px-4 py-2 capitalize">{u.status}</td>
              <td className="px-4 py-2">{new Date(u.createdAt).toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}


