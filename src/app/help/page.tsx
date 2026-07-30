import fs from "node:fs";
import path from "node:path";
import { requireUser } from "@/lib/session";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MarkdownGuide } from "@/components/markdown-guide";

function readGuide(filename: string) {
  return fs.readFileSync(path.join(process.cwd(), "docs", "manuals", filename), "utf-8");
}

export default async function HelpPage() {
  const user = await requireUser();
  const roles = user.roles;

  const canSeeReviewer = roles.includes("REVIEWER") || roles.includes("CHAIR");
  const canSeeChair = roles.includes("CHAIR");

  const defaultTab = canSeeChair ? "chair" : canSeeReviewer ? "reviewer" : "author";

  return (
    <div className="mx-auto max-w-3xl space-y-6 px-4 py-8">
      <div>
        <h1 className="text-2xl font-semibold">User Guides</h1>
        <p className="text-muted-foreground">
          How to use the IWSO 2027 submission, review, and program system.
        </p>
      </div>

      <Tabs defaultValue={defaultTab}>
        <TabsList>
          <TabsTrigger value="author">Author</TabsTrigger>
          {canSeeReviewer && <TabsTrigger value="reviewer">Reviewer</TabsTrigger>}
          {canSeeChair && <TabsTrigger value="chair">Chair</TabsTrigger>}
        </TabsList>
        <TabsContent value="author">
          <Card>
            <CardContent className="pt-6">
              <MarkdownGuide content={readGuide("author-guide-en.md")} />
            </CardContent>
          </Card>
        </TabsContent>
        {canSeeReviewer && (
          <TabsContent value="reviewer">
            <Card>
              <CardContent className="pt-6">
                <MarkdownGuide content={readGuide("reviewer-guide-en.md")} />
              </CardContent>
            </Card>
          </TabsContent>
        )}
        {canSeeChair && (
          <TabsContent value="chair">
            <Card>
              <CardContent className="pt-6">
                <MarkdownGuide content={readGuide("chair-guide-en.md")} />
              </CardContent>
            </Card>
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
}
