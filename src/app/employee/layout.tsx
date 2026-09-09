import EmployeeSidebar from "@/components/EmployeeSidebar";

export default function EmployeeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-[#f7f9fc]">
      
      {/* SIDEBAR */}
      <EmployeeSidebar />

      {/* PAGE CONTENT */}
      <main className="min-w-0 flex-1">
        {children}
      </main>

    </div>
  );
}