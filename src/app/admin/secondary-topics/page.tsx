import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ReorderButtons } from "@/components/reorder-buttons";
import { SecondaryTopicFormDialog } from "./secondary-topic-form-dialog";
import { DeleteSecondaryTopicButton } from "./delete-secondary-topic-button";
import { reorderSecondaryTopicAction } from "./actions";

export default async function SecondaryTopicsPage() {
  const secondaryTopics = await prisma.secondaryTopic.findMany({
    orderBy: [{ order: "asc" }, { name: "asc" }],
    include: { _count: { select: { submissions: true } } },
  });

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold">Secondary Topics</h1>
          <SecondaryTopicFormDialog trigger={<Button>New Secondary Topic</Button>} />
        </div>
        <p className="text-muted-foreground">
          Used as the optional Secondary Research Topic when submitting — an independent list
          from the (Primary) Research Topics.
        </p>
      </div>

      {secondaryTopics.length === 0 ? (
        <Card>
          <CardContent className="py-10 text-center text-muted-foreground">
            No secondary topics yet.
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
              {secondaryTopics.map((t, i) => (
                <TableRow key={t.id}>
                  <TableCell>
                    <ReorderButtons
                      id={t.id}
                      isFirst={i === 0}
                      isLast={i === secondaryTopics.length - 1}
                      action={reorderSecondaryTopicAction}
                    />
                  </TableCell>
                  <TableCell className="font-mono text-xs">{t.code}</TableCell>
                  <TableCell>{t.name}</TableCell>
                  <TableCell className="max-w-xs truncate text-muted-foreground">
                    {t.description}
                  </TableCell>
                  <TableCell>{t._count.submissions}</TableCell>
                  <TableCell className="flex justify-end gap-2">
                    <SecondaryTopicFormDialog
                      secondaryTopic={t}
                      trigger={
                        <Button variant="outline" size="sm">
                          Edit
                        </Button>
                      }
                    />
                    <DeleteSecondaryTopicButton id={t.id} disabled={t._count.submissions > 0} />
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
