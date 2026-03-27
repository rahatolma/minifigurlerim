import Sidebar from '@/components/admin/Sidebar';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-[#F8F9FA] font-sans antialiased text-black">
      <Sidebar />
      {/* Main Container */}
      <main className="flex-1 flex flex-col min-w-0 ml-64 min-h-screen relative">
        {children}
      </main>
    </div>
  );
}
