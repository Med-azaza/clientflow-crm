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

export type Role = "owner" | "admin" | "member" | "client";

export type Profile = {
  id: string;
  fullName: string;
  avatarUrl: string | null;
  email: string;
};

export type Organization = {
  id: string;
  name: string;
  slug: string;
  ownerId: string;
};

export type OrganizationMember = {
  id: string;
  userId: string;
  organizationId: string;
  role: Role;
  name: string;
  email: string;
  avatarUrl: string | null;
  initials: string;
  workload: number;
  projects: number;
  status: "Active" | "Away";
};

export type ClientRecord = {
  id: string;
  name: string;
  company: string;
  email: string;
  phone: string | null;
  activeProjects: number;
  revenue: number;
  status: Status;
  lastContact: string;
  health: number;
  avatar: string;
  initials: string;
};

export type ProjectRecord = {
  id: string;
  slug: string;
  name: string;
  clientId: string | null;
  client: string;
  company: string;
  status: Status;
  priority: Priority;
  budget: number;
  budgetUsed: number;
  dueDate: string;
  startsAt: string | null;
  createdAt: string;
  progress: number;
  leadId: string | null;
  assigneeIds: string[];
  column: "Planning" | "In Progress" | "Review" | "Completed";
  comments: number;
  files: number;
};

export type TaskRecord = {
  id: string;
  title: string;
  description: string | null;
  projectId: string | null;
  project: string;
  client: string;
  assigneeId: string | null;
  assigneeName: string;
  assigneeInitials: string;
  priority: Priority;
  status: Status;
  dueDate: string;
};

export type InvoiceRecord = {
  id: string;
  clientId: string | null;
  projectId: string | null;
  invoiceNumber: string;
  client: string;
  project: string;
  amount: number;
  dueDate: string;
  issuedAt: string | null;
  paidAt: string | null;
  status: Status;
};

export type FileRecord = {
  id: string;
  name: string;
  type: string;
  mimeType: string | null;
  storagePath: string;
  clientId: string | null;
  projectId: string | null;
  client: string;
  project: string;
  size: string;
  sizeBytes: number;
  uploadedBy: string;
  date: string;
  status: Status;
};

export type MessageRecord = {
  id: string;
  sender: string;
  role: string;
  preview: string;
  body: string;
  time: string;
  project: string;
  clientId: string | null;
  projectId: string | null;
  mine: boolean;
  unread?: boolean;
};

export type ActivityLogRecord = {
  id: string;
  title: string;
  detail: string;
  time: string;
  tone: "blue" | "green" | "red" | "gray";
};

export type DashboardIconName =
  | "archive"
  | "bar-chart"
  | "check-circle"
  | "clock"
  | "file-text"
  | "folder-kanban"
  | "message-square-text";

export type MetricHighlight = {
  label: string;
  value: string;
  href: string;
  tone: "blue" | "green" | "red" | "amber";
  icon: DashboardIconName;
};

export type ActionQueueItem = {
  id: string;
  title: string;
  detail: string;
  icon: DashboardIconName;
};

export type SelectOption = {
  id: string;
  name: string;
  label?: string;
};
