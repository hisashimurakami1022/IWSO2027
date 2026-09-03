import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { APP_URL } from "@/lib/app-url";

// Only ever follow a link that points back at our own Auth.js callback route
// — this page takes an arbitrary `url` query param, so without this check
// it would be an open redirect for anyone who crafts their own link to it.
function safeCallbackUrl(raw: string | undefined): string | null {
  if (!raw) return null;
  try {
    const url = new URL(raw);
    const appOrigin = new URL(APP_URL).origin;
    if (url.origin !== appOrigin) return null;
    if (!url.pathname.startsWith("/api/auth/callback/")) return null;
    return url.toString();
  } catch {
    return null;
  }
}

export default async function ConfirmSignInPage({
  searchParams,
}: {
  searchParams: Promise<{ url?: string }>;
}) {
  const { url } = await searchParams;
  const confirmedUrl = safeCallbackUrl(url);

  return (
    <div className="mx-auto flex max-w-md flex-col justify-center px-4 py-24">
      <Card>
        <CardHeader>
          <CardTitle>Confirm sign-in</CardTitle>
          <CardDescription>
            {confirmedUrl
              ? "For your security, click below to finish signing in to IWSO 2027."
              : "This sign-in link is invalid. Request a new one from the sign-in page."}
          </CardDescription>
        </CardHeader>
        {confirmedUrl && (
          <CardContent>
            <Button
              size="lg"
              className="w-full"
              nativeButton={false}
              render={<a href={confirmedUrl}>Complete Sign In</a>}
            />
          </CardContent>
        )}
      </Card>
    </div>
  );
}
