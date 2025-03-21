import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Edit, Settings } from "lucide-react"
import PostCard from "@/components/post-card"
import prisma from "@/config/prisma"
import { getUserProfile } from "@/lib/user-service"

type tParams = Promise<{ slug: string }>;

export default async function ProfilePage(props: { params: tParams}) {
  // Fetch user data from the database using Prisma
  const { slug } =  await props.params;
  const username = slug || "janesmith"


  const userData = await prisma.user.findUnique({
    where: { username },
    include: {
      followers: true,
      following: true,
      interests: {
        include: {
          tag: true,
        },
      },
      posts: {
        include: {
        votes: true,
          user: true,
          tags: {
            include: {
              tag: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
        take: 5,
      },
    },
  })

  // If user not found, you might want to handle this case
  if (!userData) {
    return <div>User not found</div>
  }

  // Format user data to match the UI structure
  const user = {
    name: userData.name,
    username: userData.username,
    bio: userData.bio || "Knowledge enthusiast. Always learning something new.",
    avatar: userData.profileImageUrl || "/placeholder.svg?height=100&width=100",
    joinedDate: new Date(userData.createdAt).toLocaleDateString("en-US", { month: "long", year: "numeric" }),
    stats: {
      posts: userData.posts.length,
      followers: userData.followers.length,
      following: userData.following.length,
    },
    interests: userData.interests.map((interest) => interest.tag.name),
  }

  // Get current user to check if they're viewing their own profile
  const currentUser = await getUserProfile()
  const isOwnProfile = currentUser?.username === username

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Profile sidebar */}
        <div className="md:col-span-1">
          <div className="sticky top-20 space-y-6">
            <div className="flex flex-col items-center text-center p-6 border rounded-lg">
              <Avatar className="h-24 w-24 mb-4">
                <AvatarImage src={user.avatar} alt={user.name} />
                <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <h1 className="text-2xl font-bold">{user.name}</h1>
              <p className="text-muted-foreground">@{user.username}</p>
              <p className="mt-4">{user.bio}</p>
              <p className="text-sm text-muted-foreground mt-2">Joined {user.joinedDate}</p>

              <div className="flex justify-center gap-4 mt-4">
                <div className="text-center">
                  <p className="font-bold">{user.stats.posts}</p>
                  <p className="text-xs text-muted-foreground">Posts</p>
                </div>
                <div className="text-center">
                  <p className="font-bold">{user.stats.followers}</p>
                  <p className="text-xs text-muted-foreground">Followers</p>
                </div>
                <div className="text-center">
                  <p className="font-bold">{user.stats.following}</p>
                  <p className="text-xs text-muted-foreground">Following</p>
                </div>
              </div>

              {isOwnProfile ? (
                <div className="flex gap-2 mt-6">
                  <Button variant="outline" size="sm" className="gap-1">
                    <Edit className="h-4 w-4" />
                    Edit Profile
                  </Button>
                  <Button variant="outline" size="sm" className="gap-1">
                    <Settings className="h-4 w-4" />
                    Settings
                  </Button>
                </div>
              ) : (
                <Button className="mt-6" variant="default" size="sm">
                  Follow
                </Button>
              )}
            </div>

            <div className="border rounded-lg p-6">
              <h2 className="font-medium mb-4">Interests</h2>
              <div className="flex flex-wrap gap-2">
                {user.interests.map((interest) => (
                  <Badge key={interest} variant="secondary">
                    #{interest}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Main content */}
        <div className="md:col-span-2">
          <Tabs defaultValue="posts" className="w-full">
            <TabsList className="grid grid-cols-3 mb-6">
              <TabsTrigger value="posts">Posts</TabsTrigger>
              <TabsTrigger value="followers">Followers</TabsTrigger>
              <TabsTrigger value="following">Following</TabsTrigger>
            </TabsList>

            <TabsContent value="posts" className="space-y-4">
              {userData.posts.length > 0 ? (
                userData.posts.map((post) => (
                  <PostCard
                    key={post.id}
                    id={post.id}
                    author={{
                      id: post.user.id,
                      name: post.user.name,
                      username: post.user.username,
                      profileImageUrl: post.user.profileImageUrl || "/placeholder.svg?height=40&width=40",
                    }}
                    content={post.content}
                    createdAt={new Date(post.createdAt)}
                    tags={post.tags.map((tag) => ({ id: tag.tag.id, name: tag.tag.name }))}
                    postType="fact" // or any appropriate type
                    votes={{
                      upvotes: post.votes.filter(vote => vote.voteType === 'upvote').length,
                      downvotes: post.votes.filter(vote => vote.voteType === 'downvote').length,
                      userVote: post.votes.find(vote => vote.userId === currentUser?.id)?.voteType || null
                    }}
                  />
                ))
              ) : (
                <p className="text-center text-muted-foreground py-8">No posts yet.</p>
              )}
            </TabsContent>

            <TabsContent value="followers" className="space-y-4">
              {userData.followers.length > 0 ? (
                <div className="grid gap-4">
                  {userData.followers.map((follow) => (
                    <div key={follow.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src="/placeholder.svg?height=40&width=40" alt="Follower" />
                          <AvatarFallback>U</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">User {follow.followerId.substring(0, 8)}</p>
                          <p className="text-sm text-muted-foreground">@username</p>
                        </div>
                      </div>
                      <Button variant="outline" size="sm">
                        Follow Back
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-muted-foreground py-8">No followers yet.</p>
              )}
            </TabsContent>

            <TabsContent value="following" className="space-y-4">
              {userData.following.length > 0 ? (
                <div className="grid gap-4">
                  {userData.following.map((follow) => (
                    <div key={follow.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src="/placeholder.svg?height=40&width=40" alt="Following" />
                          <AvatarFallback>U</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">User {follow.followingId.substring(0, 8)}</p>
                          <p className="text-sm text-muted-foreground">@username</p>
                        </div>
                      </div>
                      <Button variant="outline" size="sm">
                        Unfollow
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-muted-foreground py-8">Not following anyone yet.</p>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}

