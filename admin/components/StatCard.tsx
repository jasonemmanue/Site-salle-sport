interface StatCardProps {
  label: string;
  value: string | number;
  icon: string;
  color?: string;
}

export default function StatCard({ label, value, icon, color = 'text-primary' }: StatCardProps) {
  return (
    <div className="card flex items-center gap-4">
      <div className={`text-3xl ${color}`}>{icon}</div>
      <div>
        <p className="text-2xl font-black text-white">{value}</p>
        <p className="text-sm text-dark-muted">{label}</p>
      </div>
    </div>
  );
}
