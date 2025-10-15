import protobuf from "protobufjs";

export interface ProtoUser {
  id: number;
  email: string;
  role: string;
  status: string;
  createdAt: string;
  emailHash: string;
  signature: string;
}

export interface ProtoUsersExport {
  users: ProtoUser[];
  exportedAt: string;
  totalCount: number;
}

// Inline schema to avoid an extra network fetch for /user.proto
const schema = `
syntax = "proto3";

package userdashboard;

message User {
  int32 id = 1;
  string email = 2;
  string role = 3;
  string status = 4;
  string createdAt = 5;
  string emailHash = 6;
  string signature = 7;
}

message UsersExport {
  repeated User users = 1;
  string exportedAt = 2;
  int32 totalCount = 3;
}
`;

let rootPromise: Promise<protobuf.Root> | null = null;

export function loadProto(): Promise<protobuf.Root> {
  if (!rootPromise) {
    const parsed = protobuf.parse(schema);
    rootPromise = Promise.resolve(parsed.root);
  }
  return rootPromise;
}

export async function decodeUsersExport(buffer: ArrayBuffer): Promise<ProtoUsersExport> {
  const root = await loadProto();
  const Type = root.lookupType("userdashboard.UsersExport");
  const message = Type.decode(new Uint8Array(buffer));
  return Type.toObject(message) as ProtoUsersExport;
}

