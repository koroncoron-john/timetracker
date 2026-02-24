interface MonthlyRevenue {
  month: string;
  revenue: number;
  new_users: number;
  cancelled_users: number;
  active_subscriptions: number;
  premium_users: number;
}

interface UserTrendChartProps {
  data: MonthlyRevenue[];
}

export default function UserTrendChart({ data }: UserTrendChartProps) {
  const maxUsers = Math.max(...data.map(d => d.new_users), 1);

  return (
    <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
      <h3 className="text-lg font-semibold text-gray-900 mb-6">新規ユーザー推移</h3>
      <div className="space-y-4">
        {data.slice(0, 6).reverse().map((item) => (
          <div key={item.month}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600">{item.month}</span>
              <div className="flex items-center space-x-4">
                <span className="text-sm text-green-600">+{item.new_users}</span>
                {item.cancelled_users > 0 && (
                  <span className="text-sm text-red-600">-{item.cancelled_users}</span>
                )}
              </div>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-2">
              <div
                className="bg-gradient-to-r from-blue-500 to-blue-600 h-2 rounded-full transition-all duration-500"
                style={{ width: `${(item.new_users / maxUsers) * 100}%` }}
              ></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
