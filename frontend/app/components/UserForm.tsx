"use client";
import React from "react";
import { z } from "zod";

const schema = z.object({
  email: z.string().email(),
  role: z.enum(["admin", "user"]).default("user"),
  status: z.enum(["active", "inactive"]).default("active"),
});

export type UserFormValues = z.infer<typeof schema>;

export function UserForm({
  initial,
  onSubmit,
  submitting,
}: {
  initial?: Partial<UserFormValues>;
  submitting?: boolean;
  onSubmit: (values: UserFormValues) => void;
}) {
  const [values, setValues] = React.useState<UserFormValues>({
    email: initial?.email || "",
    role: (initial?.role as any) || "user",
    status: (initial?.status as any) || "active",
  });
  const [error, setError] = React.useState<string | null>(null);

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    const { name, value } = e.target;
    setValues((v) => ({ ...v, [name]: value } as UserFormValues));
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const parse = schema.safeParse(values);
    if (!parse.success) {
      setError(parse.error.issues?.[0]?.message || "Invalid input");
      return;
    }
    setError(null);
    onSubmit(parse.data);
  }

  return (
    <form onSubmit={submit} className="space-y-3">
      {error && <div className="text-red-600 text-sm">{error}</div>}
      <div>
        <label className="block text-sm font-medium">Email</label>
        <input
          type="email"
          name="email"
          value={values.email}
          onChange={handleChange}
          className="mt-1 w-full rounded border px-3 py-2"
          placeholder="name@example.com"
          required
        />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium">Role</label>
          <select name="role" value={values.role} onChange={handleChange} className="mt-1 w-full rounded border px-3 py-2">
            <option value="user">User</option>
            <option value="admin">Admin</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium">Status</label>
          <select name="status" value={values.status} onChange={handleChange} className="mt-1 w-full rounded border px-3 py-2">
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
      </div>
      <div className="flex justify-end gap-2">
        <button type="submit" disabled={submitting} className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-50">
          {submitting ? "Saving..." : "Save"}
        </button>
      </div>
    </form>
  );
}


