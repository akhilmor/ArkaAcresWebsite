import { Suspense } from 'react'
import ResetPasswordContent from './ResetPasswordContent'

export const dynamic = 'force-dynamic'

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen bg-neutral-50 flex items-center justify-center py-12 px-4">
      <Suspense fallback={
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full">
          <div className="text-center">
            <div className="w-16 h-16 bg-neutral-100 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
              <div className="w-8 h-8 bg-neutral-300 rounded"></div>
            </div>
            <h1 className="text-2xl font-serif text-earth-800 font-bold mb-2">
              Loading...
            </h1>
            <p className="text-neutral-600 text-sm">
              Please wait while we load the reset form.
            </p>
          </div>
        </div>
      }>
        <ResetPasswordContent />
      </Suspense>
    </div>
  )
}

