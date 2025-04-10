"use client";
import React, { useState, useEffect } from "react";
import { FiAward, FiPlus, FiX, FiLoader, FiCheckCircle } from "react-icons/fi";
import axios from "axios";

// Define interfaces for API data
interface Sport {
  _id: string;
  sportId: string;
  sportName: string;
}

interface Play {
  _id: string;
  school: {
    _id: string;
    name: string;
    schoolId: string;
  };
  sport: Sport;
}

interface Achievement {
  _id: string;
  achievementId: string;
  play: Play;
  title: string;
  level: "Zonal" | "District" | "Provincial" | "National" | "International";
  year: number;
  position?: string;
  event?: string;
  description?: string;
  mediaLinks?: string[];
  createdAt: string;
}

// Define the structure for the achievement form data
interface AchievementFormData {
  title: string;
  level: "Zonal" | "District" | "Provincial" | "National" | "International";
  year: number;
  position: string;
  event: string;
  description: string;
  play: string; // This will be the play ID
}

const Achievements = () => {
  // State for achievements data and loading/error states
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [plays, setPlays] = useState<Play[]>([]);
  const [sports, setSports] = useState<Sport[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedSport, setSelectedSport] = useState<string | null>(null);

  // State for modal and form
  const [showModal, setShowModal] = useState(false);
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [formSuccess, setFormSuccess] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [achievementForm, setAchievementForm] = useState<AchievementFormData>({
    title: "",
    level: "Zonal",
    year: new Date().getFullYear(),
    position: "",
    event: "",
    description: "",
    play: "",
  });
  
  // Add loading state for sports
  const [loadingSports, setLoadingSports] = useState(true);

  // Fetch all sports from the system
  useEffect(() => {
    const fetchSports = async () => {
      try {
        setLoadingSports(true);
        const response = await axios.get('/api/sport', {
          params: { limit: 100 } // Get a large number of sports
        });
        
        if (response.data?.sports && Array.isArray(response.data.sports)) {
          console.log('Available sports:', response.data.sports);
          setSports(response.data.sports);
        } else {
          console.warn('Unexpected sports response format:', response.data);
        }
      } catch (err) {
        console.error('Error fetching sports:', err);
      } finally {
        setLoadingSports(false);
      }
    };

    fetchSports();
  }, []);

  // Fetch school info and then achievements on component mount
  useEffect(() => {
    // Fetch current school info
    const fetchSchoolInfo = async () => {
      try {
        const response = await axios.get("/api/auth/school/me");

        if (!response.data?.school || !response.data?.school.id) {
          console.error("Invalid school info response:", response.data);
          throw new Error("Failed to fetch school info");
        }

        return response.data.school.id;
      } catch (err) {
        console.error("Error fetching school info:", err);
        setError("Failed to fetch your school information");
        setLoading(false);
        return null;
      }
    };

    // Fetch plays associated with the school
    const fetchPlays = async (schoolId: string) => {
      try {
        const response = await axios.get(`/api/play?school=${schoolId}`);
        if (response.data?.plays) {
          setPlays(response.data.plays);
          return response.data.plays;
        } else {
          console.warn("No plays found for this school");
          return [];
        }
      } catch (err) {
        console.error("Error fetching plays:", err);
        return [];
      }
    };

    // Fetch achievements for each play
    const fetchAchievements = async (plays: Play[]) => {
      if (!plays || plays.length === 0) {
        setLoading(false);
        return;
      }

      try {
        // Build an array of promises to fetch achievements for each play
        const promises = plays.map((play) =>
          axios.get(`/api/achievement?play=${play._id}`)
        );

        // Wait for all promises to resolve
        const results = await Promise.all(promises);

        // Combine and flatten all achievements
        const allAchievements: Achievement[] = [];
        results.forEach((result) => {
          if (result.data?.achievements) {
            allAchievements.push(...result.data.achievements);
          }
        });

        // Sort achievements by date
        allAchievements.sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );

        setAchievements(allAchievements);
      } catch (err) {
        console.error("Error fetching achievements:", err);
        setError("Failed to load achievements");
      } finally {
        setLoading(false);
      }
    };

    // Execute fetch operations
    const loadData = async () => {
      const schoolId = await fetchSchoolInfo();
      if (schoolId) {
        const schoolPlays = await fetchPlays(schoolId);
        fetchAchievements(schoolPlays);
      }
    };

    loadData();
  }, []);

  // Create a new play for the school when a sport is selected
  const createPlayForSchool = async (sportId: string) => {
    try {
      // First get school info
      const schoolResponse = await axios.get("/api/auth/school/me");
      if (!schoolResponse.data?.school?.id) {
        throw new Error("Failed to get school ID");
      }
      
      const schoolId = schoolResponse.data.school.id;
      
      // Create a new play connecting this school and the selected sport
      const playResponse = await axios.post("/api/play", {
        school: schoolId,
        sport: sportId,
        active: true
      });
      
      // Return the newly created play
      return playResponse.data;
    } catch (err) {
      console.error("Error creating play:", err);
      throw err;
    }
  };

  // Modal handlers
  const handleReportAchievement = () => {
    // Reset form state when opening
    setFormSuccess(false);
    setFormError(null);

    // If we have plays available, set the first one as default
    if (plays.length > 0) {
      setAchievementForm((prev) => ({
        ...prev,
        play: plays[0]._id,
      }));
    }

    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedSport(null);
    // Reset form state when closing
    setAchievementForm({
      title: "",
      level: "Zonal",
      year: new Date().getFullYear(),
      position: "",
      event: "",
      description: "",
      play: plays.length > 0 ? plays[0]._id : "",
    });
  };

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setAchievementForm((prev) => ({ ...prev, [name]: value }));
  };

  // Handle sport selection - create a new play if needed
  const handleSportChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const sportId = e.target.value;
    if (!sportId) return;
    
    setSelectedSport(sportId);
    
    // Check if a play already exists for this sport
    const existingPlay = plays.find(play => play.sport._id === sportId);
    if (existingPlay) {
      // Use the existing play
      setAchievementForm(prev => ({ ...prev, play: existingPlay._id }));
    } else {
      try {
        // Create a new play
        setFormSubmitting(true);
        const newPlay = await createPlayForSchool(sportId);
        
        // Add the new play to the plays list
        setPlays(prev => [...prev, newPlay]);
        
        // Set the new play as the selected play
        setAchievementForm(prev => ({ ...prev, play: newPlay._id }));
      } catch (err) {
        setFormError("Failed to create sport-school connection. Please try again.");
      } finally {
        setFormSubmitting(false);
      }
    }
  };

  const handleSubmitAchievement = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();
    setFormSubmitting(true);
    setFormError(null);

    try {
      // Submit the form data to the API
      const response = await axios.post("/api/achievement", achievementForm);

      // Add the new achievement to state
      setAchievements((prev) => [response.data, ...prev]);

      // Show success message
      setFormSuccess(true);

      // Close the modal after a delay
      setTimeout(() => {
        handleCloseModal();
      }, 2000);
    } catch (err: any) {
      console.error("Error submitting achievement:", err);
      setFormError(
        err.response?.data?.error || "Failed to submit achievement"
      );
    } finally {
      setFormSubmitting(false);
    }
  };

  // Format date for display
  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  // Get color based on achievement level
  const getLevelColor = (level: string): string => {
    const colorMap: Record<string, string> = {
      Zonal: "bg-green-100 text-green-800",
      District: "bg-blue-100 text-blue-800",
      Provincial: "bg-indigo-100 text-indigo-800",
      National: "bg-purple-100 text-purple-800",
      International: "bg-pink-100 text-pink-800",
    };

    return colorMap[level] || "bg-gray-100 text-gray-800";
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-10 pb-10">
        <div className="grid grid-cols-1 gap-6">
          {/* Achievements Card */}
          <div className="bg-white shadow rounded-lg overflow-hidden">
            <div className="p-5 bg-purple-50 border-b border-purple-100 flex justify-between items-center">
              <h2 className="text-lg font-semibold text-gray-800 flex items-center">
                <FiAward className="mr-2 text-[#6e11b0]" /> Records &
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
              {loading ? (
                <div className="flex justify-center items-center p-10">
                  <FiLoader className="h-8 w-8 text-[#6e11b0] animate-spin" />
                  <span className="ml-2 text-gray-600">
                    Loading achievements...
                  </span>
                </div>
              ) : error ? (
                <div className="bg-red-50 border border-red-200 rounded p-4 text-red-700">
                  {error}
                </div>
              ) : achievements.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <FiAward className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                  <p>No achievements reported yet.</p>
                  <p className="mt-2 text-sm">
                    Click the &quot;Report Achievement&quot; button to add your
                    first achievement.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {achievements.map((achievement) => (
                    <div
                      key={achievement._id}
                      className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm hover:border-[#6e11b0] hover:shadow-md transition duration-150 ease-in-out"
                    >
                      <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
                        {/* Achievement Title & Event */}
                        <div className="md:col-span-2">
                          <p className="font-semibold text-[#6e11b0] text-lg">
                            {achievement.title}
                          </p>
                          {achievement.event && (
                            <p className="text-sm text-gray-500">
                              Event: {achievement.event}
                            </p>
                          )}
                          <p className="text-sm text-gray-500 mt-1">
                            Sport: {achievement.play.sport.sportName}
                          </p>
                        </div>

                        {/* Position & Description */}
                        <div className="md:col-span-2">
                          {achievement.position && (
                            <p className="font-medium text-gray-700">
                              Position: {achievement.position}
                            </p>
                          )}
                          {achievement.description && (
                            <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                              {achievement.description}
                            </p>
                          )}
                        </div>

                        {/* Level & Year */}
                        <div className="md:col-span-1">
                          <span
                            className={`inline-block px-3 py-1 text-sm font-semibold rounded-full ${getLevelColor(
                              achievement.level
                            )}`}
                          >
                            {achievement.level}
                          </span>
                          <p className="text-sm text-gray-600 mt-2">
                            Year: {achievement.year}
                          </p>
                        </div>

                        {/* Date Added */}
                        <div className="md:col-span-1 md:text-right">
                          <p className="text-sm text-gray-600">
                            {formatDate(achievement.createdAt)}
                          </p>
                          <p className="text-xs text-gray-400 mt-1">
                            ID: {achievement.achievementId}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Report Achievement Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm overflow-y-auto h-full w-full z-50 flex items-center justify-center">
          <div className="relative bg-white rounded-lg shadow-xl max-w-lg w-full mx-4 md:mx-0">
            {/* Modal Header */}
            <div className="flex justify-between items-center border-b border-gray-200 px-6 py-4">
              <h3 className="text-lg font-medium text-gray-900">
                Report New Achievement
              </h3>
              <button
                onClick={handleCloseModal}
                className="text-gray-400 hover:text-gray-500"
                disabled={formSubmitting}
              >
                <FiX className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleSubmitAchievement} className="px-6 py-4">
              {/* Success Message */}
              {formSuccess && (
                <div className="mb-4 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded flex items-center">
                  <FiCheckCircle className="h-5 w-5 mr-2" />
                  Achievement added successfully!
                </div>
              )}

              {/* Error Message */}
              {formError && (
                <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                  {formError}
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Sport Selection - First choose a sport */}
                <div className="md:col-span-2">
                  <label
                    htmlFor="sport"
                    className="block text-sm font-medium text-[#1e0fbf]"
                  >
                    Sport*
                  </label>
                  <select
                    id="sport"
                    name="sport"
                    value={selectedSport || ""}
                    onChange={handleSportChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 text-gray-700 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    required
                    disabled={formSubmitting || loadingSports}
                  >
                    <option value="">Select a sport</option>
                    {loadingSports ? (
                      <option value="" disabled>Loading sports...</option>
                    ) : sports.length === 0 ? (
                      <option value="" disabled>No sports available</option>
                    ) : (
                      sports.map(sport => (
                        <option key={sport._id} value={sport._id}>
                          {sport.sportName}
                        </option>
                      ))
                    )}
                  </select>
                  {sports.length === 0 && !loadingSports && (
                    <p className="mt-1 text-sm text-red-600">
                      No sports available in the system. Please contact support.
                    </p>
                  )}
                </div>

                {/* Achievement Title */}
                <div className="md:col-span-2">
                  <label
                    htmlFor="title"
                    className="block text-sm font-medium text-[#1e0fbf]"
                  >
                    Achievement Title*
                  </label>
                  <input
                    type="text"
                    id="title"
                    name="title"
                    value={achievementForm.title}
                    onChange={handleInputChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 text-gray-700 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    required
                  />
                </div>

                {/* Level */}
                <div>
                  <label
                    htmlFor="level"
                    className="block text-sm font-medium text-[#1e0fbf]"
                  >
                    Level*
                  </label>
                  <select
                    id="level"
                    name="level"
                    value={achievementForm.level}
                    onChange={handleInputChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 text-gray-700 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    required
                  >
                    <option value="Zonal">Zonal</option>
                    <option value="District">District</option>
                    <option value="Provincial">Provincial</option>
                    <option value="National">National</option>
                    <option value="International">International</option>
                  </select>
                </div>

                {/* Year */}
                <div>
                  <label
                    htmlFor="year"
                    className="block text-sm font-medium text-[#1e0fbf]"
                  >
                    Year*
                  </label>
                  <input
                    type="number"
                    id="year"
                    name="year"
                    min="1900"
                    max={new Date().getFullYear()}
                    value={achievementForm.year}
                    onChange={handleInputChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 text-gray-700 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    required
                  />
                </div>

                {/* Position */}
                <div>
                  <label
                    htmlFor="position"
                    className="block text-sm font-medium text-[#1e0fbf]"
                  >
                    Position (e.g., 1st Place, Gold Medal)
                  </label>
                  <input
                    type="text"
                    id="position"
                    name="position"
                    value={achievementForm.position}
                    onChange={handleInputChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 text-gray-700 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>

                {/* Event */}
                <div>
                  <label
                    htmlFor="event"
                    className="block text-sm font-medium text-[#1e0fbf]"
                  >
                    Event Name
                  </label>
                  <input
                    type="text"
                    id="event"
                    name="event"
                    value={achievementForm.event}
                    onChange={handleInputChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 text-gray-700 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>

                {/* Description */}
                <div className="md:col-span-2">
                  <label
                    htmlFor="description"
                    className="block text-sm font-medium text-[#1e0fbf]"
                  >
                    Description
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    value={achievementForm.description}
                    onChange={handleInputChange}
                    rows={3}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 text-gray-700 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
              </div>

              {/* Modal Footer */}
              <div className="mt-6 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                  disabled={formSubmitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#1e0fbf] text-white text-sm font-medium rounded-md hover:bg-[#6e11b0] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#1e0fbf] transition duration-150 ease-in-out flex items-center"
                  disabled={formSubmitting || !achievementForm.play}
                >
                  {formSubmitting ? (
                    <>
                      <FiLoader className="animate-spin mr-2" />
                      Submitting...
                    </>
                  ) : (
                    "Submit Achievement"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Achievements;
