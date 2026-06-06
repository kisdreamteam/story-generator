import { AppButton } from '@/shared/components'

interface RoleplayScriptPrintActionsProps {
  onBack?: () => void
}

export function RoleplayScriptPrintActions({ onBack }: RoleplayScriptPrintActionsProps) {
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

          #roleplay-print-area,
          #roleplay-print-area * {
            visibility: visible;
          }

          #roleplay-print-area {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
          }

          .roleplay-no-print {
            display: none !important;
          }
        }
      `}</style>

      <div className="roleplay-no-print flex flex-col gap-2 sm:flex-row sm:flex-wrap">
        {onBack ? (
          <AppButton type="button" variant="secondary" onClick={onBack} fullWidth className="sm:w-auto">
            Back to story
          </AppButton>
        ) : null}
        <AppButton type="button" onClick={handlePrint} fullWidth className="sm:w-auto">
          Print script
        </AppButton>
      </div>
    </>
  )
}
