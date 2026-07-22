import { Navbar } from "@/components/shared/Navbar";
import { Sidebar, SidebarProvider } from "@/components/shared/Sidebar";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <div className="min-h-screen bg-background">
        <Sidebar />
        <Navbar />
        <main className="md:pl-64 pt-16">
          <div className="p-4 md:p-6 lg:p-8">{children}</div>
        </main>
      </div>
    </SidebarProvider>
  );
}
