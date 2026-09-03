import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ReorderButtons } from "@/components/reorder-buttons";
import { MaterialSystemFormDialog } from "./material-system-form-dialog";
import { DeleteMaterialSystemButton } from "./delete-material-system-button";
import { reorderMaterialSystemAction } from "./actions";

export default async function MaterialSystemsPage() {
  const materialSystems = await prisma.materialSystem.findMany({
    orderBy: [{ order: "asc" }, { name: "asc" }],
    include: { _count: { select: { submissions: true } } },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Material Systems</h1>
        <MaterialSystemFormDialog trigger={<Button>New Material System</Button>} />
      </div>

      {materialSystems.length === 0 ? (
        <Card>
          <CardContent className="py-10 text-center text-muted-foreground">
            No material systems yet.
          </CardContent>
        </Card>
      ) : (
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead />
                <TableHead>Code</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Submissions</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {materialSystems.map((m, i) => (
                <TableRow key={m.id}>
                  <TableCell>
                    <ReorderButtons
                      id={m.id}
                      isFirst={i === 0}
                      isLast={i === materialSystems.length - 1}
                      action={reorderMaterialSystemAction}
                    />
                  </TableCell>
                  <TableCell className="font-mono text-xs">{m.code}</TableCell>
                  <TableCell>{m.name}</TableCell>
                  <TableCell className="max-w-xs truncate text-muted-foreground">
                    {m.description}
                  </TableCell>
                  <TableCell>{m._count.submissions}</TableCell>
                  <TableCell className="flex justify-end gap-2">
                    <MaterialSystemFormDialog
                      materialSystem={m}
                      trigger={
                        <Button variant="outline" size="sm">
                          Edit
                        </Button>
                      }
                    />
                    <DeleteMaterialSystemButton id={m.id} disabled={m._count.submissions > 0} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}
    </div>
  );
}
