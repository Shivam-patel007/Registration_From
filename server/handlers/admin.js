import { supabase } from "../db/connection.js";
import { createSession, destroySession, getBearerToken, getSession } from "../utils/auth.js";

async function getAdminByEmail(email) {
  const normalizedEmail = String(email || "").trim().toLowerCase();

  if (!normalizedEmail) {
    return null;
  }

  const { data, error } = await supabase
    .from("admin")
    .select("id, email, password")
    .ilike("email", normalizedEmail)
    .maybeSingle();

  if (error) {
    throw new Error(error.message || "Unable to load admin account.");
  }

  return data;
}

async function getAdminById(adminId) {
  const { data, error } = await supabase
    .from("admin")
    .select("id, email, password")
    .eq("id", adminId)
    .maybeSingle();

  if (error) {
    throw new Error(error.message || "Unable to load admin account.");
  }

  return data;
}

export async function signInAdmin(email, password) {
  const admin = await getAdminByEmail(email);

  if (!admin) {
    throw new Error("Invalid email or password.");
  }

  if (String(password) !== String(admin.password)) {
    throw new Error("Invalid email or password.");
  }

  const token = createSession(admin.id);
  return { token, email: admin.email };
}

export async function signOutAdmin(req) {
  destroySession(getBearerToken(req));
}

export async function changeAdminPassword(req, body) {
  const token = getBearerToken(req);
  const session = getSession(token);

  if (!session) {
    throw new Error("Unauthorized");
  }

  const currentPassword = body.currentPassword;
  const newPassword = String(body.newPassword || "").trim();

  if (!newPassword) {
    throw new Error("Please enter a new password.");
  }

  const admin = await getAdminById(session.adminId);
  if (!admin) {
    throw new Error("Admin account not found.");
  }

  if (String(currentPassword) !== String(admin.password)) {
    throw new Error("Current password is incorrect.");
  }

  const { error } = await supabase
    .from("admin")
    .update({ password: newPassword })
    .eq("id", admin.id);

  if (error) {
    throw new Error(error.message || "Unable to update password.");
  }

  destroySession(token);
}

export async function getAdminSession(req) {
  const token = getBearerToken(req);
  const session = getSession(token);
  if (!session) return null;

  const admin = await getAdminById(session.adminId);
  if (!admin) return null;

  return { uid: String(admin.id), email: admin.email };
}
