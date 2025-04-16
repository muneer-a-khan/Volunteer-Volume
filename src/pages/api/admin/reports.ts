import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]';
import prisma from '@/lib/prisma';
import { startOfMonth, subMonths, startOfQuarter, subQuarters, startOfYear, subYears, endOfMonth, endOfQuarter, endOfYear } from 'date-fns';

// Helper function to check if user is admin
async function isAdmin(session: any) {
  if (!session?.user?.email) return false;
  
  const user = await prisma.users.findUnique({
    where: { email: session.user.email },
  });
  
  return user?.role === 'ADMIN';
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Check for proper request method
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    // Get session and verify admin
    const session = await getServerSession(req, res, authOptions);
    
    if (!session) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    
    if (!await isAdmin(session)) {
      return res.status(403).json({ message: 'Forbidden: Admin access required' });
    }

    // Get report type and timeframe from query params
    const reportType = req.query.type as string || 'volunteer-hours';
    const timeFrame = req.query.timeframe as string || 'month';
    
    const now = new Date();
    let startDate, endDate, prevStartDate, prevEndDate, labels;
    
    // Set time ranges based on timeframe
    if (timeFrame === 'month') {
      startDate = startOfMonth(now);
      endDate = now;
      prevStartDate = startOfMonth(subMonths(now, 1));
      prevEndDate = startDate;
      labels = ['Week 1', 'Week 2', 'Week 3', 'Week 4'];
    } else if (timeFrame === 'quarter') {
      startDate = startOfQuarter(now);
      endDate = now;
      prevStartDate = startOfQuarter(subQuarters(now, 1));
      prevEndDate = startDate;
      
      // Create month labels for the quarter
      const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 
                         'July', 'August', 'September', 'October', 'November', 'December'];
      const currentQuarterMonths = [];
      const startMonth = startDate.getMonth();
      
      for (let i = 0; i < 3; i++) {
        const monthIndex = (startMonth + i) % 12;
        currentQuarterMonths.push(monthNames[monthIndex]);
      }
      
      labels = currentQuarterMonths;
    } else if (timeFrame === 'year') {
      startDate = startOfYear(now);
      endDate = now;
      prevStartDate = startOfYear(subYears(now, 1));
      prevEndDate = startDate;
      labels = ['Q1', 'Q2', 'Q3', 'Q4'];
    }
    
    let reportData: any = {};
    
    // Generate report data based on type
    if (reportType === 'volunteer-hours') {
      // Get volunteer hours for the current period
      const currentHoursLogs = await prisma.volunteer_logs.findMany({
        where: {
          date: {
            gte: startDate,
            lte: endDate
          },
          approved: true
        }
      });
      
      // Get volunteer hours for the previous period
      const prevHoursLogs = await prisma.volunteer_logs.findMany({
        where: {
          date: {
            gte: prevStartDate,
            lte: prevEndDate
          },
          approved: true
        }
      });
      
      // Calculate total hours for current period
      const currentTotalHours = currentHoursLogs.reduce((total, log) => 
        total + log.hours + (log.minutes || 0) / 60, 0);
      
      // Calculate total hours for previous period
      const prevTotalHours = prevHoursLogs.reduce((total, log) => 
        total + log.hours + (log.minutes || 0) / 60, 0);
      
      // Calculate percentage change
      const percentChange = prevTotalHours ? 
        ((currentTotalHours - prevTotalHours) / prevTotalHours) * 100 : 0;
      
      // Generate data for chart
      let data;
      if (timeFrame === 'month') {
        // Divide the month into weeks
        data = [0, 0, 0, 0]; // 4 weeks
        
        currentHoursLogs.forEach(log => {
          const day = new Date(log.date).getDate();
          const weekIndex = Math.min(3, Math.floor(day / 7));
          data[weekIndex] += log.hours + (log.minutes || 0) / 60;
        });
      } else if (timeFrame === 'quarter') {
        // Divide by months in the quarter
        data = [0, 0, 0]; // 3 months
        
        currentHoursLogs.forEach(log => {
          const month = new Date(log.date).getMonth();
          const startMonth = startDate.getMonth();
          let monthIndex = month - startMonth;
          if (monthIndex < 0) monthIndex += 12;
          if (monthIndex < 3) {
            data[monthIndex] += log.hours + (log.minutes || 0) / 60;
          }
        });
      } else if (timeFrame === 'year') {
        // Divide by quarters
        data = [0, 0, 0, 0]; // 4 quarters
        
        currentHoursLogs.forEach(log => {
          const month = new Date(log.date).getMonth();
          const quarterIndex = Math.floor(month / 3);
          data[quarterIndex] += log.hours + (log.minutes || 0) / 60;
        });
      }
      
      reportData = {
        labels,
        datasets: [
          {
            label: 'Hours Logged',
            data,
            backgroundColor: 'rgba(79, 70, 229, 0.6)',
          },
        ],
        stats: {
          total: currentTotalHours.toFixed(1),
          percentChange: percentChange.toFixed(1)
        }
      };
    } else if (reportType === 'volunteer-distribution') {
      // Get groups for distribution
      const groups = await prisma.groups.findMany({
        where: {
          active: true
        }
      });
      
      // Get volunteer logs for the current period by group
      const currentLogs = await prisma.volunteer_logs.findMany({
        where: {
          date: {
            gte: startDate,
            lte: endDate
          },
          approved: true
        },
        include: {
          groups: true
        }
      });
      
      const groupData: Record<string, number> = {};
      let otherHours = 0;
      
      // Get top 4 groups by hours
      groups.forEach(group => {
        groupData[group.name || 'Unnamed Group'] = 0;
      });
      
      // Add hours to groups
      currentLogs.forEach(log => {
        if (log.groups) {
          groupData[log.groups.name || 'Unnamed Group'] = 
            (groupData[log.groups.name || 'Unnamed Group'] || 0) + log.hours + (log.minutes || 0) / 60;
        } else {
          otherHours += log.hours + (log.minutes || 0) / 60;
        }
      });
      
      // Sort groups by hours
      const sortedGroups = Object.entries(groupData)
        .sort(([, hoursA], [, hoursB]) => (hoursB as number) - (hoursA as number));
      
      // Take top 4 groups, combine the rest as "Other"
      const topGroups = sortedGroups.slice(0, 4);
      const otherGroups = sortedGroups.slice(4);
      
      if (otherGroups.length > 0 || otherHours > 0) {
        const additionalOtherHours = otherGroups.reduce((sum, [, hours]) => sum + (hours as number), 0);
        topGroups.push(['Other', otherHours + additionalOtherHours]);
      }
      
      // Generate chart data
      const labels = topGroups.map(([name]) => name);
      const data = topGroups.map(([, hours]) => hours);
      
      // Get total hours for distribution
      const totalHours = data.reduce((sum, hours) => sum + (hours as number), 0);
      
      // Get logs for previous period to calculate change
      const prevLogs = await prisma.volunteer_logs.findMany({
        where: {
          date: {
            gte: prevStartDate,
            lte: prevEndDate
          },
          approved: true
        }
      });
      
      const prevTotalHours = prevLogs.reduce((total, log) => 
        total + log.hours + (log.minutes || 0) / 60, 0);
      
      // Calculate percentage change
      const percentChange = prevTotalHours ? 
        ((totalHours - prevTotalHours) / prevTotalHours) * 100 : 0;
      
      reportData = {
        labels,
        datasets: [
          {
            label: 'Volunteer Distribution',
            data,
            backgroundColor: [
              'rgba(255, 99, 132, 0.6)',
              'rgba(54, 162, 235, 0.6)',
              'rgba(255, 206, 86, 0.6)',
              'rgba(75, 192, 192, 0.6)',
              'rgba(153, 102, 255, 0.6)',
            ],
            borderColor: [
              'rgba(255, 99, 132, 1)',
              'rgba(54, 162, 235, 1)',
              'rgba(255, 206, 86, 1)',
              'rgba(75, 192, 192, 1)',
              'rgba(153, 102, 255, 1)',
            ],
            borderWidth: 1,
          },
        ],
        stats: {
          total: totalHours.toFixed(1),
          percentChange: percentChange.toFixed(1)
        }
      };
    }
    
    // Get additional stats for the dashboard
    // Total volunteers
    const totalVolunteers = await prisma.users.count({
      where: {
        role: 'VOLUNTEER'
      }
    });
    
    // Previous month volunteer count
    const prevMonthVolunteers = await prisma.users.count({
      where: {
        role: 'VOLUNTEER',
        created_at: {
          lt: startOfMonth(now)
        }
      }
    });
    
    const volunteersPercentChange = prevMonthVolunteers ? 
      ((totalVolunteers - prevMonthVolunteers) / prevMonthVolunteers) * 100 : 0;
    
    // Get active shifts
    const activeShifts = await prisma.shifts.count({
      where: {
        start_time: {
          gte: now
        }
      }
    });
    
    // Get previous month active shifts count
    const prevMonthActiveShifts = await prisma.shifts.count({
      where: {
        start_time: {
          gte: startOfMonth(subMonths(now, 1)),
          lt: startOfMonth(now)
        }
      }
    });
    
    const shiftsPercentChange = prevMonthActiveShifts ? 
      ((activeShifts - prevMonthActiveShifts) / prevMonthActiveShifts) * 100 : 0;
    
    // Return report data with additional stats
    return res.status(200).json({
      reportData,
      stats: {
        volunteers: {
          total: totalVolunteers,
          percentChange: volunteersPercentChange.toFixed(1)
        },
        hours: {
          total: reportData.stats?.total || 0,
          percentChange: reportData.stats?.percentChange || 0
        },
        shifts: {
          total: activeShifts,
          percentChange: shiftsPercentChange.toFixed(1)
        }
      }
    });
    
  } catch (error) {
    console.error('Error generating report data:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
} 