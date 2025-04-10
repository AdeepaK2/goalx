import React from "react";
import { FiPlus, FiAward, FiBox, FiCheckCircle } from "react-icons/fi";

// Define props type
interface DashboardProps {
  setActiveTab: (tab: string) => void;
  onReportAchievementClick: () => void; // Add prop for the click handler
}

// Add setActiveTab and onReportAchievementClick to the component props
const Dashboard: React.FC<DashboardProps> = ({
  setActiveTab,
  onReportAchievementClick, // Destructure the new prop
}) => {
  // Sample data for requested items
  const itemsRequestedData = [
    {
      id: 1,
      name: "Basketball Set",
      status: "Processing",
      requestDate: "2025-04-01",
    },
    {
      id: 2,
      name: "Athletic Cones (x20)",
      status: "Pending Approval",
      requestDate: "2025-04-03",
    },
    {
      id: 3,
      name: "First Aid Kit",
      status: "Approved",
      requestDate: "2025-03-25",
    },
    {
      id: 4,
      name: "Stopwatches (x5)",
      status: "Denied",
      requestDate: "2025-03-20",
    },
  ];

  // Sample data for borrowed items
  const itemsBorrowedData = [
    {
      id: 1,
      name: "Soccer Balls (x5)",
      dueDate: "2025-04-15",
      borrowedDate: "2025-04-01",
    },
    {
      id: 2,
      name: "Volleyball Net",
      dueDate: "2025-04-20",
      borrowedDate: "2025-04-05",
    },
    {
      id: 3,
      name: "Badminton Rackets (x10)",
      dueDate: "2025-04-22",
      borrowedDate: "2025-04-08",
    },
    {
      id: 4,
      name: "Tennis Balls (x30)",
      dueDate: "2025-04-25",
      borrowedDate: "2025-04-10",
    },
  ];

  // Sample data for achievements
  const achievementsData = [
    {
      id: 1,
      event: {
        name: "100m Sprint",
        category: "Track & Field",
        abbreviation: "100m",
      },
      student: {
        name: "John Doe",
        grade: "Grade 11",
      },
      record: "10.5s",
      date: "Apr 2, 2025",
      colorScheme: "purple",
    },
    {
      id: 2,
      event: {
        name: "Long Jump",
        category: "Track & Field",
        abbreviation: "LJ",
      },
      student: {
        name: "Jane Smith",
        grade: "Grade 10",
      },
      record: "5.2m",
      date: "Apr 2, 2025",
      colorScheme: "indigo",
    },
    {
      id: 3,
      event: {
        name: "High Jump",
        category: "Track & Field",
        abbreviation: "HJ",
      },
      student: {
        name: "Alice Johnson",
        grade: "Grade 12",
      },
      record: "1.8m",
      date: "Apr 3, 2025",
      colorScheme: "purple",
    },
    {
      id: 4,
      event: {
        name: "Shot Put",
        category: "Track & Field",
        abbreviation: "SP",
      },
      student: {
        name: "Bob Williams",
        grade: "Grade 11",
      },
      record: "12.5m",
      date: "Apr 3, 2025",
      colorScheme: "indigo",
    },
    {
      id: 5,
      event: {
        name: "Javelin Throw",
        category: "Track & Field",
        abbreviation: "JT",
      },
      student: {
        name: "Charlie Brown",
        grade: "Grade 10",
      },
      record: "45.2m",
      date: "Apr 4, 2025",
      colorScheme: "purple",
    },
  ];

  return (
    <div>
      {/* Hero Section - Keeping the gradient as it already uses the correct colors */}
      <div className="bg-gradient-to-r from-[#6e11b0] to-[#1e0fbf] px-6 py-16 md:py-24">
        <div className="max-w-5xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-bold text-white text-center">
            Welcome to GoalX
          </h1>
          <p className="text-blue-100 text-xl mt-4 text-center max-w-2xl mx-auto">
            Your complete solution for managing school sports equipment and
            tracking achievements
          </p>
        </div>
      </div>

      {/* Dashboard Stats */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Items Requested Card */}
          <div className="bg-white shadow rounded-lg overflow-hidden">
            <div className="p-5 bg-purple-50 border-b border-purple-100 flex justify-between items-center">
              <h2 className="text-lg font-semibold text-gray-800 flex items-center">
                <FiBox className="mr-2 text-[#6e11b0]" /> Items Requested
              </h2>
              <span className="bg-[#6e11b0] bg-opacity-20 text-white py-1 px-3 rounded-full text-sm font-medium">
                Pending
              </span>
            </div>
            <div className="p-5">
              <div className="space-y-4">
                {itemsRequestedData.slice(0, 2).map((item) => (
                  <div
                    key={item.id}
                    className="bg-gray-50 p-3 rounded-md flex justify-between"
                  >
                    <span className="text-gray-700">{item.name}</span>
                    <span className="text-[#6e11b0] text-sm">
                      {item.status}
                    </span>
                  </div>
                ))}
              </div>
              <button
                onClick={() => setActiveTab("requests")}
                className="mt-6 w-full flex items-center justify-center px-4 py-2 border border-[#6e11b0] text-sm font-medium rounded-md text-[#6e11b0] bg-purple-50 hover:bg-purple-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#6e11b0]"
              >
                View all Requests
              </button>
            </div>
          </div>

          {/* Items Borrowed Card */}
          <div className="bg-white shadow rounded-lg overflow-hidden">
            <div className="p-5 bg-indigo-50 border-b border-indigo-100 flex justify-between items-center">
              <h2 className="text-lg font-semibold text-gray-800 flex items-center">
                <FiCheckCircle className="mr-2 text-[#1e0fbf]" /> Items Borrowed
              </h2>
              <span className="bg-[#1e0fbf] bg-opacity-20 text-white py-1 px-3 rounded-full text-sm font-medium">
                Active
              </span>
            </div>
            <div className="p-5">
              <div className="space-y-4">
                {itemsBorrowedData.slice(0, 2).map((item) => (
                  <div
                    key={item.id}
                    className="bg-gray-50 p-3 rounded-md flex justify-between"
                  >
                    <span className="text-gray-700">{item.name}</span>
                    <span className="text-[#1e0fbf] text-sm">
                      Due {item.dueDate.substring(5)}
                    </span>
                  </div>
                ))}
              </div>
              <button
                onClick={() => setActiveTab("borrowals")}
                className="mt-6 w-full flex items-center justify-center px-4 py-2 border border-[#1e0fbf] text-sm font-medium rounded-md text-[#1e0fbf] bg-indigo-50 hover:bg-indigo-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#1e0fbf]"
              >
                View all Borrowed Items
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Achievements */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-800 flex items-center">
            <FiAward className="mr-2 text-[#6e11b0]" /> Recent Achievements
          </h2>
          <button
            onClick={() => setActiveTab("achievements")}
            className="text-[#1e0fbf] hover:text-purple-800 font-medium flex items-center"
          >
            View all <span className="ml-1">→</span>
          </button>
        </div>
        <div className="bg-white shadow overflow-hidden rounded-lg">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Event
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Student
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Record
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Date
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {achievementsData.slice(0, 3).map((achievement) => (
                <tr key={achievement.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div
                        className={`flex-shrink-0 h-8 w-8 bg-${
                          achievement.colorScheme
                        }-100 text-[${
                          achievement.colorScheme === "purple"
                            ? "#6e11b0"
                            : "#1e0fbf"
                        }] rounded-full flex items-center justify-center`}
                      >
                        <span className="font-medium text-sm">
                          {achievement.event.abbreviation}
                        </span>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {achievement.event.name}
                        </div>
                        <div className="text-sm text-gray-500">
                          {achievement.event.category}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {achievement.student.name}
                    </div>
                    <div className="text-sm text-gray-500">
                      {achievement.student.grade}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-3 py-1 inline-flex text-sm leading-5 font-semibold rounded-full bg-[${
                        achievement.colorScheme === "purple"
                          ? "#6e11b0"
                          : "#1e0fbf"
                      }] bg-opacity-10 text-white`}
                    >
                      {achievement.record}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {achievement.date}
                  </td>
                </tr>
              ))}
              <tr>
                <td colSpan={4} className="">
                  <div className="flex justify-center py-6">
                    <button
                      onClick={onReportAchievementClick} // Use the passed handler here
                      className="group w-full px-5 py-2.5 bg-gradient-to-r from-[#6e11b0] to-[#1e0fbf] text-sm font-medium rounded-md text-white shadow-md hover:shadow-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#6e11b0] flex items-center justify-center"
                    >
                      <FiPlus className="mr-2 transition-transform group-hover:rotate-90" />
                      <span>Report Achievement</span>
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
