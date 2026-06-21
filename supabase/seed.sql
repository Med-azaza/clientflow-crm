-- Demo data seed. Run after signing up and creating a workspace.
-- Replace the first CTE values if you want to seed a specific organization/user.

with current_workspace as (
  select organization_id as id
  from public.organization_members
  where user_id = auth.uid()
  order by created_at asc
  limit 1
),
seed_clients as (
  insert into public.clients (organization_id, name, company, email, status, health_score, total_revenue, last_contact_at)
  select id, *
  from current_workspace,
  (values
    ('Conor O''Brien', 'Acme Corp', 'conor@acmecorp.com', 'Active', 98, 12450, now()),
    ('Maya Patel', 'Horizon Ventures', 'maya@horizon.vc', 'Active', 94, 32600, now() - interval '1 day'),
    ('Olivia Jenkins', 'Stellar Designs', 'olivia@stellardesigns.co', 'Active', 91, 42150, now() - interval '2 days'),
    ('Jessica Taylor', 'Vertex Solutions', 'jessica@vertexsolutions.io', 'Pending', 82, 8900, now() - interval '3 days'),
    ('Jacob Peterson', 'CloudScale Apps', 'jacob@cloudscaleapps.com', 'Active', 88, 45800, now() - interval '5 days')
  ) as v(name, company, email, status, health_score, total_revenue, last_contact_at)
  returning *
),
seed_projects as (
  insert into public.projects (organization_id, client_id, name, slug, description, status, priority, budget, progress, starts_at, due_at)
  select c.organization_id, c.id, p.name, p.slug, p.description, p.status, p.priority, p.budget, p.progress, current_date - 20, current_date + p.due_offset
  from seed_clients c
  join (values
    ('Acme Corp', 'Website Redesign', 'website-redesign', 'Homepage, service pages, and approval workflow.', 'In Progress', 'Urgent', 25000, 64, 24),
    ('Horizon Ventures', 'Brand Refresh 2024', 'brand-refresh-2024', 'Brand board and legal review assets.', 'Planning', 'Medium', 12500, 28, 18),
    ('CloudScale Apps', 'CRM Migration Tool', 'crm-migration-tool', 'Data migration and invoice workflow.', 'In Progress', 'Urgent', 22000, 65, 30),
    ('Vertex Solutions', 'Mobile App Prototype', 'mobile-app-prototype', 'Clickable prototype and QA notes.', 'Review', 'High', 15700, 84, 14),
    ('Stellar Designs', 'UI/UX Audit', 'ui-ux-audit', 'Design audit and recommendations.', 'Completed', 'Low', 4800, 100, -10),
    ('Horizon Ventures', 'Q3 Marketing Strategy', 'q3-marketing-strategy', 'Campaign planning and creative strategy.', 'Planning', 'High', 8500, 22, 40)
  ) as p(company, name, slug, description, status, priority, budget, progress, due_offset)
    on p.company = c.company
  returning *
),
seed_tasks as (
  insert into public.tasks (organization_id, project_id, title, status, priority, assignee_id, due_at)
  select p.organization_id, p.id, t.title, t.status, t.priority, auth.uid(), current_date + t.due_offset
  from seed_projects p
  join (values
    ('Website Redesign', 'Prepare homepage wireframes', 'In Review', 'High', 0),
    ('Brand Refresh 2024', 'Review brand assets', 'Pending', 'Medium', 2),
    ('CRM Migration Tool', 'Connect invoice workflow', 'In Progress', 'Urgent', 4),
    ('Mobile App Prototype', 'QA responsive layout', 'In Progress', 'Low', 6),
    ('Q3 Marketing Strategy', 'Send client approval request', 'Pending', 'High', 7)
  ) as t(project, title, status, priority, due_offset)
    on t.project = p.name
  returning *
),
seed_invoices as (
  insert into public.invoices (organization_id, client_id, project_id, invoice_number, amount, status, issued_at, due_at, paid_at)
  select p.organization_id, p.client_id, p.id, i.invoice_number, i.amount, i.status, current_date - 10, current_date + i.due_offset,
    case when i.status = 'Paid' then current_date - 2 else null end
  from seed_projects p
  join (values
    ('Website Redesign', 'INV-2026-042', 4200, 'Pending', 7),
    ('Brand Refresh 2024', 'INV-2026-041', 8900, 'Overdue', -3),
    ('UI/UX Audit', 'INV-2026-040', 4800, 'Paid', -9),
    ('CRM Migration Tool', 'INV-2026-039', 11000, 'Draft', 16)
  ) as i(project, invoice_number, amount, status, due_offset)
    on i.project = p.name
  returning *
)
insert into public.activity_logs (organization_id, actor_id, entity_type, entity_id, action, metadata)
select id, auth.uid(), 'seed', null, 'Demo Data Seeded', '{"detail":"ClientFlow demo data was added."}'::jsonb
from current_workspace;
