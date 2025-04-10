import React, { useState, useEffect } from "react"; // Import useEffect
import { FiAward, FiPlus, FiX } from "react-icons/fi"; // Using FiAward for achievements, FiPlus for adding, FiX for closing

// Define the structure for an achievement
interface Achievement {
  id: number;
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

// Define the structure for the achievement form data
interface AchievementFormData {
  eventName: string;
  eventCategory: string;
  eventAbbreviation: string;
  studentName: string;
  studentGrade: string;
  record: string;
  date: string;
}

// Define a type for the action trigger prop
type ActionTrigger = {
  tab: string;
  action: string;
} | null;

// Define props for Achievements component
interface AchievementsProps {
  actionTrigger?: ActionTrigger; // Make optional or provide default null in parent
  clearActionTrigger?: () => void; // Make optional or provide default empty fn
}

const achievementsData: Achievement[] = [
  {
    id: 1,
    event: {
      name: "100m Sprint",
      category: "Track & Field",
      abbreviation: "100m",
    },
    student: {
      name: "Ravindu Perera",
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
      name: "Nethmi Silva",
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
      name: "Sachintha Fernando",
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
      name: "Binuri Rajapakse",
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
      name: "Isuri Dias",
      grade: "Grade 10",
    },
    record: "45.2m",
    date: "Apr 4, 2025",
    colorScheme: "purple",
  },
];

const Achievements: React.FC<AchievementsProps> = ({
  actionTrigger,
  clearActionTrigger,
}) => {
  const [showModal, setShowModal] = useState(false);
  const [achievementForm, setAchievementForm] = useState<AchievementFormData>({
    eventName: "",
    eventCategory: "",
    eventAbbreviation: "",
    studentName: "",
    studentGrade: "",
    record: "",
    date: "",
  });

  // Effect to watch for the action trigger
  useEffect(() => {
    if (
      actionTrigger?.tab === "achievements" &&
      actionTrigger?.action === "openModal"
    ) {
      handleReportAchievement(); // Open the modal
      clearActionTrigger?.(); // Clear the trigger so it doesn't re-run
    }
  }, [actionTrigger, clearActionTrigger]); // Dependencies for the effect

  const handleReportAchievement = () => {
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    // Optionally reset form state when closing
    setAchievementForm({
      eventName: "",
      eventCategory: "",
      eventAbbreviation: "",
      studentName: "",
      studentGrade: "",
      record: "",
      date: "",
    });
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setAchievementForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmitAchievement = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log("Submitting new achievement:", achievementForm);
    // Here you would typically send the data to a backend API
    // For now, just log it and close the modal
    handleCloseModal();
  };

  return (
    <div>
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-[#6e11b0] to-[#1e0fbf] px-6 py-16 md:py-24">
        <div className="max-w-5xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-bold text-white text-center">
            School Achievements
          </h1>
          <p className="text-blue-100 text-xl mt-4 text-center max-w-2xl mx-auto">
            Celebrate the outstanding achievements of our students in various
            events.
          </p>
        </div>
      </div>

      {/* Achievements List */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-10">
        <div className="grid grid-cols-1 gap-6">
          {/* Achievements Card */}
          <div className="bg-white shadow rounded-lg overflow-hidden">
            <div className="p-5 bg-purple-50 border-b border-purple-100 flex justify-between items-center">
              <h2 className="text-lg font-semibold text-gray-800 flex items-center">
                <FiAward className="mr-2 text-[#6e11b0]" /> Recent Records &
                Achievements
              </h2>
              {/* Add Button */}
              <button
                onClick={handleReportAchievement}
                className="flex items-center px-4 py-2 bg-[#1e0fbf] text-white text-sm font-medium rounded-md hover:bg-[#6e11b0] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#1e0fbf] transition duration-150 ease-in-out"
              >
                <FiPlus className="mr-1 h-4 w-4" /> Report Achievement
              </button>
            </div>
            <div className="p-5">
              <div className="space-y-4">
                {achievementsData.map((achievement) => (
                  <div
                    key={achievement.id}
                    className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm grid grid-cols-1 md:grid-cols-4 gap-4 items-center hover:border-[#6e11b0] hover:shadow-md transition duration-150 ease-in-out"
                  >
                    {/* Event Info */}
                    <div className="md:col-span-1">
                      <p className="font-semibold text-[#6e11b0]">
                        {achievement.event.name}
                      </p>
                      <p className="text-sm text-gray-500">
                        {achievement.event.category} (
                        {achievement.event.abbreviation})
                      </p>
                    </div>

                    {/* Student Info */}
                    <div className="md:col-span-1">
                      <p className="font-medium text-gray-700">
                        {achievement.student.name}
                      </p>
                      <p className="text-sm text-gray-500">
                        {achievement.student.grade}
                      </p>
                    </div>

                    {/* Record */}
                    <div className="md:col-span-1 md:text-center">
                      <span
                        className={`inline-block px-3 py-1 text-sm font-semibold rounded-full w-20 ${achievement.id % 2 === 0 ? "bg-[#1e0fbf]" : "bg-[#6e11b0]"} text-white`}
                      >
                        {achievement.record}
                      </span>
                    </div>

                    {/* Date */}
                    <div className="md:col-span-1 md:text-right">
                      <p className="text-sm text-gray-600">
                        {achievement.date}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Report Achievement Modal */}
      {showModal && (
        <div className="fixed inset-0 backdrop-blur bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center">
          <div className="relative bg-white rounded-lg shadow-xl max-w-lg w-full mx-4 md:mx-0">
            {/* Modal Header */}
            <div className="flex justify-between items-center border-b border-gray-200 px-6 py-4">
              <h3 className="text-lg font-medium text-gray-900">
                Report New Achievement
              </h3>
              <button
                onClick={handleCloseModal}
                className="text-gray-400 hover:text-gray-500"
              >
                <FiX className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleSubmitAchievement} className="px-6 py-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Event Details */}
                <div>
                  <label
                    htmlFor="eventName"
                    className="block text-sm font-medium text-[#1e0fbf]"
                  >
                    Event Name
                  </label>
                  <input
                    type="text"
                    id="eventName"
                    name="eventName"
                    value={achievementForm.eventName}
                    onChange={handleInputChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 text-[#6e11b0] focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    required
                  />
                </div>
                <div>
                  <label
                    htmlFor="eventCategory"
                    className="block text-sm font-medium text-[#1e0fbf]"
                  >
                    Event Category
                  </label>
                  <input
                    type="text"
                    id="eventCategory"
                    name="eventCategory"
                    value={achievementForm.eventCategory}
                    onChange={handleInputChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 text-[#6e11b0] focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    required
                  />
                </div>
                <div>
                  <label
                    htmlFor="eventAbbreviation"
                    className="block text-sm font-medium text-[#1e0fbf]"
                  >
                    Event Abbreviation
                  </label>
                  <input
                    type="text"
                    id="eventAbbreviation"
                    name="eventAbbreviation"
                    value={achievementForm.eventAbbreviation}
                    onChange={handleInputChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 text-[#6e11b0] focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>

                {/* Student Details */}
                <div>
                  <label
                    htmlFor="studentName"
                    className="block text-sm font-medium text-[#1e0fbf]"
                  >
                    Student Name
                  </label>
                  <input
                    type="text"
                    id="studentName"
                    name="studentName"
                    value={achievementForm.studentName}
                    onChange={handleInputChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 text-[#6e11b0] focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    required
                  />
                </div>
                <div>
                  <label
                    htmlFor="studentGrade"
                    className="block text-sm font-medium text-[#1e0fbf]"
                  >
                    Student Grade
                  </label>
                  <input
                    type="text"
                    id="studentGrade"
                    name="studentGrade"
                    value={achievementForm.studentGrade}
                    onChange={handleInputChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 text-[#6e11b0] focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    required
                  />
                </div>

                {/* Achievement Details */}
                <div>
                  <label
                    htmlFor="record"
                    className="block text-sm font-medium text-[#1e0fbf]"
                  >
                    Record/Achievement
                  </label>
                  <input
                    type="text"
                    id="record"
                    name="record"
                    value={achievementForm.record}
                    onChange={handleInputChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 text-[#6e11b0] focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    required
                  />
                </div>
                <div>
                  <label
                    htmlFor="date"
                    className="block text-sm font-medium text-[#1e0fbf]"
                  >
                    Date Achieved
                  </label>
                  <input
                    type="date"
                    id="date"
                    name="date"
                    value={achievementForm.date}
                    onChange={handleInputChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 text-[#6e11b0] focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    required
                  />
                </div>
              </div>

              {/* Modal Footer */}
              <div className="mt-6 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#1e0fbf] text-white text-sm font-medium rounded-md hover:bg-[#6e11b0] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#1e0fbf] transition duration-150 ease-in-out"
                >
                  Submit Achievement
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Achievements; // Renamed component to follow PascalCase convention
