const { PrismaClient } = require('@prisma/client');
const { v4: uuidv4 } = require('uuid');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient({
  log: ['warn', 'error'],
});

// Constants for data generation
const NUM_USERS = 30;
const NUM_ADMIN_USERS = 2;
const NUM_GROUP_ADMIN_USERS = 3;
const NUM_PENDING_USERS = 5;
const NUM_GROUPS = 5;
const NUM_SHIFTS_PER_GROUP = 10;
const NUM_PAST_SHIFTS_PER_GROUP = 5;
const NUM_VOLUNTEER_LOGS = 50;
const NUM_APPLICATIONS = 8;

// Helper functions
const getRandomItem = (array) => array[Math.floor(Math.random() * array.length)];
const getRandomItems = (array, count) => {
  const shuffled = [...array].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
};
const getRandomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const getRandomDate = (start, end) => {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
};
const getRandomFutureDate = (daysMin = 1, daysMax = 60) => {
  const now = new Date();
  const futureDate = new Date(now);
  futureDate.setDate(now.getDate() + getRandomInt(daysMin, daysMax));
  return futureDate;
};
const getRandomPastDate = (daysMin = 1, daysMax = 60) => {
  const now = new Date();
  const pastDate = new Date(now);
  pastDate.setDate(now.getDate() - getRandomInt(daysMin, daysMax));
  return pastDate;
};

// Sample data
const firstNames = ['John', 'Jane', 'Sarah', 'Michael', 'Emily', 'David', 'Olivia', 'Daniel', 'Sophia', 'William', 'Emma', 'James', 'Ava', 'Robert', 'Mia', 'Joseph', 'Charlotte', 'Thomas', 'Amelia', 'Charles'];
const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Miller', 'Davis', 'Garcia', 'Rodriguez', 'Wilson', 'Martinez', 'Anderson', 'Taylor', 'Thomas', 'Hernandez', 'Moore', 'Martin', 'Jackson', 'Thompson', 'White'];
const emailDomains = ['gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com', 'icloud.com'];
const phoneFormats = ['(XXX) XXX-XXXX', 'XXX-XXX-XXXX'];
const groupNames = ['Museum Volunteers', 'Community Helpers', 'Education Volunteers', 'Event Staff', 'Youth Mentors', 'Senior Companions', 'Environmental Stewards', 'Arts & Culture Team'];
const groupDescriptions = [
  'Our general volunteer team supporting all museum activities',
  'Volunteers focused on community outreach and assistance programs',
  'Supporting educational programs and workshops for local students',
  'Dedicated to assisting with special events and exhibitions',
  'Focused on mentoring and educational programs for youth',
  'Providing companionship and assistance to seniors in our community',
  'Working on environmental conservation and sustainability projects',
  'Supporting arts and cultural programming throughout the museum',
];
const locations = ['Main Gallery', 'Education Room', 'Exhibit Hall A', 'Exhibit Hall B', 'Community Room', 'Lobby', 'Children\'s Area', 'Garden', 'Auditorium', 'Workshop Space'];
const shiftTitles = [
  'Visitor Guide', 
  'Exhibition Helper', 
  'Front Desk Support', 
  'Event Assistant', 
  'Education Assistant', 
  'Workshop Helper',
  'Tour Guide',
  'Children\'s Program Assistant',
  'Gallery Monitor',
  'Special Exhibit Support',
  'Community Day Helper',
  'Membership Drive Support',
  'Fundraising Event Assistant',
  'Gift Shop Helper'
];
const shiftDescriptions = [
  'Help visitors navigate the museum and answer questions about exhibits',
  'Assist with the setup and monitoring of special exhibitions',
  'Provide support at the front desk, greeting visitors and answering calls',
  'Help with event setup, guest registration, and logistics during special events',
  'Assist educators with workshops and educational programming',
  'Support hands-on workshop activities for visitors of all ages',
  'Lead guided tours through museum galleries and special exhibitions',
  'Help with children\'s activities and programs in our dedicated space',
  'Monitor gallery spaces to ensure the safety of exhibits and visitors',
  'Provide specialized assistance for our featured exhibitions',
  'Support our community day events with various activities',
  'Help with our membership drive by providing information to visitors',
  'Assist with our fundraising events, including setup and guest services',
  'Provide support in our gift shop during busy periods'
];
const states = ['VA', 'MD', 'DC', 'NC', 'PA', 'WV', 'NY', 'FL', 'CA', 'TX'];
const cities = ['Charlottesville', 'Richmond', 'Arlington', 'Alexandria', 'Norfolk', 'Roanoke', 'Blacksburg', 'Harrisonburg', 'Fairfax', 'Vienna'];
const streets = ['Main St', 'Oak Ave', 'Maple Rd', 'Park Ave', 'Washington Blvd', 'Jefferson St', 'Highland Ave', 'University Ave', 'Market St', 'College Dr'];
const interests = ['Art History', 'Education', 'Child Development', 'Community Service', 'Events', 'Administration', 'Conservation', 'Technology', 'Marketing', 'Fundraising'];
const skills = ['Public Speaking', 'Customer Service', 'Teaching', 'Organization', 'Leadership', 'Computer Skills', 'Multilingual', 'Event Planning', 'Writing', 'Photography'];
const referralSources = ['Website', 'Friend', 'Social Media', 'Museum Visit', 'School', 'Volunteer Fair', 'Community Event', 'Email Newsletter', 'Local Newspaper', 'Radio'];
const volunteerPositions = ['Gallery Guide', 'Education Assistant', 'Special Events', 'Administrative Support', 'Exhibit Helper'];
const volunteerTypes = ['Regular', 'Occasional', 'One-time', 'Group', 'Corporate', 'Student', 'Senior', 'Family'];
const availableDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const availabilityOptions = ['Mornings', 'Afternoons', 'Evenings', 'Weekends', 'Flexible'];
const logDescriptions = [
  'Assisted with school group tour',
  'Helped at community event',
  'Front desk support',
  'Gallery monitoring',
  'Assisted with workshop',
  'Helped with special exhibition',
  'Supported fundraising event',
  'Administrative assistance',
  'Provided translation services',
  'Led tour group',
  'Helped with children\'s activities',
  'Assisted with event setup/cleanup'
];

// Function to generate a random phone number
const generatePhoneNumber = () => {
  const format = getRandomItem(phoneFormats);
  return format.replace(/X/g, () => Math.floor(Math.random() * 10).toString());
};

// Generate a random address
const generateAddress = () => {
  const streetNum = getRandomInt(100, 9999);
  const street = getRandomItem(streets);
  const city = getRandomItem(cities);
  const state = getRandomItem(states);
  const zipCode = getRandomInt(10000, 99999).toString();
  
  return {
    street: `${streetNum} ${street}`,
    city,
    state,
    zipCode
  };
};

// Main seed function
async function seed() {
  console.log('🌱 Starting database seeding...');
  console.time('Database seeded');

  try {
    // Clear existing data (optional - be careful in production!)
    console.log('Cleaning existing data...');
    await prisma.$transaction([
      prisma.volunteer_logs.deleteMany({}),
      prisma.check_ins.deleteMany({}),
      prisma.shift_volunteers.deleteMany({}),
      prisma.shifts.deleteMany({}),
      prisma.user_groups.deleteMany({}),
      prisma.group_admins.deleteMany({}),
      prisma.applications.deleteMany({}),
      prisma.profiles.deleteMany({}),
      prisma.sessions.deleteMany({}),
      prisma.accounts.deleteMany({}),
      prisma.users.deleteMany({}),
      prisma.groups.deleteMany({})
    ]);

    // Create users
    console.log('Creating users...');
    
    // Create a password hash for test users
    const passwordHash = await bcrypt.hash('password123', 10);
    
    const adminUsers = [];
    const groupAdminUsers = [];
    const regularUsers = [];
    const pendingUsers = [];
    
    // Create one test admin user with a known email
    const testAdmin = await prisma.users.create({
      data: {
        id: uuidv4(),
        name: 'Admin User',
        email: 'admin@example.com',
        password: passwordHash,
        role: 'ADMIN',
        phone: generatePhoneNumber(),
        image: `https://ui-avatars.com/api/?name=Admin+User&background=random`
      }
    });
    adminUsers.push(testAdmin);

    // Create one test regular user with a known email
    const testUser = await prisma.users.create({
      data: {
        id: uuidv4(),
        name: 'Test User',
        email: 'user@example.com',
        password: passwordHash,
        role: 'VOLUNTEER',
        phone: generatePhoneNumber(),
        image: `https://ui-avatars.com/api/?name=Test+User&background=random`
      }
    });
    regularUsers.push(testUser);
    
    // Create admin users
    for (let i = 0; i < NUM_ADMIN_USERS - 1; i++) {
      const firstName = getRandomItem(firstNames);
      const lastName = getRandomItem(lastNames);
      const email = `admin.${firstName.toLowerCase()}.${lastName.toLowerCase()}@${getRandomItem(emailDomains)}`;
      
      const user = await prisma.users.create({
        data: {
          id: uuidv4(),
          name: `${firstName} ${lastName}`,
          email,
          password: passwordHash,
          role: 'ADMIN',
          phone: generatePhoneNumber(),
          image: `https://ui-avatars.com/api/?name=${firstName}+${lastName}&background=random`
        }
      });
      
      adminUsers.push(user);
    }
    
    // Create group admin users
    for (let i = 0; i < NUM_GROUP_ADMIN_USERS; i++) {
      const firstName = getRandomItem(firstNames);
      const lastName = getRandomItem(lastNames);
      const email = `groupadmin.${firstName.toLowerCase()}.${lastName.toLowerCase()}@${getRandomItem(emailDomains)}`;
      
      const user = await prisma.users.create({
        data: {
          id: uuidv4(),
          name: `${firstName} ${lastName}`,
          email,
          password: passwordHash,
          role: 'GROUP_ADMIN',
          phone: generatePhoneNumber(),
          image: `https://ui-avatars.com/api/?name=${firstName}+${lastName}&background=random`
        }
      });
      
      groupAdminUsers.push(user);
    }
    
    // Create pending users
    for (let i = 0; i < NUM_PENDING_USERS; i++) {
      const firstName = getRandomItem(firstNames);
      const lastName = getRandomItem(lastNames);
      const email = `pending.${firstName.toLowerCase()}.${lastName.toLowerCase()}@${getRandomItem(emailDomains)}`;
      
      const user = await prisma.users.create({
        data: {
          id: uuidv4(),
          name: `${firstName} ${lastName}`,
          email,
          password: passwordHash,
          role: 'PENDING',
          phone: generatePhoneNumber(),
          image: `https://ui-avatars.com/api/?name=${firstName}+${lastName}&background=random`
        }
      });
      
      pendingUsers.push(user);
    }
    
    // Create regular volunteer users
    for (let i = 0; i < NUM_USERS - 2; i++) { // -2 because we created test users already
      const firstName = getRandomItem(firstNames);
      const lastName = getRandomItem(lastNames);
      const email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}@${getRandomItem(emailDomains)}`;
      
      const user = await prisma.users.create({
        data: {
          id: uuidv4(),
          name: `${firstName} ${lastName}`,
          email,
          password: passwordHash,
          role: 'VOLUNTEER',
          phone: generatePhoneNumber(),
          image: `https://ui-avatars.com/api/?name=${firstName}+${lastName}&background=random`
        }
      });
      
      regularUsers.push(user);
    }
    
    const allUsers = [...adminUsers, ...groupAdminUsers, ...regularUsers];
    
    // Create profiles for users
    console.log('Creating user profiles...');
    for (const user of allUsers) {
      const address = generateAddress();
      const birthdate = getRandomDate(new Date(1960, 0, 1), new Date(2005, 0, 1));
      
      await prisma.profiles.create({
        data: {
          id: uuidv4(),
          user_id: user.id,
          address: address.street,
          city: address.city,
          state: address.state,
          zip_code: address.zipCode,
          emergency_contact: `${getRandomItem(firstNames)} ${getRandomItem(lastNames)}`,
          emergency_phone: generatePhoneNumber(),
          birthdate,
          interests: getRandomItems(interests, getRandomInt(2, 5)).join(', '),
          skills: getRandomItems(skills, getRandomInt(2, 5)).join(', '),
          photo_url: user.image,
          notes: Math.random() > 0.7 ? `Notes for ${user.name}` : null
        }
      });
    }
    
    // Create groups
    console.log('Creating volunteer groups...');
    const groups = [];
    
    for (let i = 0; i < NUM_GROUPS; i++) {
      const groupName = i < groupNames.length ? groupNames[i] : `${getRandomItem(groupNames)} ${i + 1}`;
      const group = await prisma.groups.create({
        data: {
          id: uuidv4(),
          name: groupName,
          description: i < groupDescriptions.length ? groupDescriptions[i] : `A volunteer group for ${groupName}`,
          email: `${groupName.toLowerCase().replace(/\s+/g, '.')}@museum.org`,
          phone: generatePhoneNumber(),
          active: true
        }
      });
      
      groups.push(group);
      
      // Assign group admins
      if (groupAdminUsers.length > 0) {
        const adminForGroup = groupAdminUsers[i % groupAdminUsers.length];
        
        await prisma.group_admins.create({
          data: {
            group_id: group.id,
            user_id: adminForGroup.id
          }
        });
        
        // Also make them a member of the group
        await prisma.user_groups.create({
          data: {
            id: uuidv4(),
            user_id: adminForGroup.id,
            group_id: group.id,
            role: 'ADMIN',
            status: 'ACTIVE',
            joined_at: getRandomPastDate(10, 500)
          }
        });
      }
      
      // Assign some regular users to each group
      const numMembersForGroup = getRandomInt(5, 15);
      const membersForGroup = getRandomItems(regularUsers, numMembersForGroup);
      
      for (const member of membersForGroup) {
        await prisma.user_groups.create({
          data: {
            id: uuidv4(),
            user_id: member.id,
            group_id: group.id,
            role: 'MEMBER',
            status: 'ACTIVE',
            joined_at: getRandomPastDate(1, 365)
          }
        });
      }
    }
    
    // Create shifts for each group
    console.log('Creating shifts...');
    const allShifts = [];
    
    for (const group of groups) {
      // Create future shifts
      for (let i = 0; i < NUM_SHIFTS_PER_GROUP; i++) {
        const startTime = getRandomFutureDate(1, 60);
        const duration = getRandomInt(1, 4) * 60; // Duration in minutes (1-4 hours)
        const endTime = new Date(startTime.getTime() + duration * 60 * 1000);
        
        const shift = await prisma.shifts.create({
          data: {
            id: uuidv4(),
            title: getRandomItem(shiftTitles),
            description: getRandomItem(shiftDescriptions),
            start_time: startTime,
            end_time: endTime,
            location: getRandomItem(locations),
            capacity: getRandomInt(2, 8),
            status: 'OPEN',
            group_id: group.id
          }
        });
        
        allShifts.push(shift);
        
        // Add some volunteers to the shift
        const numVolunteers = getRandomInt(0, shift.capacity);
        const membersForGroup = await prisma.user_groups.findMany({
          where: { group_id: group.id, status: 'ACTIVE' },
          select: { user_id: true }
        });
        
        if (membersForGroup.length > 0) {
          const volunteersForShift = getRandomItems(
            membersForGroup.map(m => m.user_id), 
            Math.min(numVolunteers, membersForGroup.length)
          );
          
          for (const volunteerId of volunteersForShift) {
            await prisma.shift_volunteers.create({
              data: {
                shift_id: shift.id,
                user_id: volunteerId
              }
            });
          }
        }
      }
      
      // Create past shifts (some completed with logs)
      for (let i = 0; i < NUM_PAST_SHIFTS_PER_GROUP; i++) {
        const startTime = getRandomPastDate(1, 90);
        const duration = getRandomInt(1, 4) * 60; // Duration in minutes (1-4 hours)
        const endTime = new Date(startTime.getTime() + duration * 60 * 1000);
        
        const shift = await prisma.shifts.create({
          data: {
            id: uuidv4(),
            title: getRandomItem(shiftTitles),
            description: getRandomItem(shiftDescriptions),
            start_time: startTime,
            end_time: endTime,
            location: getRandomItem(locations),
            capacity: getRandomInt(2, 8),
            status: 'COMPLETED',
            group_id: group.id
          }
        });
        
        allShifts.push(shift);
        
        // Add some volunteers to the shift
        const numVolunteers = getRandomInt(1, shift.capacity);
        const membersForGroup = await prisma.user_groups.findMany({
          where: { group_id: group.id, status: 'ACTIVE' },
          select: { user_id: true }
        });
        
        if (membersForGroup.length > 0) {
          const volunteersForShift = getRandomItems(
            membersForGroup.map(m => m.user_id), 
            Math.min(numVolunteers, membersForGroup.length)
          );
          
          for (const volunteerId of volunteersForShift) {
            await prisma.shift_volunteers.create({
              data: {
                shift_id: shift.id,
                user_id: volunteerId
              }
            });
            
            // Create check-in record
            const checkInTime = new Date(startTime);
            const checkOutTime = new Date(endTime);
            
            await prisma.check_ins.create({
              data: {
                id: uuidv4(),
                user_id: volunteerId,
                shift_id: shift.id,
                check_in_time: checkInTime,
                check_out_time: checkOutTime,
                duration: Math.round((checkOutTime - checkInTime) / (1000 * 60)), // Duration in minutes
                notes: Math.random() > 0.7 ? 'Completed all assigned tasks' : null
              }
            });
          }
        }
      }
    }
    
    // Create volunteer logs
    console.log('Creating volunteer logs...');
    for (let i = 0; i < NUM_VOLUNTEER_LOGS; i++) {
      const user = getRandomItem(regularUsers);
      const group = getRandomItem(groups);
      const logDate = getRandomPastDate(1, 180);
      const hours = getRandomInt(1, 6);
      const minutes = getRandomInt(0, 59);
      const approved = Math.random() > 0.3;
      
      await prisma.volunteer_logs.create({
        data: {
          id: uuidv4(),
          user_id: user.id,
          group_id: group.id,
          hours,
          minutes,
          description: getRandomItem(logDescriptions),
          date: logDate,
          approved,
          approved_by: approved ? getRandomItem(adminUsers).id : null,
          approved_at: approved ? getRandomDate(logDate, new Date()) : null
        }
      });
    }
    
    // Create applications
    console.log('Creating volunteer applications...');
    
    // For pending users
    for (const user of pendingUsers) {
      const address = generateAddress();
      const birthdate = getRandomDate(new Date(1960, 0, 1), new Date(2005, 0, 1));
      
      await prisma.applications.create({
        data: {
          id: uuidv4(),
          name: user.name,
          email: user.email,
          phone: user.phone || generatePhoneNumber(),
          address: address.street,
          city: address.city,
          state: address.state,
          zip_code: address.zipCode,
          birthdate,
          volunteer_type: getRandomItem(volunteerTypes),
          covid_vaccinated: Math.random() > 0.1,
          criminal_record: Math.random() > 0.9,
          criminal_explanation: Math.random() > 0.9 ? 'Minor infraction from many years ago' : null,
          referral_source: getRandomItem(referralSources),
          volunteer_experience: Math.random() > 0.5 ? 'Previous volunteer experience at local schools and community centers' : null,
          employment_experience: 'Professional experience in ' + getRandomItems(skills, 2).join(' and '),
          reference: `${getRandomItem(firstNames)} ${getRandomItem(lastNames)}, ${generatePhoneNumber()}`,
          interests: getRandomItems(interests, getRandomInt(2, 5)).join(', '),
          reason_for_volunteering: 'I want to give back to the community and share my passion for education.',
          volunteer_position: getRandomItem(volunteerPositions),
          availability: getRandomItem(availabilityOptions),
          available_days: getRandomItems(availableDays, getRandomInt(2, 7)),
          status: 'PENDING',
          application_date: getRandomPastDate(1, 30),
          user_id: user.id
        }
      });
    }
    
    // Create some additional applications without users
    for (let i = 0; i < NUM_APPLICATIONS - pendingUsers.length; i++) {
      const firstName = getRandomItem(firstNames);
      const lastName = getRandomItem(lastNames);
      const name = `${firstName} ${lastName}`;
      const email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}@${getRandomItem(emailDomains)}`;
      const address = generateAddress();
      const birthdate = getRandomDate(new Date(1960, 0, 1), new Date(2005, 0, 1));
      
      await prisma.applications.create({
        data: {
          id: uuidv4(),
          name,
          email,
          phone: generatePhoneNumber(),
          address: address.street,
          city: address.city,
          state: address.state,
          zip_code: address.zipCode,
          birthdate,
          volunteer_type: getRandomItem(volunteerTypes),
          covid_vaccinated: Math.random() > 0.1,
          criminal_record: Math.random() > 0.9,
          criminal_explanation: Math.random() > 0.9 ? 'Minor infraction from many years ago' : null,
          referral_source: getRandomItem(referralSources),
          volunteer_experience: Math.random() > 0.5 ? 'Previous volunteer experience at local schools and community centers' : null,
          employment_experience: 'Professional experience in ' + getRandomItems(skills, 2).join(' and '),
          reference: `${getRandomItem(firstNames)} ${getRandomItem(lastNames)}, ${generatePhoneNumber()}`,
          interests: getRandomItems(interests, getRandomInt(2, 5)).join(', '),
          reason_for_volunteering: 'I want to give back to the community and share my passion for education.',
          volunteer_position: getRandomItem(volunteerPositions),
          availability: getRandomItem(availabilityOptions),
          available_days: getRandomItems(availableDays, getRandomInt(2, 7)),
          status: Math.random() > 0.7 ? 'PENDING' : (Math.random() > 0.5 ? 'APPROVED' : 'REJECTED'),
          application_date: getRandomPastDate(1, 60),
          approved_by: Math.random() > 0.7 ? getRandomItem(adminUsers).id : null,
          approved_at: Math.random() > 0.7 ? getRandomPastDate(1, 30) : null,
          rejected_by: Math.random() > 0.8 ? getRandomItem(adminUsers).id : null,
          rejected_at: Math.random() > 0.8 ? getRandomPastDate(1, 30) : null,
          rejection_reason: Math.random() > 0.8 ? 'Does not meet our current volunteer requirements' : null
        }
      });
    }
    
    console.log('✅ Database successfully seeded');
    
    // Print summary of created data
    console.log('\nSummary of created data:');
    console.log(`- ${adminUsers.length} admin users`);
    console.log(`- ${groupAdminUsers.length} group admin users`);
    console.log(`- ${regularUsers.length} regular volunteer users`);
    console.log(`- ${pendingUsers.length} pending users`);
    console.log(`- ${groups.length} volunteer groups`);
    console.log(`- ${allShifts.length} shifts`);
    console.log(`- ${NUM_VOLUNTEER_LOGS} volunteer logs`);
    console.log(`- ${NUM_APPLICATIONS} volunteer applications`);
    
    console.log('\nImportant test accounts:');
    console.log('- Admin: admin@example.com (password: password123)');
    console.log('- Regular user: user@example.com (password: password123)');

  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
    console.timeEnd('Database seeded');
  }
}

// Run the seed function
seed()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 