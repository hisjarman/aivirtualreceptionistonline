export type Plan = {
  name: string;
  price: string;
  eyebrow: string;
  description: string;
  featured?: boolean;
  features: string[];
  allowance: string;
};

export const plans: Plan[] = [
  { name: "Launch", price: "$39", eyebrow: "For smaller teams getting started", description: "A practical first layer for businesses that need dependable coverage without a complex setup.", allowance: "100 AI call minutes included · $0.35/min overage", features: ["24/7 AI call answering", "Lead information capture", "Call summaries", "Call forwarding setup", "Email support"] },
  { name: "Growth", price: "$79", eyebrow: "For busy, growing businesses", description: "More involved call flows, lead qualification, and appointment-request support for growing teams.", allowance: "300 AI call minutes included · $0.30/min overage", featured: true, features: ["Everything in Launch", "Appointment request handling", "Custom business knowledge", "Priority lead notifications", "Priority support"] },
  { name: "Pro", price: "$129", eyebrow: "For higher-volume call teams", description: "Advanced workflows and ongoing optimization for teams with more moving parts.", allowance: "600 AI call minutes included · $0.25/min overage", features: ["Everything in Growth", "Advanced lead qualification", "Custom call workflows", "Enhanced reporting", "Priority configuration"] },
];

export const industries = [
  { slug: "plumbers", label: "Plumbers", icon: "Wrench", accent: "teal", headline: "Turn after-hours plumbing calls into organized service requests.", description: "AI Virtual Receptionist can ask what happened, where the property is, and how urgent the issue feels—then give your team a clean request to follow up on.", example: "“Is the water actively running, or is this a repair you can schedule?”" },
  { slug: "hvac", label: "HVAC businesses", icon: "Wind", accent: "sky", headline: "Keep heating and cooling calls moving when the team is on site.", description: "Capture the make, issue, location, and preferred callback time while your technicians stay focused on the job in front of them.", example: "“Are you without heat right now, or is the system still running?”" },
  { slug: "roofers", label: "Roofers", icon: "House", accent: "amber", headline: "Make every storm-damage inquiry easier to triage.", description: "A structured first conversation helps your team understand the property, the type of damage, and the best next step before a site visit.", example: "“Has water entered the home, or are you looking for an inspection?”" },
  { slug: "contractors", label: "Contractors", icon: "HardHat", accent: "violet", headline: "Give every project inquiry a clear next step.", description: "Collect project type, location, timing, and budget context without asking prospects to leave a voicemail and hope for a call back.", example: "“What are you hoping to change, and when would you like the work to begin?”" },
  { slug: "salons", label: "Salons & spas", icon: "Sparkles", accent: "rose", headline: "Let clients ask, book, or request a time without the phone tag.", description: "Answer common service questions, share approved information, and capture appointment requests when your calendar is not connected.", example: "“Would you like a haircut, color consultation, or a service recommendation?”" },
  { slug: "real-estate", label: "Real estate", icon: "KeyRound", accent: "indigo", headline: "Respond to buyer and seller questions with a human handoff in mind.", description: "Capture property context and intent, route urgent needs, and keep your follow-up list organized for the next conversation.", example: "“Are you calling about a specific property, a valuation, or a new search?”" },
  { slug: "auto-repair", label: "Auto repair shops", icon: "CarFront", accent: "slate", headline: "Capture the symptoms before the car reaches the bay.", description: "Gather vehicle details, symptoms, timing, and callback information so your service team can start with useful context.", example: "“What are you noticing, and is the vehicle safe to drive right now?”" },
  { slug: "cleaning", label: "Cleaning companies", icon: "SprayCan", accent: "cyan", headline: "Turn “how much?” calls into complete quote requests.", description: "Ask about property type, size, service cadence, and desired timing, then send a clear request to the right person.", example: "“Is this a one-time deep clean or recurring service for the home?”" },
];

export const faqs = [
  { q: "Is AI Virtual Receptionist a software subscription I configure myself?", a: "No. The service is managed for you. We learn how your business works, configure the receptionist, test the important scenarios, and continue handling updates through your plan." },
  { q: "Can the receptionist book appointments?", a: "When a supported calendar connection is available, we can configure confirmed booking rules. Otherwise, the receptionist captures a booking request and makes the next step clear—without pretending a time is reserved." },
  { q: "What happens when a caller needs a person?", a: "We configure transfer and escalation rules around your business. If a supported transfer path is not available, the receptionist captures the message and the preferred callback details." },
  { q: "Do you offer unlimited calls?", a: "Not by default. Included usage, overages, telephony, and third-party charges depend on the underlying platform and your configuration. Allowances are shown as configurable until those costs are verified." },
  { q: "Will changes I make in the portal go live immediately?", a: "No. Customer edits are saved as proposed change requests. A AI Virtual Receptionist administrator reviews, updates the underlying provider configuration, tests it, and marks it complete." },
  { q: "Is the demo a real voice call?", a: "No. The conversation on this site is a clearly labeled fictional simulation so you can understand the experience without mistaking it for a customer call." },
];

export const articles = [
  { slug: "what-is-an-ai-receptionist", category: "Getting started", title: "What Is an AI Receptionist and How Does It Work?", excerpt: "A plain-language guide to what an AI receptionist can handle, where a human stays involved, and what setup actually takes.", read: "7 min read", date: "Oct 18, 2026", author: "AI Virtual Receptionist editorial team" },
  { slug: "stop-missing-customer-calls", category: "Operations", title: "How Small Businesses Can Stop Missing Customer Calls", excerpt: "A practical look at after-hours coverage, voicemail friction, callback capture, and the handoffs that matter most.", read: "6 min read", date: "Oct 11, 2026", author: "AI Virtual Receptionist editorial team" },
  { slug: "ai-vs-human-receptionist", category: "Planning", title: "AI Receptionist vs. Human Receptionist: Costs and Trade-offs", excerpt: "Compare availability, consistency, empathy, escalation, and the real work of managing each option.", read: "8 min read", date: "Oct 03, 2026", author: "AI Virtual Receptionist editorial team" },
  { slug: "ai-receptionist-cost", category: "Pricing", title: "How Much Does an AI Receptionist Cost?", excerpt: "Understand managed service pricing, usage allowances, onboarding fees, telephony charges, and overages.", read: "8 min read", date: "Sep 26, 2026", author: "AI Virtual Receptionist editorial team" },
  { slug: "plumbers-capture-service-requests", category: "Industries", title: "How Plumbers Can Use AI to Capture More Service Requests", excerpt: "The questions that turn a rushed emergency call into a useful request your team can act on.", read: "5 min read", date: "Sep 19, 2026", author: "AI Virtual Receptionist editorial team" },
  { slug: "roofers-incoming-leads", category: "Industries", title: "How Roofing Companies Can Handle More Incoming Leads", excerpt: "A storm-season call flow for urgency, property context, inspections, and clean human follow-up.", read: "6 min read", date: "Sep 12, 2026", author: "AI Virtual Receptionist editorial team" },
  { slug: "set-up-without-technical-skills", category: "Getting started", title: "How to Set Up an AI Receptionist Without Technical Skills", excerpt: "Why a managed setup model can be a better fit than learning prompts, integrations, and call routing yourself.", read: "7 min read", date: "Sep 05, 2026", author: "AI Virtual Receptionist editorial team" },
  { slug: "questions-for-provider", category: "Planning", title: "Seven Questions to Ask Before Hiring an AI Receptionist Provider", excerpt: "Use this checklist to separate real managed service from software access and vague claims.", read: "7 min read", date: "Aug 29, 2026", author: "AI Virtual Receptionist editorial team" },
];

export const helpArticles = [
  { category: "Getting Started", title: "How to onboard your business", excerpt: "What to prepare before you begin, how save-and-resume works, and what happens after submission." },
  { category: "Phone Number and Call Forwarding", title: "How to forward calls to an AI receptionist", excerpt: "A carrier-aware overview of forwarding options. AI Virtual Receptionist never changes routing automatically." },
  { category: "Receptionist Configuration", title: "How to change business hours", excerpt: "Submit a proposed hours change and see how it moves through review and testing." },
  { category: "Receptionist Configuration", title: "How to update FAQs", excerpt: "Keep approved answers clear, specific, and safe for the receptionist to share." },
  { category: "Requesting Changes", title: "How to request a change to your agent", excerpt: "Use the workspace to describe a change, track status, and approve the completed update." },
  { category: "Call Handling and Transfers", title: "How to test your receptionist", excerpt: "Review scenarios, submit a test case, and approve the configuration before launch." },
  { category: "Notifications and Reporting", title: "How to understand call summaries", excerpt: "What a summary can include and why transcripts are provider- and consent-dependent." },
  { category: "Account and Billing", title: "How to pause or cancel a service", excerpt: "Review status, timing, and what your administrator needs to confirm." },
  { category: "Account and Billing", title: "How billing and usage allowances work", excerpt: "Understand plan fees, configurable allowances, overage terms, and third-party costs." },
];

export const legalDrafts = {
  terms: { title: "Terms of Service", body: "This initial draft describes the managed AI receptionist service, customer responsibilities, payment terms, service changes, acceptable use, and limitation of liability. Replace this placeholder with counsel-reviewed language before launch." },
  privacy: { title: "Privacy Policy", body: "This initial draft covers account information, business information, call-related data where enabled, support records, retention, deletion, service providers, and privacy rights. Review it for the countries and privacy laws that apply to your business." },
  cookies: { title: "Cookie Policy", body: "This initial draft explains essential session cookies, preference storage, analytics choices, and how users can manage consent. Configure the final categories and consent controls before launch." },
  "ai-disclosure": { title: "AI Disclosure & Call Recording Notice", body: "AI Virtual Receptionist may use an AI assistant to answer calls. Recording and transcription are not assumed to be enabled. Configure the notice, consent language, retention, and jurisdiction-specific requirements with qualified counsel before launch." },
  "acceptable-use": { title: "Acceptable Use Policy", body: "This initial draft prohibits unlawful, abusive, deceptive, harmful, or rights-infringing uses and reserves the right to pause service where required for safety, law, or provider policy." },
  cancellation: { title: "Cancellation & Refund Policy", body: "This initial draft explains cancellation requests, billing timing, onboarding work, and any refundable or non-refundable fees. Replace with counsel-reviewed terms and actual billing rules before launch." },
  "third-party": { title: "Third-Party Service Disclosure", body: "AI Virtual Receptionist relies on selected third-party telephony, AI, calendar, email, payment, and reseller services. Availability, fees, data handling, and limits depend on the configured provider contracts." },
} as const;
