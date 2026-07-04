import { supabase } from "../db/connection.js";
import {
  deletePhotoFile,
  renamePhotoFile,
} from "../utils/upload.js";
import { studentToFrontend, frontendToStudent } from "../utils/mappers.js";

function generatePassword() {
  return Math.random().toString(36).slice(-8).toUpperCase();
}

export async function createRegistration(body, photoFile) {
  if (!photoFile) {
    throw new Error("Photo is required.");
  }

  const studentRow = frontendToStudent(body);
  const password = generatePassword();

  const { data, error } = await supabase
    .from("student")
    .insert(studentRow)
    .select()
    .single();

  if (error) {
    throw new Error(error.message || "Unable to save registration.");
  }

  try {
    const photoUrl = renamePhotoFile(photoFile.filename, data.id);

    const { data: updated, error: updateError } = await supabase
      .from("student")
      .update({ photoUrl })
      .eq("id", data.id)
      .select()
      .single();

    if (updateError) {
      throw new Error(updateError.message || "Unable to save student photo.");
    }

    return {
      ...studentToFrontend(updated),
      password,
    };
  } catch (photoError) {
    deletePhotoFile(`/uploads/photos/${photoFile.filename}`);
    await supabase.from("student").delete().eq("id", data.id);
    throw photoError;
  }
}

export async function getAllRegistrations() {
  const { data, error } = await supabase
    .from("student")
    .select("*")
    .order("id", { ascending: false });

  if (error) {
    throw new Error(error.message || "Unable to load registrations.");
  }

  return (data || []).map(studentToFrontend);
}

export async function getRegistration(registrationId) {
  const students = await getAllRegistrations();
  return students.find((student) => student.id === registrationId) || null;
}

export async function deleteRegistration(registrationId) {
  const students = await getAllRegistrations();
  const student = students.find((item) => item.id === registrationId);

  if (!student) {
    throw new Error("Registration not found.");
  }

  deletePhotoFile(student.photoUrl);

  const { error } = await supabase.from("student").delete().eq("id", student.dbId);
  if (error) {
    throw new Error(error.message || "Unable to delete registration.");
  }
}
