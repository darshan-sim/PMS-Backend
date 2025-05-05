import { PrismaClient, Role, PlacementStatus } from "@prisma/client";
import { hash } from "bcrypt";

const prisma = new PrismaClient();

const domains = [
    "Software Development",
    "Data Science",
    "Artificial Intelligence",
    "Cloud Computing",
    "Cybersecurity",
    "Web Development",
    "Mobile Development",
    "DevOps",
    "UI/UX Design",
    "Product Management",
];

const branches = [
    "Computer Science",
    "Electronics",
    "Mechanical",
    "Civil",
    "Electrical",
];

const degrees = ["B.Tech", "M.Tech", "MBA", "MCA", "BBA"];

const placementCellNames = [
    "TechPlace Cell",
    "CareerConnect Cell",
    "FutureLeaders Cell",
    "ProCareer Cell",
    "JobBridge Cell",
];

const companyNames = [
    "TechSolutions Inc",
    "InnovateCorp",
    "FutureTech Systems",
    "DigitalWave Solutions",
    "SmartTech Enterprises",
];

async function main() {
    // Create branches
    for (const name of branches) {
        await prisma.branch.upsert({
            where: { name },
            update: {},
            create: { name },
        });
    }

    // Create degrees
    for (const name of degrees) {
        await prisma.degree.upsert({
            where: { name },
            update: {},
            create: { name },
        });
    }

    // Create placement cells with their admins
    for (let i = 0; i < 5; i++) {
        const hashedPassword = await hash("password123", 10);

        // Create admin user for placement cell
        const adminUser = await prisma.user.create({
            data: {
                username: `pcadmin${i + 1}`,
                email: `pcadmin${i + 1}@example.com`,
                password: hashedPassword,
                role: Role.placement_cell,
                isActive: true,
            },
        });

        // Get random branch and degrees
        const branch = await prisma.branch.findFirst({
            skip: i % branches.length,
        });

        const selectedDegrees = await prisma.degree.findMany({
            take: 3,
            skip: i % degrees.length,
        });

        // Create placement cell
        const placementCell = await prisma.placementCell.create({
            data: {
                placementCellName: placementCellNames[i],
                isVerified: true,
                placementCellEmail: `contact@${placementCellNames[i].toLowerCase().replace(/\s+/g, "")}.com`,
                website: `https://${placementCellNames[i].toLowerCase().replace(/\s+/g, "")}.com`,
                adminId: adminUser.userId,
                branchId: branch!.branchId,
                placementCellDegrees: {
                    create: selectedDegrees.map((degree) => ({
                        degreeId: degree.degreeId,
                    })),
                },
                placementCellDomains: {
                    create: domains.slice(i * 2, (i + 1) * 2).map((domain) => ({
                        domain,
                    })),
                },
            },
        });

        // Create 10 students for each placement cell
        for (let j = 0; j < 10; j++) {
            const studentNumber = i * 10 + j + 1;
            const hashedPassword = await hash("password123", 10);

            // Create student user
            const studentUser = await prisma.user.create({
                data: {
                    username: `student${studentNumber}`,
                    email: `student${studentNumber}@example.com`,
                    password: hashedPassword,
                    role: Role.student,
                    isActive: true,
                },
            });

            // Create student record
            await prisma.student.create({
                data: {
                    studentId: studentUser.userId,
                    enrollmentNumber: `EN${studentNumber.toString().padStart(4, "0")}`,
                    placementCellId: placementCell.placementCellId,
                    degreeId: selectedDegrees[0].degreeId,
                    fullName: `Student ${studentNumber}`,
                    cgpa: 8.5 + Math.random() * 1.5,
                    bachelorsGpa: 8.0 + Math.random() * 1.5,
                    tenthPercentage: 85 + Math.random() * 10,
                    twelfthPercentage: 80 + Math.random() * 10,
                    diplomaPercentage: 75 + Math.random() * 10,
                    backlogs: Math.floor(Math.random() * 3),
                    liveBacklogs: Math.floor(Math.random() * 2),
                    placementStatus: PlacementStatus.not_placed,
                },
            });
        }
    }

    // Create recruiters
    for (let i = 0; i < 5; i++) {
        const hashedPassword = await hash("password123", 10);

        // Create recruiter user
        const recruiterUser = await prisma.user.create({
            data: {
                username: `recruiter${i + 1}`,
                email: `recruiter${i + 1}@example.com`,
                password: hashedPassword,
                role: Role.recruiter,
                isActive: true,
            },
        });

        // Create recruiter record
        await prisma.recruiter.create({
            data: {
                recruiterId: recruiterUser.userId,
                companyName: companyNames[i],
                representativePosition: "HR Manager",
                description: `Leading ${companyNames[i]} in technology solutions`,
                website: `https://${companyNames[i].toLowerCase().replace(/\s+/g, "")}.com`,
                companyEmail: `hr@${companyNames[i].toLowerCase().replace(/\s+/g, "")}.com`,
                representativeId: recruiterUser.userId,
            },
        });
    }
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
