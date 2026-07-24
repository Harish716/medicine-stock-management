export default function StatsCard({ label, value, icon: Icon, color, iconBg }) {
  return (
    <div className="stat-card" style={{ '--accent-color': color, '--icon-bg': iconBg }}>
      <div className="stat-icon">
        <Icon size={22} color={color} />
      </div>
      <div className="stat-info">
        <div className="stat-value">{value}</div>
        <div className="stat-label">{label}</div>
      </div>
    </div>
  );
}
