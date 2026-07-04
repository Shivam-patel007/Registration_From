import { supabase } from "../db/connection.js";
import { createSession, destroySession, getBearerToken, getSession } from "../utils/auth.js";

async function getAdminRecord() {
  const { data, error } = await supabase
    .from("admin")
    .select("id, email, password")
    .limit(1)
    .maybeSingle();

  if (error) {
    throw new Error(error.message || "Unable to load admin account.");
  }

  return data;
}

export async function signInAdmin(password) {
  const admin = await getAdminRecord();

  if (!admin) {
    throw new Error("Admin account is not configured in the database.");
  }

  if (String(password) !== String(admin.password)) {
    throw new Error("Incorrect admin password.");
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

  const admin = await getAdminRecord();
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

  const admin = await getAdminRecord();
  if (!admin || admin.id !== session.adminId) return null;

  return { uid: String(admin.id), email: admin.email };
}
