export default function AdminDashboard() {
  return (
    <div className="w-full max-w-[1600px] mx-auto p-12 pb-24">
      <h1 className="text-3xl font-black text-gray-900 mb-2">Dashboard</h1>
      <p className="text-sm font-semibold text-gray-500 uppercase tracking-widest">MINIFIG OS. ENTERPRISE SYSTEM</p>
      
      <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-8 border border-gray-200 shadow-sm flex flex-col">
          <p className="text-gray-500 font-bold text-sm">Toplam Seri</p>
          <p className="text-4xl font-black mt-2">12</p>
        </div>
        <div className="bg-white p-8 border border-gray-200 shadow-sm flex flex-col">
          <p className="text-gray-500 font-bold text-sm">Toplam Figür</p>
          <p className="text-4xl font-black mt-2">139</p>
        </div>
        <div className="bg-white p-8 border border-gray-200 shadow-sm flex flex-col">
          <p className="text-gray-500 font-bold text-sm">Günlük Hit</p>
          <p className="text-4xl font-black mt-2 text-green-600">4,192</p>
        </div>
      </div>
    </div>
  );
}
