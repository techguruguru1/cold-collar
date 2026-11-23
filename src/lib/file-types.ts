// Helpers for upload boxes, so the file picker shows photos on Windows and Mac as well as phones.
//
// Windows builds the picker's filter from `accept`. A list of exact types such as "image/heic"
// can leave the filter showing only folders, and Windows often reports HEIC photos with no type
// at all. So the picker also lists "image/*" and file extensions, and the type is worked out from
// the extension when the browser doesn't provide one.

const EXTENSIONS: Record<string, string[]> = {
  "image/png": [".png"],
  "image/jpeg": [".jpg", ".jpeg", ".jfif", ".pjpeg", ".pjp"],
  "image/webp": [".webp"],
  "image/heic": [".heic"],
  "image/heif": [".heif"],
  "application/pdf": [".pdf"],
};

/** Value for an <input type="file"> `accept` attribute. */
export function acceptFor(types: readonly string[]): string {
  const parts = new Set<string>();
  if (types.some((t) => t.startsWith("image/"))) parts.add("image/*");
  for (const t of types) {
    parts.add(t);
    for (const ext of EXTENSIONS[t] ?? []) parts.add(ext);
  }
  return [...parts].join(",");
}

/** The file's type if it's one of `allowed` (using its extension as a fallback), otherwise null. */
export function fileTypeOf<T extends string>(file: File, allowed: readonly T[]): T | null {
  const reported = file.type.toLowerCase() === "image/jpg" ? "image/jpeg" : file.type.toLowerCase();
  if ((allowed as readonly string[]).includes(reported)) return reported as T;
  const name = file.name.toLowerCase();
  for (const t of allowed) {
    if ((EXTENSIONS[t] ?? []).some((ext) => name.endsWith(ext))) return t;
  }
  return null;
}
