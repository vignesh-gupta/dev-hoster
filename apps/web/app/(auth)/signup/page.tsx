import type { Metadata } from "next"
import Link from "next/link"
import { SignupForm } from "@/components/auth/auth-forms"

export const metadata: Metadata = { title: "Create account" }

export default function SignupPage() {
  return (
    <div className="space-y-4">
      <div className="space-y-1">
        <h1 className="text-base font-semibold tracking-tight">Create your account</h1>
        <p className="text-xs text-muted-foreground">Deploy your first repo in a minute.</p>
      </div>
      <SignupForm />
      <p className="text-center text-xs text-muted-foreground">
        Already have an account?{" "}
        <Link href="/login" className="text-foreground underline underline-offset-2">
          Sign in
        </Link>
      </p>
    </div>
  )
}
