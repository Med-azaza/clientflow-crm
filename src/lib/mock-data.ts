import {
  Archive,
  BarChart3,
  CheckCircle2,
  Clock3,
  FileSpreadsheet,
  FileText,
  FolderKanban,
  MessageSquareText,
  Upload,
} from "lucide-react";

export type Status =
  | "Active"
  | "Planning"
  | "In Progress"
  | "Review"
  | "In Review"
  | "Completed"
  | "Pending"
  | "Paid"
  | "Overdue"
  | "Draft"
  | "Shared"
  | "Private";

export type Priority = "Low" | "Medium" | "High" | "Urgent";

export type TeamMember = {
  id: string;
  name: string;
  role: string;
  avatar: string;
  initials: string;
  workload: number;
  projects: number;
  status: "Active" | "Away";
};

export type Client = {
  id: string;
  name: string;
  company: string;
  email: string;
  activeProjects: number;
  revenue: number;
  status: Status;
  lastContact: string;
  health: number;
  avatar: string;
  initials: string;
};

export type Project = {
  id: string;
  slug: string;
  name: string;
  client: string;
  company: string;
  status: Status;
  priority: Priority;
  budget: number;
  budgetUsed: number;
  dueDate: string;
  createdAt: string;
  progress: number;
  leadId: string;
  assigneeIds: string[];
  column: "Planning" | "In Progress" | "Review" | "Completed";
  comments: number;
  files: number;
};

export type Task = {
  id: string;
  title: string;
  project: string;
  client: string;
  assigneeId: string;
  priority: Priority;
  status: Status;
  dueDate: string;
};

export type Invoice = {
  id: string;
  client: string;
  project: string;
  amount: number;
  dueDate: string;
  status: Status;
};

export type ClientFile = {
  id: string;
  name: string;
  type: string;
  client: string;
  project: string;
  size: string;
  uploadedBy: string;
  date: string;
  status: Status;
};

export type Message = {
  id: string;
  sender: string;
  role: string;
  preview: string;
  body: string;
  time: string;
  project: string;
  unread?: boolean;
};

export type ActivityLog = {
  id: string;
  title: string;
  detail: string;
  time: string;
  tone: "blue" | "green" | "red" | "gray";
};

export const teamMembers: TeamMember[] = [
  {
    id: "olivia",
    name: "Olivia Jenkins",
    role: "Account Lead",
    avatar: "OJ",
    initials: "OJ",
    workload: 92,
    projects: 8,
    status: "Active",
  },
  {
    id: "sam",
    name: "Sam Walker",
    role: "Design Lead",
    avatar: "SW",
    initials: "SW",
    workload: 76,
    projects: 6,
    status: "Active",
  },
  {
    id: "emily",
    name: "Emily Carter",
    role: "Project Manager",
    avatar: "EC",
    initials: "EC",
    workload: 68,
    projects: 5,
    status: "Active",
  },
  {
    id: "michael",
    name: "Michael Scott",
    role: "Account Manager",
    avatar: "MS",
    initials: "MS",
    workload: 58,
    projects: 4,
    status: "Away",
  },
  {
    id: "anna",
    name: "Anna Dorsey",
    role: "Operations Lead",
    avatar: "AD",
    initials: "AD",
    workload: 64,
    projects: 5,
    status: "Active",
  },
];

export const clients: Client[] = [
  {
    id: "acme",
    name: "Conor O'Brien",
    company: "Acme Corp",
    email: "conor@acmecorp.com",
    activeProjects: 3,
    revenue: 12450,
    status: "Active",
    lastContact: "Today",
    health: 98,
    avatar: "CO",
    initials: "AC",
  },
  {
    id: "horizon",
    name: "Maya Patel",
    company: "Horizon Ventures",
    email: "maya@horizon.vc",
    activeProjects: 2,
    revenue: 32600,
    status: "Active",
    lastContact: "Yesterday",
    health: 94,
    avatar: "MP",
    initials: "HV",
  },
  {
    id: "stellar",
    name: "Olivia Jenkins",
    company: "Stellar Designs",
    email: "olivia@stellardesigns.co",
    activeProjects: 4,
    revenue: 42150,
    status: "Active",
    lastContact: "2 days ago",
    health: 91,
    avatar: "OJ",
    initials: "SD",
  },
  {
    id: "vertex",
    name: "Jessica Taylor",
    company: "Vertex Solutions",
    email: "jessica@vertexsolutions.io",
    activeProjects: 1,
    revenue: 8900,
    status: "Pending",
    lastContact: "Jun 18",
    health: 82,
    avatar: "JT",
    initials: "VS",
  },
  {
    id: "cloudscale",
    name: "Jacob Peterson",
    company: "CloudScale Apps",
    email: "jacob@cloudscaleapps.com",
    activeProjects: 7,
    revenue: 45800,
    status: "Active",
    lastContact: "Jun 16",
    health: 88,
    avatar: "JP",
    initials: "CA",
  },
];

export const projects: Project[] = [
  {
    id: "p1",
    slug: "website-redesign",
    name: "Website Redesign",
    client: "Conor O'Brien",
    company: "Acme Corp",
    status: "In Progress",
    priority: "Urgent",
    budget: 25000,
    budgetUsed: 18750,
    dueDate: "Nov 15",
    createdAt: "Oct 12, 2026",
    progress: 64,
    leadId: "michael",
    assigneeIds: ["michael", "sam", "emily"],
    column: "In Progress",
    comments: 8,
    files: 14,
  },
  {
    id: "p2",
    slug: "brand-refresh-2024",
    name: "Brand Refresh 2024",
    client: "Maya Patel",
    company: "Horizon Ventures",
    status: "Planning",
    priority: "Medium",
    budget: 12500,
    budgetUsed: 3200,
    dueDate: "Oct 12",
    createdAt: "Sep 24, 2026",
    progress: 28,
    leadId: "sam",
    assigneeIds: ["sam", "olivia"],
    column: "Planning",
    comments: 4,
    files: 2,
  },
  {
    id: "p3",
    slug: "crm-migration-tool",
    name: "CRM Migration Tool",
    client: "Jacob Peterson",
    company: "CloudScale Apps",
    status: "In Progress",
    priority: "Urgent",
    budget: 22000,
    budgetUsed: 14300,
    dueDate: "Sep 30",
    createdAt: "Sep 05, 2026",
    progress: 65,
    leadId: "olivia",
    assigneeIds: ["olivia", "michael"],
    column: "In Progress",
    comments: 6,
    files: 9,
  },
  {
    id: "p4",
    slug: "mobile-app-prototype",
    name: "Mobile App Prototype",
    client: "Jessica Taylor",
    company: "Vertex Solutions",
    status: "Review",
    priority: "High",
    budget: 15700,
    budgetUsed: 13200,
    dueDate: "Oct 05",
    createdAt: "Aug 28, 2026",
    progress: 84,
    leadId: "emily",
    assigneeIds: ["emily", "sam"],
    column: "Review",
    comments: 11,
    files: 7,
  },
  {
    id: "p5",
    slug: "ui-ux-audit",
    name: "UI/UX Audit",
    client: "Olivia Jenkins",
    company: "Stellar Designs",
    status: "Completed",
    priority: "Low",
    budget: 4800,
    budgetUsed: 4800,
    dueDate: "Sep 15",
    createdAt: "Aug 02, 2026",
    progress: 100,
    leadId: "anna",
    assigneeIds: ["anna"],
    column: "Completed",
    comments: 3,
    files: 5,
  },
  {
    id: "p6",
    slug: "q3-marketing-strategy",
    name: "Q3 Marketing Strategy",
    client: "Maya Patel",
    company: "Horizon Ventures",
    status: "Planning",
    priority: "High",
    budget: 8500,
    budgetUsed: 1900,
    dueDate: "Oct 21",
    createdAt: "Sep 18, 2026",
    progress: 22,
    leadId: "olivia",
    assigneeIds: ["olivia", "emily"],
    column: "Planning",
    comments: 5,
    files: 4,
  },
];

export const tasks: Task[] = [
  {
    id: "t1",
    title: "Design System Documentation",
    project: "Website Redesign",
    client: "Acme Corp",
    assigneeId: "emily",
    priority: "High",
    status: "In Review",
    dueDate: "Today",
  },
  {
    id: "t2",
    title: "Main Landing Page Mockup",
    project: "Website Redesign",
    client: "Acme Corp",
    assigneeId: "michael",
    priority: "Medium",
    status: "In Progress",
    dueDate: "Tomorrow",
  },
  {
    id: "t3",
    title: "Approve API Sync Budget",
    project: "CRM Migration Tool",
    client: "CloudScale Apps",
    assigneeId: "anna",
    priority: "Urgent",
    status: "Pending",
    dueDate: "Today",
  },
  {
    id: "t4",
    title: "Finalize Q3 Campaign Brief",
    project: "Q3 Marketing Strategy",
    client: "Horizon Ventures",
    assigneeId: "olivia",
    priority: "High",
    status: "Completed",
    dueDate: "Jun 20",
  },
  {
    id: "t5",
    title: "Mobile Prototype QA Notes",
    project: "Mobile App Prototype",
    client: "Vertex Solutions",
    assigneeId: "sam",
    priority: "Low",
    status: "In Progress",
    dueDate: "Jun 24",
  },
];

export const invoices: Invoice[] = [
  {
    id: "INV-2026-042",
    client: "Acme Corp",
    project: "Website Redesign",
    amount: 4200,
    dueDate: "Jun 28",
    status: "Pending",
  },
  {
    id: "INV-2026-041",
    client: "Horizon Ventures",
    project: "Brand Refresh 2024",
    amount: 8900,
    dueDate: "Jun 18",
    status: "Overdue",
  },
  {
    id: "INV-2026-040",
    client: "Stellar Designs",
    project: "UI/UX Audit",
    amount: 4800,
    dueDate: "Jun 12",
    status: "Paid",
  },
  {
    id: "INV-2026-039",
    client: "CloudScale Apps",
    project: "CRM Migration Tool",
    amount: 11000,
    dueDate: "Jul 05",
    status: "Draft",
  },
];

export const files: ClientFile[] = [
  {
    id: "f1",
    name: "Brand_Guidelines.pdf",
    type: "PDF",
    client: "Horizon Ventures",
    project: "Brand Refresh 2024",
    size: "4.2 MB",
    uploadedBy: "Sam Walker",
    date: "Jun 19",
    status: "Shared",
  },
  {
    id: "f2",
    name: "Logo_Assets_v2.zip",
    type: "Archive",
    client: "Stellar Designs",
    project: "UI/UX Audit",
    size: "28 MB",
    uploadedBy: "Emily Carter",
    date: "Jun 18",
    status: "Private",
  },
  {
    id: "f3",
    name: "Budget_Q4.xlsx",
    type: "Spreadsheet",
    client: "Acme Corp",
    project: "Website Redesign",
    size: "1.1 MB",
    uploadedBy: "Anna Dorsey",
    date: "Jun 17",
    status: "Shared",
  },
  {
    id: "f4",
    name: "Prototype_Review.mov",
    type: "Video",
    client: "Vertex Solutions",
    project: "Mobile App Prototype",
    size: "86 MB",
    uploadedBy: "Olivia Jenkins",
    date: "Jun 14",
    status: "Shared",
  },
];

export const messages: Message[] = [
  {
    id: "m1",
    sender: "Conor O'Brien",
    role: "Acme Corp",
    preview: "Can we approve the homepage direction today?",
    body: "The homepage direction looks strong. Can we approve it today so your team can move into the remaining service pages?",
    time: "12m ago",
    project: "Website Redesign",
    unread: true,
  },
  {
    id: "m2",
    sender: "Maya Patel",
    role: "Horizon Ventures",
    preview: "The brand board is ready for legal review.",
    body: "The brand board is ready for legal review. Please send the latest logo lockups and color accessibility notes.",
    time: "1h ago",
    project: "Brand Refresh 2024",
  },
  {
    id: "m3",
    sender: "Jacob Peterson",
    role: "CloudScale Apps",
    preview: "Budget approved for API migration scope.",
    body: "Budget is approved for the API migration scope. We can start staging data next week if the task list is ready.",
    time: "3h ago",
    project: "CRM Migration Tool",
  },
];

export const activityLogs: ActivityLog[] = [
  {
    id: "a1",
    title: "Task Completed",
    detail: 'Emily C. finished "Moodboard Approval"',
    time: "2 hours ago",
    tone: "green",
  },
  {
    id: "a2",
    title: "New Comment",
    detail: "Michael S. replied to the design file discussion.",
    time: "5 hours ago",
    tone: "blue",
  },
  {
    id: "a3",
    title: "File Uploaded",
    detail: "Acme_Corp_Brief_V2.pdf",
    time: "Yesterday",
    tone: "red",
  },
];

export const actionQueue = [
  {
    id: "q1",
    title: "Review Contract",
    detail: "Acme Corp update waiting",
    icon: FileText,
  },
  {
    id: "q2",
    title: "Follow up Invoice",
    detail: "Horizon Ventures - 3 days late",
    icon: BarChart3,
  },
  {
    id: "q3",
    title: "New Proposal",
    detail: "Review Stellar Designs draft",
    icon: MessageSquareText,
  },
];

export const fileTypeIcons = {
  Archive,
  PDF: FileText,
  Spreadsheet: FileSpreadsheet,
  Video: Upload,
};

export const dashboardHighlights = [
  {
    label: "Active Clients",
    value: "12",
    icon: CheckCircle2,
    tone: "green",
    href: "/clients",
  },
  {
    label: "Active Projects",
    value: "8",
    icon: FolderKanban,
    tone: "blue",
    href: "/projects",
  },
  {
    label: "Tasks Due",
    value: "5",
    icon: Clock3,
    tone: "amber",
    href: "/tasks",
  },
  {
    label: "Unpaid Invoices",
    value: "$4.2k",
    icon: Archive,
    tone: "red",
    href: "/invoices",
  },
] as const;
