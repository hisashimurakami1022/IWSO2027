import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function VerifyRequestPage() {
  return (
    <div className="mx-auto flex max-w-md flex-col justify-center px-4 py-24">
      <Card>
        <CardHeader>
          <CardTitle>Check your email</CardTitle>
          <CardDescription>
            We&apos;ve sent you a sign-in link. Click the link in the email to complete your
            sign-in.
          </CardDescription>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          This can take a few minutes to arrive, especially from university or corporate email
          addresses that scan incoming mail for security. If you don&apos;t see it after a while,
          check your spam folder — no need to request another one in the meantime.
        </CardContent>
      </Card>
    </div>
  );
}
