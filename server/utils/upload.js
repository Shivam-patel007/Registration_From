import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import multer from "multer";
import { supabase } from "../db/connection.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
export const UPLOADS_DIR = path.join(__dirname, "../uploads/photos");

if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

const STORAGE_BUCKET = process.env.SUPABASE_STORAGE_BUCKET || process.env.SUPABASE_BUCKET || "Images";

const storage = multer.memoryStorage();

function fileFilter(_req, file, cb) {
  const allowed = ["image/jpeg", "image/png", "image/jpg"];
  if (allowed.includes(file.mimetype)) {
    cb(null, true);
    return;
  }
  cb(new Error("Only JPG, PNG, or WEBP photos are allowed."));
}

export const uploadPhoto = multer({
  storage,
  fileFilter,
  limits: { fileSize: 512 },
});

export function buildPhotoUrl(filename) {
  return `/uploads/photos/${filename}`;
}

export function getPhotoFilePath(photoUrl) {
  if (!photoUrl || !photoUrl.startsWith("/uploads/photos/")) {
    return null;
  }

  const filename = path.basename(photoUrl);
  return path.join(UPLOADS_DIR, filename);
}

function getStorageObjectName(photoUrl) {
  if (!photoUrl || typeof photoUrl !== "string") return null;

  try {
    const parsedUrl = new URL(photoUrl);
    const segments = parsedUrl.pathname.split("/").filter(Boolean);
    const objectIndex = segments.indexOf("object");

    if (objectIndex === -1) {
      return null;
    }

    const afterObject = segments.slice(objectIndex + 1);
    if (afterObject[0] === "public" || afterObject[0] === "authenticated") {
      return afterObject.slice(2).join("/");
    }

    return afterObject.slice(1).join("/");
  } catch {
    return null;
  }
}

export async function renamePhotoFile(photoFile, studentId) {
  if (!photoFile?.buffer) {
    throw new Error("Photo file is required.");
  }

  const extension = path.extname(photoFile.originalname || "").toLowerCase() || ".jpg";
  const safeExtension = [".jpg", ".jpeg", ".png", ".webp"].includes(extension)
    ? extension
    : ".jpg";
  const objectName = `student-${studentId}-${Date.now()}${safeExtension}`;

  const { error } = await supabase.storage.from(STORAGE_BUCKET).upload(objectName, photoFile.buffer, {
    contentType: photoFile.mimetype || "image/jpeg",
    upsert: false,
  });

  if (error) {
    throw new Error(error.message || "Unable to upload student photo to storage.");
  }

  const { data: publicUrlData } = supabase.storage.from(STORAGE_BUCKET).getPublicUrl(objectName);
  return publicUrlData?.publicUrl || "";
}

export async function deletePhotoFile(photoUrl) {
  if (!photoUrl) return;

  const localFilePath = getPhotoFilePath(photoUrl);
  if (localFilePath && fs.existsSync(localFilePath)) {
    fs.unlinkSync(localFilePath);
    return;
  }

  const objectName = getStorageObjectName(photoUrl);
  if (!objectName) return;

  const { error } = await supabase.storage.from(STORAGE_BUCKET).remove([objectName]);
  if (error && !String(error.message || "").toLowerCase().includes("not found")) {
    console.warn("Unable to delete photo from storage:", error.message);
  }
}
