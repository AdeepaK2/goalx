'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import { MapPin, Phone, Mail, Trophy, Package, Calendar, Medal, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

const mockSchool = {
  id: '1',
  name: 'St. Mary High School',
  location: 'New York, NY',
  phone: '+1 (555) 123-4567',
  email: 'contact@stmary.edu',
  activeStudents: 1200,
  activeSports: 8,
  achievements: [
    {
      id: '1',
      title: 'State Basketball Champions',
      date: '2024-02-15',
      sport: 'Basketball',
      type: 'Championship',
    },
    {
      id: '2',
      title: 'Regional Swimming Competition Winners',
      date: '2024-01-20',
      sport: 'Swimming',
      type: 'Regional',
    },
  ],
  equipmentHistory: [
    {
      id: '1',
      item: 'Basketball Equipment Set',
      quantity: 10,
      date: '2024-03-15',
      status: 'Delivered',
    },
    {
      id: '2',
      item: 'Swimming Gear',
      quantity: 20,
      date: '2024-02-10',
      status: 'Delivered',
    },
  ],
};

export default function SchoolProfile() {
  const { id } = useParams();
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);

  return (
    <div className="space-y-8">
      <div className="flex items-center space-x-4">
        <Link
          href="/schools"
          className="flex items-center text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back to Schools
        </Link>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-6">
          <div className="rounded-lg border bg-card p-6">
            <h1 className="text-3xl font-bold mb-6">{mockSchool.name}</h1>
            
            <div className="space-y-4 text-muted-foreground">
              <div className="flex items-center">
                <MapPin className="h-5 w-5 mr-3" />
                {mockSchool.location}
              </div>
              <div className="flex items-center">
                <Phone className="h-5 w-5 mr-3" />
                {mockSchool.phone}
              </div>
              <div className="flex items-center">
                <Mail className="h-5 w-5 mr-3" />
                {mockSchool.email}
              </div>
            </div>

            <button
              onClick={() => setIsEmailModalOpen(true)}
              className="mt-6 w-full bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors"
            >
              Contact School
            </button>
          </div>

          <div className="rounded-lg border bg-card p-6">
            <div className="flex items-center mb-4">
              <Trophy className="h-5 w-5 mr-2 text-primary" />
              <h2 className="text-xl font-semibold">Recent Achievements</h2>
            </div>
            <div className="space-y-4">
              {mockSchool.achievements.map((achievement) => (
                <div
                  key={achievement.id}
                  className="flex items-start space-x-4 p-4 rounded-lg bg-muted/50"
                >
                  <Medal className="h-5 w-5 text-primary flex-shrink-0" />
                  <div>
                    <h3 className="font-medium">{achievement.title}</h3>
                    <p className="text-sm text-muted-foreground">
                      {achievement.sport} - {achievement.type}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(achievement.date).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="rounded-lg border bg-card p-6">
          <div className="flex items-center mb-4">
            <Package className="h-5 w-5 mr-2 text-primary" />
            <h2 className="text-xl font-semibold">Equipment History</h2>
          </div>
          <div className="space-y-4">
            {mockSchool.equipmentHistory.map((equipment) => (
              <div
                key={equipment.id}
                className="flex items-start space-x-4 p-4 rounded-lg bg-muted/50"
              >
                <Calendar className="h-5 w-5 text-primary flex-shrink-0" />
                <div>
                  <h3 className="font-medium">{equipment.item}</h3>
                  <p className="text-sm text-muted-foreground">
                    Quantity: {equipment.quantity}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Status: {equipment.status}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {new Date(equipment.date).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {isEmailModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
          <div className="bg-card p-6 rounded-lg max-w-md w-full mx-4">
            <h2 className="text-xl font-semibold mb-4">Contact School</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Subject</label>
                <input
                  type="text"
                  className="w-full rounded-lg border bg-card px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Message</label>
                <textarea
                  rows={4}
                  className="w-full rounded-lg border bg-card px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <div className="flex justify-end space-x-2">
                <button
                  onClick={() => setIsEmailModalOpen(false)}
                  className="px-4 py-2 rounded-lg bg-muted hover:bg-muted/80 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => setIsEmailModalOpen(false)}
                  className="px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
                >
                  Send
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}