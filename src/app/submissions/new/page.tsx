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
        <h1 className="text-2xl font-semibold">Abstractを投稿</h1>
        <p className="text-muted-foreground">下書き保存後も投稿締切まで編集できます。</p>
      </div>

      {!open && (
        <Alert variant="destructive">
          <AlertTitle>投稿締切を過ぎています</AlertTitle>
          <AlertDescription>新規投稿の受付は終了しました。</AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle>投稿内容</CardTitle>
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
