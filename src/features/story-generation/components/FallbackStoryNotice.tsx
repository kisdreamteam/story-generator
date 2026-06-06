interface FallbackStoryNoticeProps {
  message: string
}

export function FallbackStoryNotice({ message }: FallbackStoryNoticeProps) {
  return (
    <div
      className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900"
      role="status"
    >
      {message}
    </div>
  )
}
