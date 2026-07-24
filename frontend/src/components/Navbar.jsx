import { NavLink } from 'react-router-dom';
import { LayoutDashboard, ClipboardList, PlusCircle, Activity } from 'lucide-react';

export default function Navbar() {
  return (
    <nav className="navbar">
      <div className="navbar-inner">
        <NavLink to="/" className="navbar-brand">
          <div className="navbar-brand-icon">
            <Activity size={18} color="#fff" />
          </div>
          <div>
            <div className="navbar-brand-text">MedStock</div>
            <div className="navbar-brand-sub">Primary Health Centre</div>
          </div>
        </NavLink>

        <div className="navbar-links">
          <NavLink to="/" end className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
            <LayoutDashboard size={16} />
            <span>Dashboard</span>
          </NavLink>
          <NavLink to="/stock" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
            <ClipboardList size={16} />
            <span>Stock Register</span>
          </NavLink>
          <NavLink to="/add" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
            <PlusCircle size={16} />
            <span>Add Entry</span>
          </NavLink>
        </div>
      </div>
    </nav>
  );
}
