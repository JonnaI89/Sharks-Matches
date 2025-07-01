"use client"
import Link from "next/link";
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarInset,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Gamepad2, LayoutDashboard, Settings, Users } from "lucide-react";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";

export default function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname();

  return (
    <SidebarProvider>
      <div className="flex min-h-screen">
        <Sidebar>
          <SidebarContent>
            <SidebarHeader>
              <Link href="/" className="flex items-center gap-2 text-lg font-bold text-primary">
                <Gamepad2 className="h-6 w-6" />
                <span className="group-data-[collapsible=icon]:hidden">FloorballLive</span>
              </Link>
            </SidebarHeader>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  isActive={pathname === "/admin"}
                  tooltip={{ children: "Dashboard" }}
                >
                  <Link href="/admin">
                    <LayoutDashboard />
                    <span>Dashboard</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  isActive={pathname === "/admin/rosters"}
                  tooltip={{ children: "Rosters" }}
                >
                  <Link href="/admin/rosters">
                    <Users />
                    <span>Roster Management</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  isActive={pathname === "/admin/settings"}
                  tooltip={{ children: "Settings" }}
                >
                  <Link href="#">
                    <Settings />
                    <span>Settings</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarContent>
        </Sidebar>

        <SidebarInset className="flex-1 flex flex-col">
          <header className="flex items-center justify-between p-4 border-b bg-card">
            <SidebarTrigger className="md:hidden"/>
            <h1 className="text-2xl font-bold">Admin Panel</h1>
            <Button asChild>
              <Link href="/">View Public Site</Link>
            </Button>
          </header>
          <main className="flex-1 p-4 md:p-8 bg-background">
            {children}
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
