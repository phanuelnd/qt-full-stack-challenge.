import { http, httpBinary } from "../services/http";

export type UserRole = "admin" | "user";
export type UserStatus = "active" | "inactive";

export interface UserDTO {
  id: number;
  email: string;
  role: UserRole;
  status: UserStatus;
  createdAt: string;
  emailHash: string;
  signature: string;
}

export interface CreateUserInput {
  email: string;
  role?: UserRole;
  status?: UserStatus;
}

export interface UpdateUserInput {
  email?: string;
  role?: UserRole;
  status?: UserStatus;
}

export async function listUsers() {
  return http<UserDTO[]>("/users");
}

export async function getUser(id: number) {
  return http<UserDTO>(`/users/${id}`);
}

export async function createUser(input: CreateUserInput) {
  return http<UserDTO>("/users", { method: "POST", body: JSON.stringify(input) });
}

export async function updateUser(id: number, input: UpdateUserInput) {
  return http<UserDTO>(`/users/${id}`, { method: "PATCH", body: JSON.stringify(input) });
}

export async function deleteUser(id: number) {
  await http<unknown>(`/users/${id}`, { method: "DELETE" });
}

export async function getChart() {
  return http<{ date: string; count: number }[]>("/users/stats/chart");
}

export async function getSummary() {
  return http<{ totalUsers: number; activeUsers: number; adminUsers: number }>("/users/stats/summary");
}

export async function exportUsersBinary() {
  return httpBinary("/users/export");
}

export async function fetchPublicKeyPem(): Promise<string> {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3002"}/crypto/public-key`);
  if (!res.ok) throw new Error("Failed to fetch public key");
  return await res.text();
}

