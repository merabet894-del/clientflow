import { Button } from "@/components/ui/button"

export function FileActionButton({ fileId, storagePath }: { fileId: string; storagePath: string | null }) {
  if (!storagePath) {
    return (
      <Button variant="outline" className="h-9 rounded-full bg-white text-sm" disabled>
        Stored
      </Button>
    )
  }

  return (
    <a href={`/api/files/${fileId}/signed-url`} target="_blank" rel="noopener noreferrer">
      <Button variant="outline" className="h-9 rounded-full bg-white text-sm">
        View
      </Button>
    </a>
  )
}
