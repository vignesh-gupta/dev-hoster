import { SettingsNav } from "@/components/projects/settings-nav"

export default async function SettingsLayout({
  children,
  params,
}: LayoutProps<"/projects/[slug]/settings">) {
  const { slug } = await params
  return (
    <div className="grid gap-5 md:grid-cols-[10rem_minmax(0,1fr)]">
      <SettingsNav slug={slug} />
      <div className="min-w-0 space-y-5">{children}</div>
    </div>
  )
}
