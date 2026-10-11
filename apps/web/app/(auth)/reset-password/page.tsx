import type { Metadata } from "next"
import { ResetPasswordForm } from "@/components/auth/auth-forms"

export const metadata: Metadata = { title: "Choose a new password" }

export default function ResetPasswordPage() {
  return (
    <div className="space-y-4">
      <div className="space-y-1">
        <h1 className="text-base font-semibold tracking-tight">Choose a new password</h1>
        <p className="text-xs text-muted-foreground">
          Pick something you have not used before.
        </p>
      </div>
      {/* TODO-AUTH: read the reset token from the URL (?token=) and pass it to the form. */}
      <ResetPasswordForm />
    </div>
  )
}
