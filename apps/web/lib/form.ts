import type { z } from "zod"

export type FieldErrors = Record<string, string>

/** Runs a zod schema and flattens issues into `{ "path.to.field": message }`. */
export function validate<S extends z.ZodType>(
  schema: S,
  values: unknown
): { data: z.output<S>; errors: null } | { data: null; errors: FieldErrors } {
  const result = schema.safeParse(values)
  if (result.success) return { data: result.data, errors: null }
  const errors: FieldErrors = {}
  for (const issue of result.error.issues) {
    const key = issue.path.join(".")
    errors[key] ??= issue.message
  }
  return { data: null, errors }
}
