"use client";

import { Header } from "@/components/header";
import { MatchCard } from "@/components/match-card";
import { useAdminData } from "@/context/admin-data-context";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { PlusCircle, CalendarX2 } from "lucide-react";

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
      <div className="flex min-h-[400px] flex-col items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/20 p-12 text-center">
        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
          <CalendarX2 className="h-8 w-8 text-primary" />
        </div>
        <h2 className="text-2xl font-semibold">Ingen kamper funnet</h2>
        <p className="mt-2 mb-4 text-muted-foreground">
          Kom i gang ved å opprette lag og kamper i adminpanelet.
        </p>
        <Button asChild>
          <Link href="/admin">
            <PlusCircle className="mr-2 h-4 w-4" /> Gå til Admin
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
    </div>
  );
}
