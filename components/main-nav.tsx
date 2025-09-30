"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"

import { NavItem } from "@/types/nav"
import { siteConfig } from "@/config/site"
import { cn } from "@/lib/utils"
import { Icons } from "@/components/icons"

interface MainNavProps {
  items?: NavItem[]
}

export function MainNav({ items }: MainNavProps) {
  const pathname = usePathname()

  return (
    <div className="flex gap-6 md:gap-10">
      <Link href="/" className="flex items-center space-x-2">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary">
          <span className="text-lg font-bold text-primary-foreground">U</span>
        </div>
        <h1 className="text-2xl font-bold text-foreground">
          {siteConfig.name}
        </h1>
      </Link>

      {items?.length ? (
        <nav className="flex items-center gap-6">
          {items?.map((item, index) => {
            if (!item.href) return null
            const isActive = pathname === item.href
            return (
              <Link
                key={index}
                href={item.href}
                aria-current={isActive ? "page" : undefined}
                className={cn(
                  "inline-flex items-center rounded-full px-4 py-2 font-semibold transition-colors",
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground",
                  item.disabled && "pointer-events-none opacity-60"
                )}
              >
                {item.title}
              </Link>
            )
          })}
        </nav>
      ) : null}
    </div>
  )
}
