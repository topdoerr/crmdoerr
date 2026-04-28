import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const maxDuration = 30;

const client = new Anthropic();

const SYSTEM_PROMPT =
  "You are the TopDoerr AI Assistant, a helpful assistant for a CRM and company intranet. You can search clients, invoices, leads, projects, tasks, and more. You can also draft emails and proposals. Be concise and helpful. Format responses with markdown when useful. When showing data, use tables or bullet points.";

const tools: Anthropic.Tool[] = [
  {
    name: "search_clients",
    description: "Search clients by company name or other criteria",
    input_schema: {
      type: "object" as const,
      properties: {
        query: { type: "string", description: "Search term" },
      },
      required: ["query"],
    },
  },
  {
    name: "get_invoices",
    description: "Get invoices, optionally filtered by status or client",
    input_schema: {
      type: "object" as const,
      properties: {
        status: {
          type: "number",
          description:
            "Status: 1=Unpaid, 2=Sent, 3=Partially Paid, 4=Paid, 5=Cancelled, 6=Draft",
        },
        clientId: { type: "number", description: "Filter by client ID" },
        limit: { type: "number", description: "Max results (default 10)" },
      },
    },
  },
  {
    name: "get_leads",
    description: "Get leads, optionally filtered by status",
    input_schema: {
      type: "object" as const,
      properties: {
        status: { type: "number", description: "Lead status ID" },
        limit: { type: "number", description: "Max results" },
      },
    },
  },
  {
    name: "get_projects",
    description: "Get projects with status and progress",
    input_schema: {
      type: "object" as const,
      properties: {
        status: {
          type: "number",
          description:
            "1=Not Started, 2=In Progress, 3=On Hold, 4=Completed, 5=Cancelled",
        },
        clientId: { type: "number" },
      },
    },
  },
  {
    name: "get_tasks",
    description: "Get tasks, optionally by status or assignee",
    input_schema: {
      type: "object" as const,
      properties: {
        status: { type: "number" },
        limit: { type: "number" },
      },
    },
  },
  {
    name: "get_stats",
    description:
      "Get overview statistics: total clients, invoices, revenue, leads, tasks, projects",
    input_schema: {
      type: "object" as const,
      properties: {},
    },
  },
  {
    name: "draft_email",
    description: "Draft a professional email based on context",
    input_schema: {
      type: "object" as const,
      properties: {
        to: { type: "string", description: "Recipient name or context" },
        purpose: { type: "string", description: "What the email is about" },
        tone: {
          type: "string",
          enum: ["formal", "friendly", "urgent"],
          description: "Email tone",
        },
      },
      required: ["to", "purpose"],
    },
  },
  {
    name: "draft_proposal",
    description: "Draft a project proposal",
    input_schema: {
      type: "object" as const,
      properties: {
        clientName: { type: "string" },
        projectDescription: { type: "string" },
        estimatedBudget: { type: "number" },
        timeline: { type: "string" },
      },
      required: ["clientName", "projectDescription"],
    },
  },
  {
    name: "summarize_client",
    description:
      "Get a full summary of a client including their invoices, projects, and contacts",
    input_schema: {
      type: "object" as const,
      properties: {
        clientId: { type: "number", description: "Client ID" },
      },
      required: ["clientId"],
    },
  },
  {
    name: "get_pto_summary",
    description: "Get PTO/leave summary for staff",
    input_schema: {
      type: "object" as const,
      properties: {
        staffId: { type: "number" },
      },
    },
  },
  {
    name: "search_knowledge_base",
    description: "Search knowledge base articles",
    input_schema: {
      type: "object" as const,
      properties: {
        query: { type: "string" },
      },
      required: ["query"],
    },
  },
];

// Tool handler functions

async function searchClients(input: { query: string }) {
  const clients = await prisma.client.findMany({
    where: {
      company: { contains: input.query, mode: "insensitive" },
    },
    include: { contacts: { where: { active: 1 }, take: 3 } },
    take: 10,
  });
  return clients.map((c) => ({
    id: c.id,
    company: c.company,
    phone: c.phonenumber,
    website: c.website,
    city: c.city,
    state: c.state,
    active: c.active,
    contacts: c.contacts.map((ct) => ({
      name: `${ct.firstName} ${ct.lastName}`,
      email: ct.email,
      phone: ct.phonenumber,
      isPrimary: ct.isPrimary,
    })),
  }));
}

async function getInvoices(input: {
  status?: number;
  clientId?: number;
  limit?: number;
}) {
  const where: Record<string, unknown> = {};
  if (input.status) where.status = input.status;
  if (input.clientId) where.clientId = input.clientId;

  const invoices = await prisma.invoice.findMany({
    where,
    include: { client: { select: { company: true } } },
    orderBy: { date: "desc" },
    take: input.limit || 10,
  });
  return invoices.map((inv) => ({
    id: inv.id,
    number: `${inv.prefix || "INV-"}${inv.number}`,
    client: inv.client.company,
    date: inv.date.toISOString().split("T")[0],
    dueDate: inv.dueDate.toISOString().split("T")[0],
    total: Number(inv.total),
    status: inv.status,
    statusLabel: ["", "Unpaid", "Sent", "Partially Paid", "Paid", "Cancelled", "Draft"][inv.status] || "Unknown",
  }));
}

async function getLeads(input: { status?: number; limit?: number }) {
  const where: Record<string, unknown> = {};
  if (input.status) where.status = input.status;

  const leads = await prisma.lead.findMany({
    where,
    include: { leadStatus: { select: { name: true } } },
    orderBy: { dateadded: "desc" },
    take: input.limit || 10,
  });
  return leads.map((l) => ({
    id: l.id,
    name: l.name,
    company: l.company,
    email: l.email,
    phone: l.phonenumber,
    status: l.leadStatus?.name || "Unknown",
    value: l.leadValue ? Number(l.leadValue) : null,
    dateAdded: l.dateadded.toISOString().split("T")[0],
  }));
}

async function getProjects(input: { status?: number; clientId?: number }) {
  const where: Record<string, unknown> = {};
  if (input.status) where.status = input.status;
  if (input.clientId) where.clientId = input.clientId;

  const projects = await prisma.project.findMany({
    where,
    include: { client: { select: { company: true } } },
    orderBy: { projectCreated: "desc" },
    take: 15,
  });
  const statusLabels = ["", "Not Started", "In Progress", "On Hold", "Completed", "Cancelled"];
  return projects.map((p) => ({
    id: p.id,
    name: p.name,
    client: p.client.company,
    status: statusLabels[p.status] || "Unknown",
    progress: p.progress,
    startDate: p.startDate.toISOString().split("T")[0],
    deadline: p.deadline?.toISOString().split("T")[0] || null,
    cost: p.projectCost ? Number(p.projectCost) : null,
  }));
}

async function getTasks(input: { status?: number; limit?: number }) {
  const where: Record<string, unknown> = {};
  if (input.status) where.status = input.status;

  const tasks = await prisma.task.findMany({
    where,
    include: {
      assignees: { include: { staff: { select: { firstName: true, lastName: true } } } },
    },
    orderBy: { dateadded: "desc" },
    take: input.limit || 10,
  });
  const statusLabels = ["", "Not Started", "In Progress", "Testing", "Awaiting Feedback", "Complete"];
  const priorityLabels = ["Low", "Medium", "High", "Urgent"];
  return tasks.map((t) => ({
    id: t.id,
    name: t.name,
    status: statusLabels[t.status] || "Unknown",
    priority: priorityLabels[t.priority] || "Low",
    dueDate: t.duedate?.toISOString().split("T")[0] || null,
    assignees: t.assignees.map((a) => `${a.staff.firstName} ${a.staff.lastName}`),
  }));
}

async function getStats() {
  const [totalClients, totalInvoices, totalLeads, totalTasks, totalProjects, revenueResult] =
    await Promise.all([
      prisma.client.count({ where: { active: 1 } }),
      prisma.invoice.count(),
      prisma.lead.count(),
      prisma.task.count(),
      prisma.project.count(),
      prisma.invoice.aggregate({ _sum: { total: true }, where: { status: 4 } }),
    ]);

  return {
    totalClients,
    totalInvoices,
    totalLeads,
    totalTasks,
    totalProjects,
    totalRevenue: Number(revenueResult._sum.total || 0),
  };
}

async function draftEmail(input: { to: string; purpose: string; tone?: string }) {
  // This is a generative tool - Claude will use the result as context
  return {
    to: input.to,
    purpose: input.purpose,
    tone: input.tone || "formal",
    instruction:
      "Please generate a professional email draft based on these parameters. Include a subject line, greeting, body, and sign-off.",
  };
}

async function draftProposal(input: {
  clientName: string;
  projectDescription: string;
  estimatedBudget?: number;
  timeline?: string;
}) {
  return {
    clientName: input.clientName,
    projectDescription: input.projectDescription,
    estimatedBudget: input.estimatedBudget,
    timeline: input.timeline,
    instruction:
      "Please generate a professional project proposal based on these parameters. Include sections for Executive Summary, Scope of Work, Timeline, Budget, and Terms.",
  };
}

async function summarizeClient(input: { clientId: number }) {
  const client = await prisma.client.findUnique({
    where: { id: input.clientId },
    include: {
      contacts: { where: { active: 1 } },
      invoices: { orderBy: { date: "desc" }, take: 5 },
      projects: { orderBy: { projectCreated: "desc" }, take: 5 },
    },
  });

  if (!client) return { error: "Client not found" };

  const totalInvoiced = client.invoices.reduce((sum, inv) => sum + Number(inv.total), 0);
  const paidInvoices = client.invoices.filter((inv) => inv.status === 4);
  const totalPaid = paidInvoices.reduce((sum, inv) => sum + Number(inv.total), 0);

  return {
    id: client.id,
    company: client.company,
    phone: client.phonenumber,
    website: client.website,
    address: [client.address, client.city, client.state, client.zip].filter(Boolean).join(", "),
    active: client.active === 1,
    contacts: client.contacts.map((c) => ({
      name: `${c.firstName} ${c.lastName}`,
      email: c.email,
      phone: c.phonenumber,
      isPrimary: c.isPrimary === 1,
    })),
    recentInvoices: client.invoices.map((inv) => ({
      number: `${inv.prefix || "INV-"}${inv.number}`,
      total: Number(inv.total),
      status: ["", "Unpaid", "Sent", "Partially Paid", "Paid", "Cancelled", "Draft"][inv.status],
      date: inv.date.toISOString().split("T")[0],
    })),
    recentProjects: client.projects.map((p) => ({
      name: p.name,
      status: ["", "Not Started", "In Progress", "On Hold", "Completed", "Cancelled"][p.status],
      progress: p.progress,
    })),
    financialSummary: { totalInvoiced, totalPaid, outstanding: totalInvoiced - totalPaid },
  };
}

async function getPtoSummary(input: { staffId?: number }) {
  const currentYear = new Date().getFullYear();

  if (input.staffId) {
    const balance = await prisma.ptoBalance.findUnique({
      where: { staffId_year: { staffId: input.staffId, year: currentYear } },
    });
    const requests = await prisma.ptoRequest.findMany({
      where: { staffId: input.staffId },
      orderBy: { createdAt: "desc" },
      take: 5,
    });
    return {
      balance: balance
        ? { allocated: balance.allocated, used: balance.used, pending: balance.pending, remaining: balance.allocated - balance.used - balance.pending }
        : null,
      recentRequests: requests.map((r) => ({
        type: r.type,
        startDate: r.startDate.toISOString().split("T")[0],
        endDate: r.endDate.toISOString().split("T")[0],
        days: r.days,
        status: r.status,
      })),
    };
  }

  // All staff summary
  const balances = await prisma.ptoBalance.findMany({
    where: { year: currentYear },
  });
  const pendingRequests = await prisma.ptoRequest.count({
    where: { status: "pending" },
  });
  return { year: currentYear, totalStaffWithBalances: balances.length, pendingRequests };
}

async function searchKnowledgeBase(input: { query: string }) {
  const articles = await prisma.knowledgeBaseArticle.findMany({
    where: {
      active: 1,
      OR: [
        { subject: { contains: input.query, mode: "insensitive" } },
        { description: { contains: input.query, mode: "insensitive" } },
      ],
    },
    include: { group: { select: { name: true } } },
    take: 5,
  });
  return articles.map((a) => ({
    id: a.id,
    subject: a.subject,
    group: a.group?.name || "Uncategorized",
    description: a.description.substring(0, 300),
    views: a.views,
  }));
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const toolHandlers: Record<string, (input: any) => Promise<unknown>> = {
  search_clients: searchClients,
  get_invoices: getInvoices,
  get_leads: getLeads,
  get_projects: getProjects,
  get_tasks: getTasks,
  get_stats: getStats,
  draft_email: draftEmail,
  draft_proposal: draftProposal,
  summarize_client: summarizeClient,
  get_pto_summary: getPtoSummary,
  search_knowledge_base: searchKnowledgeBase,
};

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { messages } = body as {
      messages: { role: string; content: string }[];
    };

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ error: "messages array is required" }, { status: 400 });
    }

    const anthropicMessages: Anthropic.MessageParam[] = messages.map((m) => ({
      role: m.role as "user" | "assistant",
      content: m.content,
    }));

    let response = await client.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 4096,
      system: SYSTEM_PROMPT,
      tools,
      messages: anthropicMessages,
    });

    // Tool use loop
    while (response.stop_reason === "tool_use") {
      const toolUseBlocks = response.content.filter(
        (block): block is Anthropic.ToolUseBlock => block.type === "tool_use"
      );

      const toolResults: Anthropic.ToolResultBlockParam[] = [];

      for (const toolUse of toolUseBlocks) {
        const handler = toolHandlers[toolUse.name];
        if (handler) {
          try {
            const result = await handler(toolUse.input as Record<string, unknown>);
            toolResults.push({
              type: "tool_result",
              tool_use_id: toolUse.id,
              content: JSON.stringify(result),
            });
          } catch (error) {
            toolResults.push({
              type: "tool_result",
              tool_use_id: toolUse.id,
              content: JSON.stringify({ error: `Tool execution failed: ${error}` }),
              is_error: true,
            });
          }
        } else {
          toolResults.push({
            type: "tool_result",
            tool_use_id: toolUse.id,
            content: JSON.stringify({ error: `Unknown tool: ${toolUse.name}` }),
            is_error: true,
          });
        }
      }

      // Send tool results back to Claude
      anthropicMessages.push({ role: "assistant", content: response.content });
      anthropicMessages.push({ role: "user", content: toolResults });

      response = await client.messages.create({
        model: "claude-sonnet-4-20250514",
        max_tokens: 4096,
        system: SYSTEM_PROMPT,
        tools,
        messages: anthropicMessages,
      });
    }

    // Extract text from response
    const textBlock = response.content.find(
      (block): block is Anthropic.TextBlock => block.type === "text"
    );

    return NextResponse.json({
      response: textBlock?.text || "I could not generate a response.",
    });
  } catch (error) {
    console.error("AI Chat API error:", error);
    return NextResponse.json(
      { error: "Failed to process AI request" },
      { status: 500 }
    );
  }
}
