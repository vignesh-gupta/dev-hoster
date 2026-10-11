/** Host the preview proxy serves projects from (<slug>.<PREVIEW_DOMAIN>). */
export const previewDomain = () =>
  process.env.PREVIEW_DOMAIN ?? "localhost:8000"

export const projectHost = (slug: string) => `${slug}.${previewDomain()}`

export const projectUrl = (slug: string) => `http://${projectHost(slug)}`

export function requireEnv(name: string): string {
  const value = process.env[name]
  if (!value) throw new Error(`${name} is not set`)
  return value
}
