function StatCard({ label, value, tone = "neutral", icon: Icon }) {
  return (
    <div className={`stat-card tone-${tone}`}>
      <div>
        <span>{label}</span>
        <strong>{value}</strong>
      </div>
      {Icon && (
        <div className="stat-icon">
          <Icon size={20} />
        </div>
      )}
    </div>
  );
}

export default StatCard;
