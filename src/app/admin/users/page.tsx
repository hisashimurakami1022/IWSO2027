import { prisma } from "@/lib/prisma";
import { Card } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { RoleToggle } from "./role-toggle";
import { InviteUserDialog } from "./invite-user-dialog";

export default async function UsersPage() {
  const users = await prisma.user.findMany({ orderBy: { createdAt: "asc" } });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Users</h1>
        <InviteUserDialog />
      </div>

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Email</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Reviewer</TableHead>
              <TableHead>Chair</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((u) => (
              <TableRow key={u.id}>
                <TableCell>{u.email}</TableCell>
                <TableCell className="text-muted-foreground">{u.name ?? "—"}</TableCell>
                <TableCell>
                  <RoleToggle userId={u.id} role="REVIEWER" checked={u.roles.includes("REVIEWER")} />
                </TableCell>
                <TableCell>
                  <RoleToggle userId={u.id} role="CHAIR" checked={u.roles.includes("CHAIR")} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
