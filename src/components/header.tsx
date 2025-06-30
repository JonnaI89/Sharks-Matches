import Link from "next/link";
import { Gamepad2, UserCog } from "lucide-react";
import { Button } from "@/components/ui/button";

export function Header() {
  return (
    <header className="bg-card border-b sticky top-0 z-50 shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <Link href="/" className="flex items-center gap-2 text-xl font-bold text-primary">
            <Gamepad2 className="h-6 w-6" />
            <span>FloorballLive</span>
          </Link>
          <nav>
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
