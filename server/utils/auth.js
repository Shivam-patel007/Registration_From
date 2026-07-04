import crypto from "node:crypto";

const sessions = new Map();
const SESSION_TTL_MS = 24 * 60 * 60 * 1000;

function pruneExpiredSessions() {
  const now = Date.now();
  for (const [token, session] of sessions.entries()) {
    if (session.expiresAt <= now) {
      sessions.delete(token);
    }
  }
}

export function createSession(adminId) {
  pruneExpiredSessions();
  const token = crypto.randomBytes(32).toString("hex");
  sessions.set(token, {
    adminId,
    expiresAt: Date.now() + SESSION_TTL_MS,
  });
  return token;
}

export function getSession(token) {
  if (!token) return null;

  pruneExpiredSessions();
  const session = sessions.get(token);
  if (!session) return null;

  if (session.expiresAt <= Date.now()) {
    sessions.delete(token);
    return null;
  }

  return session;
}

export function destroySession(token) {
  if (token) {
    sessions.delete(token);
  }
}

export function getBearerToken(req) {
  const header = req.headers.authorization || "";
  const [scheme, token] = header.split(" ");
  if (scheme !== "Bearer" || !token) return null;
  return token;
}

export function requireAdmin(req) {
  const token = getBearerToken(req);
  const session = getSession(token);
  if (!session) {
    return { ok: false, statusCode: 401, error: "Unauthorized" };
  }
  return { ok: true, session };
}
