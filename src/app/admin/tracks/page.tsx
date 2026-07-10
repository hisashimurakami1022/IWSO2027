import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { TrackFormDialog } from "./track-form-dialog";
import { DeleteTrackButton } from "./delete-track-button";

export default async function TracksPage() {
  const tracks = await prisma.track.findMany({
    orderBy: { name: "asc" },
    include: { _count: { select: { submissions: true } } },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Tracks</h1>
        <TrackFormDialog trigger={<Button>New Track</Button>} />
      </div>

      {tracks.length === 0 ? (
        <Card>
          <CardContent className="py-10 text-center text-muted-foreground">
            No tracks yet.
          </CardContent>
        </Card>
      ) : (
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Code</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Submissions</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tracks.map((t) => (
                <TableRow key={t.id}>
                  <TableCell className="font-mono text-xs">{t.code}</TableCell>
                  <TableCell>{t.name}</TableCell>
                  <TableCell className="max-w-xs truncate text-muted-foreground">
                    {t.description}
                  </TableCell>
                  <TableCell>{t._count.submissions}</TableCell>
                  <TableCell className="flex justify-end gap-2">
                    <TrackFormDialog
                      track={t}
                      trigger={
                        <Button variant="outline" size="sm">
                          Edit
                        </Button>
                      }
                    />
                    <DeleteTrackButton id={t.id} disabled={t._count.submissions > 0} />
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
