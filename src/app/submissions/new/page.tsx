import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";
import { isSubmissionOpen } from "@/lib/settings";
import { SubmissionForm } from "@/components/submission-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export default async function NewSubmissionPage() {
  const user = await requireUser();
  const [tracks, open] = await Promise.all([
    prisma.track.findMany({ orderBy: { name: "asc" } }),
    isSubmissionOpen(),
  ]);

  return (
    <div className="mx-auto max-w-3xl space-y-6 px-4 py-8">
      <div>
        <h1 className="text-2xl font-semibold">Submit an Abstract</h1>
        <p className="text-muted-foreground">
          You can keep editing after saving a draft, until the submission deadline.
        </p>
      </div>

      {!open && (
        <Alert variant="destructive">
          <AlertTitle>Submission deadline has passed</AlertTitle>
          <AlertDescription>New submissions are no longer being accepted.</AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Submission Details</CardTitle>
        </CardHeader>
        <CardContent>
          <SubmissionForm
            tracks={tracks}
            defaultValues={{
              title: "",
              trackId: "",
              presentationType: "ORAL",
              abstractText: "",
              keywords: [],
              authors: [
                {
                  name: user.name ?? "",
                  email: user.email,
                  affiliation: user.affiliation ?? "",
                  isCorresponding: true,
                },
              ],
            }}
          />
        </CardContent>
      </Card>
    </div>
  );
}
