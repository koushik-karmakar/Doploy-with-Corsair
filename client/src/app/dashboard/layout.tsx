import { SideNav, TopNav } from "@/components/nav";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen">
      <SideNav />
      <main className="flex-1 overflow-hidden">
        <TopNav title="Dashboard" />
        {children}
      </main>
    </div>
  );
}
