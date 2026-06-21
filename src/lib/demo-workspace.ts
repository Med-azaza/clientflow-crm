import "server-only";

import type { createClient } from "@/lib/supabase/server";

type SupabaseServerClient = Awaited<ReturnType<typeof createClient>>;

// biome-ignore lint/suspicious/noExplicitAny: Supabase rows are untyped without generated database types.
type AnyRecord = Record<string, any>;

type DemoSeedInput = {
  email: string | null | undefined;
  organizationId?: string | null;
  supabase: SupabaseServerClient;
  userId: string;
};

const DEMO_WORKSPACE_NAME = "ClientFlow Demo Workspace";
const DEMO_BLOCKED_MESSAGE =
  "Demo workspace sample records cannot be deleted or administratively changed.";

const demoClients = [
  {
    company: "Acme Corp",
    email: "conor@acmecorp.com",
    health_score: 98,
    last_contact_at: offsetTimestamp(0),
    name: "Conor O'Brien",
    phone: "+1 415 555 0198",
    status: "Active",
    total_revenue: 12_450,
  },
  {
    company: "Horizon Ventures",
    email: "maya@horizon.vc",
    health_score: 94,
    last_contact_at: offsetTimestamp(-1),
    name: "Maya Patel",
    phone: "+1 212 555 0147",
    status: "Active",
    total_revenue: 32_600,
  },
  {
    company: "Stellar Designs",
    email: "olivia@stellardesigns.co",
    health_score: 91,
    last_contact_at: offsetTimestamp(-2),
    name: "Olivia Jenkins",
    phone: "+1 310 555 0112",
    status: "Active",
    total_revenue: 42_150,
  },
  {
    company: "Vertex Solutions",
    email: "jessica@vertexsolutions.io",
    health_score: 82,
    last_contact_at: offsetTimestamp(-3),
    name: "Jessica Taylor",
    phone: "+1 312 555 0166",
    status: "Pending",
    total_revenue: 8_900,
  },
  {
    company: "CloudScale Apps",
    email: "jacob@cloudscaleapps.com",
    health_score: 88,
    last_contact_at: offsetTimestamp(-5),
    name: "Jacob Peterson",
    phone: "+1 646 555 0184",
    status: "Active",
    total_revenue: 45_800,
  },
] as const;

const demoProjects = [
  {
    budget: 25_000,
    clientCompany: "Acme Corp",
    description: "Homepage, service pages, and approval workflow.",
    due_at: offsetDate(24),
    name: "Website Redesign",
    priority: "Urgent",
    progress: 64,
    slug: "website-redesign",
    starts_at: offsetDate(-20),
    status: "In Progress",
  },
  {
    budget: 12_500,
    clientCompany: "Horizon Ventures",
    description: "Brand board and legal review assets.",
    due_at: offsetDate(18),
    name: "Brand Refresh 2024",
    priority: "Medium",
    progress: 28,
    slug: "brand-refresh-2024",
    starts_at: offsetDate(-20),
    status: "Planning",
  },
  {
    budget: 22_000,
    clientCompany: "CloudScale Apps",
    description: "Data migration and invoice workflow.",
    due_at: offsetDate(30),
    name: "CRM Migration Tool",
    priority: "Urgent",
    progress: 65,
    slug: "crm-migration-tool",
    starts_at: offsetDate(-20),
    status: "In Progress",
  },
  {
    budget: 15_700,
    clientCompany: "Vertex Solutions",
    description: "Clickable prototype and QA notes.",
    due_at: offsetDate(14),
    name: "Mobile App Prototype",
    priority: "High",
    progress: 84,
    slug: "mobile-app-prototype",
    starts_at: offsetDate(-20),
    status: "Review",
  },
  {
    budget: 4_800,
    clientCompany: "Stellar Designs",
    description: "Design audit and recommendations.",
    due_at: offsetDate(-10),
    name: "UI/UX Audit",
    priority: "Low",
    progress: 100,
    slug: "ui-ux-audit",
    starts_at: offsetDate(-35),
    status: "Completed",
  },
] as const;

const demoTasks = [
  {
    due_at: offsetDate(0),
    priority: "High",
    projectName: "Website Redesign",
    status: "In Review",
    title: "Design System Documentation",
  },
  {
    due_at: offsetDate(1),
    priority: "Medium",
    projectName: "Website Redesign",
    status: "In Progress",
    title: "Main Landing Page Mockup",
  },
  {
    due_at: offsetDate(2),
    priority: "High",
    projectName: "Website Redesign",
    status: "Pending",
    title: "Homepage Responsive QA",
  },
  {
    due_at: offsetDate(4),
    priority: "Urgent",
    projectName: "CRM Migration Tool",
    status: "Pending",
    title: "Prepare Client Approval Checklist",
  },
  {
    due_at: offsetDate(6),
    priority: "Medium",
    projectName: "Brand Refresh 2024",
    status: "In Progress",
    title: "Upload Brand Assets",
  },
] as const;

const demoInvoices = [
  {
    amount: 4_200,
    due_at: offsetDate(7),
    invoice_number: "INV-2026-042",
    issued_at: offsetDate(-10),
    projectName: "Website Redesign",
    status: "Pending",
  },
  {
    amount: 8_900,
    due_at: offsetDate(-3),
    invoice_number: "INV-2026-041",
    issued_at: offsetDate(-18),
    projectName: "Brand Refresh 2024",
    status: "Overdue",
  },
  {
    amount: 4_800,
    due_at: offsetDate(-9),
    invoice_number: "INV-2026-040",
    issued_at: offsetDate(-24),
    paid_at: offsetDate(-2),
    projectName: "UI/UX Audit",
    status: "Paid",
  },
  {
    amount: 11_000,
    due_at: offsetDate(16),
    invoice_number: "INV-2026-039",
    issued_at: offsetDate(-5),
    projectName: "CRM Migration Tool",
    status: "Draft",
  },
] as const;

const demoFiles = [
  {
    clientCompany: "Horizon Ventures",
    content: "Demo brand guidelines placeholder for Horizon Ventures.",
    mime_type: "application/pdf",
    name: "Brand_Guidelines.pdf",
    projectName: "Brand Refresh 2024",
    shared_with_client: true,
    size_bytes: 4200,
  },
  {
    clientCompany: "Stellar Designs",
    content: "Demo compressed logo archive placeholder for Stellar Designs.",
    mime_type: "application/zip",
    name: "Logo_Assets_v2.zip",
    projectName: "UI/UX Audit",
    shared_with_client: false,
    size_bytes: 28_000,
  },
  {
    clientCompany: "Acme Corp",
    content: "Demo spreadsheet placeholder for Acme Corp Q4 budget.",
    mime_type: "text/csv",
    name: "Budget_Q4.csv",
    projectName: "Website Redesign",
    shared_with_client: true,
    size_bytes: 1100,
  },
  {
    clientCompany: "Vertex Solutions",
    content: "Demo prototype review placeholder for Vertex Solutions.",
    mime_type: "text/plain",
    name: "Prototype_Review.txt",
    projectName: "Mobile App Prototype",
    shared_with_client: true,
    size_bytes: 8600,
  },
] as const;

const demoMessages = [
  {
    body: "The homepage direction looks strong. Can we approve it today so your team can move into the remaining service pages?",
    clientCompany: "Acme Corp",
    projectName: "Website Redesign",
  },
  {
    body: "The brand board is ready for legal review. Please send the latest logo lockups and color accessibility notes.",
    clientCompany: "Horizon Ventures",
    projectName: "Brand Refresh 2024",
  },
  {
    body: "Budget is approved for the API migration scope. We can start staging data next week if the task list is ready.",
    clientCompany: "CloudScale Apps",
    projectName: "CRM Migration Tool",
  },
] as const;

function offsetDate(days: number) {
  const date = new Date();
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

function offsetTimestamp(days: number) {
  const date = new Date();
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString();
}

function normalizedEmail(email: string | null | undefined) {
  return email?.trim().toLowerCase() ?? "";
}

function demoEmail() {
  return normalizedEmail(process.env.DEMO_EMAIL);
}

function demoStoragePath(organizationId: string, fileName: string) {
  return `${organizationId}/demo/${fileName}`;
}

function isExistingStorageObjectError(error: { message?: string }) {
  return error.message?.toLowerCase().includes("already exists") ?? false;
}

export function getDemoCredentials() {
  const email = process.env.DEMO_EMAIL?.trim();
  const password = process.env.DEMO_PASSWORD;

  if (!email || !password) {
    throw new Error("Demo access is not configured.");
  }

  return { email, password };
}

export function isDemoEmail(email: string | null | undefined) {
  const configuredEmail = demoEmail();
  return Boolean(configuredEmail && normalizedEmail(email) === configuredEmail);
}

export function assertNotDemoEmail(email: string | null | undefined) {
  if (isDemoEmail(email)) {
    throw new Error(DEMO_BLOCKED_MESSAGE);
  }
}

export async function ensureDemoWorkspace({
  email,
  organizationId,
  supabase,
  userId,
}: DemoSeedInput) {
  if (!isDemoEmail(email)) {
    return;
  }

  const orgId = organizationId ?? (await getFirstOrganizationId(supabase));

  if (!orgId) {
    throw new Error("Demo workspace could not be found.");
  }

  await updateDemoOrganization(supabase, orgId);
  const clientMap = await ensureClients(supabase, orgId);
  const projectMap = await ensureProjects(supabase, orgId, clientMap);
  await ensureTasks(supabase, orgId, projectMap, userId);
  await ensureInvoices(supabase, orgId, clientMap, projectMap);
  await ensureFiles(supabase, orgId, clientMap, projectMap, userId);
  await ensureMessages(supabase, orgId, clientMap, projectMap, userId);
  await ensureActivityLog(supabase, orgId, userId);
}

async function getFirstOrganizationId(supabase: SupabaseServerClient) {
  const { data, error } = await supabase
    .from("organization_members")
    .select("organization_id")
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return data?.organization_id ?? null;
}

async function updateDemoOrganization(
  supabase: SupabaseServerClient,
  organizationId: string,
) {
  const { error } = await supabase
    .from("organizations")
    .update({ name: DEMO_WORKSPACE_NAME })
    .eq("id", organizationId);

  if (error) {
    throw error;
  }
}

async function ensureClients(
  supabase: SupabaseServerClient,
  organizationId: string,
) {
  const { data, error } = await supabase
    .from("clients")
    .select("*")
    .eq("organization_id", organizationId);

  if (error) {
    throw error;
  }

  const clientsByCompany = new Map(
    ((data ?? []) as AnyRecord[]).map((client) => [client.company, client]),
  );

  for (const client of demoClients) {
    if (clientsByCompany.has(client.company)) {
      continue;
    }

    const { data: inserted, error: insertError } = await supabase
      .from("clients")
      .insert({ ...client, organization_id: organizationId })
      .select("*")
      .single();

    if (insertError) {
      throw insertError;
    }

    clientsByCompany.set(client.company, inserted);
  }

  return clientsByCompany;
}

async function ensureProjects(
  supabase: SupabaseServerClient,
  organizationId: string,
  clientsByCompany: Map<string, AnyRecord>,
) {
  const { data, error } = await supabase
    .from("projects")
    .select("*")
    .eq("organization_id", organizationId);

  if (error) {
    throw error;
  }

  const projectsByName = new Map(
    ((data ?? []) as AnyRecord[]).map((project) => [project.name, project]),
  );

  for (const project of demoProjects) {
    if (projectsByName.has(project.name)) {
      continue;
    }

    const { clientCompany, ...projectValues } = project;
    const { data: inserted, error: insertError } = await supabase
      .from("projects")
      .insert({
        ...projectValues,
        client_id: clientsByCompany.get(clientCompany)?.id ?? null,
        organization_id: organizationId,
      })
      .select("*")
      .single();

    if (insertError) {
      throw insertError;
    }

    projectsByName.set(project.name, inserted);
  }

  return projectsByName;
}

async function ensureTasks(
  supabase: SupabaseServerClient,
  organizationId: string,
  projectsByName: Map<string, AnyRecord>,
  userId: string,
) {
  const { data, error } = await supabase
    .from("tasks")
    .select("title")
    .eq("organization_id", organizationId);

  if (error) {
    throw error;
  }

  const existingTitles = new Set(
    ((data ?? []) as AnyRecord[]).map((task) => task.title),
  );

  for (const task of demoTasks) {
    if (existingTitles.has(task.title)) {
      continue;
    }

    const { projectName, ...taskValues } = task;
    const { error: insertError } = await supabase.from("tasks").insert({
      ...taskValues,
      assignee_id: userId,
      organization_id: organizationId,
      project_id: projectsByName.get(projectName)?.id ?? null,
    });

    if (insertError) {
      throw insertError;
    }

    existingTitles.add(task.title);
  }
}

async function ensureInvoices(
  supabase: SupabaseServerClient,
  organizationId: string,
  clientsByCompany: Map<string, AnyRecord>,
  projectsByName: Map<string, AnyRecord>,
) {
  const { data, error } = await supabase
    .from("invoices")
    .select("invoice_number")
    .eq("organization_id", organizationId);

  if (error) {
    throw error;
  }

  const existingNumbers = new Set(
    ((data ?? []) as AnyRecord[]).map((invoice) => invoice.invoice_number),
  );

  for (const invoice of demoInvoices) {
    if (existingNumbers.has(invoice.invoice_number)) {
      continue;
    }

    const { projectName, ...invoiceValues } = invoice;
    const project = projectsByName.get(projectName);
    const client = Array.from(clientsByCompany.values()).find(
      (item) => item.id === project?.client_id,
    );
    const { error: insertError } = await supabase.from("invoices").insert({
      ...invoiceValues,
      client_id: client?.id ?? null,
      organization_id: organizationId,
      project_id: project?.id ?? null,
    });

    if (insertError) {
      throw insertError;
    }

    existingNumbers.add(invoice.invoice_number);
  }
}

async function ensureFiles(
  supabase: SupabaseServerClient,
  organizationId: string,
  clientsByCompany: Map<string, AnyRecord>,
  projectsByName: Map<string, AnyRecord>,
  userId: string,
) {
  const { data, error } = await supabase
    .from("files")
    .select("name")
    .eq("organization_id", organizationId);

  if (error) {
    throw error;
  }

  const existingNames = new Set(
    ((data ?? []) as AnyRecord[]).map((file) => file.name),
  );

  for (const file of demoFiles) {
    const storagePath = demoStoragePath(organizationId, file.name);
    const { error: uploadError } = await supabase.storage
      .from("client-files")
      .upload(storagePath, new Blob([file.content], { type: file.mime_type }), {
        contentType: file.mime_type,
        upsert: false,
      });

    if (uploadError && !isExistingStorageObjectError(uploadError)) {
      throw uploadError;
    }

    if (existingNames.has(file.name)) {
      continue;
    }

    const { clientCompany, projectName } = file;
    const { error: insertError } = await supabase.from("files").insert({
      client_id: clientsByCompany.get(clientCompany)?.id ?? null,
      mime_type: file.mime_type,
      name: file.name,
      organization_id: organizationId,
      project_id: projectsByName.get(projectName)?.id ?? null,
      shared_with_client: file.shared_with_client,
      size_bytes: file.size_bytes,
      storage_path: storagePath,
      uploaded_by: userId,
    });

    if (insertError) {
      throw insertError;
    }

    existingNames.add(file.name);
  }
}

async function ensureMessages(
  supabase: SupabaseServerClient,
  organizationId: string,
  clientsByCompany: Map<string, AnyRecord>,
  projectsByName: Map<string, AnyRecord>,
  userId: string,
) {
  const { data, error } = await supabase
    .from("messages")
    .select("body")
    .eq("organization_id", organizationId);

  if (error) {
    throw error;
  }

  const existingBodies = new Set(
    ((data ?? []) as AnyRecord[]).map((message) => message.body),
  );

  for (const message of demoMessages) {
    if (existingBodies.has(message.body)) {
      continue;
    }

    const { clientCompany, projectName, ...messageValues } = message;
    const { error: insertError } = await supabase.from("messages").insert({
      ...messageValues,
      client_id: clientsByCompany.get(clientCompany)?.id ?? null,
      organization_id: organizationId,
      project_id: projectsByName.get(projectName)?.id ?? null,
      sender_id: userId,
    });

    if (insertError) {
      throw insertError;
    }

    existingBodies.add(message.body);
  }
}

async function ensureActivityLog(
  supabase: SupabaseServerClient,
  organizationId: string,
  userId: string,
) {
  const { data, error } = await supabase
    .from("activity_logs")
    .select("id")
    .eq("organization_id", organizationId)
    .eq("entity_type", "demo")
    .eq("action", "Demo Workspace Seeded")
    .limit(1)
    .maybeSingle();

  if (error) {
    throw error;
  }

  if (data) {
    return;
  }

  const { error: insertError } = await supabase.from("activity_logs").insert({
    action: "Demo Workspace Seeded",
    actor_id: userId,
    entity_type: "demo",
    metadata: { detail: "ClientFlow demo workspace data was added." },
    organization_id: organizationId,
  });

  if (insertError) {
    throw insertError;
  }
}
