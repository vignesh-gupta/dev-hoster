// TODO-remove-last: JSON-file "database" backing the mock data layer. Replace
// the whole lib/server/mock/ directory (and temp/) with real API/DB calls.
import { promises as fs } from "node:fs"
import path from "node:path"

export type CollectionName =
  | "users"
  | "projects"
  | "deployments"
  | "env-vars"
  | "domains"
  | "logs"

const DIR = process.env.MOCK_DB_DIR
  ? path.resolve(process.env.MOCK_DB_DIR)
  : path.resolve(process.cwd(), "../../temp")

// Route bundles can be instantiated more than once in dev, so the lock table
// lives on globalThis to serialise access across all of them.
const g = globalThis as unknown as {
  __mockLocks?: Map<string, Promise<unknown>>
}
const locks = (g.__mockLocks ??= new Map())

function withLock<R>(name: string, task: () => Promise<R>): Promise<R> {
  const prev = locks.get(name) ?? Promise.resolve()
  const next = prev.then(task, task)
  locks.set(
    name,
    next.catch(() => undefined)
  )
  return next
}

const file = (name: CollectionName) => path.join(DIR, `${name}.json`)

async function load<T>(name: CollectionName): Promise<T> {
  try {
    return JSON.parse(await fs.readFile(file(name), "utf8")) as T
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code !== "ENOENT") throw err
  }
  // First access: copy the committed seed (or start empty).
  let initial: string
  try {
    initial = await fs.readFile(path.join(DIR, "seed", `${name}.json`), "utf8")
  } catch {
    initial = name === "logs" ? "{}" : "[]"
  }
  await fs.mkdir(DIR, { recursive: true })
  await fs.writeFile(file(name), initial)
  return JSON.parse(initial) as T
}

export function readCollection<T>(name: CollectionName): Promise<T> {
  return withLock(name, () => load<T>(name))
}

/** Read-modify-write under a lock. `fn` may mutate `data` in place or return a value. */
export function mutate<T, R>(
  name: CollectionName,
  fn: (data: T) => R | Promise<R>
): Promise<R> {
  return withLock(name, async () => {
    const data = await load<T>(name)
    const result = await fn(data)
    await fs.writeFile(file(name), JSON.stringify(data, null, 2) + "\n")
    return result
  })
}

export const now = () => new Date().toISOString()
