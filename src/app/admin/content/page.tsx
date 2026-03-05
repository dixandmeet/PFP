"use client"

import { useEffect, useState, useCallback } from "react"
import { AdminHeader } from "@/components/admin/AdminHeader"
import { DataTable, Column } from "@/components/admin/DataTable"
import { UserBadge } from "@/components/admin/UserBadge"
import { ActionMenu, commonActions } from "@/components/admin/ActionMenu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, Heart, MessageSquare, Share2 } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { fr } from "date-fns/locale"

interface Post {
  id: string
  content: string
  mediaUrls: string[]
  createdAt: string
  user: {
    id: string
    name: string | null
    email: string
    image: string | null
    role: "PLAYER" | "AGENT" | "CLUB" | "ADMIN"
  }
  _count: {
    likes: number
    comments: number
    shares: number
  }
}

interface Comment {
  id: string
  content: string
  createdAt: string
  user: {
    id: string
    name: string | null
    email: string
    image: string | null
    role: "PLAYER" | "AGENT" | "CLUB" | "ADMIN"
  }
  post: {
    id: string
    content: string
  }
}

export default function AdminContentPage() {
  const [activeTab, setActiveTab] = useState<"posts" | "comments">("posts")
  const [posts, setPosts] = useState<Post[]>([])
  const [comments, setComments] = useState<Comment[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [pagination, setPagination] = useState({
    page: 1,
    pageSize: 20,
    total: 0,
    totalPages: 0,
  })

  const fetchContent = useCallback(async () => {
    setIsLoading(true)
    try {
      const params = new URLSearchParams({
        page: String(pagination.page),
        pageSize: String(pagination.pageSize),
        type: activeTab,
      })
      
      if (searchQuery) {
        params.set("search", searchQuery)
      }

      const res = await fetch(`/api/admin/content?${params}`)
      if (res.ok) {
        const data = await res.json()
        if (activeTab === "posts") {
          setPosts(data.items)
        } else {
          setComments(data.items)
        }
        setPagination((prev) => ({
          ...prev,
          total: data.pagination.total,
          totalPages: data.pagination.totalPages,
        }))
      }
    } catch (error) {
      console.error("Error fetching content:", error)
    } finally {
      setIsLoading(false)
    }
  }, [activeTab, pagination.page, pagination.pageSize, searchQuery])

  useEffect(() => {
    fetchContent()
  }, [fetchContent])

  const handleDelete = async (type: "post" | "comment", id: string) => {
    if (!confirm(`Êtes-vous sûr de vouloir supprimer ce ${type === "post" ? "post" : "commentaire"} ?`)) return
    
    try {
      const res = await fetch(`/api/admin/content?type=${type}&id=${id}`, { method: "DELETE" })
      if (res.ok) {
        fetchContent()
      }
    } catch (error) {
      console.error("Error deleting content:", error)
    }
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setPagination((prev) => ({ ...prev, page: 1 }))
    fetchContent()
  }

  const postColumns: Column<Post>[] = [
    {
      key: "user",
      header: "Auteur",
      cell: (post) => (
        <div className="flex items-center gap-3">
          <Avatar className="h-8 w-8">
            <AvatarImage src={post.user.image || ""} />
            <AvatarFallback className="text-xs bg-slate-100">
              {(post.user.name || post.user.email).charAt(0)}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="text-sm font-medium text-slate-900">
              {post.user.name || post.user.email}
            </p>
            <UserBadge role={post.user.role} className="mt-0.5" />
          </div>
        </div>
      ),
    },
    {
      key: "content",
      header: "Contenu",
      cell: (post) => (
        <div className="max-w-md">
          <p className="text-sm text-slate-700 line-clamp-2">{post.content}</p>
          {post.mediaUrls.length > 0 && (
            <span className="text-xs text-slate-500">
              📷 {post.mediaUrls.length} média(s)
            </span>
          )}
        </div>
      ),
    },
    {
      key: "engagement",
      header: "Engagement",
      cell: (post) => (
        <div className="flex items-center gap-4 text-sm text-slate-600">
          <span className="flex items-center gap-1">
            <Heart className="h-3.5 w-3.5" />
            {post._count.likes}
          </span>
          <span className="flex items-center gap-1">
            <MessageSquare className="h-3.5 w-3.5" />
            {post._count.comments}
          </span>
          <span className="flex items-center gap-1">
            <Share2 className="h-3.5 w-3.5" />
            {post._count.shares}
          </span>
        </div>
      ),
    },
    {
      key: "createdAt",
      header: "Date",
      cell: (post) => (
        <span className="text-sm text-slate-500">
          {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true, locale: fr })}
        </span>
      ),
    },
    {
      key: "actions",
      header: "",
      cell: (post) => (
        <ActionMenu
          actions={[
            commonActions.delete(() => handleDelete("post", post.id)),
          ]}
        />
      ),
      className: "w-12",
    },
  ]

  const commentColumns: Column<Comment>[] = [
    {
      key: "user",
      header: "Auteur",
      cell: (comment) => (
        <div className="flex items-center gap-3">
          <Avatar className="h-8 w-8">
            <AvatarImage src={comment.user.image || ""} />
            <AvatarFallback className="text-xs bg-slate-100">
              {(comment.user.name || comment.user.email).charAt(0)}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="text-sm font-medium text-slate-900">
              {comment.user.name || comment.user.email}
            </p>
            <UserBadge role={comment.user.role} className="mt-0.5" />
          </div>
        </div>
      ),
    },
    {
      key: "content",
      header: "Commentaire",
      cell: (comment) => (
        <p className="text-sm text-slate-700 line-clamp-2 max-w-sm">
          {comment.content}
        </p>
      ),
    },
    {
      key: "post",
      header: "Post associé",
      cell: (comment) => (
        <p className="text-sm text-slate-500 line-clamp-1 max-w-xs">
          {comment.post.content}
        </p>
      ),
    },
    {
      key: "createdAt",
      header: "Date",
      cell: (comment) => (
        <span className="text-sm text-slate-500">
          {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true, locale: fr })}
        </span>
      ),
    },
    {
      key: "actions",
      header: "",
      cell: (comment) => (
        <ActionMenu
          actions={[
            commonActions.delete(() => handleDelete("comment", comment.id)),
          ]}
        />
      ),
      className: "w-12",
    },
  ]

  return (
    <div>
      <AdminHeader
        title="Modération du contenu"
        description="Gérez les posts et commentaires de la plateforme"
      />

      <div className="p-4 lg:p-6 space-y-4">
        <Tabs
          value={activeTab}
          onValueChange={(v) => {
            setActiveTab(v as "posts" | "comments")
            setPagination((prev) => ({ ...prev, page: 1 }))
          }}
        >
          <div className="flex flex-col sm:flex-row justify-between gap-4">
            <TabsList>
              <TabsTrigger value="posts">Posts</TabsTrigger>
              <TabsTrigger value="comments">Commentaires</TabsTrigger>
            </TabsList>

            <form onSubmit={handleSearch} className="flex gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  type="search"
                  placeholder="Rechercher dans le contenu..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 h-9 w-64"
                />
              </div>
              <Button type="submit" variant="outline" size="sm" className="h-9">
                Rechercher
              </Button>
            </form>
          </div>

          <TabsContent value="posts" className="mt-4">
            <DataTable
              data={posts}
              columns={postColumns}
              isLoading={isLoading}
              emptyMessage="Aucun post trouvé"
              pagination={{
                page: pagination.page,
                pageSize: pagination.pageSize,
                total: pagination.total,
                onPageChange: (page) => setPagination((prev) => ({ ...prev, page })),
                onPageSizeChange: (pageSize) => setPagination((prev) => ({ ...prev, pageSize, page: 1 })),
              }}
            />
          </TabsContent>

          <TabsContent value="comments" className="mt-4">
            <DataTable
              data={comments}
              columns={commentColumns}
              isLoading={isLoading}
              emptyMessage="Aucun commentaire trouvé"
              pagination={{
                page: pagination.page,
                pageSize: pagination.pageSize,
                total: pagination.total,
                onPageChange: (page) => setPagination((prev) => ({ ...prev, page })),
                onPageSizeChange: (pageSize) => setPagination((prev) => ({ ...prev, pageSize, page: 1 })),
              }}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
