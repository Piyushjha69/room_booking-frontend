"use client";

interface StatCardProps {
  title: string;
  value: number | string;
  icon?: React.ReactNode;
  color?: "blue" | "green" | "purple" | "orange";
}

export function StatCard({ title, value, icon, color = "blue" }: StatCardProps) {
  const colors = {
    blue: "from-blue-500 to-blue-600",
    green: "from-green-500 to-green-600",
    purple: "from-purple-500 to-purple-600",
    orange: "from-orange-500 to-orange-600",
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className={`bg-gradient-to-r ${colors[color]} p-6 text-white`}>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm opacity-90">{title}</p>
            <p className="text-3xl font-bold mt-1">{value}</p>
          </div>
          {icon && <div className="text-4xl opacity-80">{icon}</div>}
        </div>
      </div>
    </div>
  );
}
