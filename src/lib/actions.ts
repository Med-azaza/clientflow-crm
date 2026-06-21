"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import type { Role } from "@/lib/app-types";
import { getCurrentContext } from "@/lib/data";

type ActionResult = {
  ok: boolean;
  error?: string;
  message?: string;
};

const optionalUuid = z.string().uuid().or(z.literal("")).optional();
const requiredText = z.string().trim().min(1, "This field is required.");
const optionalText = z.string().trim().optional();
const moneyValue = z.coerce.number().min(0);

const clientSchema = z.object({
  company: requiredText,
  email: z.string().trim().email("Enter a valid email address."),
  healthScore: z.coerce.number().min(0).max(100).default(80),
  id: optionalUuid,
  name: requiredText,
  phone: optionalText,
  status: z.enum(["Active", "Pending"]).default("Active"),
  totalRevenue: moneyValue.default(0),
});

const projectSchema = z.object({
  budget: moneyValue.default(0),
  clientId: optionalUuid,
  description: optionalText,
  dueAt: z.string().optional(),
  id: optionalUuid,
  name: requiredText,
  priority: z.enum(["Low", "Medium", "High", "Urgent"]).default("Medium"),
  progress: z.coerce.number().min(0).max(100).default(0),
  startsAt: z.string().optional(),
  status: z
    .enum(["Planning", "In Progress", "Review", "Completed"])
    .default("Planning"),
});

const taskSchema = z.object({
  assigneeId: optionalUuid,
  description: optionalText,
  dueAt: z.string().optional(),
  id: optionalUuid,
  priority: z.enum(["Low", "Medium", "High", "Urgent"]).default("Medium"),
  projectId: optionalUuid,
  status: z
    .enum(["Pending", "In Progress", "In Review", "Completed"])
    .default("Pending"),
  title: requiredText,
});

const invoiceSchema = z.object({
  amount: moneyValue,
  clientId: optionalUuid,
  dueAt: z.string().optional(),
  id: optionalUuid,
  invoiceNumber: optionalText,
  issuedAt: z.string().optional(),
  projectId: optionalUuid,
  status: z.enum(["Draft", "Pending", "Paid", "Overdue"]).default("Draft"),
});

const messageSchema = z.object({
  body: requiredText,
  clientId: optionalUuid,
  projectId: optionalUuid,
});

const profileSchema = z.object({
  fullName: requiredText,
});

const organizationSchema = z.object({
  name: requiredText,
});

const memberSchema = z.object({
  role: z.enum(["admin", "member", "client"]).default("member"),
  userId: z.string().uuid(),
});

function actionError(error: unknown): ActionResult {
  if (error instanceof z.ZodError) {
    return {
      error: error.issues[0]?.message ?? "Validation failed.",
      ok: false,
    };
  }

  if (error instanceof Error) {
    return { error: error.message, ok: false };
  }

  return { error: "Something went wrong.", ok: false };
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 72);
}

function assertCanManage(role: Role) {
  if (role === "client") {
    throw new Error("You do not have permission to manage workspace data.");
  }
}

function nullIfEmpty(value: string | undefined | null) {
  return value?.trim() ? value : null;
}

async function createActivity(
  action: string,
  entityType: string,
  entityId: string | null,
  detail: string,
) {
  const { organization, supabase, userId } = await getCurrentContext();

  await supabase.from("activity_logs").insert({
    action,
    actor_id: userId,
    entity_id: entityId,
    entity_type: entityType,
    metadata: { detail },
    organization_id: organization.id,
  });
}

export async function createClientRecord(
  input: unknown,
): Promise<ActionResult> {
  try {
    const values = clientSchema.parse(input);
    const { organization, role, supabase } = await getCurrentContext();
    assertCanManage(role);

    const { data, error } = await supabase
      .from("clients")
      .insert({
        company: values.company,
        email: values.email,
        health_score: values.healthScore,
        name: values.name,
        organization_id: organization.id,
        phone: nullIfEmpty(values.phone),
        status: values.status,
        total_revenue: values.totalRevenue,
      })
      .select("id")
      .single();

    if (error) {
      throw error;
    }

    await createActivity(
      "Client Created",
      "client",
      data.id,
      `${values.company} was added to the workspace.`,
    );
    revalidatePath("/clients");
    revalidatePath("/dashboard");
    return { message: "Client saved.", ok: true };
  } catch (error) {
    return actionError(error);
  }
}

export async function updateClientRecord(
  input: unknown,
): Promise<ActionResult> {
  try {
    const values = clientSchema.extend({ id: z.string().uuid() }).parse(input);
    const { organization, role, supabase } = await getCurrentContext();
    assertCanManage(role);

    const { error } = await supabase
      .from("clients")
      .update({
        company: values.company,
        email: values.email,
        health_score: values.healthScore,
        name: values.name,
        phone: nullIfEmpty(values.phone),
        status: values.status,
        total_revenue: values.totalRevenue,
      })
      .eq("organization_id", organization.id)
      .eq("id", values.id);

    if (error) {
      throw error;
    }

    await createActivity(
      "Client Updated",
      "client",
      values.id,
      `${values.company} was updated.`,
    );
    revalidatePath("/clients");
    revalidatePath("/dashboard");
    return { message: "Client updated.", ok: true };
  } catch (error) {
    return actionError(error);
  }
}

export async function deleteClientRecord(id: string): Promise<ActionResult> {
  try {
    const { organization, role, supabase } = await getCurrentContext();
    assertCanManage(role);

    const { error } = await supabase
      .from("clients")
      .delete()
      .eq("organization_id", organization.id)
      .eq("id", z.string().uuid().parse(id));

    if (error) {
      throw error;
    }

    await createActivity(
      "Client Deleted",
      "client",
      id,
      "A client was deleted.",
    );
    revalidatePath("/clients");
    revalidatePath("/dashboard");
    return { message: "Client deleted.", ok: true };
  } catch (error) {
    return actionError(error);
  }
}

export async function createProjectRecord(
  input: unknown,
): Promise<ActionResult> {
  try {
    const values = projectSchema.parse(input);
    const { organization, role, supabase } = await getCurrentContext();
    assertCanManage(role);
    const slug = `${slugify(values.name)}-${crypto.randomUUID().slice(0, 8)}`;

    const { data, error } = await supabase
      .from("projects")
      .insert({
        budget: values.budget,
        client_id: nullIfEmpty(values.clientId),
        description: nullIfEmpty(values.description),
        due_at: nullIfEmpty(values.dueAt),
        name: values.name,
        organization_id: organization.id,
        priority: values.priority,
        progress: values.progress,
        slug,
        starts_at: nullIfEmpty(values.startsAt),
        status: values.status,
      })
      .select("id")
      .single();

    if (error) {
      throw error;
    }

    await createActivity(
      "Project Created",
      "project",
      data.id,
      `${values.name} was created.`,
    );
    revalidatePath("/projects");
    revalidatePath("/dashboard");
    return { message: "Project saved.", ok: true };
  } catch (error) {
    return actionError(error);
  }
}

export async function updateProjectRecord(
  input: unknown,
): Promise<ActionResult> {
  try {
    const values = projectSchema.extend({ id: z.string().uuid() }).parse(input);
    const { organization, role, supabase } = await getCurrentContext();
    assertCanManage(role);

    const { error } = await supabase
      .from("projects")
      .update({
        budget: values.budget,
        client_id: nullIfEmpty(values.clientId),
        description: nullIfEmpty(values.description),
        due_at: nullIfEmpty(values.dueAt),
        name: values.name,
        priority: values.priority,
        progress: values.progress,
        starts_at: nullIfEmpty(values.startsAt),
        status: values.status,
      })
      .eq("organization_id", organization.id)
      .eq("id", values.id);

    if (error) {
      throw error;
    }

    await createActivity(
      "Project Updated",
      "project",
      values.id,
      `${values.name} was updated.`,
    );
    revalidatePath("/projects");
    revalidatePath(`/projects/${values.id}`);
    revalidatePath("/dashboard");
    return { message: "Project updated.", ok: true };
  } catch (error) {
    return actionError(error);
  }
}

export async function deleteProjectRecord(id: string): Promise<ActionResult> {
  try {
    const { organization, role, supabase } = await getCurrentContext();
    assertCanManage(role);

    const { error } = await supabase
      .from("projects")
      .delete()
      .eq("organization_id", organization.id)
      .eq("id", z.string().uuid().parse(id));

    if (error) {
      throw error;
    }

    await createActivity(
      "Project Deleted",
      "project",
      id,
      "A project was deleted.",
    );
    revalidatePath("/projects");
    revalidatePath("/dashboard");
    return { message: "Project deleted.", ok: true };
  } catch (error) {
    return actionError(error);
  }
}

export async function createTaskRecord(input: unknown): Promise<ActionResult> {
  try {
    const values = taskSchema.parse(input);
    const { organization, role, supabase } = await getCurrentContext();
    assertCanManage(role);

    const { data, error } = await supabase
      .from("tasks")
      .insert({
        assignee_id: nullIfEmpty(values.assigneeId),
        description: nullIfEmpty(values.description),
        due_at: nullIfEmpty(values.dueAt),
        organization_id: organization.id,
        priority: values.priority,
        project_id: nullIfEmpty(values.projectId),
        status: values.status,
        title: values.title,
      })
      .select("id")
      .single();

    if (error) {
      throw error;
    }

    await createActivity(
      "Task Created",
      "task",
      data.id,
      `${values.title} was created.`,
    );
    revalidatePath("/tasks");
    revalidatePath("/projects");
    revalidatePath("/dashboard");
    return { message: "Task saved.", ok: true };
  } catch (error) {
    return actionError(error);
  }
}

export async function updateTaskRecord(input: unknown): Promise<ActionResult> {
  try {
    const values = taskSchema.extend({ id: z.string().uuid() }).parse(input);
    const { organization, role, supabase } = await getCurrentContext();
    assertCanManage(role);

    const { error } = await supabase
      .from("tasks")
      .update({
        assignee_id: nullIfEmpty(values.assigneeId),
        description: nullIfEmpty(values.description),
        due_at: nullIfEmpty(values.dueAt),
        priority: values.priority,
        project_id: nullIfEmpty(values.projectId),
        status: values.status,
        title: values.title,
      })
      .eq("organization_id", organization.id)
      .eq("id", values.id);

    if (error) {
      throw error;
    }

    await createActivity(
      "Task Updated",
      "task",
      values.id,
      `${values.title} was updated.`,
    );
    revalidatePath("/tasks");
    revalidatePath("/projects");
    revalidatePath("/dashboard");
    return { message: "Task updated.", ok: true };
  } catch (error) {
    return actionError(error);
  }
}

export async function deleteTaskRecord(id: string): Promise<ActionResult> {
  try {
    const { organization, role, supabase } = await getCurrentContext();
    assertCanManage(role);

    const { error } = await supabase
      .from("tasks")
      .delete()
      .eq("organization_id", organization.id)
      .eq("id", z.string().uuid().parse(id));

    if (error) {
      throw error;
    }

    await createActivity("Task Deleted", "task", id, "A task was deleted.");
    revalidatePath("/tasks");
    revalidatePath("/projects");
    revalidatePath("/dashboard");
    return { message: "Task deleted.", ok: true };
  } catch (error) {
    return actionError(error);
  }
}

export async function createInvoiceRecord(
  input: unknown,
): Promise<ActionResult> {
  try {
    const values = invoiceSchema.parse(input);
    const { organization, role, supabase } = await getCurrentContext();
    assertCanManage(role);
    const invoiceNumber =
      values.invoiceNumber || `INV-${new Date().getFullYear()}-${Date.now()}`;

    const { data, error } = await supabase
      .from("invoices")
      .insert({
        amount: values.amount,
        client_id: nullIfEmpty(values.clientId),
        due_at: nullIfEmpty(values.dueAt),
        invoice_number: invoiceNumber,
        issued_at: nullIfEmpty(values.issuedAt),
        organization_id: organization.id,
        paid_at: values.status === "Paid" ? new Date().toISOString() : null,
        project_id: nullIfEmpty(values.projectId),
        status: values.status,
      })
      .select("id")
      .single();

    if (error) {
      throw error;
    }

    await createActivity(
      "Invoice Created",
      "invoice",
      data.id,
      `${invoiceNumber} was created.`,
    );
    revalidatePath("/invoices");
    revalidatePath("/dashboard");
    return { message: "Invoice saved.", ok: true };
  } catch (error) {
    return actionError(error);
  }
}

export async function updateInvoiceRecord(
  input: unknown,
): Promise<ActionResult> {
  try {
    const values = invoiceSchema.extend({ id: z.string().uuid() }).parse(input);
    const { organization, role, supabase } = await getCurrentContext();
    assertCanManage(role);

    const { error } = await supabase
      .from("invoices")
      .update({
        amount: values.amount,
        client_id: nullIfEmpty(values.clientId),
        due_at: nullIfEmpty(values.dueAt),
        invoice_number: values.invoiceNumber,
        issued_at: nullIfEmpty(values.issuedAt),
        paid_at: values.status === "Paid" ? new Date().toISOString() : null,
        project_id: nullIfEmpty(values.projectId),
        status: values.status,
      })
      .eq("organization_id", organization.id)
      .eq("id", values.id);

    if (error) {
      throw error;
    }

    await createActivity(
      "Invoice Updated",
      "invoice",
      values.id,
      `${values.invoiceNumber || "Invoice"} was updated.`,
    );
    revalidatePath("/invoices");
    revalidatePath("/dashboard");
    return { message: "Invoice updated.", ok: true };
  } catch (error) {
    return actionError(error);
  }
}

export async function markInvoicePaid(id: string): Promise<ActionResult> {
  try {
    const { organization, role, supabase } = await getCurrentContext();
    assertCanManage(role);

    const { error } = await supabase
      .from("invoices")
      .update({ paid_at: new Date().toISOString(), status: "Paid" })
      .eq("organization_id", organization.id)
      .eq("id", z.string().uuid().parse(id));

    if (error) {
      throw error;
    }

    await createActivity("Invoice Paid", "invoice", id, "An invoice was paid.");
    revalidatePath("/invoices");
    revalidatePath("/dashboard");
    return { message: "Invoice marked as paid.", ok: true };
  } catch (error) {
    return actionError(error);
  }
}

export async function deleteInvoiceRecord(id: string): Promise<ActionResult> {
  try {
    const { organization, role, supabase } = await getCurrentContext();
    assertCanManage(role);

    const { error } = await supabase
      .from("invoices")
      .delete()
      .eq("organization_id", organization.id)
      .eq("id", z.string().uuid().parse(id));

    if (error) {
      throw error;
    }

    await createActivity(
      "Invoice Deleted",
      "invoice",
      id,
      "An invoice was deleted.",
    );
    revalidatePath("/invoices");
    revalidatePath("/dashboard");
    return { message: "Invoice deleted.", ok: true };
  } catch (error) {
    return actionError(error);
  }
}

export async function createMessageRecord(
  input: unknown,
): Promise<ActionResult> {
  try {
    const values = messageSchema.parse(input);
    const { organization, supabase, userId } = await getCurrentContext();

    const { data, error } = await supabase
      .from("messages")
      .insert({
        body: values.body,
        client_id: nullIfEmpty(values.clientId),
        organization_id: organization.id,
        project_id: nullIfEmpty(values.projectId),
        sender_id: userId,
      })
      .select("id")
      .single();

    if (error) {
      throw error;
    }

    await createActivity(
      "Message Sent",
      "message",
      data.id,
      "A message was sent.",
    );
    revalidatePath("/messages");
    revalidatePath("/projects");
    return { message: "Message sent.", ok: true };
  } catch (error) {
    return actionError(error);
  }
}

export async function toggleFileSharing(id: string): Promise<ActionResult> {
  try {
    const { organization, role, supabase } = await getCurrentContext();
    assertCanManage(role);
    const fileId = z.string().uuid().parse(id);
    const { data: file, error: fetchError } = await supabase
      .from("files")
      .select("shared_with_client")
      .eq("organization_id", organization.id)
      .eq("id", fileId)
      .single();

    if (fetchError) {
      throw fetchError;
    }

    const { error } = await supabase
      .from("files")
      .update({ shared_with_client: !file.shared_with_client })
      .eq("organization_id", organization.id)
      .eq("id", fileId);

    if (error) {
      throw error;
    }

    revalidatePath("/files");
    revalidatePath("/projects");
    return { message: "File sharing updated.", ok: true };
  } catch (error) {
    return actionError(error);
  }
}

export async function deleteFileRecord(id: string): Promise<ActionResult> {
  try {
    const { organization, role, supabase } = await getCurrentContext();
    assertCanManage(role);
    const fileId = z.string().uuid().parse(id);
    const { data: file, error: fetchError } = await supabase
      .from("files")
      .select("storage_path")
      .eq("organization_id", organization.id)
      .eq("id", fileId)
      .single();

    if (fetchError) {
      throw fetchError;
    }

    if (file?.storage_path) {
      await supabase.storage.from("client-files").remove([file.storage_path]);
    }

    const { error } = await supabase
      .from("files")
      .delete()
      .eq("organization_id", organization.id)
      .eq("id", fileId);

    if (error) {
      throw error;
    }

    await createActivity("File Deleted", "file", fileId, "A file was deleted.");
    revalidatePath("/files");
    revalidatePath("/projects");
    return { message: "File deleted.", ok: true };
  } catch (error) {
    return actionError(error);
  }
}

export async function updateOrganization(
  input: unknown,
): Promise<ActionResult> {
  try {
    const values = organizationSchema.parse(input);
    const { organization, role, supabase } = await getCurrentContext();

    if (!["owner", "admin"].includes(role)) {
      throw new Error(
        "Only owners and admins can update organization settings.",
      );
    }

    const { error } = await supabase
      .from("organizations")
      .update({ name: values.name, slug: slugify(values.name) })
      .eq("id", organization.id);

    if (error) {
      throw error;
    }

    revalidatePath("/settings");
    return { message: "Organization updated.", ok: true };
  } catch (error) {
    return actionError(error);
  }
}

export async function updateProfile(input: unknown): Promise<ActionResult> {
  try {
    const values = profileSchema.parse(input);
    const { supabase, userId } = await getCurrentContext();

    const { error } = await supabase
      .from("profiles")
      .update({ full_name: values.fullName })
      .eq("id", userId);

    if (error) {
      throw error;
    }

    revalidatePath("/settings");
    revalidatePath("/dashboard");
    return { message: "Profile updated.", ok: true };
  } catch (error) {
    return actionError(error);
  }
}

export async function updateMemberRole(input: unknown): Promise<ActionResult> {
  try {
    const values = memberSchema.parse(input);
    const { organization, role, supabase } = await getCurrentContext();

    if (!["owner", "admin"].includes(role)) {
      throw new Error("Only owners and admins can update member roles.");
    }

    const { error } = await supabase
      .from("organization_members")
      .update({ role: values.role })
      .eq("organization_id", organization.id)
      .eq("user_id", values.userId);

    if (error) {
      throw error;
    }

    revalidatePath("/settings");
    return { message: "Member role updated.", ok: true };
  } catch (error) {
    return actionError(error);
  }
}
