import mongoose from 'mongoose';
import User from '../models/User.js';
import Project from '../models/Project.js';
import Task from '../models/Task.js';
import Application from '../models/Application.js';
import Comment from '../models/Comment.js';
import Notification from '../models/Notification.js';
import Review from '../models/Review.js';

export const seedDatabase = async () => {
  try {
    console.log('--- Checking & Seeding ImpactHub Demo Data ---');

    // Check if data already exists
    const userCount = await User.countDocuments();
    if (userCount > 0) {
      console.log(`Database already populated (${userCount} users found). Skipping seed.`);
      return;
    }

    console.log('Seeding initial demo users...');

    // 1. Create Users
    const admin = await User.create({
      name: 'Muhammad Tariq (Admin)',
      email: 'admin@impacthub.pk',
      password: 'password123',
      role: 'admin',
      phone: '+92 300 1122334',
      city: 'Karachi',
      skills: ['Administration', 'Policy', 'Operations', 'Leadership'],
      bio: 'Saylani Platform Administrator overseeing community initiatives across Pakistan.',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=300',
      points: 2500,
      hoursContributed: 120,
      badges: ['Impact Pioneer', 'Master Builder', 'Community Hero'],
    });

    const manager1 = await User.create({
      name: 'Usman Ghani',
      email: 'manager@impacthub.pk',
      password: 'password123',
      role: 'manager',
      phone: '+92 321 4455667',
      city: 'Rawalpindi',
      skills: ['Project Management', 'Event Planning', 'Volunteer Leadership', 'Public Relations'],
      bio: 'Regional Project Manager at Saylani Welfare. Passionate about green and clean city drives.',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=300',
      points: 1850,
      hoursContributed: 95,
      badges: ['Impact Pioneer', 'Community Hero'],
    });

    const manager2 = await User.create({
      name: 'Dr. Sarah Bilal',
      email: 'sarah.pm@impacthub.pk',
      password: 'password123',
      role: 'manager',
      phone: '+92 333 7788990',
      city: 'Lahore',
      skills: ['Healthcare Operations', 'Community Outreach', 'Logistics'],
      bio: 'Public Health Coordinator organizing medical & relief campaigns in Punjab.',
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=300',
      points: 1600,
      hoursContributed: 80,
      badges: ['Impact Pioneer', 'Task Master'],
    });

    const student1 = await User.create({
      name: 'Ali Khan',
      email: 'student@impacthub.pk',
      password: 'password123',
      role: 'student',
      phone: '+92 345 9988776',
      city: 'Rawalpindi',
      skills: ['Graphic Design', 'Social Media', 'Marketing', 'Photography'],
      bio: 'Computer Science student and passionate volunteer. Love digital campaigns & community work.',
      avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&q=80&w=300',
      points: 1250,
      hoursContributed: 45,
      badges: ['Impact Pioneer', 'Active Contributor', 'Task Master', 'Community Hero', 'Legendary Impact Maker'],
    });

    const student2 = await User.create({
      name: 'Ahmed Raza',
      email: 'ahmed@impacthub.pk',
      password: 'password123',
      role: 'student',
      phone: '+92 312 3344556',
      city: 'Islamabad',
      skills: ['Event Management', 'Public Speaking', 'First Aid', 'Fundraising'],
      bio: 'Saylani Mass IT Training student. Active in youth drives and disaster relief.',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=300',
      points: 1120,
      hoursContributed: 38,
      badges: ['Impact Pioneer', 'Active Contributor', 'Task Master', 'Community Hero'],
    });

    const student3 = await User.create({
      name: 'Sara Fatima',
      email: 'sara@impacthub.pk',
      password: 'password123',
      role: 'student',
      phone: '+92 334 5566778',
      city: 'Rawalpindi',
      skills: ['Content Writing', 'Teaching', 'Social Media', 'Coordination'],
      bio: 'Education advocate. Helping children in community welfare centers learn digital skills.',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=300',
      points: 980,
      hoursContributed: 32,
      badges: ['Impact Pioneer', 'Active Contributor', 'Task Master'],
    });

    const student4 = await User.create({
      name: 'Hamza Tariq',
      email: 'hamza@impacthub.pk',
      password: 'password123',
      role: 'student',
      phone: '+92 301 2233445',
      city: 'Lahore',
      skills: ['Logistics', 'Inventory Management', 'Packaging', 'Driver'],
      bio: 'Active member in ration drives and relief distributions.',
      avatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&q=80&w=300',
      points: 870,
      hoursContributed: 28,
      badges: ['Impact Pioneer', 'Active Contributor'],
    });

    const student5 = await User.create({
      name: 'Ayesha Noor',
      email: 'ayesha@impacthub.pk',
      password: 'password123',
      role: 'student',
      phone: '+92 315 6677889',
      city: 'Karachi',
      skills: ['UI/UX Design', 'Web Development', 'Tutoring'],
      bio: 'Front-end enthusiast participating in Saylani education and technology campaigns.',
      avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=300',
      points: 650,
      hoursContributed: 20,
      badges: ['Impact Pioneer', 'Active Contributor'],
    });

    console.log('Seeding projects...');

    // 2. Create Projects
    const project1 = await Project.create({
      title: 'Clean Rawalpindi Campaign',
      description:
        'A comprehensive youth-led city transformation drive to clean public parks, markets, and roads across Rawalpindi, installing eco-friendly waste bins and promoting recycling awareness.',
      category: 'Environment',
      location: 'Rawalpindi',
      startDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      endDate: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000),
      requiredVolunteers: 20,
      skillsRequired: ['Marketing', 'Social Media', 'Event Management', 'Waste Segregation'],
      image: 'https://images.unsplash.com/photo-1618477461853-cf6ed80faba5?auto=format&fit=crop&q=80&w=800',
      status: 'active',
      createdBy: manager1._id,
      members: [student1._id, student2._id, student3._id],
      progress: 60,
      impactScore: 8420,
      averageRating: 4.8,
      totalReviews: 2,
    });

    const project2 = await Project.create({
      title: 'Saylani Tech Bootcamp for Underprivileged Youth',
      description:
        'Equipping 100+ deserving high school students with fundamental coding, web development, and digital literacy skills using hands-on lab sessions.',
      category: 'Education',
      location: 'Karachi',
      startDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      requiredVolunteers: 15,
      skillsRequired: ['JavaScript', 'Python', 'Mentorship', 'Teaching'],
      image: 'https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&q=80&w=800',
      status: 'active',
      createdBy: manager1._id,
      members: [student1._id, student5._id],
      progress: 75,
      impactScore: 6850,
      averageRating: 4.9,
      totalReviews: 1,
    });

    const project3 = await Project.create({
      title: 'Ramadan Ration & Food Distribution Drive',
      description:
        'Packaging and delivering 2,500 comprehensive monthly ration bags with flour, lentils, oil, and staples to low-income families across Lahore neighborhoods.',
      category: 'Emergency Relief',
      location: 'Lahore',
      startDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      endDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
      requiredVolunteers: 30,
      skillsRequired: ['Logistics', 'Packaging', 'Inventory Management', 'Coordination'],
      image: 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?auto=format&fit=crop&q=80&w=800',
      status: 'active',
      createdBy: manager2._id,
      members: [student4._id, student2._id],
      progress: 45,
      impactScore: 5400,
      averageRating: 4.7,
      totalReviews: 1,
    });

    const project4 = await Project.create({
      title: 'Green Karachi Urban Tree Plantation',
      description:
        'Planting 5,000 indigenous trees along coastal highways and university campuses to combat urban heat islands and reduce smog in Karachi.',
      category: 'Environment',
      location: 'Karachi',
      startDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
      endDate: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000),
      requiredVolunteers: 25,
      skillsRequired: ['Gardening', 'Photography', 'Social Media', 'Field Work'],
      image: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&q=80&w=800',
      status: 'active',
      createdBy: manager1._id,
      members: [student5._id],
      progress: 20,
      impactScore: 2400,
      averageRating: 5.0,
      totalReviews: 0,
    });

    const project5 = await Project.create({
      title: 'Free Health & Eye Checkup Camp',
      description:
        'A fully concluded medical diagnostic camp offering free cataract screenings, general health consults, and prescription eyewear to 600+ patients.',
      category: 'Health',
      location: 'Islamabad',
      startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      endDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      requiredVolunteers: 18,
      skillsRequired: ['Medical Assisting', 'Patient Registration', 'First Aid'],
      image: 'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&q=80&w=800',
      status: 'completed',
      createdBy: manager2._id,
      members: [student2._id, student3._id, student4._id],
      progress: 100,
      impactScore: 9600,
      averageRating: 4.9,
      totalReviews: 3,
    });

    const project6 = await Project.create({
      title: 'Digital Literacy for Underprivileged Girls',
      description:
        'Proposed weekend workshops for 50 young girls in Rawalpindi learning basic computer skills, internet safety, and typing skills.',
      category: 'Education',
      location: 'Rawalpindi',
      startDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
      endDate: new Date(Date.now() + 40 * 24 * 60 * 60 * 1000),
      requiredVolunteers: 10,
      skillsRequired: ['Basic Computer', 'English', 'Teaching'],
      image: 'https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&q=80&w=800',
      status: 'pending_approval',
      createdBy: manager1._id,
      members: [],
      progress: 0,
      impactScore: 500,
      averageRating: 0,
      totalReviews: 0,
    });

    console.log('Seeding Kanban tasks...');

    // 3. Create Tasks for Clean Rawalpindi Campaign (Project 1)
    await Task.create([
      {
        project: project1._id,
        title: 'Design Instagram & Social Media Campaign',
        description: 'Create 5 high-resolution carousel graphics with awareness facts about cleanliness and event dates.',
        assignedTo: student1._id,
        priority: 'HIGH',
        deadline: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000),
        status: 'IN_PROGRESS',
        createdBy: manager1._id,
      },
      {
        project: project1._id,
        title: 'Arrange 500 Bio-degradable Trash Bags & Gloves',
        description: 'Coordinate procurement and sponsor delivery to Saylani Rawalpindi warehouse.',
        assignedTo: student3._id,
        priority: 'URGENT',
        deadline: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
        status: 'COMPLETED',
        completedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
        completionNotes: 'All 500 bio-degradable bags received and verified in warehouse room 2.',
        createdBy: manager1._id,
      },
      {
        project: project1._id,
        title: 'Recruit 20 Campus Volunteers from Local Colleges',
        description: 'Set up outreach desks at PMAS Arid Agriculture University and Gordon College.',
        assignedTo: student1._id,
        priority: 'HIGH',
        deadline: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        status: 'COMPLETED',
        completedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        completionNotes: '24 enthusiastic students registered and added to the roster!',
        createdBy: manager1._id,
      },
      {
        project: project1._id,
        title: 'Coordinate with City Municipal Sanitation Directorate',
        description: 'Confirm pickup truck schedule for collected waste at Commercial Market at 2 PM.',
        assignedTo: student2._id,
        priority: 'MEDIUM',
        deadline: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000),
        status: 'TODO',
        createdBy: manager1._id,
      },
      {
        project: project1._id,
        title: 'Prepare Post-Drive Media Brief & Photo Album',
        description: 'Curate high-res event photos and write a 1-page press release for local news.',
        assignedTo: student3._id,
        priority: 'LOW',
        deadline: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
        status: 'TODO',
        createdBy: manager1._id,
      },
    ]);

    // Tasks for Project 3 (Ramadan Ration)
    await Task.create([
      {
        project: project3._id,
        title: 'Packaging 1,000 Food Ration Boxes',
        description: 'Assemble staple items (atta, ghee, daal, sugar) into moisture-proof family packages.',
        assignedTo: student4._id,
        priority: 'URGENT',
        deadline: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
        status: 'IN_PROGRESS',
        createdBy: manager2._id,
      },
      {
        project: project3._id,
        title: 'Verify Eligible Family Token Registry',
        description: 'Cross-check CNIC entries against verified neighborhood eligibility roster.',
        assignedTo: student2._id,
        priority: 'HIGH',
        deadline: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
        status: 'COMPLETED',
        completedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
        completionNotes: '500 tokens registered and SMS confirmation dispatched.',
        createdBy: manager2._id,
      },
      {
        project: project3._id,
        title: 'Manage On-site Queue and Security Protocol',
        description: 'Set up canopy shading and organized lines for elderly and women beneficiaries.',
        assignedTo: student4._id,
        priority: 'MEDIUM',
        deadline: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
        status: 'TODO',
        createdBy: manager2._id,
      },
    ]);

    console.log('Seeding applications...');

    // 4. Create Applications
    await Application.create([
      {
        project: project1._id,
        applicant: student1._id,
        status: 'approved',
        motivation: 'I want to make Rawalpindi clean and inspire youth in my neighborhood.',
        skills: ['Social Media', 'Marketing'],
        reviewedBy: manager1._id,
        reviewedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
      },
      {
        project: project1._id,
        applicant: student2._id,
        status: 'approved',
        motivation: 'Ready to manage on-ground logistics and coordination.',
        skills: ['Event Management', 'First Aid'],
        reviewedBy: manager1._id,
        reviewedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      },
      {
        project: project1._id,
        applicant: student3._id,
        status: 'approved',
        motivation: 'Passionate about content writing and team coordination.',
        skills: ['Content Writing'],
        reviewedBy: manager1._id,
        reviewedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      },
      {
        project: project2._id,
        applicant: student4._id,
        status: 'pending',
        motivation: 'I want to assist instructors in the tech lab and learn web development.',
        skills: ['Mentorship', 'Basic Coding'],
      },
      {
        project: project3._id,
        applicant: student5._id,
        status: 'pending',
        motivation: 'Eager to help in distribution and registration desks.',
        skills: ['Registration', 'Coordination'],
      },
    ]);

    console.log('Seeding discussions...');

    // 5. Create Project Discussions
    const comment1 = await Comment.create({
      project: project1._id,
      author: manager1._id,
      content: 'Team, kickoff briefing starts tomorrow at 10:00 AM sharp at the Saylani Rawalpindi branch! Please wear comfortable shoes and bring water bottles.',
    });

    await Comment.create({
      project: project1._id,
      author: student1._id,
      content: 'Got it Usman bhai! The Instagram promotional reel has already crossed 2,000 views!',
      parentComment: comment1._id,
    });

    await Comment.create({
      project: project1._id,
      author: student3._id,
      content: 'All the biodegradable gloves and masks have arrived at the center.',
    });

    console.log('Seeding reviews...');

    // 6. Create Reviews
    await Review.create([
      {
        project: project1._id,
        reviewer: student1._id,
        rating: 5,
        comment: 'Outstanding leadership by Usman bhai. The volunteer coordination was seamless!',
      },
      {
        project: project1._id,
        reviewer: student3._id,
        rating: 5,
        comment: 'Very impactful initiative. Proud to see our streets visibly cleaner.',
      },
      {
        project: project5._id,
        reviewer: student2._id,
        rating: 5,
        comment: 'Great healthcare camp. Over 600 elderly citizens received free vision tests.',
      },
    ]);

    console.log('Seeding notifications...');

    // 7. Create Notifications
    await Notification.create([
      {
        recipient: student1._id,
        sender: manager1._id,
        type: 'application_approved',
        title: 'Application Approved! 🎉',
        message: 'Your application to join "Clean Rawalpindi Campaign" has been approved!',
        link: `/projects/${project1._id}`,
        isRead: false,
      },
      {
        recipient: student1._id,
        sender: manager1._id,
        type: 'task_assigned',
        title: 'New Task Assigned 📋',
        message: 'You have been assigned: "Design Instagram & Social Media Campaign".',
        link: `/projects/${project1._id}`,
        isRead: false,
      },
      {
        recipient: manager1._id,
        sender: student4._id,
        type: 'application_received',
        title: 'New Volunteer Application',
        message: 'Hamza Tariq applied to join "Saylani Tech Bootcamp".',
        link: `/projects/${project2._id}`,
        isRead: false,
      },
      {
        recipient: admin._id,
        sender: manager1._id,
        type: 'system',
        title: 'New Project Submitted for Approval',
        message: 'Usman Ghani submitted "Digital Literacy for Underprivileged Girls" for approval.',
        link: '/admin',
        isRead: false,
      },
    ]);

    console.log('--- ImpactHub Demo Database Seeded Successfully! ---');
  } catch (error) {
    console.error('Error during database seed:', error.message);
  }
};
