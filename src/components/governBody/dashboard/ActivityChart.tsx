'use client';

import { useTheme } from 'next-themes';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

const data = [
  { name: 'Football', value: 45 },
  { name: 'Basketball', value: 38 },
  { name: 'Swimming', value: 32 },
  { name: 'Athletics', value: 28 },
  { name: 'Tennis', value: 25 },
  { name: 'Volleyball', value: 22 },
];

export default function ActivityChart() {
  const { theme } = useTheme();

  return (
    <div className="h-[400px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey="name"
            stroke={theme === 'dark' ? '#fff' : '#000'}
          />
          <YAxis
            stroke={theme === 'dark' ? '#fff' : '#000'}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: theme === 'dark' ? '#1f2937' : '#fff',
              border: 'none',
              borderRadius: '8px',
            }}
          />
          <Bar
            dataKey="value"
            fill="#0C48C2"
            radius={[4, 4, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}