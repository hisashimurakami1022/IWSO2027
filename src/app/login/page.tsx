import { signIn } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ callbackUrl?: string }>;
}) {
  const { callbackUrl } = await searchParams;

  async function login(formData: FormData) {
    "use server";
    const email = formData.get("email") as string;
    await signIn("resend", {
      email,
      redirectTo: callbackUrl || "/dashboard",
    });
  }

  return (
    <div className="mx-auto flex max-w-md flex-col justify-center px-4 py-24">
      <Card>
        <CardHeader>
          <CardTitle>ログイン</CardTitle>
          <CardDescription>
            メールアドレスを入力すると、ログイン用のリンクをお送りします。投稿者・査読者・運営のいずれも同じ方法でログインできます。
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form action={login} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">メールアドレス</Label>
              <Input
                id="email"
                name="email"
                type="email"
                required
                placeholder="you@example.com"
                autoFocus
              />
            </div>
            <Button type="submit" className="w-full">
              ログインリンクを送信
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
