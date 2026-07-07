const EXTENSION_MIME_MAP: Record<string, string> = {
  ".pdf": "application/pdf",
  ".doc": "application/msword",
  ".docx":
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ".xlsx":
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  ".xls": "application/vnd.ms-excel",
  ".pptx":
    "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  ".ppt": "application/vnd.ms-powerpoint",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
};

const DEFAULT_DRIVE_MIME_TYPES = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",
].join(",");

const GOOGLE_NATIVE_MIME_BY_ACCEPT: Array<{
  acceptMime: string;
  googleNative: string;
}> = [
  {
    acceptMime:
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    googleNative: "application/vnd.google-apps.document",
  },
  {
    acceptMime: "application/msword",
    googleNative: "application/vnd.google-apps.document",
  },
  {
    acceptMime:
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    googleNative: "application/vnd.google-apps.spreadsheet",
  },
  {
    acceptMime: "application/vnd.ms-excel",
    googleNative: "application/vnd.google-apps.spreadsheet",
  },
  {
    acceptMime:
      "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    googleNative: "application/vnd.google-apps.presentation",
  },
  {
    acceptMime: "application/vnd.ms-powerpoint",
    googleNative: "application/vnd.google-apps.presentation",
  },
  {
    acceptMime: "application/pdf",
    googleNative: "application/vnd.google-apps.document",
  },
];

/** Maps an HTML accept attribute to Google Picker mimeTypes string */
export function acceptToDriveMimeTypes(accept?: string): string {
  if (!accept) return DEFAULT_DRIVE_MIME_TYPES;

  const mimeSet = new Set<string>();

  for (const part of accept.split(",").map((s) => s.trim().toLowerCase())) {
    if (part.startsWith(".") && EXTENSION_MIME_MAP[part]) {
      mimeSet.add(EXTENSION_MIME_MAP[part]);
    } else if (part.includes("/")) {
      mimeSet.add(part);
    }
  }

  for (const mapping of GOOGLE_NATIVE_MIME_BY_ACCEPT) {
    if (mimeSet.has(mapping.acceptMime)) {
      mimeSet.add(mapping.googleNative);
    }
  }

  if (mimeSet.size === 0) return DEFAULT_DRIVE_MIME_TYPES;
  return Array.from(mimeSet).join(",");
}
