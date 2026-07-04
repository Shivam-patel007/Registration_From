import express from "express";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { sendJson, setCorsHeaders } from "./utils/http.js";
import { requireAdmin } from "./utils/auth.js";
import { uploadPhoto, UPLOADS_DIR } from "./utils/upload.js";
import {
  createRegistration,
  deleteRegistration,
  getAllRegistrations,
  getRegistration,
} from "./handlers/students.js";
import {
  getAdminSession,
  signInAdmin,
  signOutAdmin,
} from "./handlers/admin.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const FRONTEND_DIR = path.join(__dirname, "../frontend");
const PORT = Number(process.env.PORT) || 5000;

const app = express();

app.use((req, res, next) => {
  setCorsHeaders(res);
  if (req.method === "OPTIONS") {
    res.status(204).end();
    return;
  }
  next();
});

app.use(express.json());
app.use("/uploads/photos", express.static(UPLOADS_DIR));
app.use(express.static(FRONTEND_DIR));

app.post(
  "/api/registrations",
  (req, res, next) => {
    uploadPhoto.single("photo")(req, res, (error) => {
      if (error) {
        sendJson(res, 400, { error: error.message || "Invalid photo upload." });
        return;
      }
      next();
    });
  },
  async (req, res) => {
    try {
      const registration = await createRegistration(req.body, req.file);
      sendJson(res, 201, registration);
    } catch (error) {
      if (req.file?.filename) {
        const tempPath = path.join(UPLOADS_DIR, req.file.filename);
        try {
          const fs = await import("node:fs");
          if (fs.existsSync(tempPath)) fs.unlinkSync(tempPath);
        } catch {
          // ignore cleanup errors
        }
      }
      sendJson(res, 500, { error: error.message || "Unable to save registration." });
    }
  }
);

app.get("/api/registrations", async (req, res) => {
  const auth = requireAdmin(req);
  if (!auth.ok) {
    sendJson(res, auth.statusCode, { error: auth.error });
    return;
  }

  try {
    const registrations = await getAllRegistrations();
    sendJson(res, 200, registrations);
  } catch (error) {
    sendJson(res, 500, { error: error.message || "Unable to load registrations." });
  }
});

app.get("/api/registrations/:id", async (req, res) => {
  const auth = requireAdmin(req);
  if (!auth.ok) {
    sendJson(res, auth.statusCode, { error: auth.error });
    return;
  }

  try {
    const registration = await getRegistration(req.params.id);
    if (!registration) {
      sendJson(res, 404, { error: "Registration not found." });
      return;
    }
    sendJson(res, 200, registration);
  } catch (error) {
    sendJson(res, 500, { error: error.message || "Unable to load registration." });
  }
});

app.delete("/api/registrations/:id", async (req, res) => {
  const auth = requireAdmin(req);
  if (!auth.ok) {
    sendJson(res, auth.statusCode, { error: auth.error });
    return;
  }

  try {
    await deleteRegistration(req.params.id);
    sendJson(res, 200, { success: true });
  } catch (error) {
    sendJson(res, 500, { error: error.message || "Unable to delete registration." });
  }
});

app.post("/api/admin/login", async (req, res) => {
  try {
    const session = await signInAdmin(req.body.email, req.body.password);
    sendJson(res, 200, session);
  } catch (error) {
    const statusCode = error.message === "Invalid email or password." ? 401 : 500;
    sendJson(res, statusCode, { error: error.message || "Unable to sign in." });
  }
});

app.post("/api/admin/logout", async (req, res) => {
  await signOutAdmin(req);
  sendJson(res, 200, { success: true });
});

app.get("/api/admin/session", async (req, res) => {
  try {
    const session = await getAdminSession(req);
    if (!session) {
      sendJson(res, 401, { error: "Unauthorized" });
      return;
    }
    sendJson(res, 200, session);
  } catch (error) {
    sendJson(res, 500, { error: error.message || "Unable to validate session." });
  }
});

app.get("/", (_req, res) => {
  res.sendFile(path.join(FRONTEND_DIR, "index.html"));
});

app.use((req, res) => {
  if (req.path.startsWith("/api/")) {
    sendJson(res, 404, { error: "Route not found" });
    return;
  }

  res.status(404).send("Not found");
});

app.listen(PORT, () => {
  console.log(`Server is listening at http://localhost:${PORT}`);
});
