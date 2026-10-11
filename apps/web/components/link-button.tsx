import Link from "next/link"
import { Button } from "@dev-hoster/ui/components/button"
import type { ComponentProps } from "react"

type Props = Omit<ComponentProps<typeof Button>, "render" | "nativeButton"> & {
  href: string
  /** Opens in a new tab with a plain <a>. */
  external?: boolean
}

/** A Button that is really a link (keeps correct semantics + base-ui props). */
export function LinkButton({ href, external, ...props }: Props) {
  return (
    <Button
      nativeButton={false}
      render={
        external ? (
          <a href={href} target="_blank" rel="noreferrer noopener" />
        ) : (
          <Link href={href} />
        )
      }
      {...props}
    />
  )
}
