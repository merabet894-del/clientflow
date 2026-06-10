export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export function getFileType(filename: string): string {
  const ext = filename.split(".").pop()?.toLowerCase() ?? ""
  const typeMap: Record<string, string> = {
    png: "Image", jpg: "Image", jpeg: "Image", gif: "Image", webp: "Image", svg: "Image",
    pdf: "PDF",
    doc: "Document", docx: "Document", txt: "Document", md: "Document",
    xls: "Spreadsheet", xlsx: "Spreadsheet", csv: "Spreadsheet",
    zip: "Archive", rar: "Archive", "7z": "Archive", gz: "Archive", tar: "Archive",
    fig: "Design", psd: "Design", ai: "Design", sketch: "Design",
    mp4: "Video", mov: "Video", avi: "Video",
    mp3: "Audio", wav: "Audio",
  }
  return typeMap[ext] ?? "Other"
}
