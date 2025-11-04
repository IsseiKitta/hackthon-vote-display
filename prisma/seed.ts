import { PrismaClient } from "@prisma/client";
import * as argon2 from "argon2";

const prisma = new PrismaClient();

async function main() {
  console.log("Start seeding...");

  // Create 3 users
  const users = await Promise.all([
    prisma.user.create({
      data: {
        username: "alice",
        password: await argon2.hash("password123"),
      },
    }),
    prisma.user.create({
      data: {
        username: "bob",
        password: await argon2.hash("password123"),
      },
    }),
    prisma.user.create({
      data: {
        username: "charlie",
        password: await argon2.hash("password123"),
      },
    }),
  ]);

  console.log(`Created ${users.length} users`);

  // Create polls with projects
  const poll1 = await prisma.poll.create({
    data: {
      title: "2025 Spring Hackathon",
      createdBy: users[0].id,
      projects: {
        create: [
          {
            teamName: "Team Alpha",
            projectName: "Task Manager App",
            description: "Simple and easy-to-use task management application",
            votes: 45,
          },
          {
            teamName: "Team Beta",
            projectName: "Recipe Sharing Service",
            description: "SNS for sharing cooking recipes",
            votes: 38,
          },
          {
            teamName: "Team Gamma",
            projectName: "AI English Learning Assistant",
            description: "Learn English by talking with AI",
            votes: 52,
          },
          {
            teamName: "Team Delta",
            projectName: "Local Event Finder",
            description: "Find nearby events easily",
            votes: 29,
          },
          {
            teamName: "Team Epsilon",
            projectName: "Weather Dashboard",
            description: "Beautiful weather forecast dashboard",
            votes: 41,
          },
          {
            teamName: "Team Zeta",
            projectName: "Budget Tracker",
            description: "Personal finance management tool",
            votes: 33,
          },
          {
            teamName: "Team Eta",
            projectName: "Fitness Tracker",
            description: "Track your workout progress",
            votes: 27,
          },
          {
            teamName: "Team Theta",
            projectName: "Music Playlist Generator",
            description: "AI-powered music recommendations",
            votes: 61,
          },
          {
            teamName: "Team Iota",
            projectName: "Code Snippet Manager",
            description: "Organize your code snippets efficiently",
            votes: 49,
          },
          {
            teamName: "Team Kappa",
            projectName: "Travel Planner",
            description: "Plan your perfect trip",
            votes: 35,
          },
        ],
      },
    },
  });

  const poll2 = await prisma.poll.create({
    data: {
      title: "University Festival App Contest",
      createdBy: users[1].id,
      projects: {
        create: [
          {
            teamName: "Team Lambda",
            projectName: "Campus Map",
            description: "Campus facility guide app",
            votes: 67,
          },
          {
            teamName: "Team Mu",
            projectName: "Club Management System",
            description: "Tool to streamline club activities",
            votes: 41,
          },
          {
            teamName: "Team Nu",
            projectName: "Cafeteria Menu Voting",
            description: "Students can vote for menu items they want",
            votes: 55,
          },
          {
            teamName: "Team Xi",
            projectName: "Study Room Booking",
            description: "Reserve study rooms easily",
            votes: 38,
          },
          {
            teamName: "Team Omicron",
            projectName: "Course Review Platform",
            description: "Students share course experiences",
            votes: 72,
          },
          {
            teamName: "Team Pi",
            projectName: "Library Book Finder",
            description: "Locate books in university library",
            votes: 44,
          },
          {
            teamName: "Team Rho",
            projectName: "Student Marketplace",
            description: "Buy and sell items between students",
            votes: 59,
          },
          {
            teamName: "Team Sigma",
            projectName: "Class Schedule Optimizer",
            description: "Optimize your course schedule",
            votes: 31,
          },
          {
            teamName: "Team Tau",
            projectName: "Campus Event Calendar",
            description: "Never miss a campus event",
            votes: 48,
          },
          {
            teamName: "Team Upsilon",
            projectName: "Parking Spot Finder",
            description: "Find available parking on campus",
            votes: 26,
          },
        ],
      },
    },
  });

  const poll3 = await prisma.poll.create({
    data: {
      title: "Startup Pitch Contest",
      createdBy: users[0].id,
      projects: {
        create: [
          {
            teamName: "Team Phi",
            projectName: "Freelance Job Matching",
            description: "Platform connecting freelancers and clients",
            votes: 88,
          },
          {
            teamName: "Team Chi",
            projectName: "Pet Health Manager",
            description: "Easily manage pet health records",
            votes: 72,
          },
          {
            teamName: "Team Psi",
            projectName: "Used Textbook Marketplace",
            description: "Students can buy and sell textbooks",
            votes: 64,
          },
          {
            teamName: "Team Omega",
            projectName: "Smart Home Assistant",
            description: "Control your home with voice commands",
            votes: 95,
          },
          {
            teamName: "Team Phoenix",
            projectName: "Meal Prep Planner",
            description: "Plan weekly meals and groceries",
            votes: 53,
          },
          {
            teamName: "Team Dragon",
            projectName: "Language Exchange Platform",
            description: "Connect with native speakers worldwide",
            votes: 79,
          },
          {
            teamName: "Team Griffin",
            projectName: "Eco-Friendly Shopping Guide",
            description: "Find sustainable products easily",
            votes: 42,
          },
          {
            teamName: "Team Unicorn",
            projectName: "Mental Wellness App",
            description: "Daily mindfulness and mood tracking",
            votes: 67,
          },
          {
            teamName: "Team Pegasus",
            projectName: "Local Artist Marketplace",
            description: "Support local artists and creators",
            votes: 58,
          },
          {
            teamName: "Team Kraken",
            projectName: "Carbon Footprint Tracker",
            description: "Monitor and reduce your carbon emissions",
            votes: 81,
          },
        ],
      },
    },
  });

  console.log("Created polls with projects:");
  console.log(`Poll 1: ${poll1.title} (${users[0].username})`);
  console.log(`Poll 2: ${poll2.title} (${users[1].username})`);
  console.log(`Poll 3: ${poll3.title} (${users[0].username})`);

  console.log("Seeding finished.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
