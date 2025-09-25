import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Blog",
  description:
    "Stay updated with our latest insights, features, and behind-the-scenes content.",
}

interface BlogLayoutProps {
  children: React.ReactNode
}

export default function BlogLayout({ children }: BlogLayoutProps) {
  return <>{children}</>
}
