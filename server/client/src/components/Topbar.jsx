import "../styles/dashboard.css";

export default function Topbar({ onAdd }) {
  return (
    <div className="topbar">
      <span>My Calendar</span>
      <button className="btn-add" onClick={onAdd}>+ Create Event</button>
    </div>
  );
}
