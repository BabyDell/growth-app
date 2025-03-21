import { Badge } from "@/components/ui/badge"

export default function TrendingTags() {
  // This would typically come from an API
  const trendingTags = [
    { name: "science", count: 1243 },
    { name: "technology", count: 982 },
    { name: "history", count: 756 },
    { name: "psychology", count: 621 },
    { name: "philosophy", count: 543 },
    { name: "art", count: 432 },
    { name: "literature", count: 321 },
    { name: "mathematics", count: 298 },
  ]

  return (
    <div className="space-y-3">
      <h3 className="font-medium">Trending Tags</h3>
      <div className="flex flex-wrap gap-2">
        {trendingTags.map((tag) => (
          <Badge key={tag.name} variant="outline" className="cursor-pointer hover:bg-secondary">
            #{tag.name}
            <span className="ml-1 text-xs text-muted-foreground">({tag.count})</span>
          </Badge>
        ))}
      </div>
    </div>
  )
}

