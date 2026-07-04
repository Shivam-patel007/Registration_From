const META_PREFIX = "\n__META__";

const ALLOWED_COURSES = ["BCA", "BBA"];

export function getCourseCode(course) {
  const normalized = normalizeCourseValue(course);
  if (normalized === "BCA") return "BCA";
  if (normalized === "BBA") return "BBA";
  return "GEN";
}

export function normalizeCourseValue(course) {
  return String(course || "").trim().toUpperCase();
}

export function validateCourse(course) {
  const normalized = normalizeCourseValue(course);

  if (!normalized) {
    throw new Error("Please select a course.");
  }

  if (!ALLOWED_COURSES.includes(normalized)) {
    throw new Error("Please select a valid course.");
  }

  return normalized;
}

export function formatRegistrationId(course, numericId) {
  const courseCode = getCourseCode(course);
  return `${courseCode}${String(numericId).padStart(3, "0")}`;
}

function parseAddressMeta(fullAddress) {
  const text = String(fullAddress || "");
  const metaIndex = text.indexOf(META_PREFIX);

  if (metaIndex === -1) {
    return {
      address: text,
      hostel: "",
      bus: "",
    };
  }

  const address = text.slice(0, metaIndex);
  const meta = text.slice(metaIndex + META_PREFIX.length);
  const hostelMatch = meta.match(/hostel:([^;]*)/);
  const busMatch = meta.match(/bus:([^;]*)/);

  return {
    address,
    hostel: hostelMatch?.[1] || "",
    bus: busMatch?.[1] || "",
  };
}

function buildFullAddress(address, hostel, bus) {
  const baseAddress = String(address || "").trim();
  const hostelValue = String(hostel || "").trim();
  const busValue = String(bus || "").trim();

  if (!hostelValue && !busValue) {
    return baseAddress;
  }

  return `${baseAddress}${META_PREFIX}hostel:${hostelValue};bus:${busValue}`;
}

export function studentToFrontend(row) {
  if (!row) return null;

  const { address, hostel, bus } = parseAddressMeta(row.fullAddress);

  return {
    id: formatRegistrationId(row.course, row.id),
    dbId: row.id,
    name: row.fullName || "",
    mobile: row.mobileNo || "",
    fatherName: row.fatherName || "",
    fatherMobile: row.fatherMob || "",
    state: row.state || "",
    district: row.district || "",
    pincode: row.pincode || "",
    landmark: row.landmark || "",
    address,
    course: row.course || "",
    board10: row.tenBoard || "",
    percentage10: row.tenscore || "",
    board: row.twelthBoard || "",
    percentage: row.twelthscore || "",
    hostel,
    bus,
    photoUrl: row.photoUrl || "",
    photoDataUrl: row.photoUrl || "",
    createdAt: row.createdAt || null,
  };
}

export function frontendToStudent(values) {
  return {
    fullName: values.name || "",
    mobileNo: values.mobile || "",
    fatherName: values.fatherName || "",
    fatherMob: values.fatherMobile || "",
    state: values.state || "",
    district: values.district || "",
    pincode: values.pincode || "",
    landmark: values.landmark || "",
    fullAddress: buildFullAddress(values.address, values.hostel, values.bus),
    course: validateCourse(values.course),
    tenBoard: values.board10 || "",
    tenscore: values.percentage10 ? String(values.percentage10) : "",
    twelthBoard: values.board || "",
    twelthscore: values.percentage ? String(values.percentage) : "",
  };
}
