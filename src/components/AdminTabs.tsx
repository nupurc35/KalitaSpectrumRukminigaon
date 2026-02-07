import React from "react";
import { useLocation, useNavigate } from "react-router-dom";

const AdminTabs: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const isMenuActive = location.pathname.includes("/admin/menu");
  const isCategoriesActive = location.pathname.includes("/admin/categories");

  return (
    <div className="flex gap-8 mb-8 border-b border-white/10">
      <button
        type="button"
        onClick={() => navigate("/admin/menu")}
        className={`pb-4 text-xs font-bold uppercase tracking-widest transition-all relative ${
          isMenuActive ? "text-white" : "text-white/50 hover:text-white"
        }`}
      >
        Menu Items
        {isMenuActive && <span className="absolute bottom-0 left-0 w-full h-0.5 bg-secondary" />}
      </button>

      <button
        type="button"
        onClick={() => navigate("/admin/categories")}
        className={`pb-4 text-xs font-bold uppercase tracking-widest transition-all relative ${
          isCategoriesActive ? "text-white" : "text-white/50 hover:text-white"
        }`}
      >
        Categories
        {isCategoriesActive && (
          <span className="absolute bottom-0 left-0 w-full h-0.5 bg-secondary" />
        )}
      </button>
    </div>
  );
};

export default AdminTabs;
