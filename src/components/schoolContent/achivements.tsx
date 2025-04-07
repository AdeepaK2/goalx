import React from 'react'
import { FiAward, FiPlus } from "react-icons/fi"; // Using FiAward for achievements, FiPlus for adding




const achievementsData = [
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


const achivements = () => {
  // Placeholder function for handling the button click
  const handleReportAchievement = () => {
    console.log("Report new achievement button clicked");
    // Implement logic to open a form or modal for reporting
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
                    Celebrate the outstanding achievements of our students in various events.
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
                            <FiAward className="mr-2 text-[#6e11b0]" /> Recent Records & Achievements
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
                                        <p className="font-semibold text-[#6e11b0]">{achievement.event.name}</p>
                                        <p className="text-sm text-gray-500">{achievement.event.category} ({achievement.event.abbreviation})</p>
                                    </div>

                                    {/* Student Info */}
                                    <div className="md:col-span-1">
                                        <p className="font-medium text-gray-700">{achievement.student.name}</p>
                                        <p className="text-sm text-gray-500">{achievement.student.grade}</p>
                                    </div>

                                    {/* Record */}
                                    <div className="md:col-span-1 md:text-center">
                                         {/* Using the blue color for the record badge */}
                                         <span className={`inline-block px-3 py-1 text-sm font-semibold rounded-full w-20 ${achievement.id % 2 === 0 ? 'bg-[#1e0fbf]' : 'bg-[#6e11b0]'} text-white`}>
                                             {achievement.record}
                                         </span>
                                    </div>

                                    {/* Date */}
                                    <div className="md:col-span-1 md:text-right">
                                        <p className="text-sm text-gray-600">{achievement.date}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
  )
}

export default achivements