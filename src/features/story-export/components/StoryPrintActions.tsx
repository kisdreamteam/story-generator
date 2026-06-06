import { AppButton } from '@/shared/components'

interface StoryPrintActionsProps {
  onBack?: () => void
}

export function StoryPrintActions({ onBack }: StoryPrintActionsProps) {
  function handlePrint() {
    window.print()
  }

  return (
    <>
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }

          #story-print-area,
          #story-print-area * {
            visibility: visible;
          }

          #story-print-area {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
          }

          .story-export-no-print {
            display: none !important;
          }
        }
      `}</style>

      <div className="story-export-no-print flex flex-col gap-2 sm:flex-row sm:flex-wrap">
        {onBack ? (
          <AppButton type="button" variant="secondary" onClick={onBack} fullWidth className="sm:w-auto">
            Back to story
          </AppButton>
        ) : null}
        <AppButton type="button" onClick={handlePrint} fullWidth className="sm:w-auto">
          Print story
        </AppButton>
      </div>
    </>
  )
}
