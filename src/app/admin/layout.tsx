import Link from "next/link";
import { requireChair } from "@/lib/session";

const links = [
  { href: "/admin", label: "Overview" },
  { href: "/admin/submissions", label: "Submissions" },
  { href: "/admin/assignments", label: "Assignments" },
  { href: "/admin/decisions", label: "Decisions" },
  { href: "/admin/program", label: "Program" },
  { href: "/admin/tracks", label: "Tracks" },
  { href: "/admin/material-systems", label: "Material Systems" },
  { href: "/admin/research-topics", label: "Research Topics" },
  { href: "/admin/users", label: "Users" },
  { href: "/admin/settings", label: "Settings" },
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  await requireChair();

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <nav className="mb-6 flex gap-5 border-b pb-3 text-sm">
        {links.map((l) => (
          <Link key={l.href} href={l.href} className="text-muted-foreground hover:text-foreground">
            {l.label}
          </Link>
        ))}
      </nav>
      {children}
    </div>
  );
}
