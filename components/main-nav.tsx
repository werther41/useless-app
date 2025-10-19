"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Menu, X } from "lucide-react"

import { NavItem } from "@/types/nav"
import { siteConfig } from "@/config/site"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Icons } from "@/components/icons"

interface MainNavProps {
  items?: NavItem[]
}

export function MainNav({ items }: MainNavProps) {
  const pathname = usePathname()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false)

  return (
    <div className="flex items-center gap-2 sm:gap-6 md:gap-10">
      <Link href="/" className="flex items-center space-x-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary sm:size-10">
          <span className="text-sm font-bold text-primary-foreground sm:text-lg">
            U
          </span>
        </div>
        <h1 className="text-lg font-bold text-foreground sm:text-2xl">
          {siteConfig.name}
        </h1>
      </Link>

      {items?.length ? (
        <>
          {/* Desktop Navigation */}
          <nav className="hidden items-center gap-2 sm:flex">
            {items?.map((item, index) => {
              if (!item.href) return null
              const isActive = pathname === item.href
              return (
                <Link
                  key={index}
                  href={item.href}
                  aria-current={isActive ? "page" : undefined}
                  className={cn(
                    "inline-flex items-center rounded-full px-4 py-2 text-sm font-semibold transition-colors",
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

          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="icon"
            className="sm:hidden"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </Button>

          {/* Mobile Dropdown Menu */}
          {isMobileMenuOpen && (
            <div className="absolute inset-x-0 top-16 z-50 border-b border-border bg-card shadow-lg sm:hidden">
              <nav className="flex flex-col space-y-2 p-4">
                {items?.map((item, index) => {
                  if (!item.href) return null
                  const isActive = pathname === item.href
                  return (
                    <Link
                      key={index}
                      href={item.href}
                      aria-current={isActive ? "page" : undefined}
                      className={cn(
                        "inline-flex items-center rounded-lg px-4 py-3 text-sm font-semibold transition-colors",
                        isActive
                          ? "bg-primary text-primary-foreground"
                          : "text-muted-foreground hover:bg-muted",
                        item.disabled && "pointer-events-none opacity-60"
                      )}
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      {item.title}
                    </Link>
                  )
                })}
              </nav>
            </div>
          )}
        </>
      ) : null}
    </div>
  )
}
