'use client';

import { CheckCircle, XCircle, Clock } from 'lucide-react';

interface Request {
  id: string;
  school: string;
  item: string;
  quantity: number;
  date: string;
  status: string;
  priority: string;
}

interface RequestTableProps {
  requests: Request[];
}

const statusIcons = {
  approved: { icon: CheckCircle, className: 'text-green-500' },
  rejected: { icon: XCircle, className: 'text-red-500' },
  pending: { icon: Clock, className: 'text-yellow-500' },
};

const priorityColors = {
  high: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
  medium: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
  low: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
};

export default function RequestTable({ requests }: RequestTableProps) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b bg-muted/50">
            <th className="px-6 py-3 text-left text-sm font-medium text-muted-foreground">School</th>
            <th className="px-6 py-3 text-left text-sm font-medium text-muted-foreground">Item</th>
            <th className="px-6 py-3 text-left text-sm font-medium text-muted-foreground">Quantity</th>
            <th className="px-6 py-3 text-left text-sm font-medium text-muted-foreground">Date</th>
            <th className="px-6 py-3 text-left text-sm font-medium text-muted-foreground">Priority</th>
            <th className="px-6 py-3 text-left text-sm font-medium text-muted-foreground">Status</th>
            <th className="px-6 py-3 text-left text-sm font-medium text-muted-foreground">Actions</th>
          </tr>
        </thead>
        <tbody>
          {requests.map((request) => {
            const StatusIcon = statusIcons[request.status as keyof typeof statusIcons].icon;
            const statusClassName = statusIcons[request.status as keyof typeof statusIcons].className;
            const priorityClassName = priorityColors[request.priority as keyof typeof priorityColors];

            return (
              <tr key={request.id} className="border-b hover:bg-muted/50 transition-colors">
                <td className="px-6 py-4 text-sm">{request.school}</td>
                <td className="px-6 py-4 text-sm">{request.item}</td>
                <td className="px-6 py-4 text-sm">{request.quantity}</td>
                <td className="px-6 py-4 text-sm">{new Date(request.date).toLocaleDateString()}</td>
                <td className="px-6 py-4 text-sm">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${priorityClassName}`}>
                    {request.priority}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm">
                  <div className="flex items-center">
                    <StatusIcon className={`h-4 w-4 mr-2 ${statusClassName}`} />
                    <span className="capitalize">{request.status}</span>
                  </div>
                </td>
                <td className="px-6 py-4 text-sm">
                  <button className="text-primary hover:text-primary/80 transition-colors">
                    View Details
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}