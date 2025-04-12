import { BarChart3, School, Package, Trophy } from 'lucide-react';
import StatsCard from '@/components/governBody/dashboard/StatsCard';
import ActivityChart from '@/components/governBody/dashboard/ActivityChart';

export default function Dashboard() {
  const stats = [
    { title: 'Total Schools', value: '150', icon: School },
    { title: 'Equipment Requests', value: '45', icon: Package  },
    { title: 'Achievements', value: '289', icon: Trophy },
    { title: 'Active Sports', value: '12', icon: BarChart3  },
  ];

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold">Dashboard Overview</h1>
      
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <StatsCard key={stat.title} {...stat} />
        ))}
      </div>

      <div className="rounded-lg border bg-card p-6">
        <h2 className="text-xl font-semibold mb-4">Sports Activity</h2>
        <ActivityChart />
      </div>
    </div>
  );
}