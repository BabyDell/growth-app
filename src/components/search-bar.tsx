"use client"

import type React from "react"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search } from "lucide-react"

export default function SearchBar() {
  const [query, setQuery] = useState("")

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    // Handle search logic
    console.log("Searching for:", query)
  }

  return (
    <form onSubmit={handleSearch} className="relative">
      <Input
        type="search"
        placeholder="Search for knowledge..."
        className="pl-10 pr-4 py-2"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />
      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
      <Button type="submit" size="sm" className="absolute right-1 top-1/2 transform -translate-y-1/2 h-7">
        Search
      </Button>
    </form>
  )
}

