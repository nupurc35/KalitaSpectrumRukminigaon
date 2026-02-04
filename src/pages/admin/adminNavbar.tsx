import { supabase } from "../../lib/superbase";
import { useNavigate } from "react-router-dom";





const AdminHeader = () => {
  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.replace("/admin/login");
  };

  return (
    <div className="flex justify-between items-center mb-6">
      <h1 className="text-2xl font-serif text-white">Admin Dashboard</h1>

      <button
        onClick={handleLogout}
        className="px-4 py-2 rounded-full bg-red-600 text-white font-semibold hover:bg-red-700"
      >
        Logout
      </button>
    </div>
  );
};

export default AdminHeader;

 
  
