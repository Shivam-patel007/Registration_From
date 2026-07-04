import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import multer from "multer";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
export const UPLOADS_DIR = path.join(__dirname, "../uploads/photos");

if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

const storage = multer.diskStorage({
  destination(_req, _file, cb) {
    cb(null, UPLOADS_DIR);
  },
  filename(_req, file, cb) {
    const extension = path.extname(file.originalname).toLowerCase() || ".jpg";
    const safeExtension = [".jpg", ".jpeg", ".png", ".webp"].includes(extension)
      ? extension
      : ".jpg";
    cb(null, `temp-${Date.now()}-${Math.round(Math.random() * 1e9)}${safeExtension}`);
  },
});

function fileFilter(_req, file, cb) {
  const allowed = ["image/jpeg", "image/png", "image/webp"];
  if (allowed.includes(file.mimetype)) {
    cb(null, true);
    return;
  }
  cb(new Error("Only JPG, PNG, or WEBP photos are allowed."));
}

export const uploadPhoto = multer({
  storage,
  fileFilter,
  limits: { fileSize: 2 * 1024 * 1024 },
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

export function renamePhotoFile(tempFilename, studentId) {
  const tempPath = path.join(UPLOADS_DIR, tempFilename);
  const extension = path.extname(tempFilename) || ".jpg";
  const finalFilename = `student-${studentId}${extension}`;
  const finalPath = path.join(UPLOADS_DIR, finalFilename);

  fs.renameSync(tempPath, finalPath);
  return buildPhotoUrl(finalFilename);
}

export function deletePhotoFile(photoUrl) {
  const filePath = getPhotoFilePath(photoUrl);
  if (!filePath || !fs.existsSync(filePath)) return;
  fs.unlinkSync(filePath);
}
