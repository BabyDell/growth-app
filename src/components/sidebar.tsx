import Link from "next/link"
import { Home, Compass, Bookmark, User } from "lucide-react"
import CreatePostButton from "@/components/create-post-button"
import TrendingTags from "@/components/trending-tags"

interface SidebarProps {
  user?: {
    id: string
    name: string | null
    username: string
    profileImageUrl: string | null
  } | null
}

export default function Sidebar({ user }: SidebarProps) {
  return (
    <div className="hidden md:block">
      <div className="sticky top-20 space-y-6">
        <h2 className="text-xl font-bold">Discover</h2>
        <nav className="space-y-1">
          <Link
            href="/"
            className="flex items-center px-3 py-2 text-sm font-medium rounded-md bg-primary/10 text-primary"
          >
            <Home className="h-5 w-5 mr-2" />
            Home
          </Link>
          <Link
            href="/explore"
            className="flex items-center px-3 py-2 text-sm font-medium rounded-md text-gray-700 hover:bg-gray-100"
          >
            <Compass className="h-5 w-5 mr-2" />
            Explore
          </Link>
          <Link
            href="/bookmarks"
            className="flex items-center px-3 py-2 text-sm font-medium rounded-md text-gray-700 hover:bg-gray-100"
          >
            <Bookmark className="h-5 w-5 mr-2" />
            Bookmarks
          </Link>
          {user && (
            <Link
              href={`/profile/${user.username}`}
              className="flex items-center px-3 py-2 text-sm font-medium rounded-md text-gray-700 hover:bg-gray-100"
            >
              <User className="h-5 w-5 mr-2" />
              Profile
            </Link>
          )}
        </nav>

        <div className="mt-8">
          <CreatePostButton />
        </div>

        <div className="mt-8">
          <TrendingTags />
        </div>
      </div>
    </div>
  )
}

