# CRM Doerr

Full-featured CRM built with Next.js 14, TypeScript, Tailwind CSS, and Prisma.

## Features

- **Clients** - Company management with contacts, billing/shipping addresses
- **Leads** - Pipeline with kanban board, conversion to clients
- **Projects** - Project tracking with team members, progress, billing types
- **Tasks** - Task management with kanban board, assignees, timers
- **Time Tracking** - Timesheets with start/stop timers, hourly rates
- **Calendar** - Month view with event creation and color coding
- **Tickets** - Support tickets with threaded replies, priorities, departments
- **Estimates** - Estimate creation with line items and PDF export
- **Proposals** - Proposal management with content editor
- **Contracts** - Contract tracking with signature status
- **Invoices** - Invoice management with line items, payments, PDF export
- **Recurring Invoices** - Automated invoice generation on schedule
- **Subscriptions** - Subscription billing management
- **Expenses** - Expense tracking by category, billable flag
- **Knowledge Base** - Articles organized by groups
- **Reports** - Sales, leads, projects, expenses, and customer analytics
- **Staff** - Staff management with role-based permissions
- **Roles & Permissions** - Feature-level access control
- **Custom Fields** - Add custom fields to any module
- **Email Templates** - SMTP integration with template system
- **File Attachments** - File uploads on any record
- **Announcements** - Internal announcements for staff/clients
- **Goals** - Goal tracking with progress
- **Surveys** - Survey builder with question types
- **Settings** - Profile and company configuration

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS + shadcn/ui components
- **Database**: PostgreSQL via Prisma ORM
- **Auth**: NextAuth.js v4 (JWT + Credentials)
- **Charts**: Recharts
- **PDF**: @react-pdf/renderer
- **Email**: Nodemailer

## Quick Deploy to Vercel

### 1. Get a free PostgreSQL database

Go to [neon.tech](https://neon.tech) and create a free project. Copy the connection string.

### 2. Deploy

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/topdoerr/crmdoerr)

### 3. Set environment variables

In Vercel project settings, add:

| Variable | Value |
|---|---|
| `DATABASE_URL` | Your Neon connection string |
| `NEXTAUTH_SECRET` | Any random string (run `openssl rand -base64 32`) |
| `NEXTAUTH_URL` | Your Vercel URL (e.g. `https://your-app.vercel.app`) |

### 4. Deploy and log in

The build automatically creates database tables and seeds sample data.

- **Email**: `admin@crmdoerr.com`
- **Password**: `admin123`

> Change the admin password after first login.

## Local Development

### Prerequisites

- Node.js 18+
- PostgreSQL database (or use Neon free tier)

### Setup

```bash
# Clone the repo
git clone https://github.com/topdoerr/crmdoerr.git
cd crmdoerr

# Install dependencies
npm install

# Configure environment
cp .env.example .env
# Edit .env with your DATABASE_URL, NEXTAUTH_SECRET, NEXTAUTH_URL

# Create database tables and seed data
npx prisma db push
node prisma/seed.js

# Start dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) and log in with `admin@crmdoerr.com` / `admin123`.

## Environment Variables

| Variable | Required | Description |
|---|---|---|
| `DATABASE_URL` | Yes | PostgreSQL connection string |
| `NEXTAUTH_SECRET` | Yes | Secret for JWT signing |
| `NEXTAUTH_URL` | Yes | Full URL of the app |
| `SMTP_HOST` | No | SMTP server for sending emails |
| `SMTP_PORT` | No | SMTP port (default: 587) |
| `SMTP_USER` | No | SMTP username |
| `SMTP_PASSWORD` | No | SMTP password |
| `SMTP_FROM` | No | Default "from" email address |

## Project Structure

```
src/
  app/
    (auth)/           # Login, register, forgot password
    (dashboard)/      # All CRM modules
      clients/
      invoices/
      projects/
      tasks/
      leads/
      tickets/
      ...
    api/              # API routes (auth, PDF, upload, cron)
  components/
    ui/               # shadcn/ui components
    layout/           # Sidebar, header, providers
    files/            # File upload/list components
    custom-fields/    # Custom field components
    reports/          # Chart components
  lib/
    auth.ts           # NextAuth configuration
    prisma.ts         # Prisma client singleton
    email.ts          # Nodemailer setup
    upload.ts         # File upload helper
    permissions.ts    # Permission checking
    utils.ts          # Formatting utilities
    pdf/              # PDF document templates
prisma/
  schema.prisma       # Database schema (30+ models)
  seed.js             # Sample data seeder
```

## License

Private - All rights reserved.
