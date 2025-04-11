import React, { useEffect, useState } from "react";
import { FiPlus, FiAward, FiBox, FiCheckCircle, FiLoader } from "react-icons/fi";

// Define props type
interface DashboardProps {
  setActiveTab: (tab: string) => void;
  onReportAchievementClick: () => void; // Add prop for the click handler
}

// Define types for API data
interface RequestItem {
  _id: string;
  requestId: string;
  equipmentName: string;
  status: string;
  requestDate: string;
}

interface BorrowedItem {
  _id: string;
  transactionId: string;
  equipmentName: string;
  dueDate: string;
  borrowedDate: string;
}

interface Achievement {
  _id: string;
  achievementId: string;
  title: string;
  level: string;
  event: {
    name: string;
    category: string;
    abbreviation: string;
  };
  student: {
    name: string;
    grade: string;
  };
  record: string;
  date: string;
  colorScheme: string;
}

// Add setActiveTab and onReportAchievementClick to the component props
const Dashboard: React.FC<DashboardProps> = ({
  setActiveTab,
  onReportAchievementClick, // Destructure the new prop
}) => {
  // State for API data
  const [itemsRequestedData, setItemsRequestedData] = useState<RequestItem[]>([]);
  const [itemsBorrowedData, setItemsBorrowedData] = useState<BorrowedItem[]>([]);
  const [achievementsData, setAchievementsData] = useState<Achievement[]>([]);
  const [loading, setLoading] = useState({
    requests: true,
    borrowals: true,
    achievements: true
  });
  const [error, setError] = useState<{ requests: string | null, borrowals: string | null, achievements: string | null }>({
    requests: null,
    borrowals: null,
    achievements: null
  });
  const [schoolInfo, setSchoolInfo] = useState<{id?: string, name?: string}>({});


  // Fetch data on component mount
  useEffect(() => {
    // Fetch current school info
    const fetchSchoolInfo = async () => {
      try {
        const response = await fetch('/api/auth/school/me');
        if (!response.ok) throw new Error('Failed to fetch school info');
        const data = await response.json();
        setSchoolInfo(data.school || {});
        return data.school?.id;
      } catch (err) {
        console.error('Error fetching school info:', err);
        return null;
      }
    };

    // Fetch equipment requests
    const fetchRequests = async (schoolId: string) => {
      try {
        setLoading(prev => ({ ...prev, requests: true }));
        const response = await fetch(`/api/equipment/request?school=${schoolId}&limit=4`);
        if (!response.ok) throw new Error('Failed to fetch requests');

        const data = await response.json();

        // Transform the data to match our component's expected format
        const formattedRequests = data.equipmentRequests.map((req: any) => ({
          _id: req._id,
          requestId: req.requestId,
          equipmentName: req.items[0]?.equipment?.name || 'Equipment',
          status: req.status,
          requestDate: new Date(req.createdAt).toISOString().split('T')[0]
        }));

        setItemsRequestedData(formattedRequests);
      } catch (err: any) {
        console.error('Error fetching requests:', err);
        setError(prev => ({ ...prev, requests: err.message }));
      } finally {
        setLoading(prev => ({ ...prev, requests: false }));
      }
    };

    // Fetch borrowed equipment (transactions)
    const fetchBorrowals = async (schoolId: string) => {
      try {
        setLoading(prev => ({ ...prev, borrowals: true }));
        const response = await fetch(`/api/equipment/transaction?recipient=${schoolId}&status=approved&transactionType=rental&limit=4`);
        if (!response.ok) throw new Error('Failed to fetch borrowals');

        const data = await response.json();

        // Transform the data to match our component's expected format
        const formattedBorrowals = data.transactions.map((txn: any) => ({
          _id: txn._id,
          transactionId: txn.transactionId,
          equipmentName: txn.items[0]?.equipment?.name || 'Equipment',
          dueDate: txn.rentalDetails?.returnDueDate ? new Date(txn.rentalDetails.returnDueDate).toISOString().split('T')[0] : 'Unknown',
          borrowedDate: txn.rentalDetails?.startDate ? new Date(txn.rentalDetails.startDate).toISOString().split('T')[0] : 'Unknown'
        }));

        setItemsBorrowedData(formattedBorrowals);
      } catch (err: any) {
        console.error('Error fetching borrowals:', err);
        setError(prev => ({ ...prev, borrowals: err.message }));
      } finally {
        setLoading(prev => ({ ...prev, borrowals: false }));
      }
    };

    // Fetch achievements
    const fetchAchievements = async (schoolId: string) => {
      try {
        setLoading(prev => ({ ...prev, achievements: true }));
        // Get plays associated with the school first
        const playsResponse = await fetch(`/api/play?school=${schoolId}`);
        if (!playsResponse.ok) throw new Error('Failed to fetch school plays');

        const playsData = await playsResponse.json();
        if (!playsData.plays || playsData.plays.length === 0) {
          setAchievementsData([]);
          setLoading(prev => ({ ...prev, achievements: false }));
          return;
        }

        // Get play IDs
        const playIds = playsData.plays.map((play: any) => play._id);

        // For each play ID, fetch achievements
        const achievementPromises = playIds.map((playId: string) =>
          fetch(`/api/achievement?play=${playId}`)
            .then(res => res.ok ? res.json() : {achievements: []})
        );

        const achievementResults = await Promise.all(achievementPromises);

        // Combine and flatten all achievements
        const allAchievements = achievementResults
          .flatMap(result => result.achievements || [])
          .slice(0, 5) // Take only 5 most recent
          .map((achievement: any) => ({
            _id: achievement._id,
            achievementId: achievement.achievementId,
            title: achievement.title,
            level: achievement.level,
            event: {
              name: achievement.event || achievement.title,
              category: achievement.play?.sport?.sportName || "Sports",
              abbreviation: achievement.event?.substring(0, 2) || "SP",
            },
            student: {
              name: achievement.position || "School Team",
              grade: achievement.year?.toString() || "N/A",
            },
            record: achievement.description?.substring(0, 10) || "Achievement",
            date: new Date(achievement.createdAt).toLocaleDateString('en-US', {month: 'short', day: 'numeric', year: 'numeric'}),
            colorScheme: ['purple', 'indigo'][Math.floor(Math.random() * 2)],
          }));

        setAchievementsData(allAchievements);
      } catch (err: any) {
        console.error('Error fetching achievements:', err);
        setError(prev => ({ ...prev, achievements: err.message }));
      } finally {
        setLoading(prev => ({ ...prev, achievements: false }));
      }
    };

    // Execute all fetch operations
    const loadData = async () => {
      const schoolId = await fetchSchoolInfo();
      if (schoolId) {
        fetchRequests(schoolId);
        fetchBorrowals(schoolId);
        fetchAchievements(schoolId);
      }
    };

    loadData();
  }, []);

  // Loading state component
  const LoadingState = () => (
    <div className="flex justify-center items-center p-8">
      <FiLoader className="animate-spin text-[#6e11b0] mr-2" size={20} />
      <span>Loading data...</span>
    </div>
  );

  // Error state component
  const ErrorState = ({ message }: { message: string | null }) => (
    <div className="p-4 border border-red-200 rounded bg-red-50 text-red-700 text-center">
      Error loading data: {message || "Unknown error"}
    </div>
  );

  return (
    <div>
      {/* Hero Section - Keeping the gradient as it already uses the correct colors */}
      <div className="bg-gradient-to-r from-[#6e11b0] to-[#1e0fbf] px-6 py-16 md:py-24">
        <div className="max-w-5xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-bold text-white text-center">
            Welcome to GoalX{schoolInfo.name ? `, ${schoolInfo.name}` : ''}
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
              <span className="bg-[#6e11b0] bg-opacity-20 text-[#6e11b0] py-1 px-3 rounded-full text-sm font-medium">
                Pending
              </span>
            </div>
            <div className="p-5">
              {loading.requests ? (
                <LoadingState />
              ) : error.requests ? (
                <ErrorState message={error.requests} />
              ) : (
                <div className="space-y-4">
                  {itemsRequestedData.length === 0 ? (
                    <div className="text-center text-gray-500 py-2">No equipment requests found</div>
                  ) : (
                    itemsRequestedData.slice(0, 2).map((item) => (
                      <div
                        key={item._id}
                        className="bg-gray-50 p-3 rounded-md flex justify-between"
                      >
                        <span className="text-gray-700">{item.equipmentName}</span>
                        <span className="text-[#6e11b0] text-sm">
                          {item.status}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              )}
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
              <span className="bg-[#1e0fbf] bg-opacity-20 text-[#1e0fbf] py-1 px-3 rounded-full text-sm font-medium">
                Active
              </span>
            </div>
            <div className="p-5">
              {loading.borrowals ? (
                <LoadingState />
              ) : error.borrowals ? (
                <ErrorState message={error.borrowals} />
              ) : (
                <div className="space-y-4">
                  {itemsBorrowedData.length === 0 ? (
                    <div className="text-center text-gray-500 py-2">No borrowed equipment found</div>
                  ) : (
                    itemsBorrowedData.slice(0, 2).map((item) => (
                      <div
                        key={item._id}
                        className="bg-gray-50 p-3 rounded-md flex justify-between"
                      >
                        <span className="text-gray-700">{item.equipmentName}</span>
                        <span className="text-[#1e0fbf] text-sm">
                          Due {item.dueDate.substring(5)}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              )}
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
          {loading.achievements ? (
            <div className="p-8">
              <LoadingState />
            </div>
          ) : error.achievements ? (
            <div className="p-4">
              <ErrorState message={error.achievements} />
            </div>
          ) : (
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
                    Student/Team
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
                {achievementsData.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-8 text-center text-gray-500">
                      No achievements found
                    </td>
                  </tr>
                ) : (
                  achievementsData.slice(0, 3).map((achievement) => (
                    <tr key={achievement._id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div
                            className={`flex-shrink-0 h-8 w-8 bg-${
                              achievement.colorScheme
                            }-100 text-${
                              achievement.colorScheme === "purple"
                                ? "[#6e11b0]"
                                : "[#1e0fbf]"
                            } rounded-full flex items-center justify-center`}
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
                          className={`px-3 py-1 inline-flex text-sm leading-5 font-semibold rounded-full bg-${
                            achievement.colorScheme
                          }-100 text-${
                            achievement.colorScheme === "purple"
                              ? "[#6e11b0]"
                              : "[#1e0fbf]"
                          }`}
                        >
                          {achievement.record}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {achievement.date}
                      </td>
                    </tr>
                  ))
                )}
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
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
