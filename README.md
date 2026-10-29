# Minimalist Black-and-White Portfolio Website with Private Admin CMS

A modern personal portfolio website built with **React 19**, **Vite**, **Tailwind CSS**, and **Supabase (PostgreSQL, Auth & Storage)**.

Designed with radical minimalism:
- Pure monochrome color tokens: `#FFFFFF` background, `#111111` main text, `#666666` secondary text, `#E5E5E5` borders.
- Architectural layout, high contrast typography, and responsive grid structures.
- Real-time synchronization between the public website and private CMS.

---

## 1. System Architecture

The application is structured into two primary interfaces sharing a single backend and state engine:

1. **Public Portfolio (`/`)**:
   - Monogram header with live availability status pill.
   - Minimalist Hero with introduction, downloadable CV action, and profile framing.
   - Selected Works catalog with category filtering, real-time search, and detailed architecture modal.
   - Categorized Technical Proficiencies with clean progress indicators.
   - Structured Career Trajectory timeline with key accomplishments.
   - Education and verified credentials.
   - Consulting & capabilities offerings with deliverables breakdown.
   - Secure Contact Form with anti-bot honeypot protection, field validation, and database enquiry storage.
   - Minimalist footer.

2. **Private Administrative CMS (`/admin`)**:
   - Protected route requiring authentication (`/admin/login`).
   - 16-item sidebar navigation on desktop + collapsible drawer on mobile:
     1. Dashboard Overview (real metrics: published projects, draft works, skills, inquiries, unread count).
     2. Profile Management (biography, title, hero punchlines, availability, avatar & CV upload).
     3. Projects Management (full CRUD, drag/reorder, cover & gallery uploads, slug generation, draft/published toggle).
     4. Skills Management (categories, proficiency sliders, visibility toggles).
     5. Experience Management (positions, bullet points, current role flags).
     6. Education & Certifications (degrees, institutions, honors).
     7. Services Management (offerings, scope, icons, deliverables).
     8. Contact Messages Inbox (open message, mark read/unread, archive, delete, reply via mailto).
     9. Social Links Management (platforms, custom URLs, labels, icons).
     10. Navigation & Sections (toggle section visibility, rename navigation labels, reorder vertical page layout).
     11. Appearance & Branding (monogram, typography pairing, site titles, colophon).
     12. SEO Settings (meta title/desc, Open Graph card tags, live Google search snippet preview).
     13. Website Settings (maintenance mode notice, contact form availability, factory data re-seeding).
     14. Account & Security (administrator credentials, password update).
     15. View Live Website (direct link to public site in new tab).
     16. Logout.

---

## 2. Quickstart & Local Development

### Prerequisites
- Node.js 18+ or 20+
- npm or yarn

### Installation
```bash
npm install
npm run dev
```
The application will start at `http://localhost:3000`.

### Default Admin Credentials (Out of the Box)
The CMS includes built-in operational storage seeded with complete, realistic portfolio data. You can log into the CMS immediately without external setup:
- **URL**: `http://localhost:3000/admin/login`
- **Email**: `admin@portfolio.local`
- **Password**: `admin`

*(You can update your administrator password anytime in Account & Security).*

---

## 3. Supabase Integration Setup

To connect to a live Supabase project:

### Step 1: Create a Supabase Project
1. Go to [https://supabase.com](https://supabase.com) and create a new project.
2. Under **Project Settings > API**, note your:
   - **Project URL**
   - **anon / public Key**

### Step 2: Configure Environment Variables
Copy `.env.example` to `.env`:
```env
VITE_SUPABASE_URL="https://your-project-id.supabase.co"
VITE_SUPABASE_ANON_KEY="your-anon-jwt-token"
```
*(Alternatively, you can click "Connect Supabase" right inside the Admin top bar to paste your credentials dynamically without restarting).*

### Step 3: Run Database Schema & RLS Migration
1. Open your Supabase Dashboard and click on **SQL Editor**.
2. Click **New query** and paste the contents of `/supabase/schema.sql`.
3. Click **Run**. This will create:
   - `portfolio_profile`
   - `projects`
   - `skills`
   - `experiences`
   - `educations`
   - `services`
   - `contact_messages`
   - `social_links`
   - `section_settings`
   - `appearance_settings`
   - `seo_settings`
   - `website_settings`
   - Full Row Level Security (RLS) policies guaranteeing public visitors can only read published content and insert contact enquiries, while only authenticated administrators can mutate data or read enquiries.
   - Storage bucket `portfolio-assets` for image and PDF uploads.

### Step 4: Create First Supabase Administrator User
1. In the Supabase dashboard, navigate to **Authentication > Users**.
2. Click **Add User > Create User**.
3. Enter your administrative email and secure password.
4. Go to **Authentication > Providers > Email** and ensure **Enable Sign up** is disabled so the public cannot register accounts.

---

## 4. Deployment to Vercel

1. Push your repository to GitHub or GitLab.
2. In [Vercel](https://vercel.com), select **Add New Project** and import the repository.
3. In **Environment Variables**, set:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
4. Build settings:
   - Framework Preset: **Vite**
   - Build Command: `npm run build`
   - Output Directory: `dist`
5. Click **Deploy**.

---

## 5. Custom Domain Configuration

1. In your Vercel project dashboard, navigate to **Settings > Domains**.
2. Enter your custom domain (e.g. `yourname.dev` or `portfolio.yourdomain.com`).
3. Follow the DNS instructions to add the `CNAME` or `A` records to your domain registrar (Cloudflare, Namecheap, Google Domains).
4. SSL certificates are provisioned automatically.
