import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { ensureConnection } from '@/utils/connectionManager';
import mongoose from 'mongoose';
import Achievement from '@/model/achievementSchema';
import Play from '@/model/playSchema';
import School from '@/model/schoolSchema';
import Donor from '@/model/donorSchema';

// Initialize the Gemini API with your API key
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export async function POST(request: NextRequest) {
  try {
    // Ensure database connection
    const connectionError = await ensureConnection();
    if (connectionError) return connectionError;

    const { donorData, schools } = await request.json();
    
    if (!donorData || !schools || !Array.isArray(schools)) {
      return NextResponse.json(
        { error: 'Invalid request data' },
        { status: 400 }
      );
    }
    
    // If no schools to analyze, return early
    if (schools.length === 0) {
      return NextResponse.json({ 
        analysis: "No schools available for analysis.",
        scoredSchools: [] 
      });
    }
    
    // Enrich donor data with additional information if we have an ID
    let enrichedDonorData = { ...donorData };
    
    if (donorData.id) {
      try {
        const donor = await Donor.findById(donorData.id);
        if (donor) {
          // Get donation history
          const donationCount = await countDonorDonations(donorData.id);
          enrichedDonorData.donationHistory = {
            count: donationCount
          };
        }
      } catch (err) {
        console.error("Error enriching donor data:", err);
      }
    }
    
    // Enrich schools with additional data
    const enrichedSchools = await Promise.all(schools.map(async (school) => {
      try {
        // Fetch actual school data if just ID was provided
        let enrichedSchool = { ...school };
        
        if (typeof school.id === 'string' && !school.achievements) {
          const schoolObj = await School.findOne({ 
            $or: [{ _id: school.id }, { schoolId: school.id }] 
          });
          
          if (schoolObj) {
            // Add school location if not provided
            if (!school.district || !school.province) {
              enrichedSchool.district = schoolObj.location.district;
              enrichedSchool.province = schoolObj.location.province;
            }
            
            // Find plays for this school
            const plays = await Play.find({ school: schoolObj._id })
              .populate('sport', 'sportName')
              .limit(5);
              
            if (plays.length > 0) {
              // Add sports info
              enrichedSchool.sports = plays.map(p => p.sport.sportName)
                .filter((v, i, a) => a.indexOf(v) === i);
              
              // Find achievements for these plays
              const playIds = plays.map(p => p._id);
              const achievements = await Achievement.find({ 
                play: { $in: playIds } 
              })
              .sort({ year: -1 })
              .limit(5);
              
              if (achievements.length > 0) {
                enrichedSchool.achievements = achievements.map(a => a.title);
              }
            }
          }
        }
        
        return enrichedSchool;
      } catch (err) {
        console.error(`Error enriching school ${school.id}:`, err);
        return school;
      }
    }));
    
    // Calculate relevance scores 
    const scoredSchools = calculateRelevanceScores(enrichedSchools, enrichedDonorData);
    
    // Sort by relevance score
    scoredSchools.sort((a, b) => (b.relevanceScore || 0) - (a.relevanceScore || 0));
    
    // Generate analysis with Gemini
    let analysis = "";
    try {
      const model = genAI.getGenerativeModel({ model: "gemini-pro" });
      
      const donorInfo = formatDonorInfo(enrichedDonorData);
      const schoolsInfo = formatSchoolsInfo(scoredSchools.slice(0, 3));
      
      const prompt = `
        As a donation advisor for a sports program called GoalX, analyze these schools and provide a brief, personalized recommendation for the donor.
        
        DONOR INFORMATION:
        ${donorInfo}
        
        TOP SCHOOLS TO CONSIDER:
        ${schoolsInfo}
        
        Provide a 2-3 sentence personalized recommendation highlighting why these schools would be good matches for donations based on location, needs, and achievements. Be specific but concise, focusing on sports context. Make it sound natural and conversational.
      `;
      
      const result = await model.generateContent(prompt);
      const response = await result.response;
      analysis = response.text();
    } catch (error) {
      console.error("Gemini API error:", error);
      analysis = generateFallbackAnalysis(scoredSchools, enrichedDonorData);
    }
    
    return NextResponse.json({
      analysis,
      scoredSchools
    });
    
  } catch (error) {
    console.error('Error analyzing schools:', error);
    return NextResponse.json(
      { error: 'Failed to analyze schools' },
      { status: 500 }
    );
  }
}

// Count donations from a specific donor
async function countDonorDonations(donorId: string): Promise<number> {
  try {
    const Donation = mongoose.model('Donation');
    return await Donation.countDocuments({ donor: donorId, status: 'completed' });
  } catch (err) {
    console.error('Error counting donations:', err);
    return 0;
  }
}

// Format donor information for Gemini prompt
function formatDonorInfo(donorData: any): string {
  let info = `Donor type: ${donorData.donorType || 'Unknown'}`;
  
  if (donorData.location) {
    info += `\nLocation: ${donorData.location.district || 'Unknown district'}, ${donorData.location.province || 'Unknown province'}`;
  } else {
    info += '\nLocation: Unknown';
  }
  
  // Add donation history if available
  if (donorData.donationHistory) {
    info += `\nPrevious donations: ${donorData.donationHistory.count || 0}`;
  }
  
  return info;
}

// Format schools information for Gemini prompt
function formatSchoolsInfo(schools: any[]): string {
  return schools.map((s, i) => 
    `School ${i+1}: ${s.schoolName || s.name} in ${s.district || s.location?.district || 'Unknown district'}, ${s.province || s.location?.province || 'Unknown province'}. 
     Needs: ${s.description || 'General sports equipment and support'}.
     Sports: ${s.sports ? s.sports.join(', ') : 'Various sports programs'}.
     Achievements: ${Array.isArray(s.achievements) && s.achievements.length > 0 
      ? s.achievements.join(', ') 
      : 'No achievements provided'}
     Relevance score: ${s.relevanceScore || 0}%
     ${s.needType === 'MONETARY' && s.targetAmount
      ? `Funding target: LKR ${s.targetAmount.toLocaleString()}`
      : ''}
     ${s.needType === 'EQUIPMENT' && s.itemsNeeded && s.itemsNeeded.length > 0
      ? `Equipment needed: ${s.itemsNeeded.join(', ')}`
      : ''}`
  ).join('\n\n');
}

// Calculate relevance scores for schools based on donor info
function calculateRelevanceScores(schools: any[], donorData: any): any[] {
  return schools.map(school => {
    let baseScore = 70; // Start with a decent base score
    let distanceScore = 0;
    let distance = 0;
    
    // Get standardized location properties
    const schoolDistrict = school.district || school.location?.district;
    const schoolProvince = school.province || school.location?.province;
    
    // Calculate proximity score if location data is available
    if (donorData.location && donorData.location.district && schoolDistrict) {
      if (donorData.location.district === schoolDistrict) {
        distanceScore += 20; // Same district is a strong match
        distance = Math.random() * 5 + 1; // 1-6 km if same district
      } else if (donorData.location.province === schoolProvince) {
        distanceScore += 10; // Same province still good
        distance = Math.random() * 15 + 10; // 10-25 km if same province
      } else {
        distance = Math.random() * 50 + 25; // 25-75 km if different province
      }
    } else {
      // Random distance as placeholder
      distance = Math.random() * 50 + 5;
    }
    
    // Adjust score based on achievements
    const achievementScore = Math.min(10, (Array.isArray(school.achievements) ? school.achievements.length : 0) * 2);
    
    // Check if need types match donor types
    let needMatchScore = 0;
    if (donorData.donorType === 'COMPANY' && school.needType === 'EQUIPMENT') {
      needMatchScore += 10; // Companies often provide equipment
    } else if (donorData.donorType === 'INDIVIDUAL' && school.needType === 'MONETARY') {
      needMatchScore += 5; // Individuals often provide monetary support
    }
    
    // Consider urgency level
    const urgencyScore = 
      school.urgencyLevel === 'HIGH' ? 10 :
      school.urgencyLevel === 'MEDIUM' ? 5 : 0;
    
    // Calculate final score (cap at 100)
    const relevanceScore = Math.min(100, Math.round(
      baseScore + distanceScore + achievementScore + needMatchScore + urgencyScore
    ));
    
    return {
      ...school,
      relevanceScore,
      distance
    };
  });
}

// Generate fallback analysis when Gemini API fails
function generateFallbackAnalysis(scoredSchools: any[], donorData: any): string {
  if (scoredSchools.length === 0) return "We couldn't find any schools matching your profile at this time.";
  
  const topSchool = scoredSchools[0];
  const schoolName = topSchool.schoolName || topSchool.name;
  const district = topSchool.district || topSchool.location?.district || "the area";
  
  let analysis = `Based on your profile, ${schoolName} in ${district} appears to be an excellent match for your donation.`;
  
  if (Array.isArray(topSchool.achievements) && topSchool.achievements.length > 0) {
    analysis += ` They have notable achievements including ${topSchool.achievements[0]}.`;
  }
  
  if (topSchool.needType === 'MONETARY') {
    analysis += ` They're seeking financial support for their sports programs.`;
  } else if (topSchool.needType === 'EQUIPMENT') {
    analysis += ` They need sports equipment to support their athletics programs.`;
  }
  
  if (scoredSchools.length > 1) {
    analysis += ` We've also identified ${scoredSchools.length - 1} other schools that would benefit from your support.`;
  }
  
  return analysis;
}