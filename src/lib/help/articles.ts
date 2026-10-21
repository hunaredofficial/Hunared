import type { HelpArticle } from "./types";

export const HELP_ARTICLES: HelpArticle[] = [
  {
    slug: "what-is-hunared",
    category: "getting-started",
    title: "What is Hunared?",
    summary: "Overview of Hunared as a global jobs, talent, companies, and marketplace platform.",
    keywords: ["overview", "about", "platform", "what is", "features"],
    roles: ["all", "guest"],
    action: { href: "/", label: "Go to homepage" },
    related: ["getting-started/create-account", "getting-started/account-types"],
    updated: "2026-10-21",
    body: `Hunared is a global platform that connects people with opportunities across jobs, talent, companies, marketplace listings, learning, and community tools.

## What you can do
- Search and filter **jobs** (permanent and temporary)
- Browse **candidates / talent** and **company** directories
- Use the **Marketplace** for products, services, property, vehicles, and more
- Build a professional **CV** with templates and AI assist
- Message other users about jobs or listings
- Use **Hunared Agent** for guided help across the site
- Manage everything from your **Dashboard**

## Main navigation
Use the top header: Jobs, Talent (Candidates), Companies, Marketplace, Learning/Program, and More (including Finder Center).

## Account types
Hunared supports different roles (Personal, Seeker, Company, Team, Admin). Features available to you depend on your role — see the Account types guide.`,
  },
  {
    slug: "create-account",
    category: "getting-started",
    title: "How to create a Hunared account",
    summary: "Sign up with email and complete your profile setup.",
    keywords: ["register", "sign up", "signup", "create account", "join"],
    roles: ["all", "guest"],
    action: { href: "/register", label: "Create account" },
    related: ["getting-started/account-types", "accounts/complete-profile"],
    updated: "2026-10-21",
    steps: [
      { title: "Open Sign up", body: "Go to Register (or Sign up) from the header." },
      { title: "Enter your details", body: "Use a valid email and follow the Clerk authentication steps (verification as required)." },
      { title: "Choose your path", body: "Complete registration for Seeker (job seeker) or Company (employer) fields when prompted — including photo, skills, industry, or services as shown." },
      { title: "Finish profile", body: "You may be redirected to complete mandatory fields (for example username for seekers). Save your profile." },
    ],
    body: `## Overview
Anyone can browse public pages without an account. To post jobs, save items, message others, use the CV Builder workspace, or access the dashboard, you need an account.

## Expected result
After sign-up you can open **Dashboard** from the header and manage your profile, listings, and messages.

## Tips
- Use a real email you can access for verification.
- Complete your profile early — incomplete profiles get fewer views.
- Company accounts should add industry, services, and location when available.

## Common problems
- **Stuck after sign-up:** Open /register?mode=complete or Dashboard → Profile and finish required fields.
- **Session issues:** Sign out, clear site data for hunared.com, sign in again.`,
  },
  {
    slug: "account-types",
    category: "getting-started",
    title: "Account types: Personal, Seeker, Company, Team",
    summary: "Which role to choose and what each role can do.",
    keywords: ["role", "seeker", "employer", "company", "team", "personal", "account type"],
    roles: ["all"],
    action: { href: "/dashboard/profile", label: "Open My Profile", requiresAuth: true },
    related: ["accounts/complete-profile", "jobs/post-a-job"],
    updated: "2026-10-21",
    body: `## Roles on Hunared
- **Personal** — general account for browsing and marketplace use.
- **Seeker** — job seeker / talent profile (CV, available for hire, job interests).
- **Company (employer)** — company profile, post jobs, browse candidates.
- **Team** — internal Hunared team tools (bulk post, managed profiles). Not for normal public users.
- **Admin** — platform moderation tools.

## Who can use what
| Feature | Seeker | Company | Team |
|---------|--------|---------|------|
| CV Builder | Yes | Yes | Yes |
| Post jobs | Limited | Yes | Yes |
| Browse candidates | Yes | Yes | Yes |
| Bulk post | No | No | Yes |
| Premium ads | Yes | Yes | Yes |
| Messages | Yes | Yes | Yes |

## Where to change role-related details
Dashboard → **My Profile** / **Company Profile**. Some role changes may clear company data or hire flags — follow on-screen warnings.`,
  },
  {
    slug: "complete-profile",
    category: "accounts",
    title: "Complete and edit your profile",
    summary: "Fill required fields, photo, skills, and public visibility.",
    keywords: ["profile", "edit profile", "photo", "username", "skills", "listed publicly"],
    roles: ["personal", "seeker", "employer", "all"],
    action: { href: "/dashboard/profile", label: "Edit profile", requiresAuth: true },
    related: ["accounts/dashboard-overview", "accounts/settings"],
    updated: "2026-10-21",
    steps: [
      { title: "Open profile", body: "Dashboard → My Profile (or Company Profile for employers)." },
      { title: "Add photo", body: "Upload a clear profile or company photo (size limits apply, e.g. max 10MB where enforced)." },
      { title: "Fill required fields", body: "Seekers: username, skills, interests, location. Companies: industry, services, optional Google Maps location link." },
      { title: "Public listing", body: "If you see a “listed publicly” or similar toggle, enable it only if you want to appear in public candidate/company directories." },
      { title: "Save", body: "Save changes and confirm success message." },
    ],
    body: `## Purpose
A complete profile improves discovery by employers and makes messaging clearer.

## Tips
- Use a professional photo.
- Keep job interests and skills accurate for personalized job ranking (“For you”).
- Company profiles should list real services and contact preferences.`,
  },
  {
    slug: "dashboard-overview",
    category: "accounts",
    title: "Using your dashboard",
    summary: "Navigate Overview, sidebar tools, and quick actions.",
    keywords: ["dashboard", "overview", "sidebar", "menu"],
    roles: ["all"],
    action: { href: "/dashboard", label: "Open dashboard", requiresAuth: true },
    related: ["accounts/settings", "saved-notifications/saved-items"],
    updated: "2026-10-21",
    body: `## Where to find it
After sign-in, open **Dashboard** from the header account menu.

## What you see
- **Overview** — stats and quick actions for your role
- **Sidebar** — Profile, CV Builder, Saved, Notifications, Listings, Messages (via header icon), Settings, Premium Ads, History
- Role-specific items (e.g. My Job Posts for companies, Bulk Post for team)

## Tips
Use Quick Actions on Overview for common tasks. On mobile, open the sidebar menu to reach the same links.`,
  },
  {
    slug: "settings",
    category: "accounts",
    title: "Account settings and preferences",
    summary: "Theme, country, timezone, history, and Hunared Agent visibility.",
    keywords: ["settings", "theme", "timezone", "country", "agent off", "history", "preferences"],
    roles: ["all"],
    action: { href: "/dashboard/settings", label: "Open settings", requiresAuth: true },
    related: ["agent/hide-agent", "saved-notifications/activity-history"],
    updated: "2026-10-21",
    steps: [
      { title: "Open Settings", body: "Dashboard → Settings (usually near the bottom of the sidebar)." },
      { title: "Adjust preferences", body: "Set theme, country, timezone, and other options shown for your account." },
      { title: "Agent visibility", body: "Turn Hunared Agent on or off for the homepage if the toggle is available." },
      { title: "Activity history", body: "Enable or disable saving your browsing activity if the option is present." },
      { title: "Save", body: "Save each section when the UI requires an explicit save." },
    ],
    body: `## Purpose
Settings personalize Hunared without changing other users’ experience.

## Privacy note
Disabling history stops new activity from being stored for your account (when that feature is enabled on the platform).`,
  },
  {
    slug: "search-jobs",
    category: "jobs",
    title: "How to search and filter jobs",
    summary: "Use country, city, employment type, and filters to find roles.",
    keywords: ["jobs", "search", "filter", "permanent", "temporary", "city"],
    roles: ["all", "guest", "seeker"],
    action: { href: "/jobs", label: "Browse jobs" },
    related: ["jobs/save-and-contact", "cv-builder/cv-overview"],
    updated: "2026-10-21",
    steps: [
      { title: "Open Jobs", body: "Header → Jobs, or go to /jobs." },
      { title: "Search", body: "Enter keywords in the job search field." },
      { title: "Location", body: "Choose country and city (city list is scrollable)." },
      { title: "Filters", body: "Use sidebar/bar filters: employment type (Permanent / Temporary), categories, and other available filters." },
      { title: "Open a job", body: "Click a card to see details, company contact, and apply/message options." },
    ],
    body: `## Purpose
Find roles that match your skills and location.

## Tips
- Permanent vs Temporary filters show only matching employment types.
- Signed-in seekers may see **For you** ranking based on profile interests and saved activity.
- Use Save on a job to find it later under Dashboard → My Saved.`,
  },
  {
    slug: "post-a-job",
    category: "jobs",
    title: "How to post a job",
    summary: "Create a job listing with title, description, location, and contact options.",
    keywords: ["post job", "create job", "job form", "employer"],
    roles: ["employer", "team", "admin"],
    action: { href: "/dashboard/jobs/new", label: "Post a job", requiresAuth: true },
    related: ["jobs/search-jobs", "companies/company-profile"],
    updated: "2026-10-21",
    steps: [
      { title: "Start a new job", body: "Dashboard → Post a Job (or My Job Posts → create)." },
      { title: "Fill required fields", body: "Title, description, country, city, work location, employment type, duration, salary if shown, phone where required." },
      { title: "Categories", body: "Select one or more job categories when multi-select is available." },
      { title: "Contact options", body: "Choose whether to show profile contact on the public job page." },
      { title: "Publish", body: "Submit the form. Team users may also use bulk post tools." },
    ],
    body: `## Who can post
Primarily **Company** accounts. **Team** accounts can post and bulk-post. Follow on-screen validation if fields are missing.

## Smart Fill
Where available, paste structured job text and use Smart Fill to populate fields. Description text you already entered is preserved when Smart Fill runs (current behavior).

## Expected result
The job appears in Jobs browse (subject to moderation if your site requires approval).`,
  },
  {
    slug: "save-and-contact",
    category: "jobs",
    title: "Save jobs and contact employers",
    summary: "Bookmark jobs and message companies about a role.",
    keywords: ["save job", "message", "contact", "apply"],
    roles: ["seeker", "all"],
    action: { href: "/dashboard/saved", label: "My Saved", requiresAuth: true },
    related: ["messaging/how-messaging-works", "jobs/search-jobs"],
    updated: "2026-10-21",
    body: `## Save a job
On a job detail page, use **Save**. View saved items under Dashboard → **My Saved**.

## Contact / message
If the listing shows a **Message** button, open a conversation about that job. You must be signed in. System/team accounts may be excluded from messaging on their posts.

## Tips
Complete your profile and CV before messaging employers.`,
  },
  {
    slug: "cv-overview",
    category: "cv-builder",
    title: "CV Builder overview",
    summary: "Create, edit, and export CVs from your dashboard.",
    keywords: ["cv", "resume", "cv builder", "templates"],
    roles: ["seeker", "all"],
    action: { href: "/dashboard/cv", label: "Open CV Builder", requiresAuth: true },
    related: ["cv-builder/upload-cv", "cv-builder/ai-assist"],
    updated: "2026-10-21",
    steps: [
      { title: "Open CV Builder", body: "Dashboard → CV Builder (/dashboard/cv)." },
      { title: "Choose a path", body: "Create new, start from profile, use a sample, or upload an existing CV." },
      { title: "Edit", body: "Use the editor and live preview. Switch templates without losing content where supported." },
      { title: "Export", body: "Use Print / PDF from the preview tools." },
    ],
    body: `## Purpose
Build a professional CV tailored to Gulf and international roles using Hunared templates and tools.

## Tips
- Keep multiple CV versions for different job types.
- Use samples as structure references, then replace with your real experience.
- Print preview carefully to avoid extra margins.`,
  },
  {
    slug: "upload-cv",
    category: "cv-builder",
    title: "Upload and edit your own CV",
    summary: "Import PDF/DOCX content and edit in the document-style editor.",
    keywords: ["upload cv", "import", "pdf", "docx", "edit cv"],
    roles: ["seeker", "all"],
    action: { href: "/dashboard/cv", label: "Upload in CV Builder", requiresAuth: true },
    related: ["cv-builder/cv-overview", "troubleshooting/upload-issues"],
    updated: "2026-10-21",
    body: `## Steps
1. Open **CV Builder**.
2. Choose **Upload** and select a PDF or DOCX from your device.
3. Wait for extraction; content opens in the editable document view.
4. Edit text, sections, and formatting.
5. Save your CV in the library.

## Notes
- Complex designer PDFs may not match the original layout 1:1; content is reconstructed for editing.
- Max useful quality comes from clear, text-based CVs (not scanned images without OCR quality).

## Common problems
If upload does nothing, allow the file picker, try another browser, or use a smaller PDF.`,
  },
  {
    slug: "ai-assist",
    category: "cv-builder",
    title: "AI assist for CV writing",
    summary: "Use AI chips and prompts to improve sections and tailor content.",
    keywords: ["ai cv", "improve", "tailor", "ats"],
    roles: ["seeker", "all"],
    action: { href: "/dashboard/cv", label: "Open CV Builder", requiresAuth: true },
    related: ["cv-builder/cv-overview"],
    updated: "2026-10-21",
    body: `## Overview
CV Builder includes AI assistance for improving selected text, suggesting professional wording, and job-related tailoring when configured.

## How to use
1. Open a CV in the builder.
2. Select text or choose an AI action/chip.
3. Review suggestions before accepting.
4. Save a new version if you want to keep the previous CV.

## Important
AI quality depends on configuration (optional external API). Always verify facts — never invent employment history.`,
  },
  {
    slug: "company-directory",
    category: "companies",
    title: "Browse companies and candidates",
    summary: "Use Companies and Talent directories with filters.",
    keywords: ["companies", "candidates", "talent", "directory", "hiring"],
    roles: ["all", "guest"],
    action: { href: "/companies", label: "Companies" },
    related: ["companies/company-profile", "jobs/search-jobs"],
    updated: "2026-10-21",
    body: `## Companies
Open **Companies** in the header. Filter by available options (e.g. hiring, verified) as shown on the page.

## Talent / Candidates
Open **Talent** (Candidates). Filters may include availability for hire and public listing status.

## Messaging
Use Message on a public profile when the user is contactable and not a system account.`,
  },
  {
    slug: "company-profile",
    category: "companies",
    title: "Set up a company profile",
    summary: "Industry, services, location, and photo for employers.",
    keywords: ["company profile", "employer", "industry", "services"],
    roles: ["employer"],
    action: { href: "/dashboard/profile", label: "Company profile", requiresAuth: true },
    related: ["jobs/post-a-job", "companies/company-directory"],
    updated: "2026-10-21",
    body: `## Steps
1. Register or switch to a **Company** account type.
2. Dashboard → **Company Profile**.
3. Add company photo, industry, services, and optional map link.
4. Save.

A strong company profile improves trust on job posts linked to your company.`,
  },
  {
    slug: "browse-and-post",
    category: "marketplace",
    title: "Marketplace: browse and post listings",
    summary: "Find items and services or create your own listing.",
    keywords: ["marketplace", "listing", "for sale", "rent", "services", "property"],
    roles: ["all"],
    action: { href: "/market", label: "Open Marketplace" },
    related: ["messaging/how-messaging-works", "premium/premium-ads"],
    updated: "2026-10-21",
    steps: [
      { title: "Browse", body: "Header → Marketplace. Use category filters and search." },
      { title: "Open a listing", body: "View details and contact the advertiser via Message when available." },
      { title: "Post", body: "Use Post an Ad / create listing flow. Choose category then fill fields." },
      { title: "Manage", body: "Dashboard → My Listings to edit or close listings." },
    ],
    body: `## Categories
Marketplace covers multiple verticals (for sale, rent, services, property, vehicles, electronics, lost & found, offers, etc.) as configured on the site.

## Tips
Clear photos, honest condition, and complete location help buyers respond faster.`,
  },
  {
    slug: "how-messaging-works",
    category: "messaging",
    title: "How Hunared Messages works",
    summary: "Unified inbox for jobs, marketplace, and profile conversations.",
    keywords: ["messages", "chat", "inbox", "message button"],
    roles: ["all"],
    action: { href: "/dashboard/messages", label: "Open Messages", requiresAuth: true },
    related: ["messaging/voice-notes", "messaging/safety"],
    updated: "2026-10-21",
    steps: [
      { title: "Start a chat", body: "On a job, listing, or profile, click Message (when shown)." },
      { title: "Open inbox", body: "Use the messages icon in the header or Dashboard → Messages." },
      { title: "Reply", body: "Type a message or use suggested openers when shown." },
      { title: "Attach files", body: "Use the paperclip to send images or documents (size limits apply)." },
    ],
    body: `## Rules
- You must be signed in.
- You generally cannot message Hunared system/team posts meant to be non-contactable.
- Block and report tools are available in the conversation menu.

## Live updates
Open conversations refresh so new messages appear without a full page reload (polling-based live chat).`,
  },
  {
    slug: "voice-notes",
    category: "messaging",
    title: "Send voice notes",
    summary: "Record up to 60 seconds of audio in a chat — free, no calling charges.",
    keywords: ["voice", "voice note", "audio", "mic", "microphone"],
    roles: ["all"],
    action: { href: "/dashboard/messages", label: "Open Messages", requiresAuth: true },
    related: ["messaging/how-messaging-works"],
    updated: "2026-10-21",
    steps: [
      { title: "Open a conversation", body: "Dashboard → Messages → select a chat." },
      { title: "Tap the mic", body: "Allow microphone access when the browser asks." },
      { title: "Record", body: "Speak (maximum about 60 seconds)." },
      { title: "Stop", body: "Tap stop — the note uploads and sends automatically." },
      { title: "Play", body: "Both sides can play the audio in the message bubble." },
    ],
    body: `## Requirements
- HTTPS site and a modern browser
- Microphone permission
- Existing Messages file storage (Supabase message-files bucket)

## Note
Voice notes are not phone calls. Live voice/video calling is a separate feature and is not included in free messaging.`,
  },
  {
    slug: "safety",
    category: "messaging",
    title: "Block, report, and stay safe",
    summary: "Use block and report tools; avoid sharing sensitive data.",
    keywords: ["block", "report", "safety", "spam", "scam"],
    roles: ["all"],
    action: { href: "/dashboard/messages", label: "Messages", requiresAuth: true },
    related: ["messaging/how-messaging-works", "troubleshooting/common-errors"],
    updated: "2026-10-21",
    body: `## Block
In a conversation, use Block so the other user cannot continue messaging you.

## Report
Use Report with a clear reason. This flags the issue for review — it is not an instant public ban confirmation.

## Safety tips
- Never share bank passwords or one-time codes.
- Meet in safe public places for marketplace exchanges.
- Prefer Hunared messaging over unknown external links.`,
  },
  {
    slug: "using-agent",
    category: "agent",
    title: "Using Hunared Agent",
    summary: "AI assistant that helps you navigate jobs, market, and account tasks.",
    keywords: ["agent", "ai", "assistant", "chatbot", "help agent"],
    roles: ["all", "guest"],
    action: { href: "/ai-settings", label: "Agent settings" },
    related: ["agent/hide-agent", "getting-started/what-is-hunared"],
    updated: "2026-10-21",
    body: `## Overview
Hunared Agent answers questions about using the platform and can guide you to features (jobs, marketplace, CV, account).

## Guest vs signed-in
- Guests can use the agent for general platform guidance where enabled.
- Signed-in users get more account-aware help.

## Tips
Ask clear questions: “How do I post a job?” or “Where is CV Builder?”`,
  },
  {
    slug: "hide-agent",
    category: "agent",
    title: "Show or hide Hunared Agent on the homepage",
    summary: "Control Agent visibility from profile settings.",
    keywords: ["hide agent", "turn off agent", "agent off", "settings"],
    roles: ["all"],
    action: { href: "/dashboard/settings", label: "Settings", requiresAuth: true },
    related: ["accounts/settings", "agent/using-agent"],
    updated: "2026-10-21",
    body: `## Steps
1. Sign in.
2. Dashboard → **Settings**.
3. Find the Hunared Agent visibility / AI option.
4. Turn **Off** to hide the agent from the homepage experience.
5. Save if required.

You can turn it back on anytime from the same settings page or public AI settings page when available.`,
  },
  {
    slug: "saved-items",
    category: "saved-notifications",
    title: "Saved jobs and listings",
    summary: "Bookmark opportunities and find them later.",
    keywords: ["saved", "bookmark", "favorites", "my saved"],
    roles: ["all"],
    action: { href: "/dashboard/saved", label: "My Saved", requiresAuth: true },
    related: ["jobs/search-jobs", "marketplace/browse-and-post"],
    updated: "2026-10-21",
    body: `## How to save
Use the **Save** control on job or listing pages.

## Where to view
Dashboard → **My Saved**.

## Note
Saving requires an account. Saved items stay linked to your user ID.`,
  },
  {
    slug: "notifications",
    category: "saved-notifications",
    title: "Notifications and subscriptions",
    summary: "Manage alerts from the dashboard.",
    keywords: ["notifications", "alerts", "subscriptions"],
    roles: ["all"],
    action: { href: "/dashboard/notifications", label: "Notifications", requiresAuth: true },
    related: ["accounts/settings"],
    updated: "2026-10-21",
    body: `## Where
Dashboard → **Notifications** and **My Subscriptions**.

## Tips
Keep contact email up to date so you do not miss important account messages.`,
  },
  {
    slug: "activity-history",
    category: "saved-notifications",
    title: "Activity history",
    summary: "Optional log of your browsing activity on Hunared.",
    keywords: ["history", "activity", "tracking"],
    roles: ["all"],
    action: { href: "/dashboard/history", label: "History", requiresAuth: true },
    related: ["accounts/settings"],
    updated: "2026-10-21",
    body: `## Overview
When enabled, Hunared can store recent activity (pages you use) for your account.

## Control
Dashboard → Settings → disable history if you prefer not to save activity.

## View
Dashboard → **History**.`,
  },
  {
    slug: "premium-ads",
    category: "premium",
    title: "Premium Ads campaigns",
    summary: "Promote a job, listing, or custom creative with paid placement.",
    keywords: ["premium", "ads", "promote", "campaign", "bid"],
    roles: ["all"],
    action: { href: "/dashboard/premium-ads", label: "Premium Ads", requiresAuth: true },
    related: ["jobs/post-a-job", "marketplace/browse-and-post"],
    updated: "2026-10-21",
    steps: [
      { title: "Open Premium Ads", body: "Dashboard → Premium Ads → Create ad." },
      { title: "Choose objective", body: "Promote a job, marketplace listing, or standalone brand ad." },
      { title: "Pick placement", body: "Select a slot size (header, home, jobs, market, etc.)." },
      { title: "Creative", body: "Add title, destination URL, and upload an image (or paste image URL)." },
      { title: "Budget", body: "Set duration and bid (minimum shown per slot)." },
      { title: "Pay & approve", body: "Submit payment reference; an admin reviews before the ad goes live." },
    ],
    body: `## Editing
You can edit campaigns after creation. Editing a live ad may require re-approval.

## Note
Prices and slots are configured by the platform. Contact ads@hunared.com (or the address shown in the UI) for payment confirmation.`,
  },
  {
    slug: "bulk-post",
    category: "team",
    title: "Team bulk posting",
    summary: "Post multiple jobs or marketplace listings at once (Team role only).",
    keywords: ["bulk", "team", "multiple posts", "magic post"],
    roles: ["team", "admin"],
    action: { href: "/dashboard/team/bulk", label: "Bulk Post", requiresAuth: true },
    related: ["jobs/post-a-job", "team/team-profiles"],
    updated: "2026-10-21",
    body: `## Who
Only users with the **Team** role.

## Where
Dashboard → **Bulk Post** (and standard job/market forms as configured).

## Behavior
Create multiple posts in one flow using the same fields as normal job/market forms. Smart Fill may be available on individual fields depending on the current UI version.

## Profiles
Team can create candidate/company profiles without normal email verification. If a real user later signs up with the same contact, team placeholder data may be replaced per platform rules.`,
  },
  {
    slug: "team-profiles",
    category: "team",
    title: "Team-managed candidate and company profiles",
    summary: "Create profiles for publishing without standard user verification.",
    keywords: ["team profile", "managed profile", "placeholder"],
    roles: ["team", "admin"],
    action: { href: "/dashboard", label: "Team dashboard", requiresAuth: true },
    related: ["team/bulk-post"],
    updated: "2026-10-21",
    body: `## Purpose
Internal operations: create candidate or company profiles that behave like real profiles for listings, without requiring the end user to verify first.

## After create
Profiles can be edited from team tools. Jobs can link to team-created companies when that option is enabled.

## Claim
If a real user registers with matching contact details, the platform may remove the team placeholder and attach the real account.`,
  },
  {
    slug: "login-issues",
    category: "troubleshooting",
    title: "Sign-in and session problems",
    summary: "Fix login loops, expired sessions, and incomplete registration.",
    keywords: ["login", "sign in", "session", "expired", "clerk"],
    roles: ["all", "guest"],
    action: { href: "/sign-in", label: "Sign in" },
    related: ["getting-started/create-account", "troubleshooting/common-errors"],
    updated: "2026-10-21",
    body: `## Problem
Cannot sign in, or keep returning to register/complete.

## Try this
1. Confirm email verification was completed.
2. Open /register?mode=complete if profile setup was interrupted.
3. Sign out fully, then sign in again.
4. Try another browser or private window.
5. Disable strict blockers that break authentication cookies.

## Sessions
Sessions are designed to last for extended use; if you stay signed out, sign in again. Contact support via the Contact page if access remains blocked.`,
  },
  {
    slug: "upload-issues",
    category: "troubleshooting",
    title: "File and image upload issues",
    summary: "CV, chat attachments, profile photo, and ad creative uploads.",
    keywords: ["upload", "file", "image", "cv upload", "attachment"],
    roles: ["all"],
    related: ["cv-builder/upload-cv", "messaging/how-messaging-works"],
    updated: "2026-10-21",
    body: `## Problem
Upload button does nothing, or file fails.

## Causes & fixes
- **File too large** — use a smaller file (profile photos and ads often max ~5–10MB; chat files have their own limit).
- **Wrong type** — use JPG/PNG for images; PDF/DOCX for CVs where supported.
- **Permissions** — allow the browser file dialog; on mobile, grant storage access.
- **Storage not configured** — site admins must ensure Supabase storage buckets exist (e.g. message-files, premium-ads).

## Verify
Retry after a refresh. If the same file works on desktop but not mobile, try a different format.`,
  },
  {
    slug: "common-errors",
    category: "troubleshooting",
    title: "Common errors and what to do",
    summary: "Blank pages, 404s, and message or dashboard errors.",
    keywords: ["error", "404", "broken", "not working", "bug"],
    roles: ["all"],
    action: { href: "/contact", label: "Contact support" },
    related: ["troubleshooting/login-issues"],
    updated: "2026-10-21",
    body: `## 404 page
The page may have moved. Use header search or Help Center search.

## Dashboard looks wrong
Hard-refresh (Ctrl+Shift+R). Clear cache if a double menu or empty gap appears after an update.

## Messages
If a file link fails, ask the sender to resend. Block/report errors usually mean the other user id could not be resolved — refresh and retry.

## Still stuck
Use **Contact Us** with the page URL, approximate time, and a screenshot (no passwords).`,
  },
  {
    slug: "finder-center",
    category: "getting-started",
    title: "Finder Center",
    summary: "Standalone tool to discover opportunities and resources.",
    keywords: ["finder", "finder center", "discover"],
    roles: ["all", "guest"],
    action: { href: "/finder", label: "Open Finder Center" },
    related: ["getting-started/what-is-hunared"],
    updated: "2026-10-21",
    body: `## Where
Open **Finder Center** from site navigation / footer (path /finder).

## Purpose
A focused discovery experience separate from the main homepage hero search.`,
  },
  {
    slug: "program-learning",
    category: "getting-started",
    title: "Programs and learning links",
    summary: "Hunared Programs and external courses / credential info.",
    keywords: ["program", "courses", "training", "certificate", "learning"],
    roles: ["all", "guest"],
    action: { href: "/program", label: "Hunared Programs" },
    related: ["getting-started/what-is-hunared"],
    updated: "2026-10-21",
    body: `## Hunared Programs
Visit **/program** for program information and available offerings.

## Courses
Course exploration may link to **https://hunared.org/courses** (external).

## Credentials
Follow on-page guidance for training partners and verification links shown on the Program page.`,
  },
];

export function getArticle(category: string, slug: string): HelpArticle | undefined {
  return HELP_ARTICLES.find((a) => a.category === category && a.slug === slug);
}

export function getArticlesByCategory(category: string): HelpArticle[] {
  return HELP_ARTICLES.filter((a) => a.category === category);
}

export function getArticleByPath(path: string): HelpArticle | undefined {
  const [category, slug] = path.split("/");
  if (!category || !slug) return undefined;
  return getArticle(category, slug);
}
