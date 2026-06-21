import { Archive, FileSpreadsheet, FileText, Upload } from "lucide-react";
import { redirect } from "next/navigation";
import type {
  ActionQueueItem,
  ActivityLogRecord,
  ClientRecord,
  FileRecord,
  InvoiceRecord,
  MessageRecord,
  MetricHighlight,
  Organization,
  OrganizationMember,
  Priority,
  Profile,
  ProjectRecord,
  Role,
  Status,
  TaskRecord,
} from "@/lib/app-types";
import { createClient } from "@/lib/supabase/server";
import { formatCurrency, formatDate, initialsFor } from "@/lib/utils";

// biome-ignore lint/suspicious/noExplicitAny: Supabase rows are untyped without generated database types.
type AnyRecord = Record<string, any>;

export const fileTypeIcons = {
  Archive,
  PDF: FileText,
  Spreadsheet: FileSpreadsheet,
  Video: Upload,
};

function statusValue(value: unknown, fallback: Status): Status {
  return String(value || fallback) as Status;
}

function priorityValue(
  value: unknown,
  fallback: Priority = "Medium",
): Priority {
  return String(value || fallback) as Priority;
}

function projectColumn(status: string): ProjectRecord["column"] {
  if (status === "Completed") {
    return "Completed";
  }

  if (status === "Review" || status === "In Review") {
    return "Review";
  }

  if (status === "In Progress") {
    return "In Progress";
  }

  return "Planning";
}

function fileTypeFor(mimeType: string | null | undefined, name: string) {
  if (mimeType?.includes("pdf") || name.toLowerCase().endsWith(".pdf")) {
    return "PDF";
  }

  if (
    mimeType?.includes("zip") ||
    mimeType?.includes("compressed") ||
    name.toLowerCase().endsWith(".zip")
  ) {
    return "Archive";
  }

  if (
    mimeType?.includes("spreadsheet") ||
    name.toLowerCase().endsWith(".xlsx") ||
    name.toLowerCase().endsWith(".csv")
  ) {
    return "Spreadsheet";
  }

  if (mimeType?.startsWith("video/")) {
    return "Video";
  }

  return "File";
}

function formatBytes(bytes: number | null | undefined) {
  const value = Number(bytes ?? 0);

  if (value < 1000) {
    return `${value} B`;
  }

  const units = ["KB", "MB", "GB", "TB"];
  let size = value / 1000;
  let unitIndex = 0;

  while (size >= 1000 && unitIndex < units.length - 1) {
    size /= 1000;
    unitIndex += 1;
  }

  return `${size.toFixed(size >= 10 ? 0 : 1)} ${units[unitIndex]}`;
}

function relativeTime(value: string | null | undefined) {
  if (!value) {
    return "Not set";
  }

  const date = new Date(value);
  const diff = Date.now() - date.getTime();
  const minutes = Math.round(diff / 60000);

  if (Number.isNaN(minutes)) {
    return formatDate(value);
  }

  if (minutes < 1) {
    return "Just now";
  }

  if (minutes < 60) {
    return `${minutes}m ago`;
  }

  const hours = Math.round(minutes / 60);

  if (hours < 24) {
    return `${hours}h ago`;
  }

  return formatDate(value);
}

export async function getCurrentContext() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  const userId = data?.claims?.sub;

  if (!userId) {
    redirect("/login");
  }

  await supabase.rpc("ensure_user_workspace");

  const { data: membership } = await supabase
    .from("organization_members")
    .select("id, organization_id, role")
    .eq("user_id", userId)
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();

  if (!membership) {
    redirect("/login");
  }

  const [{ data: organization }, { data: profile }] = await Promise.all([
    supabase
      .from("organizations")
      .select("id, name, slug, owner_id")
      .eq("id", membership.organization_id)
      .single(),
    supabase
      .from("profiles")
      .select("id, full_name, avatar_url, email")
      .eq("id", userId)
      .single(),
  ]);

  return {
    organization: {
      id: organization?.id ?? membership.organization_id,
      name: organization?.name ?? "ClientFlow Workspace",
      ownerId: organization?.owner_id ?? userId,
      slug: organization?.slug ?? "clientflow-workspace",
    } satisfies Organization,
    profile: {
      avatarUrl: profile?.avatar_url ?? null,
      email: profile?.email ?? String(data.claims.email ?? ""),
      fullName:
        profile?.full_name ??
        String(data.claims.user_metadata?.full_name ?? data.claims.email ?? ""),
      id: userId,
    } satisfies Profile,
    role: membership.role as Role,
    supabase,
    userId,
  };
}

export async function getWorkspaceData() {
  const context = await getCurrentContext();
  const orgId = context.organization.id;
  const supabase = context.supabase;

  const [
    clientsResult,
    projectsResult,
    tasksResult,
    invoicesResult,
    filesResult,
    messagesResult,
    activityResult,
    membersResult,
  ] = await Promise.all([
    supabase
      .from("clients")
      .select("*")
      .eq("organization_id", orgId)
      .order("created_at", { ascending: false }),
    supabase
      .from("projects")
      .select("*")
      .eq("organization_id", orgId)
      .order("created_at", { ascending: false }),
    supabase
      .from("tasks")
      .select("*")
      .eq("organization_id", orgId)
      .order("created_at", { ascending: false }),
    supabase
      .from("invoices")
      .select("*")
      .eq("organization_id", orgId)
      .order("created_at", { ascending: false }),
    supabase
      .from("files")
      .select("*")
      .eq("organization_id", orgId)
      .order("created_at", { ascending: false }),
    supabase
      .from("messages")
      .select("*")
      .eq("organization_id", orgId)
      .order("created_at", { ascending: false }),
    supabase
      .from("activity_logs")
      .select("*")
      .eq("organization_id", orgId)
      .order("created_at", { ascending: false })
      .limit(12),
    supabase
      .from("organization_members")
      .select("id, organization_id, user_id, role, created_at")
      .eq("organization_id", orgId)
      .order("created_at", { ascending: true }),
  ]);

  const rawClients = (clientsResult.data ?? []) as AnyRecord[];
  const rawProjects = (projectsResult.data ?? []) as AnyRecord[];
  const rawTasks = (tasksResult.data ?? []) as AnyRecord[];
  const rawInvoices = (invoicesResult.data ?? []) as AnyRecord[];
  const rawFiles = (filesResult.data ?? []) as AnyRecord[];
  const rawMessages = (messagesResult.data ?? []) as AnyRecord[];
  const rawActivity = (activityResult.data ?? []) as AnyRecord[];
  const rawMembers = (membersResult.data ?? []) as AnyRecord[];
  const memberIds = rawMembers.map((member) => member.user_id).filter(Boolean);

  const { data: profileRows } = memberIds.length
    ? await supabase
        .from("profiles")
        .select("id, full_name, avatar_url, email")
        .in("id", memberIds)
    : { data: [] };

  const profiles = new Map(
    ((profileRows ?? []) as AnyRecord[]).map((profile) => [
      profile.id,
      profile,
    ]),
  );
  const clientMap = new Map(rawClients.map((client) => [client.id, client]));
  const projectMap = new Map(
    rawProjects.map((project) => [project.id, project]),
  );

  const members: OrganizationMember[] = rawMembers.map((member, index) => {
    const profile = profiles.get(member.user_id) ?? {};
    const fullName =
      profile.full_name || profile.email || `Team Member ${index + 1}`;
    const projectCount = rawTasks.filter(
      (task) => task.assignee_id === member.user_id,
    ).length;

    return {
      avatarUrl: profile.avatar_url ?? null,
      email: profile.email ?? "",
      id: member.id,
      initials: initialsFor(fullName),
      name: fullName,
      organizationId: member.organization_id,
      projects: projectCount,
      role: member.role,
      status: "Active",
      userId: member.user_id,
      workload: Math.min(96, Math.max(18, projectCount * 18)),
    };
  });

  const memberMap = new Map(members.map((member) => [member.userId, member]));

  const clients: ClientRecord[] = rawClients.map((client) => {
    const activeProjects = rawProjects.filter(
      (project) =>
        project.client_id === client.id && project.status !== "Completed",
    ).length;
    const revenue = Number(client.total_revenue ?? 0);

    return {
      activeProjects,
      avatar: initialsFor(client.name),
      company: client.company ?? client.name,
      email: client.email ?? "",
      health: Number(client.health_score ?? 80),
      id: client.id,
      initials: initialsFor(client.company ?? client.name),
      lastContact: client.last_contact_at
        ? formatDate(client.last_contact_at)
        : "No contact yet",
      name: client.name ?? client.company ?? "Client",
      phone: client.phone ?? null,
      revenue,
      status: statusValue(client.status, "Active"),
    };
  });

  const projects: ProjectRecord[] = rawProjects.map((project) => {
    const client = project.client_id ? clientMap.get(project.client_id) : null;
    const projectTasks = rawTasks.filter(
      (task) => task.project_id === project.id,
    );
    const assigneeIds = Array.from(
      new Set(projectTasks.map((task) => task.assignee_id).filter(Boolean)),
    );
    const paidAmount = rawInvoices
      .filter(
        (invoice) =>
          invoice.project_id === project.id && invoice.status === "Paid",
      )
      .reduce((total, invoice) => total + Number(invoice.amount ?? 0), 0);

    return {
      assigneeIds,
      budget: Number(project.budget ?? 0),
      budgetUsed: paidAmount,
      client: client?.name ?? "Unassigned contact",
      clientId: project.client_id ?? null,
      column: projectColumn(project.status),
      comments: rawMessages.filter(
        (message) => message.project_id === project.id,
      ).length,
      company: client?.company ?? "Unassigned client",
      createdAt: formatDate(project.created_at),
      dueDate: project.due_at ? formatDate(project.due_at) : "No due date",
      files: rawFiles.filter((file) => file.project_id === project.id).length,
      id: project.id,
      leadId: assigneeIds[0] ?? null,
      name: project.name,
      priority: priorityValue(project.priority),
      progress: Number(project.progress ?? 0),
      slug: project.slug,
      startsAt: project.starts_at ?? null,
      status: statusValue(project.status, "Planning"),
    };
  });

  const tasks: TaskRecord[] = rawTasks.map((task) => {
    const project = task.project_id ? projectMap.get(task.project_id) : null;
    const client = project?.client_id ? clientMap.get(project.client_id) : null;
    const assignee = task.assignee_id ? memberMap.get(task.assignee_id) : null;

    return {
      assigneeId: task.assignee_id ?? null,
      assigneeInitials: initialsFor(assignee?.name),
      assigneeName: assignee?.name ?? "Unassigned",
      client: client?.company ?? "Unassigned client",
      description: task.description ?? null,
      dueDate: task.due_at ? formatDate(task.due_at) : "No due date",
      id: task.id,
      priority: priorityValue(task.priority),
      project: project?.name ?? "Unassigned project",
      projectId: task.project_id ?? null,
      status: statusValue(task.status, "Pending"),
      title: task.title,
    };
  });

  const invoices: InvoiceRecord[] = rawInvoices.map((invoice) => {
    const project = invoice.project_id
      ? projectMap.get(invoice.project_id)
      : null;
    const client = invoice.client_id ? clientMap.get(invoice.client_id) : null;

    return {
      amount: Number(invoice.amount ?? 0),
      client: client?.company ?? "Unassigned client",
      clientId: invoice.client_id ?? null,
      dueDate: invoice.due_at ? formatDate(invoice.due_at) : "No due date",
      id: invoice.id,
      invoiceNumber: invoice.invoice_number,
      issuedAt: invoice.issued_at ?? null,
      paidAt: invoice.paid_at ?? null,
      project: project?.name ?? "Unassigned project",
      projectId: invoice.project_id ?? null,
      status: statusValue(invoice.status, "Draft"),
    };
  });

  const files: FileRecord[] = rawFiles.map((file) => {
    const project = file.project_id ? projectMap.get(file.project_id) : null;
    const client = file.client_id ? clientMap.get(file.client_id) : null;
    const uploader = file.uploaded_by ? memberMap.get(file.uploaded_by) : null;

    return {
      client: client?.company ?? "Unassigned client",
      clientId: file.client_id ?? null,
      date: formatDate(file.created_at),
      id: file.id,
      mimeType: file.mime_type ?? null,
      name: file.name,
      project: project?.name ?? "Unassigned project",
      projectId: file.project_id ?? null,
      size: formatBytes(file.size_bytes),
      sizeBytes: Number(file.size_bytes ?? 0),
      status: file.shared_with_client ? "Shared" : "Private",
      storagePath: file.storage_path,
      type: fileTypeFor(file.mime_type, file.name),
      uploadedBy: uploader?.name ?? "Current user",
    };
  });

  const messages: MessageRecord[] = rawMessages.map((message) => {
    const sender = message.sender_id ? memberMap.get(message.sender_id) : null;
    const project = message.project_id
      ? projectMap.get(message.project_id)
      : null;
    const client = message.client_id ? clientMap.get(message.client_id) : null;

    return {
      body: message.body,
      clientId: message.client_id ?? null,
      id: message.id,
      mine: message.sender_id === context.userId,
      preview: message.body,
      project: project?.name ?? "General",
      projectId: message.project_id ?? null,
      role: client?.company ?? sender?.role ?? "Workspace",
      sender: sender?.name ?? client?.name ?? "ClientFlow",
      time: relativeTime(message.created_at),
    };
  });

  const activityLogs: ActivityLogRecord[] = rawActivity.map((event) => ({
    detail: event.metadata?.detail ?? event.entity_type ?? "Workspace update",
    id: event.id,
    time: relativeTime(event.created_at),
    title: event.action ?? "Activity",
    tone: "blue",
  }));

  const dashboardHighlights: MetricHighlight[] = [
    {
      href: "/clients",
      icon: "check-circle",
      label: "Active Clients",
      tone: "green",
      value: String(
        clients.filter((client) => client.status === "Active").length,
      ),
    },
    {
      href: "/projects",
      icon: "folder-kanban",
      label: "Active Projects",
      tone: "blue",
      value: String(
        projects.filter((project) => project.status !== "Completed").length,
      ),
    },
    {
      href: "/tasks",
      icon: "clock",
      label: "Tasks Due",
      tone: "amber",
      value: String(tasks.filter((task) => task.status !== "Completed").length),
    },
    {
      href: "/invoices",
      icon: "archive",
      label: "Unpaid Invoices",
      tone: "red",
      value: formatCurrency(
        invoices
          .filter((invoice) => ["Pending", "Overdue"].includes(invoice.status))
          .reduce((total, invoice) => total + invoice.amount, 0),
      ),
    },
  ];

  const actionQueue: ActionQueueItem[] = [
    {
      detail:
        invoices.find((invoice) => invoice.status === "Overdue")?.client ??
        "No overdue invoices",
      icon: "bar-chart",
      id: "invoice-follow-up",
      title: "Follow up Invoice",
    },
    {
      detail:
        tasks.find((task) => task.status !== "Completed")?.title ??
        "No open tasks",
      icon: "file-text",
      id: "task-review",
      title: "Review Open Task",
    },
    {
      detail: messages[0]?.preview ?? "Client conversations will appear here",
      icon: "message-square-text",
      id: "message-reply",
      title: "Reply to Message",
    },
  ];

  return {
    ...context,
    actionQueue,
    activityLogs,
    clients,
    dashboardHighlights,
    files,
    invoices,
    members,
    messages,
    projects,
    tasks,
  };
}

export async function getProjectWorkspaceData(id: string) {
  const data = await getWorkspaceData();
  const project = data.projects.find(
    (item) => item.slug === id || item.id === id,
  );

  return {
    ...data,
    project,
    projectFiles: data.files.filter((file) => file.projectId === project?.id),
    projectInvoices: data.invoices.filter(
      (invoice) => invoice.projectId === project?.id,
    ),
    projectMessages: data.messages.filter(
      (message) => message.projectId === project?.id,
    ),
    projectTasks: data.tasks.filter((task) => task.projectId === project?.id),
  };
}
