import { NextRequest, NextResponse } from 'next/server';
import { ensureConnection } from '@/utils/connectionManager';
import School from '@/model/schoolSchema';
import Achievement from '@/model/achievementSchema';
import Play from '@/model/playSchema';
import Sport from '@/model/sportSchema';
import Donation from '@/model/donationSchema';
import EquipmentRequest from '@/model/equipmentRequestSchema';
import mongoose from 'mongoose';

export async function GET(request: NextRequest) {
  try {
    // Ensure database connection
    const connectionError = await ensureConnection();
    if (connectionError) return connectionError;

    const { searchParams } = new URL(request.url);
    const district = searchParams.get('district');
    const province = searchParams.get('province');
    const sportId = searchParams.get('sport');
    const urgency = searchParams.get('urgency');
    const limit = parseInt(searchParams.get('limit') || '10');

    // Build query for schools
    const schoolQuery: any = {};
    if (district) schoolQuery['location.district'] = district;
    if (province) schoolQuery['location.province'] = province;
    
    // Find active schools with verified status
    schoolQuery.verified = true;
    
    // Get schools with basic info
    const schools = await School.find(schoolQuery)
      .select('name schoolId location sid verified')
      .limit(20);

    // Prepare our result array
    const schoolNeeds = [];
    
    // For each school, collect related data in parallel
    const schoolPromises = schools.map(async (school) => {
      try {
        // Find plays (sport participation) for this school
        const playsQuery: any = { school: school._id };
        if (sportId) playsQuery.sport = sportId;
        
        const plays = await Play.find(playsQuery)
          .populate('sport', 'sportName sportId')
          .limit(5);
        
        if (plays.length === 0) return null; // Skip schools with no sports activities
        
        // Get achievements for these plays
        const playIds = plays.map(p => p._id);
        const achievements = await Achievement.find({ 
          play: { $in: playIds } 
        })
        .sort({ year: -1 })
        .limit(5);
        
        // Get active equipment requests
        const equipmentRequests = await EquipmentRequest.find({
          school: school._id,
          status: { $in: ['pending', 'partial'] }
        })
        .populate('items.equipment', 'name')
        .sort({ createdAt: -1 })
        .limit(3);
        
        // Get recent donations to determine needs
        const recentDonations = await Donation.find({
          recipient: school._id,
          status: 'completed'
        })
        .sort({ completedAt: -1 })
        .limit(5);
        
        // Determine need type and priority based on collected data
        const needInfo = determineNeeds(plays, equipmentRequests, recentDonations);
        
        // Skip if urgency filter doesn't match
        if (urgency && needInfo.urgencyLevel !== urgency) return null;
        
        // Get a random image from Unsplash for the school based on sports
        const schoolSports = plays.map(p => p.sport.sportName).filter((v, i, a) => a.indexOf(v) === i);
        const sportForImage = schoolSports[0] || 'sports';
        
        return {
          id: school._id.toString(),
          schoolId: school.schoolId,
          schoolName: school.name,
          district: school.location.district,
          province: school.location.province,
          achievements: achievements.map(a => a.title),
          needType: needInfo.needType,
          description: needInfo.description,
          targetAmount: needInfo.targetAmount,
          itemsNeeded: needInfo.itemsNeeded,
          urgencyLevel: needInfo.urgencyLevel,
          sports: schoolSports,
          imageUrl: `https://source.unsplash.com/random/800x450/?${sportForImage.toLowerCase()},school`
        };
      } catch (err) {
        console.error(`Error processing school ${school.name}:`, err);
        return null; // Skip this school in case of error
      }
    });
    
    // Wait for all school data to be processed
    const schoolResults = await Promise.all(schoolPromises);
    
    // Filter out null results and limit to the requested count
    const validSchoolNeeds = schoolResults.filter(Boolean).slice(0, limit);

    return NextResponse.json({
      schools: validSchoolNeeds
    }, {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Error fetching school needs:', error);
    return NextResponse.json(
      { error: 'Failed to fetch school needs' },
      { status: 500 }
    );
  }
}

// Helper function to determine school needs based on all available data
function determineNeeds(plays: any[], equipmentRequests: any[], recentDonations: any[]) {
  // Get all sports from plays
  const sports = plays.map(p => p.sport?.sportName || 'Unknown sport').filter(Boolean);
  
  // Check if there are any monetary donations in the last 6 months
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
  
  const recentMonetaryDonations = recentDonations.filter(d => 
    d.donationType === 'MONETARY' && 
    new Date(d.completedAt || d.createdAt) > sixMonthsAgo
  );
  
  const recentEquipmentDonations = recentDonations.filter(d =>
    d.donationType === 'EQUIPMENT' &&
    new Date(d.completedAt || d.createdAt) > sixMonthsAgo
  );
  
  // Check if there are pending equipment requests
  const hasActiveEquipmentRequests = equipmentRequests.length > 0;
  
  // Determine need priority based on collected data
  let urgencyLevel: 'LOW' | 'MEDIUM' | 'HIGH' = 'MEDIUM';
  let needType: 'MONETARY' | 'EQUIPMENT' | 'OTHER' = 'MONETARY';
  let description = '';
  let targetAmount: number | undefined;
  let itemsNeeded: string[] | undefined;
  
  // If there are active equipment requests, they get priority
  if (hasActiveEquipmentRequests) {
    urgencyLevel = 'HIGH';
    needType = 'EQUIPMENT';
    
    // Extract equipment items needed from requests
    const requestedItems = new Set<string>();
    equipmentRequests.forEach(request => {
      request.items.forEach((item: any) => {
        if (item.equipment && item.equipment.name) {
          requestedItems.add(item.equipment.name);
        }
      });
    });
    
    description = `Equipment urgently needed for ${sports.join(', ')} programs. ${equipmentRequests.length} active equipment requests.`;
    itemsNeeded = Array.from(requestedItems);
  }
  // If no equipment requests but no monetary donations recently
  else if (recentMonetaryDonations.length === 0 && plays.length > 0) {
    urgencyLevel = 'HIGH';
    needType = 'MONETARY';
    description = `Financial support needed for ${sports.join(', ')} programs. No monetary donations received in the last 6 months.`;
    
    // Calculate target amount based on sports count and type
    targetAmount = 50000 + (sports.length * 20000);
  }
  // If no equipment donations recently
  else if (recentEquipmentDonations.length === 0 && plays.length > 0) {
    urgencyLevel = 'MEDIUM';
    needType = 'EQUIPMENT';
    description = `Equipment needed for ${sports.join(', ')} programs. No equipment donations received recently.`;
    
    // Generate items needed based on sports
    itemsNeeded = generateItemsNeededBySport(sports);
  }
  // Has had some recent donations of both types
  else {
    urgencyLevel = 'LOW';
    const randomNeedType = Math.random() > 0.5 ? 'MONETARY' : 'EQUIPMENT';
    needType = randomNeedType;
    
    if (randomNeedType === 'MONETARY') {
      description = `Additional funding would help enhance our ${sports.join(', ')} programs.`;
      targetAmount = 25000 + (sports.length * 10000);
    } else {
      description = `Additional equipment would help improve our ${sports.join(', ')} programs.`;
      itemsNeeded = generateItemsNeededBySport(sports);
    }
  }
  
  return {
    urgencyLevel,
    needType,
    description,
    targetAmount: needType === 'MONETARY' ? targetAmount : undefined,
    itemsNeeded: needType === 'EQUIPMENT' ? itemsNeeded : undefined
  };
}

// Helper function to generate needed items based on sports
function generateItemsNeededBySport(sports: string[]): string[] {
  const sportEquipment: Record<string, string[]> = {
    'Cricket': ['Cricket bats', 'Gloves', 'Helmets', 'Cricket balls', 'Wickets'],
    'Football': ['Footballs', 'Goal nets', 'Football boots', 'Training cones', 'Jerseys'],
    'Basketball': ['Basketballs', 'Basketball hoops', 'Basketball shoes', 'Scoreboards'],
    'Volleyball': ['Volleyballs', 'Volleyball nets', 'Knee pads', 'Referee stands'],
    'Athletics': ['Running shoes', 'Hurdles', 'Starting blocks', 'Javelins', 'Shot puts'],
    'Swimming': ['Swimwear', 'Goggles', 'Swim caps', 'Kickboards', 'Lane ropes'],
    'Badminton': ['Badminton rackets', 'Shuttlecocks', 'Nets', 'Court shoes'],
    'Table Tennis': ['Table tennis tables', 'Paddles', 'Balls', 'Nets'],
    'Rugby': ['Rugby balls', 'Rugby boots', 'Protective gear', 'Training equipment'],
    'Netball': ['Netballs', 'Netball hoops', 'Bibs', 'Court shoes']
  };
  
  // Get equipment for the sports played
  const neededItems: Set<string> = new Set();
  
  sports.forEach(sport => {
    const equipmentForSport = sportEquipment[sport] || sportEquipment['Athletics']; // Default to athletics
    
    // Add 1-3 random items for this sport
    const itemCount = Math.floor(Math.random() * 3) + 1;
    for (let i = 0; i < itemCount; i++) {
      if (equipmentForSport.length > 0) {
        const randomIndex = Math.floor(Math.random() * equipmentForSport.length);
        neededItems.add(equipmentForSport[randomIndex]);
      }
    }
  });
  
  return Array.from(neededItems);
}