import Link from "next/link";
import { UserCog } from "lucide-react";
import { Button } from "@/components/ui/button";

export function Header() {
  return (
    <header className="bg-card border-b sticky top-0 z-50 shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex justify-end items-center h-16">
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
