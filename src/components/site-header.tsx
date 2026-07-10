import Link from "next/link";
import { getCurrentUser } from "@/lib/session";
import { signOut } from "@/lib/auth";
import { Button } from "@/components/ui/button";

export async function SiteHeader() {
  const user = await getCurrentUser();
  const roles = user?.roles ?? [];

  return (
    <header className="border-b bg-background">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
        <Link href="/" className="font-semibold tracking-tight">
          IWSO 2027
        </Link>

        <nav className="flex items-center gap-4 text-sm">
          <Link href="/program" className="text-muted-foreground hover:text-foreground">
            Program
          </Link>

          {user && (
            <>
              <Link href="/submissions" className="text-muted-foreground hover:text-foreground">
                Submissions
              </Link>
              {(roles.includes("REVIEWER") || roles.includes("CHAIR")) && (
                <Link href="/review" className="text-muted-foreground hover:text-foreground">
                  Review
                </Link>
              )}
              {roles.includes("CHAIR") && (
                <Link href="/admin" className="text-muted-foreground hover:text-foreground">
                  Admin
                </Link>
              )}
            </>
          )}

          {user ? (
            <div className="flex items-center gap-3">
              <span className="hidden text-muted-foreground sm:inline">{user.email}</span>
              <form
                action={async () => {
                  "use server";
                  await signOut({ redirectTo: "/" });
                }}
              >
                <Button type="submit" variant="outline" size="sm">
                  Sign out
                </Button>
              </form>
            </div>
          ) : (
            <Button size="sm" nativeButton={false} render={<Link href="/login">Sign in</Link>} />
          )}
        </nav>
      </div>
    </header>
  );
}
