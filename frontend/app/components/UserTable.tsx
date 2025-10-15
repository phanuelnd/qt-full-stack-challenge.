"use client";
import React from "react";

export interface UserRow {
  id: number;
  email: string;
  role: "admin" | "user";
  status: "active" | "inactive";
  createdAt: string;
}

export function UserTable({ users, onEdit, onDelete }: {
  users: UserRow[];
  onEdit: (user: UserRow) => void;
  onDelete: (user: UserRow) => void;
}) {
  const [sortKey, setSortKey] = React.useState<keyof UserRow>('email');
  const [asc, setAsc] = React.useState(true);
  const sorted = React.useMemo(() => {
    const copy = [...users];
    copy.sort((a, b) => {
      const av = a[sortKey];
      const bv = b[sortKey];
      if (typeof av === 'string' && typeof bv === 'string') {
        return asc ? av.localeCompare(bv) : bv.localeCompare(av);
      }
      return asc ? (av as any) - (bv as any) : (bv as any) - (av as any);
    });
    return copy;
  }, [users, sortKey, asc]);

  function toggleSort(key: keyof UserRow) {
    if (key === sortKey) setAsc((v) => !v);
    else { setSortKey(key); setAsc(true); }
  }
  return (
    <div className="overflow-x-auto rounded border bg-white text-gray-900">
      <table className="min-w-full text-sm">
        <thead className="bg-gray-100 text-left text-gray-900">
          <tr>
            <th className="px-4 py-2 cursor-pointer select-none" onClick={() => toggleSort('email')}>Email {sortKey==='email' ? (asc?'▲':'▼') : ''}</th>
            <th className="px-4 py-2 cursor-pointer select-none" onClick={() => toggleSort('role')}>Role {sortKey==='role' ? (asc?'▲':'▼') : ''}</th>
            <th className="px-4 py-2 cursor-pointer select-none" onClick={() => toggleSort('status')}>Status {sortKey==='status' ? (asc?'▲':'▼') : ''}</th>
            <th className="px-4 py-2 cursor-pointer select-none" onClick={() => toggleSort('createdAt')}>Created {sortKey==='createdAt' ? (asc?'▲':'▼') : ''}</th>
            <th className="px-4 py-2 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="text-gray-900">
          {sorted.map((u) => (
            <tr key={u.id} className="border-t hover:bg-gray-50">
              <td className="px-4 py-2">{u.email}</td>
              <td className="px-4 py-2 capitalize">{u.role}</td>
              <td className="px-4 py-2 capitalize">{u.status}</td>
              <td className="px-4 py-2">{new Date(u.createdAt).toLocaleString()}</td>
              <td className="px-4 py-2 text-right">
                <button onClick={() => onEdit(u)} className="mr-2 rounded bg-blue-600 px-3 py-1 text-white hover:bg-blue-700">Edit</button>
                <button onClick={() => onDelete(u)} className="rounded bg-red-600 px-3 py-1 text-white hover:bg-red-700">Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}


