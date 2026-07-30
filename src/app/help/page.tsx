import fs from "node:fs";
import path from "node:path";
import { getCurrentUser } from "@/lib/session";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MarkdownGuide } from "@/components/markdown-guide";

function readGuide(filename: string) {
  return fs.readFileSync(path.join(process.cwd(), "docs", "manuals", filename), "utf-8");
}

export default async function HelpPage() {
  const user = await getCurrentUser();
  const roles = user?.roles ?? [];

  const defaultTab = roles.includes("CHAIR")
    ? "chair"
    : roles.includes("REVIEWER")
      ? "reviewer"
      : "author";

  const authorGuide = readGuide("author-guide-en.md");
  const reviewerGuide = readGuide("reviewer-guide-en.md");
  const chairGuide = readGuide("chair-guide-en.md");

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
          <TabsTrigger value="reviewer">Reviewer</TabsTrigger>
          <TabsTrigger value="chair">Chair</TabsTrigger>
        </TabsList>
        <TabsContent value="author">
          <Card>
            <CardContent className="pt-6">
              <MarkdownGuide content={authorGuide} />
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="reviewer">
          <Card>
            <CardContent className="pt-6">
              <MarkdownGuide content={reviewerGuide} />
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="chair">
          <Card>
            <CardContent className="pt-6">
              <MarkdownGuide content={chairGuide} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
