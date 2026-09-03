import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ResearchTopicFormDialog } from "./research-topic-form-dialog";
import { DeleteResearchTopicButton } from "./delete-research-topic-button";

export default async function ResearchTopicsPage() {
  const researchTopics = await prisma.researchTopic.findMany({
    orderBy: { name: "asc" },
    include: {
      _count: { select: { primarySubmissions: true, secondarySubmissions: true } },
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Research Topics</h1>
        <ResearchTopicFormDialog trigger={<Button>New Research Topic</Button>} />
      </div>

      {researchTopics.length === 0 ? (
        <Card>
          <CardContent className="py-10 text-center text-muted-foreground">
            No research topics yet.
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
                <TableHead>As Primary</TableHead>
                <TableHead>As Secondary</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {researchTopics.map((t) => {
                const inUse = t._count.primarySubmissions > 0 || t._count.secondarySubmissions > 0;
                return (
                  <TableRow key={t.id}>
                    <TableCell className="font-mono text-xs">{t.code}</TableCell>
                    <TableCell>{t.name}</TableCell>
                    <TableCell className="max-w-xs truncate text-muted-foreground">
                      {t.description}
                    </TableCell>
                    <TableCell>{t._count.primarySubmissions}</TableCell>
                    <TableCell>{t._count.secondarySubmissions}</TableCell>
                    <TableCell className="flex justify-end gap-2">
                      <ResearchTopicFormDialog
                        researchTopic={t}
                        trigger={
                          <Button variant="outline" size="sm">
                            Edit
                          </Button>
                        }
                      />
                      <DeleteResearchTopicButton id={t.id} disabled={inUse} />
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </Card>
      )}
    </div>
  );
}
