const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

async function main() {
  const hashedPassword = await bcrypt.hash("admin123", 12);

  await prisma.staff.upsert({
    where: { staffid: 1 },
    update: {},
    create: {
      email: "admin@crmdoerr.com",
      password: hashedPassword,
      firstName: "Admin",
      lastName: "User",
      admin: 1,
      active: 1,
    },
  });

  await prisma.client.upsert({
    where: { id: 1 },
    update: {},
    create: {
      company: "Acme Corporation",
      phonenumber: "+1 555-0100",
      website: "https://acme.example.com",
      address: "123 Main Street",
      city: "San Francisco",
      state: "CA",
      zip: "94105",
      active: 1,
    },
  });

  await prisma.client.upsert({
    where: { id: 2 },
    update: {},
    create: {
      company: "Globex Industries",
      phonenumber: "+1 555-0200",
      city: "New York",
      state: "NY",
      active: 1,
    },
  });

  await prisma.client.upsert({
    where: { id: 3 },
    update: {},
    create: {
      company: "Stark Enterprises",
      phonenumber: "+1 555-0300",
      city: "Los Angeles",
      state: "CA",
      active: 1,
    },
  });

  const leadStatuses = [
    { name: "New", statusorder: 1, color: "#2196f3" },
    { name: "Contacted", statusorder: 2, color: "#ff9800" },
    { name: "Qualified", statusorder: 3, color: "#4caf50" },
    { name: "Proposal Sent", statusorder: 4, color: "#9c27b0" },
    { name: "Won", statusorder: 5, color: "#283618" },
  ];
  for (const s of leadStatuses) {
    await prisma.leadStatus.upsert({ where: { id: s.statusorder }, update: {}, create: s });
  }

  const leadSources = ["Website", "Referral", "LinkedIn", "Cold Call", "Advertisement"];
  for (let i = 0; i < leadSources.length; i++) {
    await prisma.leadSource.upsert({ where: { id: i + 1 }, update: {}, create: { name: leadSources[i] } });
  }

  const ticketStatuses = [
    { name: "Open", statusorder: 1, statuscolor: "#2196f3" },
    { name: "In Progress", statusorder: 2, statuscolor: "#ff9800" },
    { name: "Answered", statusorder: 3, statuscolor: "#4caf50" },
    { name: "On Hold", statusorder: 4, statuscolor: "#9e9e9e" },
    { name: "Closed", statusorder: 5, statuscolor: "#f44336" },
  ];
  for (let i = 0; i < ticketStatuses.length; i++) {
    await prisma.ticketStatus.upsert({ where: { ticketstatusid: i + 1 }, update: {}, create: ticketStatuses[i] });
  }

  const ticketPriorities = ["Low", "Medium", "High", "Urgent"];
  for (let i = 0; i < ticketPriorities.length; i++) {
    await prisma.ticketPriority.upsert({ where: { id: i + 1 }, update: {}, create: { name: ticketPriorities[i] } });
  }

  await prisma.project.upsert({
    where: { id: 1 },
    update: {},
    create: {
      name: "Website Redesign",
      description: "Complete redesign of the company website",
      status: 2,
      clientId: 1,
      billingType: 1,
      startDate: new Date("2024-01-15"),
      deadline: new Date("2024-06-30"),
      projectCost: 25000,
      progress: 45,
    },
  });

  await prisma.invoice.upsert({
    where: { id: 1 },
    update: {},
    create: {
      clientId: 1,
      number: 1,
      prefix: "INV-",
      date: new Date("2024-02-01"),
      dueDate: new Date("2024-03-01"),
      subtotal: 5000,
      total: 5000,
      status: 4,
    },
  });

  await prisma.invoice.upsert({
    where: { id: 2 },
    update: {},
    create: {
      clientId: 2,
      number: 2,
      prefix: "INV-",
      date: new Date("2024-03-01"),
      dueDate: new Date("2024-04-01"),
      subtotal: 12500,
      total: 12500,
      status: 1,
    },
  });

  const leads = [
    { name: "John Smith", company: "TechFlow Inc", email: "john@techflow.com", status: 1, source: 1, leadValue: 15000 },
    { name: "Sarah Johnson", company: "DesignPro LLC", email: "sarah@designpro.com", status: 2, source: 2, leadValue: 8000 },
    { name: "Mike Chen", company: "DataSync Corp", email: "mike@datasync.com", status: 3, source: 3, leadValue: 22000 },
  ];
  for (let i = 0; i < leads.length; i++) {
    await prisma.lead.upsert({ where: { id: i + 1 }, update: {}, create: leads[i] });
  }

  await prisma.knowledgeBaseGroup.upsert({
    where: { id: 1 },
    update: {},
    create: {
      name: "Getting Started",
      description: "Guides for new users",
      color: "#4caf50",
    },
  });

  await prisma.knowledgeBaseArticle.upsert({
    where: { id: 1 },
    update: {},
    create: {
      subject: "Welcome to CRM Doerr",
      slug: "welcome",
      description: "<h2>Welcome!</h2><p>This is your CRM dashboard. Use the sidebar to navigate between modules.</p>",
      groupId: 1,
    },
  });

  console.log("Seed complete!");
  console.log("Login: admin@crmdoerr.com / admin123");
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
