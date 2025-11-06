import { NavLink } from "react-router-dom";
import "../styles/dashboard.css";

export default function Sidebar() {
  return (
    <div className="sidebar">
      <div>
        <h2>SlotSwapper</h2>
        <nav>
          <NavLink to="/" end>My Calendar</NavLink>
          <NavLink to="/marketplace">Marketplace</NavLink>
          <NavLink to="/requests">Requests</NavLink>
        </nav>
      </div>
      <div style={{ fontSize: "0.9rem", color: "#94a3b8" }}>
        <p>User A</p>
        <p style={{ fontSize: "0.8rem" }}>user@example.com</p>
      </div>
    </div>
  );
}
