import { SideNav, TopNav } from "@/components/nav";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen">
      <SideNav />
      <main className="flex-1 overflow-auto">
        <TopNav title="Dashboard" />
        {children}
      </main>
    </div>
  );
}
