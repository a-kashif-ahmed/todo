// src/app/(dashboard)/layout.tsx
import Sidebar from "@/components/ui/sidebar/page";
import Navbar from "@/components/ui/navbar/page";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-surface">
      <Sidebar />
      <div className="flex flex-col flex-1">
        <Navbar />
        <main className="flex-1 p-6 md:p-8 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}