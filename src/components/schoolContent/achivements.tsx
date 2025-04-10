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

// Define a type for the action trigger prop (Optional, kept for potential future use or if needed by parent)
type ActionTrigger = {
  tab: string;
  action: string;
} | null;

// Define props for Achievements component (Optional, kept for potential future use)
interface AchievementsProps {
  actionTrigger?: ActionTrigger;
  clearActionTrigger?: () => void;
}

// Combine state and logic from both branches, prioritizing the data fetching and form handling
const Achievements: React.FC<AchievementsProps> = ({ actionTrigger, clearActionTrigger }) => {
  // State from incoming change (data fetching, form handling)
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [plays, setPlays] = useState<Play[]>([]);
  const [sports, setSports] = useState<Sport[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedSport, setSelectedSport] = useState<string | null>(null);
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
  const [loadingSports, setLoadingSports] = useState(true);

  // Effect to watch for the action trigger (from HEAD)
  useEffect(() => {
    if (
      actionTrigger?.tab === "achievements" &&
      actionTrigger?.action === "openModal"
    ) {
      handleReportAchievement(); // Open the modal using the handler below
      clearActionTrigger?.(); // Clear the trigger
    }
  }, [actionTrigger, clearActionTrigger]); // Dependencies for the effect

  // Fetch all sports from the system (from incoming change)
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

  // Fetch school info, plays, and achievements (from incoming change)
  useEffect(() => {
    const fetchSchoolInfo = async () => {
      try {
        const response = await axios.get("/api/auth/school/me");
        if (!response.data?.school?.id) {
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

    const fetchPlays = async (schoolId: string) => {
      try {
        const response = await axios.get(`/api/play?school=${schoolId}`);
        if (response.data?.plays) {
          setPlays(response.data.plays);
          // Set default play for the form if plays exist
          if (response.data.plays.length > 0 && !achievementForm.play) {
             setAchievementForm(prev => ({ ...prev, play: response.data.plays[0]._id }));
          }
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

    const fetchAchievements = async (fetchedPlays: Play[]) => {
      if (!fetchedPlays || fetchedPlays.length === 0) {
        setLoading(false);
        return;
      }
      try {
        const promises = fetchedPlays.map((play) =>
          axios.get(`/api/achievement?play=${play._id}`)
        );
        const results = await Promise.all(promises);
        const allAchievements: Achievement[] = [];
        results.forEach((result) => {
          if (result.data?.achievements) {
            allAchievements.push(...result.data.achievements);
          }
        });
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

    const loadData = async () => {
      setLoading(true);
      const schoolId = await fetchSchoolInfo();
      if (schoolId) {
        const schoolPlays = await fetchPlays(schoolId);
        await fetchAchievements(schoolPlays); // Ensure achievements are fetched after plays
      } else {
         setLoading(false); // Ensure loading stops if schoolId is not found
      }
    };

    loadData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Run once on mount

  // Create a new play for the school (from incoming change)
  const createPlayForSchool = async (sportId: string) => {
    try {
      const schoolResponse = await axios.get("/api/auth/school/me");
      if (!schoolResponse.data?.school?.id) {
        throw new Error("Failed to get school ID");
      }
      const schoolId = schoolResponse.data.school.id;
      const playResponse = await axios.post("/api/play", {
        school: schoolId,
        sport: sportId,
        active: true
      });
      return playResponse.data;
    } catch (err) {
      console.error("Error creating play:", err);
      throw err;
    }
  };

  // Modal handlers (using the more detailed versions from incoming change)
  const handleReportAchievement = () => {
    setFormSuccess(false);
    setFormError(null);
    // Reset form but keep default year and level
    setAchievementForm(prev => ({
        title: "",
        level: "Zonal",
        year: new Date().getFullYear(),
        position: "",
        event: "",
        description: "",
        play: plays.length > 0 ? plays[0]._id : "", // Default to first play if available
    }));
    setSelectedSport(null); // Reset selected sport
    // If plays exist, try to find the sport for the default play
    if (plays.length > 0 && plays[0].sport?._id) {
        setSelectedSport(plays[0].sport._id);
    }

    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedSport(null);
    // Reset form state completely on close
    setAchievementForm({
      title: "",
      level: "Zonal",
      year: new Date().getFullYear(),
      position: "",
      event: "",
      description: "",
      play: plays.length > 0 ? plays[0]._id : "", // Reset to default play if available
    });
    setFormSuccess(false); // Ensure success message is cleared
    setFormError(null); // Ensure error message is cleared
  };

  // Input change handler (from incoming change)
  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    // Handle year specifically to ensure it's a number
    if (name === 'year') {
        setAchievementForm((prev) => ({ ...prev, [name]: parseInt(value, 10) || new Date().getFullYear() }));
    } else {
        setAchievementForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  // Handle sport selection (from incoming change)
  const handleSportChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const sportId = e.target.value;
    if (!sportId) {
        setSelectedSport(null);
        setAchievementForm(prev => ({ ...prev, play: "" })); // Clear play if no sport selected
        return;
    }

    setSelectedSport(sportId);

    const existingPlay = plays.find(play => play.sport._id === sportId);
    if (existingPlay) {
      setAchievementForm(prev => ({ ...prev, play: existingPlay._id }));
    } else {
      // If no existing play, create one
      try {
        setFormSubmitting(true); // Indicate loading while creating play
        setFormError(null); // Clear previous errors
        const newPlay = await createPlayForSchool(sportId);
        if (newPlay && newPlay._id) {
            // Add the new play to the state
            setPlays(prev => [...prev, newPlay]);
            // Set the new play in the form
            setAchievementForm(prev => ({ ...prev, play: newPlay._id }));
        } else {
            throw new Error("Failed to create play or received invalid response.");
        }
      } catch (err) {
        console.error("Error during play creation or selection:", err);
        setFormError("Failed to set up sport for school. Please try selecting again or contact support.");
        setSelectedSport(null); // Reset selection on error
        setAchievementForm(prev => ({ ...prev, play: "" })); // Clear play on error
      } finally {
        setFormSubmitting(false); // Stop loading indicator
      }
    }
  };

  // Form submission handler (from incoming change)
  const handleSubmitAchievement = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();
    // Ensure a play is selected before submitting
    if (!achievementForm.play) {
        setFormError("Please select a sport first.");
        return;
    }

    setFormSubmitting(true);
    setFormError(null);
    setFormSuccess(false);

    try {
      const response = await axios.post("/api/achievement", achievementForm);

      // Add the new achievement to state, ensuring it includes nested data if needed
      // Assuming response.data is the full Achievement object including the populated play
      const newAchievement = response.data;
      // Find the corresponding play object to ensure nested data is present for display
      const playDetails = plays.find(p => p._id === newAchievement.play) || newAchievement.play; // Use fetched play or fallback
      setAchievements((prev) => [{ ...newAchievement, play: playDetails }, ...prev]);


      setFormSuccess(true);

      setTimeout(() => {
        handleCloseModal();
      }, 2000);
    } catch (err: any) {
      console.error("Error submitting achievement:", err);
      setFormError(
        err.response?.data?.error || "Failed to submit achievement. Please check the details and try again."
      );
    } finally {
      setFormSubmitting(false);
    }
  };

  // Format date (from incoming change)
  const formatDate = (dateString: string): string => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  // Get level color (from incoming change)
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

  // JSX structure (primarily from incoming change, ensuring consistency)
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
                      <div className="grid grid-cols-1 md:grid-cols-6 gap-4 items-start"> {/* Use items-start for alignment */}
                        {/* Achievement Title & Event */}
                        <div className="md:col-span-2">
                          <p className="font-semibold text-[#6e11b0] text-lg break-words"> {/* Added break-words */}
                            {achievement.title}
                          </p>
                          {achievement.event && (
                            <p className="text-sm text-gray-500 mt-1">
                              Event: {achievement.event}
                            </p>
                          )}
                           {/* Ensure play and sport data is available before accessing */}
                          <p className="text-sm text-gray-500 mt-1">
                            Sport: {achievement.play?.sport?.sportName || 'N/A'}
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
                            <p className="text-sm text-gray-600 mt-1 line-clamp-2 break-words"> {/* Added break-words */}
                              {achievement.description}
                            </p>
                          )}
                        </div>

                        {/* Level & Year */}
                        <div className="md:col-span-1">
                          <span
                            className={`inline-block px-3 py-1 text-xs sm:text-sm font-semibold rounded-full ${getLevelColor(
                              achievement.level
                            )}`}
                          >
                            {achievement.level}
                          </span>
                          <p className="text-sm text-gray-600 mt-2">
                            Year: {achievement.year}
                          </p>
                        </div>

                        {/* Date Added & ID */}
                        <div className="md:col-span-1 md:text-right">
                          <p className="text-sm text-gray-600">
                            {formatDate(achievement.createdAt)}
                          </p>
                          {achievement.achievementId && (
                             <p className="text-xs text-gray-400 mt-1 break-all"> {/* Added break-all */}
                                ID: {achievement.achievementId}
                             </p>
                          )}
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
        <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4"> {/* Added padding */}
          <div className="relative bg-white rounded-lg shadow-xl max-w-lg w-full mx-auto"> {/* Use mx-auto */}
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
            <form onSubmit={handleSubmitAchievement} className="px-6 py-4 max-h-[70vh] overflow-y-auto"> {/* Added max-height and overflow */}
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
                 {/* Sport Selection */}
                <div className="md:col-span-2">
                  <label
                    htmlFor="sport"
                    className="block text-sm font-medium text-[#1e0fbf]"
                  >
                    Sport* {loadingSports ? <FiLoader className="inline animate-spin ml-1" /> : ''}
                  </label>
                  <select
                    id="sport"
                    name="sport"
                    value={selectedSport || ""}
                    onChange={handleSportChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 text-gray-700 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 disabled:bg-gray-100"
                    required
                    // Disable while submitting the main form OR while creating a play OR while loading sports
                    disabled={formSubmitting || loadingSports}
                  >
                    <option value="">Select a sport</option>
                    {loadingSports ? (
                      <option value="" disabled>Loading sports...</option>
                    ) : sports.length === 0 ? (
                      <option value="" disabled>No sports available</option>
                    ) : (
                      // Sort sports alphabetically for better UX
                      [...sports].sort((a, b) => a.sportName.localeCompare(b.sportName)).map(sport => (
                        <option key={sport._id} value={sport._id}>
                          {sport.sportName}
                        </option>
                      ))
                    )}
                  </select>
                  {sports.length === 0 && !loadingSports && (
                    <p className="mt-1 text-sm text-red-600">
                      No sports found. Please contact an administrator to add sports.
                    </p>
                  )}
                   {/* Indicate if a play is being created */}
                   {formSubmitting && selectedSport && !plays.find(p => p.sport._id === selectedSport) && (
                       <p className="mt-1 text-sm text-orange-600 flex items-center">
                           <FiLoader className="animate-spin mr-1" /> Setting up sport for school...
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
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 text-gray-700 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 disabled:bg-gray-100"
                    required
                    disabled={formSubmitting || !achievementForm.play} // Disable if no play selected or submitting
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
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 text-gray-700 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 disabled:bg-gray-100"
                    required
                    disabled={formSubmitting || !achievementForm.play}
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
                    max={new Date().getFullYear()} // Ensure max year is current
                    step="1" // Ensure whole numbers
                    value={achievementForm.year}
                    onChange={handleInputChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 text-gray-700 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 disabled:bg-gray-100"
                    required
                    disabled={formSubmitting || !achievementForm.play}
                  />
                </div>

                {/* Position */}
                <div>
                  <label
                    htmlFor="position"
                    className="block text-sm font-medium text-[#1e0fbf]"
                  >
                    Position (e.g., 1st Place)
                  </label>
                  <input
                    type="text"
                    id="position"
                    name="position"
                    value={achievementForm.position}
                    onChange={handleInputChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 text-gray-700 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 disabled:bg-gray-100"
                    disabled={formSubmitting || !achievementForm.play}
                  />
                </div>

                {/* Event */}
                <div>
                  <label
                    htmlFor="event"
                    className="block text-sm font-medium text-[#1e0fbf]"
                  >
                    Event Name (e.g., 100m Sprint)
                  </label>
                  <input
                    type="text"
                    id="event"
                    name="event"
                    value={achievementForm.event}
                    onChange={handleInputChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 text-gray-700 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 disabled:bg-gray-100"
                    disabled={formSubmitting || !achievementForm.play}
                  />
                </div>

                {/* Description */}
                <div className="md:col-span-2">
                  <label
                    htmlFor="description"
                    className="block text-sm font-medium text-[#1e0fbf]"
                  >
                    Description (Optional)
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    value={achievementForm.description}
                    onChange={handleInputChange}
                    rows={3}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 text-gray-700 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 disabled:bg-gray-100"
                    disabled={formSubmitting || !achievementForm.play}
                  />
                </div>
              </div>

              {/* Modal Footer */}
              <div className="mt-6 pt-4 border-t border-gray-200 flex justify-end space-x-3"> {/* Added top border */}
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                  disabled={formSubmitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#1e0fbf] text-white text-sm font-medium rounded-md hover:bg-[#6e11b0] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#1e0fbf] transition duration-150 ease-in-out flex items-center disabled:bg-indigo-300 disabled:cursor-not-allowed"
                  // Disable if submitting OR if no play is selected/available
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
