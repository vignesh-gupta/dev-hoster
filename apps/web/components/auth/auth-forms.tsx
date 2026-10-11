"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { Button } from "@dev-hoster/ui/components/button"
import { Input } from "@dev-hoster/ui/components/input"
import { toast } from "sonner"
import type { z } from "zod"
import { validate, type FieldErrors } from "@/lib/form"
import {
  forgotPasswordSchema,
  loginSchema,
  resetPasswordSchema,
  signupSchema,
} from "@/lib/schemas"
import { Field } from "@/components/field"

// TODO-AUTH: these forms validate for real but do not authenticate. Each submit
// handler has the fetch call it should make, commented out. Wire them to
// /api/auth/* when auth is turned on.

type Values = Record<string, string>

function useAuthForm<S extends z.ZodType>(
  schema: S,
  initial: Values,
  onValid: (data: z.output<S>) => void | Promise<void>
) {
  const [values, setValues] = useState<Values>(initial)
  const [errors, setErrors] = useState<FieldErrors>({})
  const [pending, setPending] = useState(false)

  return {
    values,
    errors,
    pending,
    set: (key: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
      setValues((v) => ({ ...v, [key]: e.target.value })),
    submit: async (e: React.FormEvent) => {
      e.preventDefault()
      const result = validate(schema, values)
      if (result.errors) {
        setErrors(result.errors)
        requestAnimationFrame(() =>
          document.querySelector<HTMLElement>("[aria-invalid=true]")?.focus()
        )
        return
      }
      setErrors({})
      setPending(true)
      try {
        await onValid(result.data)
      } finally {
        setPending(false)
      }
    },
  }
}

const NOT_ENABLED = "Sign-in is not enabled yet. Continuing as the default user."

export function LoginForm() {
  const router = useRouter()
  const f = useAuthForm(loginSchema, { email: "", password: "" }, async () => {
    // TODO-AUTH:
    // await api("/auth/login", { method: "POST", body: data })
    toast.info(NOT_ENABLED)
    router.push("/dashboard")
  })

  return (
    <form onSubmit={f.submit} noValidate className="space-y-4">
      <Field label="Email" error={f.errors.email}>
        {(p) => (
          <Input {...p} type="email" autoComplete="email" autoFocus value={f.values.email} onChange={f.set("email")} />
        )}
      </Field>
      <Field label="Password" error={f.errors.password}>
        {(p) => (
          <Input {...p} type="password" autoComplete="current-password" value={f.values.password} onChange={f.set("password")} />
        )}
      </Field>
      <div className="flex items-center justify-between text-xs">
        <Link href="/forgot-password" className="text-muted-foreground underline-offset-2 hover:text-foreground hover:underline">
          Forgot password?
        </Link>
      </div>
      <Button type="submit" className="w-full" disabled={f.pending}>
        {f.pending ? "Signing in…" : "Sign in"}
      </Button>
    </form>
  )
}

export function SignupForm() {
  const router = useRouter()
  const f = useAuthForm(
    signupSchema,
    { name: "", email: "", password: "", confirmPassword: "" },
    async () => {
      // TODO-AUTH:
      // await api("/auth/signup", { method: "POST", body: data })
      toast.info(NOT_ENABLED)
      router.push("/dashboard")
    }
  )

  return (
    <form onSubmit={f.submit} noValidate className="space-y-4">
      <Field label="Name" error={f.errors.name}>
        {(p) => <Input {...p} autoComplete="name" autoFocus value={f.values.name} onChange={f.set("name")} />}
      </Field>
      <Field label="Email" error={f.errors.email}>
        {(p) => <Input {...p} type="email" autoComplete="email" value={f.values.email} onChange={f.set("email")} />}
      </Field>
      <Field label="Password" error={f.errors.password} hint="At least 8 characters.">
        {(p) => <Input {...p} type="password" autoComplete="new-password" value={f.values.password} onChange={f.set("password")} />}
      </Field>
      <Field label="Confirm password" error={f.errors.confirmPassword}>
        {(p) => <Input {...p} type="password" autoComplete="new-password" value={f.values.confirmPassword} onChange={f.set("confirmPassword")} />}
      </Field>
      <Button type="submit" className="w-full" disabled={f.pending}>
        {f.pending ? "Creating account…" : "Create account"}
      </Button>
    </form>
  )
}

export function ForgotPasswordForm() {
  const [sent, setSent] = useState(false)
  const f = useAuthForm(forgotPasswordSchema, { email: "" }, async () => {
    // TODO-AUTH:
    // await api("/auth/forgot-password", { method: "POST", body: data })
    setSent(true)
  })

  if (sent)
    return (
      <div className="space-y-3 text-xs/relaxed" role="status">
        <p>
          If an account exists for <span className="font-medium">{f.values.email}</span>,
          a reset link is on its way.
        </p>
        <p className="text-muted-foreground">
          Email is not connected yet, so nothing was actually sent.
        </p>
      </div>
    )

  return (
    <form onSubmit={f.submit} noValidate className="space-y-4">
      <Field label="Email" error={f.errors.email} hint="We will send a reset link to this address.">
        {(p) => <Input {...p} type="email" autoComplete="email" autoFocus value={f.values.email} onChange={f.set("email")} />}
      </Field>
      <Button type="submit" className="w-full" disabled={f.pending}>
        Send reset link
      </Button>
    </form>
  )
}

export function ResetPasswordForm() {
  const router = useRouter()
  const f = useAuthForm(
    resetPasswordSchema,
    { password: "", confirmPassword: "" },
    async () => {
      // TODO-AUTH:
      // await api("/auth/reset-password", { method: "POST", body: { token, password } })
      toast.info("Password reset is not enabled yet.")
      router.push("/login")
    }
  )

  return (
    <form onSubmit={f.submit} noValidate className="space-y-4">
      <Field label="New password" error={f.errors.password} hint="At least 8 characters.">
        {(p) => <Input {...p} type="password" autoComplete="new-password" autoFocus value={f.values.password} onChange={f.set("password")} />}
      </Field>
      <Field label="Confirm new password" error={f.errors.confirmPassword}>
        {(p) => <Input {...p} type="password" autoComplete="new-password" value={f.values.confirmPassword} onChange={f.set("confirmPassword")} />}
      </Field>
      <Button type="submit" className="w-full" disabled={f.pending}>
        Set new password
      </Button>
    </form>
  )
}
