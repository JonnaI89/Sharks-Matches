import Link from "next/link";
import { UserCog, BarChart } from "lucide-react";
import { Button } from "@/components/ui/button";

export function Header() {
  return (
    <header className="bg-card border-b sticky top-0 z-50 shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <Link href="/" className="text-xl font-bold">
            Live Center
          </Link>
          <nav className="flex items-center gap-2">
            <Button variant="ghost" asChild>
              <Link href="/stats">
                <BarChart className="mr-2 h-4 w-4" />
                Stats
              </Link>
            </Button>
            <Button variant="ghost" asChild>
              <Link href="/admin">
                <UserCog className="mr-2 h-4 w-4" />
                Admin Panel
              </Link>
            </Button>
          </nav>
        </div>
      </div>
    </header>
  );
}
