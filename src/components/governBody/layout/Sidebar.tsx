'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Package, School, Trophy } from 'lucide-react';
import ThemeToggle from './ThemeToggle';
import Image from 'next/image';

const navigation = [
  { name: 'Dashboard', href: '/governBody', icon: LayoutDashboard },
  { name: 'Equipment Requests', href: '/governBody/equipmentRequests', icon: Package },
  { name: 'School List', href: '/governBody/schools', icon: School },
  { name: 'Sport Summary', href: '/governBody/sportSummary', icon: Trophy },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <div className="flex h-full w-64 flex-col bg-card border-2">
      <div className="flex items-center justify-center h-20 border-b border-gray-100 p-4">
        <div className="relative h-15 w-40">
          <Image 
            src="/logo.png" 
            alt="GoalX Logo" 
            fill 
            style={{ objectFit: 'contain' }} 
            priority 
          />
        </div>
      </div>
      <nav className="flex-1 space-y-4 p-4">
        {navigation.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                isActive
                  ? 'bg-[#6E11B0] text-white border rounded-lg'
                  : 'hover:bg-muted'
              }`}
            >
              <item.icon className="mr-3 h-5 w-5" />
              {item.name}
            </Link>
          );
        })}
      </nav>
      <div className="p-4 border-t">
        <ThemeToggle />
      </div>
    </div>
  );
}