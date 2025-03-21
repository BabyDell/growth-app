export const dynamic = "force-dynamic";
import { Tabs, TabsList, TabsContent, TabsTrigger } from "@/components/ui/tabs"
import CreatePostButton from "@/components/create-post-button"
import SearchBar from "@/components/search-bar"
import InfinitePostFeed from "@/components/infinite-post-feed"
import Sidebar from "@/components/sidebar"
import { verifySession } from "@/lib/dal"
import { getUserWithNotifications } from "@/lib/actions/user-actions"
import { getInitialPosts } from "@/lib/actions/post-actions"

export default async function HomePage() {
  // Verify user session first
  await verifySession()

  // Fetch user data and initial posts in parallel
  const [userData, initialAllPosts, initialFactPosts, initialQuestionPosts, initialLessonPosts] = await Promise.all([
    getUserWithNotifications(),
    getInitialPosts(),
    getInitialPosts("fact"),
    getInitialPosts("question"),
    getInitialPosts("lesson"),
  ])

  return (  
    <div className="container max-w-7xl mx-auto px-4 py-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left sidebar */}
        <Sidebar user={userData?.user} />

        {/* Main content */}
        <div className="md:col-span-2">
          <div className="mb-6">
            <SearchBar />
          </div>

          <Tabs defaultValue="all" className="mb-6">
            <TabsList className="grid grid-cols-4 mb-4">
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="facts">Facts</TabsTrigger>
              <TabsTrigger value="questions">Questions</TabsTrigger>
              <TabsTrigger value="lessons">Lessons</TabsTrigger>
            </TabsList>
            <TabsContent value="all" className="space-y-4">
              <InfinitePostFeed initialPosts={initialAllPosts.map(post => ({
              ...post,
              author: {
                ...post.author,
                name: post.author.name || "Unknown"
              }
              }))} postType={undefined} />
            </TabsContent>
            <TabsContent value="facts" className="space-y-4">
              <InfinitePostFeed initialPosts={initialFactPosts.map(post => ({
              ...post,
              author: {
                ...post.author,
                name: post.author.name || "Unknown"
              }
              }))} postType="fact" />
            </TabsContent>
            <TabsContent value="questions" className="space-y-4">
              <InfinitePostFeed initialPosts={initialQuestionPosts.map(post => ({
              ...post,
              author: {
                ...post.author,
                name: post.author.name || "Unknown"
              }
              }))} postType="question" />
            </TabsContent>
            <TabsContent value="lessons" className="space-y-4">
              <InfinitePostFeed initialPosts={initialLessonPosts.map(post => ({
              ...post,
              author: {
                ...post.author,
                name: post.author.name || "Unknown"
              }
              }))} postType="lesson" />
            </TabsContent>
          </Tabs>

          <div className="md:hidden fixed bottom-4 right-4">
            <CreatePostButton />
          </div>
        </div>
      </div>
    </div>
  )
}

