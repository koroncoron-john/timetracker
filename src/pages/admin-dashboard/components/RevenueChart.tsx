interface MonthlyRevenue {
  month: string;
  revenue: number;
  new_users: number;
  cancelled_users: number;
  active_subscriptions: number;
  premium_users: number;
}

interface RevenueChartProps {
  data: MonthlyRevenue[];
}

export default function RevenueChart({ data }: RevenueChartProps) {
  const maxRevenue = Math.max(...data.map(d => d.revenue), 1);

  return (
    <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
      <h3 className="text-lg font-semibold text-gray-900 mb-6">月次売上推移</h3>
      <div className="space-y-4">
        {data.slice(0, 6).reverse().map((item) => (
          <div key={item.month}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600">{item.month}</span>
              <span className="text-sm font-semibold text-gray-900">¥{item.revenue.toLocaleString()}</span>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-2">
              <div
                className="bg-gradient-to-r from-teal-500 to-teal-600 h-2 rounded-full transition-all duration-500"
                style={{ width: `${(item.revenue / maxRevenue) * 100}%` }}
              ></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
