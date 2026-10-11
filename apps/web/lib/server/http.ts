import { NextResponse, type NextRequest } from "next/server"
import { ZodError, type z } from "zod"
import type { ApiErrorBody } from "@/lib/types"

export class HttpError extends Error {
  constructor(
    public status: number,
    message: string,
    public code = "error"
  ) {
    super(message)
  }
}

export const notFound = (what: string) =>
  new HttpError(404, `${what} not found`, "not_found")
export const conflict = (message: string) =>
  new HttpError(409, message, "conflict")

function errorResponse(err: unknown): NextResponse<ApiErrorBody> {
  if (err instanceof ZodError) {
    return NextResponse.json(
      {
        error: {
          code: "validation_error",
          message: err.issues[0]?.message ?? "Invalid request",
          issues: err.issues.map((i) => ({
            path: i.path.join("."),
            message: i.message,
          })),
        },
      },
      { status: 400 }
    )
  }
  if (err instanceof HttpError) {
    return NextResponse.json(
      { error: { code: err.code, message: err.message } },
      { status: err.status }
    )
  }
  console.error("[api]", err)
  return NextResponse.json(
    { error: { code: "internal_error", message: "Something went wrong" } },
    { status: 500 }
  )
}

/** Wraps a route body so thrown HttpError / ZodError become JSON error responses. */
export async function handle(
  fn: () => Promise<Response>
): Promise<Response> {
  try {
    return await fn()
  } catch (err) {
    return errorResponse(err)
  }
}

export async function parseBody<S extends z.ZodType>(
  req: NextRequest,
  schema: S
): Promise<z.output<S>> {
  const text = await req.text()
  let json: unknown = {}
  if (text.trim()) {
    try {
      json = JSON.parse(text)
    } catch {
      throw new HttpError(400, "Body must be valid JSON", "invalid_json")
    }
  }
  return schema.parse(json)
}

export function parseQuery<S extends z.ZodType>(
  req: NextRequest,
  schema: S
): z.output<S> {
  return schema.parse(Object.fromEntries(req.nextUrl.searchParams))
}

export const ok = <T>(data: T, status = 200) =>
  NextResponse.json(data, { status })

export const noContent = () => new NextResponse(null, { status: 204 })
