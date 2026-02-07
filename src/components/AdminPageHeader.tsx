import React from "react";
import { useNavigate } from "react-router-dom";

const AdminPageHeader: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="flex items-center justify-between mb-6">
      <button
        type="button"
        onClick={() => navigate("/admin")}
        className="text-sm uppercase tracking-widest text-white/50 hover:text-white transition-colors"
      >
        <span aria-hidden="true" className="mr-2">
          ←
        </span>
        Dashboard
      </button>
      <span aria-hidden="true" />
    </div>
  );
};

export default AdminPageHeader;
