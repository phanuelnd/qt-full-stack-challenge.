"use client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  listUsers,
  createUser,
  updateUser,
  deleteUser,
  getChart,
  getSummary,
  exportUsersBinary,
  fetchPublicKeyPem,
  type CreateUserInput,
  type UpdateUserInput,
} from "../services/users";
import { decodeUsersExport } from "../utils/protobuf";
import { importPublicKey, verifySignature } from "../utils/crypto";

export function useUsers() {
  const qc = useQueryClient();

  const usersQuery = useQuery({
    queryKey: ["users"],
    queryFn: async () => {
      const users = await listUsers();
      const pem = await fetchPublicKeyPem();
      const pub = await importPublicKey(pem);
      const verified = await Promise.all(
        users.map(async (u) => ({ ...u, isValid: await verifySignature(pub, u.emailHash, u.signature) }))
      );
      return verified.filter((u) => u.isValid);
    },
  });

  const createMut = useMutation({
    mutationFn: (input: CreateUserInput) => createUser(input),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["users"] }),
  });

  const updateMut = useMutation({
    mutationFn: (vars: { id: number; input: UpdateUserInput }) => updateUser(vars.id, vars.input),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["users"] }),
  });

  const deleteMut = useMutation({
    mutationFn: (id: number) => deleteUser(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["users"] }),
  });

  const chartQuery = useQuery({ queryKey: ["users", "chart"], queryFn: getChart });
  const summaryQuery = useQuery({ queryKey: ["users", "summary"], queryFn: getSummary });

  const exportQuery = useQuery({
    queryKey: ["users", "export"],
    queryFn: async () => {
      const buf = await exportUsersBinary();
      return await decodeUsersExport(buf);
    },
  });

  return { usersQuery, createMut, updateMut, deleteMut, chartQuery, summaryQuery, exportQuery };
}


