export interface BlogPost {
  slug: string
  title: string
  date: string
  updatedDate?: string
  author: string
  excerpt: string
  content: string
  tags?: string[]
  published: boolean
}

export interface BlogPostMeta {
  slug: string
  title: string
  date: string
  updatedDate?: string
  author: string
  excerpt: string
  tags?: string[]
  published: boolean
}
