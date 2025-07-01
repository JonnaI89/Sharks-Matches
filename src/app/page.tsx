"use client";

import { Header } from "@/components/header";
import { MatchCard } from "@/components/match-card";
import { useAdminData } from "@/context/admin-data-context";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { PlusCircle } from "lucide-react";

function MatchList() {
  const { matches, isDataLoaded } = useAdminData();

  if (!isDataLoaded) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <Skeleton key={i} className="h-60 rounded-lg" />
        ))}
      </div>
    );
  }

  if (matches.length === 0) {
    return (
      <div className="text-center py-16 text-muted-foreground border-2 border-dashed rounded-lg">
        <h2 className="text-2xl font-semibold">No Matches Found</h2>
        <p className="mt-2 mb-4">Get started by creating teams and then a new match in the admin panel.</p>
        <Button asChild>
          <Link href="/admin">
            <PlusCircle className="mr-2 h-4 w-4" /> Go to Admin
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {matches.map((match) => (
        <MatchCard key={match.id} match={match} />
      ))}
    </div>
  );
}

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1 container mx-auto p-4 md:p-8">
        <h1 className="text-3xl md:text-4xl font-bold mb-6 text-foreground">Matches</h1>
        <MatchList />
      </main>
      <footer className="text-center p-4 text-muted-foreground text-sm">
        <p>&copy; {new Date().getFullYear()} Sarpsborg IBK Live. All rights reserved.</p>
      </footer>
    </div>
  );
}
