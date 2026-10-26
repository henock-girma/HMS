import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import { createClient } from "jsr:@supabase/supabase-js@2.49.8";

const app = new Hono();
// Supabase removes the Edge Function name before routing the request.
const prefix = "";
const supabaseAdmin = () => createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);

const rolePermissions: Record<string, string[]> = {
  super_admin: ["*"],
  country_manager: ["analytics.country.read", "regions.read", "organizations.read", "referrals.read"],
  region_manager: ["analytics.region.read", "organizations.read", "organizations.manage", "referrals.read"],
  hospital_super_admin: ["hospital.manage", "staff.manage", "departments.manage", "patients.read", "referrals.manage", "reports.read"],
  hospital_manager: ["hospital.read", "staff.read", "departments.manage", "patients.read", "referrals.manage", "reports.read"],
  hospital_admin: ["staff.read", "appointments.manage", "patients.register", "referrals.manage", "reports.read"],
  department_manager: ["department.manage", "staff.read", "patients.read", "referrals.manage"],
  doctor_manager: ["doctors.manage", "patients.read", "clinical.write", "referrals.manage"],
  nurse_manager: ["nurses.manage", "patients.read", "nursing.write", "handover.manage"],
  doctor: ["patients.assigned.read", "clinical.write", "prescriptions.write", "referrals.write"],
  physician: ["patients.assigned.read", "clinical.write", "prescriptions.write", "referrals.write"],
  nurse: ["patients.assigned.read", "nursing.write", "handover.write"],
  patient: ["portal.own.read", "consultations.own.create", "notifications.own.manage"],
  receptionist: ["patients.register", "appointments.manage", "fayda.verify"],
  finance: ["billing.manage", "payments.read", "finance.reports"],
  pharmacy_super_admin: ["pharmacy.manage", "staff.manage", "inventory.manage", "orders.manage", "payments.read"],
  pharmacist: ["prescriptions.verify", "inventory.write", "orders.manage"],
  pharmacy_staff: ["inventory.read", "orders.assigned.manage"],
  courier_manager: ["dispatch.manage", "couriers.manage", "orders.read"],
  courier: ["deliveries.assigned.read", "deliveries.status.write"],
  diagnostic_manager: ["diagnostics.manage", "staff.manage", "results.manage"],
  laboratory_staff: ["samples.assigned.read", "samples.status.write", "results.write"],
};

app.use("*", logger(console.log));
app.use("/*", cors({ origin: "*", allowHeaders: ["Content-Type", "Authorization", "X-Bootstrap-Secret"], allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"], maxAge: 600 }));

async function caller(c: any) {
  const token = c.req.header("Authorization")?.replace("Bearer ", "");
  if (!token) return null;
  const { data: { user } } = await supabaseAdmin().auth.getUser(token);
  if (!user) return null;
  const { data: profile } = await supabaseAdmin().from("profiles").select("*").eq("id", user.id).maybeSingle();
  return profile ? { user, profile } : null;
}

function scoped(profile: any, permission: string) {
  return profile?.status === "active" && (profile.permissions?.includes("*") || profile.permissions?.includes(permission));
}

function isUuid(value: unknown) {
  return typeof value === "string" && /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}

async function resolveOrganization(body: any) {
  const admin = supabaseAdmin();
  if (isUuid(body.organizationId)) return body.organizationId;
  const names: Record<string, string> = {
    tash: "Tikur Anbessa Specialized Hospital",
    "st-pauls": "St. Paul’s Hospital Millennium Medical College",
    "jimma-umc": "Jimma University Medical Center",
    "hawassa-uch": "Hawassa University Comprehensive Hospital",
  };
  const name = body.organizationName || names[String(body.organizationId || "").toLowerCase()] || body.organizationId;
  if (!name) return null;
  const { data: existing, error: lookupError } = await admin.from("organizations").select("id").eq("name", name).maybeSingle();
  if (lookupError) throw new Error(lookupError.message);
  if (existing?.id) return existing.id;
  const type = String(body.role || "").startsWith("pharmacy") || body.organizationType === "Pharmacy" ? "pharmacy" : "hospital";
  const { data: created, error: createError } = await admin.from("organizations").insert({ name, type, region_id: body.regionId || null, status: "active" }).select("id").single();
  if (createError) throw new Error(createError.message);
  return created.id;
}

async function resolveDepartment(body: any, organizationId: string | null) {
  if (!organizationId || !body.departmentId || body.departmentId === "hospital-wide" || isUuid(body.departmentId)) return isUuid(body.departmentId) ? body.departmentId : null;
  const names: Record<string, string> = {
    emergency: "Emergency & Critical Care",
    "internal-medicine": "Internal Medicine",
    surgery: "Surgery",
    pediatrics: "Pediatrics",
    oncology: "Oncology",
    cardiology: "Cardiology",
    neurology: "Neurology",
    obgyn: "Obstetrics & Gynecology",
    orthopedics: "Orthopedics",
    radiology: "Radiology",
    laboratory: "Pathology & Laboratory",
    pharmacy: "Pharmacy",
    finance: "Finance",
    reception: "Reception & Records",
  };
  const name = names[body.departmentId] || body.departmentId;
  const code = String(body.departmentId).toUpperCase().replace(/[^A-Z0-9]+/g, "_").replace(/^_|_$/g, "");
  const admin = supabaseAdmin();
  const { data: existing, error: lookupError } = await admin.from("departments").select("id").eq("organization_id", organizationId).eq("code", code).maybeSingle();
  if (lookupError) throw new Error(lookupError.message);
  if (existing?.id) return existing.id;
  const { data: created, error: createError } = await admin.from("departments").insert({ organization_id: organizationId, name, code }).select("id").single();
  if (createError) throw new Error(createError.message);
  return created.id;
}

app.get(`${prefix}/health`, (c) => c.json({ status: "ok" }));

app.post(`${prefix}/partner-applications`, async (c) => {
  const body = await c.req.json();
  if (!body.organizationName || !body.organizationType || !body.licenseNumber || !body.representativeName || !body.representativeEmail) return c.json({ error: "Organization, license and representative details are required" }, 400);
  const { data, error } = await supabaseAdmin().from("partner_applications").insert({
    organization_name: body.organizationName,
    organization_type: String(body.organizationType).toLowerCase().replaceAll(" ", "_"),
    license_number: body.licenseNumber,
    region_id: body.regionId || null,
    representative_name: body.representativeName,
    representative_email: String(body.representativeEmail).trim().toLowerCase(),
    requested_seats: Math.max(1, Number(body.requestedSeats) || 10),
  }).select().single();
  if (error) return c.json({ error: error.message }, 400);
  return c.json({ application: data }, 201);
});

app.post(`${prefix}/partners`, async (c) => {
  const auth = await caller(c);
  if (!auth || !scoped(auth.profile, "*")) return c.json({ error: "Super admin access required" }, 403);
  const body = await c.req.json();
  if (!body.organizationName || !body.organizationType || !body.licenseNumber || !body.adminEmail || !body.adminPassword || !body.adminFullName || !body.adminUsername || !body.employeeNumber) return c.json({ error: "Organization and partner administrator details are required" }, 400);
  const admin = supabaseAdmin();
  const organizationType = String(body.organizationType).toLowerCase().replaceAll(" ", "_");
  const role = body.adminRole || (organizationType === "pharmacy" ? "pharmacy_super_admin" : "hospital_super_admin");
  if (!rolePermissions[role]) return c.json({ error: "Invalid partner administrator role" }, 400);
  const { data: organization, error: organizationError } = await admin.from("organizations").insert({
    name: body.organizationName,
    type: organizationType,
    license_number: body.licenseNumber,
    region_id: body.regionId || null,
    status: "active",
    user_seat_limit: Math.max(1, Number(body.seatLimit) || 10),
    approved_at: new Date().toISOString(),
    approved_by: auth.user.id,
  }).select().single();
  if (organizationError) return c.json({ error: organizationError.message }, 400);
  const { data: createdUser, error: userError } = await admin.auth.admin.createUser({
    email: String(body.adminEmail).trim().toLowerCase(),
    password: body.adminPassword,
    email_confirm: true,
    user_metadata: { username: body.adminUsername, full_name: body.adminFullName },
  });
  if (userError || !createdUser.user) {
    await admin.from("organizations").delete().eq("id", organization.id);
    return c.json({ error: userError?.message || "Unable to create partner administrator" }, 400);
  }
  const profile = {
    id: createdUser.user.id,
    email: String(body.adminEmail).trim().toLowerCase(),
    username: body.adminUsername,
    full_name: body.adminFullName,
    employee_number: body.employeeNumber,
    role,
    permissions: rolePermissions[role],
    organization_id: organization.id,
    region_id: body.regionId || null,
    status: "active",
    must_change_password: true,
    created_by: auth.user.id,
  };
  const { error: profileError } = await admin.from("profiles").insert(profile);
  if (profileError) {
    await admin.auth.admin.deleteUser(createdUser.user.id);
    await admin.from("organizations").delete().eq("id", organization.id);
    return c.json({ error: profileError.message }, 400);
  }
  const { error: linkError } = await admin.from("organizations").update({ partner_admin_id: createdUser.user.id }).eq("id", organization.id);
  if (linkError) return c.json({ error: linkError.message }, 400);
  await admin.from("audit_events").insert({ actor_id: auth.user.id, organization_id: organization.id, action: "partner.created", entity_type: "organization", entity_id: organization.id, metadata: { admin_id: createdUser.user.id, seat_limit: organization.user_seat_limit, staff_access_plan: Array.isArray(body.staffPlan) ? body.staffPlan : [] } });
  return c.json({ organization, profile }, 201);
});

app.get(`${prefix}/partner-applications`, async (c) => {
  const auth = await caller(c);
  if (!auth || !scoped(auth.profile, "*")) return c.json({ error: "Super admin access required" }, 403);
  const { data, error } = await supabaseAdmin().from("partner_applications").select("*").order("created_at", { ascending: false });
  if (error) return c.json({ error: error.message }, 400);
  return c.json({ applications: data });
});

app.put(`${prefix}/partner-applications/:id`, async (c) => {
  const auth = await caller(c);
  if (!auth || !scoped(auth.profile, "*")) return c.json({ error: "Super admin access required" }, 403);
  const body = await c.req.json();
  const admin = supabaseAdmin();
  const { data: application, error: applicationError } = await admin.from("partner_applications").select("*").eq("id", c.req.param("id")).maybeSingle();
  if (applicationError || !application) return c.json({ error: applicationError?.message || "Partner application not found" }, 404);
  if (!["approved", "rejected"].includes(body.status)) return c.json({ error: "Status must be approved or rejected" }, 400);
  if (body.status === "rejected") {
    const { data, error } = await admin.from("partner_applications").update({ status: "rejected", review_note: body.reviewNote || null, reviewed_by: auth.user.id, reviewed_at: new Date().toISOString() }).eq("id", application.id).select().single();
    if (error) return c.json({ error: error.message }, 400);
    return c.json({ application: data });
  }
  const { data: organization, error: organizationError } = await admin.from("organizations").insert({
    name: application.organization_name,
    type: application.organization_type,
    license_number: application.license_number,
    region_id: application.region_id,
    status: "active",
    user_seat_limit: Math.max(1, Number(body.seatLimit) || application.requested_seats),
    approved_at: new Date().toISOString(),
    approved_by: auth.user.id,
  }).select().single();
  if (organizationError) return c.json({ error: organizationError.message }, 400);
  const { data, error } = await admin.from("partner_applications").update({ status: "approved", review_note: body.reviewNote || null, reviewed_by: auth.user.id, reviewed_at: new Date().toISOString() }).eq("id", application.id).select().single();
  if (error) return c.json({ error: error.message }, 400);
  return c.json({ application: data, organization });
});

// One-time owner bootstrap. Configure SUPERADMIN_EMAIL and MEDLINK_BOOTSTRAP_SECRET
// as Edge Function secrets, then remove the bootstrap secret after use.
app.post(`${prefix}/bootstrap`, async (c) => {
  const body = await c.req.json();
  if (!Deno.env.get("MEDLINK_BOOTSTRAP_SECRET") || c.req.header("X-Bootstrap-Secret") !== Deno.env.get("MEDLINK_BOOTSTRAP_SECRET")) return c.json({ error: "Bootstrap disabled" }, 403);
  if (body.email !== Deno.env.get("SUPERADMIN_EMAIL")) return c.json({ error: "Owner email not approved" }, 403);
  const { count } = await supabaseAdmin().from("profiles").select("id", { count: "exact", head: true });
  if (count) return c.json({ error: "System already initialized" }, 409);
  const { data, error } = await supabaseAdmin().auth.admin.createUser({ email: body.email, password: body.password, email_confirm: true, user_metadata: { username: body.username } });
  if (error) return c.json({ error: error.message }, 400);
  const profile = { id: data.user.id, email: body.email, username: body.username, full_name: body.fullName, employee_number: body.employeeNumber, role: "super_admin", permissions: ["*"], status: "active", must_change_password: true };
  const { error: profileError } = await supabaseAdmin().from("profiles").insert(profile);
  if (profileError) return c.json({ error: profileError.message }, 400);
  return c.json({ profile }, 201);
});

app.get(`${prefix}/me`, async (c) => {
  const auth = await caller(c);
  if (!auth) return c.json({ error: "Unauthorized" }, 401);
  const { data: organization } = auth.profile.organization_id
    ? await supabaseAdmin().from("organizations").select("id, name, type, status").eq("id", auth.profile.organization_id).maybeSingle()
    : { data: null };
  return c.json({ profile: { ...auth.profile, organization } });
});

app.get(`${prefix}/users`, async (c) => {
  const auth = await caller(c);
  if (!auth || !scoped(auth.profile, "*")) return c.json({ error: "Super admin access required" }, 403);
  const { data, error } = await supabaseAdmin().from("profiles").select("*, organizations(name,type), departments(name)").order("created_at", { ascending: false });
  if (error) return c.json({ error: error.message }, 400);
  return c.json({ users: data });
});

app.post(`${prefix}/users`, async (c) => {
  const auth = await caller(c);
  const body = await c.req.json();
  if (!auth) return c.json({ error: "Authentication is required to create an account" }, 401);
  const allowed = rolePermissions[body.role];
  if (!allowed) return c.json({ error: "Invalid role" }, 400);
  if (!body.email || !body.password || !body.username || !body.employeeNumber || !body.organizationId) return c.json({ error: "Missing required account fields" }, 400);
  let organizationId: string;
  let departmentId: string | null;
  try {
    organizationId = await resolveOrganization(body);
    if (!organizationId) return c.json({ error: "A valid organization is required" }, 400);
    departmentId = await resolveDepartment(body, organizationId);
  } catch (error) {
    return c.json({ error: error instanceof Error ? error.message : "Unable to resolve organization assignment" }, 400);
  }
  const { data: partnerOrganization } = auth.profile.organization_id
    ? await supabaseAdmin().from("organizations").select("id, partner_admin_id").eq("id", auth.profile.organization_id).maybeSingle()
    : { data: null };
  const isPartnerAdmin = Boolean(partnerOrganization?.partner_admin_id === auth.user.id && organizationId === auth.profile.organization_id);
  if (!scoped(auth.profile, "*") && !isPartnerAdmin) return c.json({ error: "Only an authorized organization admin can create accounts" }, 403);
  if (isPartnerAdmin && ["super_admin", "country_manager", "region_manager"].includes(body.role)) return c.json({ error: "Partner administrators can only create facility accounts" }, 403);
  const { count: seatCount, error: seatError } = await supabaseAdmin().from("profiles").select("id", { count: "exact", head: true }).eq("organization_id", organizationId);
  if (seatError) return c.json({ error: seatError.message }, 400);
  const { data: organization } = await supabaseAdmin().from("organizations").select("user_seat_limit").eq("id", organizationId).maybeSingle();
  if (organization?.user_seat_limit && (seatCount || 0) >= organization.user_seat_limit) return c.json({ error: `This partner has reached its ${organization.user_seat_limit}-user seat limit` }, 409);
  const requested = Array.isArray(body.permissions) ? body.permissions : allowed;
  const permissions = requested.filter((p: string) => allowed.includes("*") || allowed.includes(p));
  const { data, error } = await supabaseAdmin().auth.admin.createUser({ email: body.email, password: body.password, email_confirm: true, user_metadata: { username: body.username, full_name: body.fullName } });
  if (error) return c.json({ error: error.message }, 400);
  const profile = { id: data.user.id, email: body.email, username: body.username, full_name: body.fullName, employee_number: body.employeeNumber, role: body.role, permissions, organization_id: organizationId, region_id: body.regionId || null, department_id: departmentId, status: "active", must_change_password: true, created_by: auth.user.id };
  const { error: profileError } = await supabaseAdmin().from("profiles").insert(profile);
  if (profileError) { await supabaseAdmin().auth.admin.deleteUser(data.user.id); return c.json({ error: profileError.message }, 400); }
  if (body.teamIds?.length) await supabaseAdmin().from("team_memberships").insert(body.teamIds.map((teamId: string) => ({ team_id: teamId, user_id: data.user.id })));
  if (body.isPartnerAdmin) {
    await supabaseAdmin().from("organizations").update({ partner_admin_id: data.user.id }).eq("id", organizationId);
  }
  await supabaseAdmin().from("audit_events").insert({ actor_id: auth.user.id, organization_id: organizationId, action: "account.created", entity_type: "profile", entity_id: data.user.id, metadata: { role: body.role } });
  return c.json({ profile }, 201);
});

app.put(`${prefix}/users/:id/access`, async (c) => {
  const auth = await caller(c);
  if (!auth || !scoped(auth.profile, "*")) return c.json({ error: "Super admin access required" }, 403);
  const { data: profile } = await supabaseAdmin().from("profiles").select("*").eq("id", c.req.param("id")).maybeSingle();
  if (!profile) return c.json({ error: "Account not found" }, 404);
  const body = await c.req.json();
  const role = body.role || profile.role;
  const ceiling = rolePermissions[role];
  if (!ceiling) return c.json({ error: "Invalid role" }, 400);
  const next = { role, permissions: (body.permissions || profile.permissions).filter((p: string) => ceiling.includes("*") || ceiling.includes(p)), status: body.status || profile.status, organization_id: body.organizationId || profile.organization_id, department_id: body.departmentId || profile.department_id, region_id: body.regionId || profile.region_id, updated_at: new Date().toISOString() };
  await supabaseAdmin().from("profiles").update(next).eq("id", profile.id);
  if (body.status === "suspended") await supabaseAdmin().auth.admin.updateUserById(profile.id, { ban_duration: "876000h" });
  if (body.status === "active") await supabaseAdmin().auth.admin.updateUserById(profile.id, { ban_duration: "none" });
  await supabaseAdmin().from("audit_events").insert({ actor_id: auth.user.id, organization_id: next.organization_id, action: "access.updated", entity_type: "profile", entity_id: profile.id });
  return c.json({ profile: { ...profile, ...next } });
});

app.get(`${prefix}/roles`, async (c) => {
  const auth = await caller(c);
  if (!auth) return c.json({ error: "Unauthorized" }, 401);
  return c.json({ roles: rolePermissions });
});

app.get(`${prefix}/home-care`, async (c) => {
  const auth = await caller(c);
  if (!auth || (!scoped(auth.profile, "patients.read") && !scoped(auth.profile, "*"))) return c.json({ error: "Home-care access required" }, 403);
  const { data, error } = await supabaseAdmin().from("home_care_requests").select("*, patients(full_name,mobile), profiles:assigned_to(full_name)").eq("organization_id", auth.profile.organization_id).order("created_at", { ascending: false });
  if (error) return c.json({ error: error.message }, 400);
  return c.json({ requests: data });
});

app.post(`${prefix}/home-care`, async (c) => {
  const auth = await caller(c);
  if (!auth || (!scoped(auth.profile, "referrals.manage") && !scoped(auth.profile, "*"))) return c.json({ error: "Home-care management access required" }, 403);
  const body = await c.req.json();
  if (!body.address) return c.json({ error: "Visit address is required" }, 400);
  const { data, error } = await supabaseAdmin().from("home_care_requests").insert({ patient_id: body.patientId || null, organization_id: auth.profile.organization_id, service_type: body.serviceType || "home_visit", requested_for: body.requestedFor || null, address: body.address, clinical_notes: body.clinicalNotes || null, created_by: auth.user.id }).select().single();
  if (error) return c.json({ error: error.message }, 400);
  return c.json({ request: data }, 201);
});

app.get(`${prefix}/follow-ups`, async (c) => {
  const auth = await caller(c);
  if (!auth || (!scoped(auth.profile, "patients.read") && !scoped(auth.profile, "*"))) return c.json({ error: "Follow-up access required" }, 403);
  const { data, error } = await supabaseAdmin().from("follow_up_tasks").select("*, patients(full_name,mobile), profiles:assigned_to(full_name)").eq("organization_id", auth.profile.organization_id).order("due_at");
  if (error) return c.json({ error: error.message }, 400);
  return c.json({ tasks: data });
});

app.post(`${prefix}/follow-ups`, async (c) => {
  const auth = await caller(c);
  if (!auth || (!scoped(auth.profile, "referrals.manage") && !scoped(auth.profile, "*"))) return c.json({ error: "Follow-up management access required" }, 403);
  const body = await c.req.json();
  if (!body.dueAt) return c.json({ error: "Follow-up date is required" }, 400);
  const { data, error } = await supabaseAdmin().from("follow_up_tasks").insert({ patient_id: body.patientId || null, organization_id: auth.profile.organization_id, assigned_to: body.assignedTo || null, due_at: body.dueAt, channel: body.channel || "phone", notes: body.notes || null, created_by: auth.user.id }).select().single();
  if (error) return c.json({ error: error.message }, 400);
  return c.json({ task: data }, 201);
});

app.get(`${prefix}/patient/portal`, async (c) => {
  const auth = await caller(c);
  if (!auth || auth.profile.role !== "patient") return c.json({ error: "Patient access required" }, 403);
  const { data: link } = await supabaseAdmin().from("patient_user_links").select("patient_id, patients(*)").eq("user_id", auth.user.id).maybeSingle();
  if (!link) return c.json({ error: "No verified patient record is linked" }, 404);
  const [{ data: referrals }, { data: appointments }, { data: consultations }] = await Promise.all([
    supabaseAdmin().from("referrals").select("*, referral_status_history(*)").eq("patient_id", link.patient_id).order("created_at", { ascending: false }),
    supabaseAdmin().from("appointments").select("*, organizations(name), departments(name)").eq("patient_id", link.patient_id).gte("starts_at", new Date().toISOString()).order("starts_at"),
    supabaseAdmin().from("consultation_applications").select("*").eq("patient_id", link.patient_id).order("created_at", { ascending: false }),
  ]);
  return c.json({ patient: link.patients, referrals, appointments, consultations });
});

app.post(`${prefix}/patient/consultations`, async (c) => {
  const auth = await caller(c);
  if (!auth || auth.profile.role !== "patient") return c.json({ error: "Patient access required" }, 403);
  const { data: link } = await supabaseAdmin().from("patient_user_links").select("patient_id").eq("user_id", auth.user.id).maybeSingle();
  if (!link) return c.json({ error: "No verified patient record is linked" }, 404);
  const body = await c.req.json();
  const { data, error } = await supabaseAdmin().from("consultation_applications").insert({ patient_id: link.patient_id, preferred_organization_id: body.organizationId || null, specialty: body.specialty, reason: body.reason, preferred_channel: body.channel || "in_person" }).select().single();
  if (error) return c.json({ error: error.message }, 400);
  return c.json({ consultation: data }, 201);
});

app.put(`${prefix}/patient/notifications`, async (c) => {
  const auth = await caller(c);
  if (!auth || auth.profile.role !== "patient") return c.json({ error: "Patient access required" }, 403);
  const body = await c.req.json();
  const { data, error } = await supabaseAdmin().from("notification_preferences").upsert({ user_id: auth.user.id, ...body, updated_at: new Date().toISOString() }).select().single();
  if (error) return c.json({ error: error.message }, 400);
  return c.json({ preferences: data });
});

// Invoke from Supabase Cron. Provider credentials stay in Edge Function secrets.
app.post(`${prefix}/notifications/process`, async (c) => {
  if (!Deno.env.get("NOTIFICATION_WORKER_SECRET") || c.req.header("Authorization") !== `Bearer ${Deno.env.get("NOTIFICATION_WORKER_SECRET")}`) return c.json({ error: "Unauthorized" }, 401);
  const { data: jobs, error } = await supabaseAdmin().from("notification_queue").select("*").eq("status", "queued").lte("scheduled_for", new Date().toISOString()).limit(25);
  if (error) return c.json({ error: error.message }, 400);
  const results = [];
  for (const job of jobs || []) {
    await supabaseAdmin().from("notification_queue").update({ status: "processing", attempts: job.attempts + 1 }).eq("id", job.id).eq("status", "queued");
    try {
      let response: Response;
      if (job.channel === "email") {
        response = await fetch("https://api.resend.com/emails", { method: "POST", headers: { Authorization: `Bearer ${Deno.env.get("RESEND_API_KEY")}`, "Content-Type": "application/json" }, body: JSON.stringify({ from: Deno.env.get("NOTIFICATION_FROM_EMAIL"), to: [job.recipient], subject: job.subject || "MedLink care update", text: job.payload.message }) });
      } else {
        response = await fetch(Deno.env.get("SMS_GATEWAY_URL")!, { method: "POST", headers: { Authorization: `Bearer ${Deno.env.get("SMS_GATEWAY_API_KEY")}`, "Content-Type": "application/json" }, body: JSON.stringify({ to: job.recipient, message: job.payload.message, sender: Deno.env.get("SMS_SENDER_ID") || "MedLink" }) });
      }
      if (!response.ok) throw new Error(`Provider returned ${response.status}`);
      await supabaseAdmin().from("notification_queue").update({ status: "sent", sent_at: new Date().toISOString(), last_error: null }).eq("id", job.id);
      results.push({ id: job.id, status: "sent" });
    } catch (error) {
      const failed = job.attempts + 1 >= 3;
      await supabaseAdmin().from("notification_queue").update({ status: failed ? "failed" : "queued", last_error: error instanceof Error ? error.message : "Delivery failed" }).eq("id", job.id);
      results.push({ id: job.id, status: failed ? "failed" : "retry" });
    }
  }
  return c.json({ processed: results });
});

Deno.serve(app.fetch);
