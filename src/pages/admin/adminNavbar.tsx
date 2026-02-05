import { supabase } from "../../lib/superbase";

const AdminHeader = () => {
  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.replace("/admin/login");
  };

  return (
    <header className="bg-[#0a0a0a] border-b border-white/5 shadow-md">
      <div className="max-w-7xl mx-auto px-6 h-20 flex justify-between items-center">
        <h1 className="text-xl font-serif tracking-wide text-white/90">Admin Dashboard</h1>

        <button
          onClick={handleLogout}
          className="px-6 py-2.5 rounded-full bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500 hover:text-white transition-all duration-300 text-sm font-medium tracking-wide"
        >
          Logout
        </button>
      </div>
    </header>
  );
};

export default AdminHeader;
