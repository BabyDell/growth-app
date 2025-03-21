"use client"

import { useState } from "react"
import Link from "next/link"
import { Bell, Home, Menu, Search, Settings, Compass, User, X, LogOut, BookOpen } from "lucide-react"
import { logout } from "@/lib/actions/auth"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import type { UserProfile } from "@/types/user"

interface NavbarProps {
  user: UserProfile | null
  notificationCount?: number
}

export default function Navbar({ user, notificationCount = 0 }: NavbarProps) {
  const [isSearchOpen, setIsSearchOpen] = useState(false)

  const handleLogout = async () => {
    await logout()
  }

  // Get initials for avatar fallback
  const getInitials = () => {
    if (!user?.name) return "U"
    return user.name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .toUpperCase()
      .substring(0, 2)
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background">
      <div className="container flex h-16 items-center px-4 m-auto">
        {/* Mobile Menu */}
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="md:hidden">
              <Menu className="h-5 w-5" />
              <span className="sr-only">Toggle menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-[240px] sm:w-[300px]">
            <nav className="flex flex-col gap-4 mt-8">
              <Link href="/" className="flex items-center gap-2 text-lg font-semibold">
                <Home className="h-5 w-5" />
                Home
              </Link>
              <Link href="/explore" className="flex items-center gap-2 text-lg font-semibold">
                <Compass className="h-5 w-5" />
                Explore
              </Link>
              <Link href="/profile" className="flex items-center gap-2 text-lg font-semibold">
                <User className="h-5 w-5" />
                Profile
              </Link>
              <Link href="/settings" className="flex items-center gap-2 text-lg font-semibold">
                <Settings className="h-5 w-5" />
                Settings
              </Link>
              {user && (
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 text-lg font-semibold text-left text-destructive"
                >
                  <LogOut className="h-5 w-5" />
                  Logout
                </button>
              )}
            </nav>
          </SheetContent>
        </Sheet>

        {/* Logo */}
        <div className="flex items-center gap-2 mr-4">
          <Link href="/" className="flex items-center gap-2">
          <BookOpen className="h-6 w-6 text-primary" />
          <span className="text-xl font-bold">LearnDaily</span>
          </Link>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-6 mx-6">
          <Link href="/" className="text-sm font-medium transition-colors hover:text-primary">
            Home
          </Link>
          <Link href="/explore" className="text-sm font-medium transition-colors hover:text-primary">
            Explore
          </Link>
          <Link href="/profile" className="text-sm font-medium transition-colors hover:text-primary">
            Profile
          </Link>
        </nav>

        {/* Search Bar - Desktop */}
        <div className="hidden md:flex flex-1 items-center gap-2 mx-6">
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input type="search" placeholder="Search..." className="w-full pl-8 bg-muted" />
          </div>
        </div>

        {/* Mobile Search Toggle */}
        <div className="flex md:hidden flex-1 items-center justify-end">
          <Button variant="ghost" size="icon" onClick={() => setIsSearchOpen(!isSearchOpen)} className="mr-2">
            {isSearchOpen ? <X className="h-5 w-5" /> : <Search className="h-5 w-5" />}
            <span className="sr-only">Toggle search</span>
          </Button>
        </div>

        {/* Right Side Items */}
        <div className="flex items-center gap-2">
          {/* Notifications */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="h-5 w-5" />
                {notificationCount > 0 && (
                  <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0">
                    {notificationCount > 99 ? "99+" : notificationCount}
                  </Badge>
                )}
                <span className="sr-only">Notifications</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Notifications</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {notificationCount > 0 ? (
                <>
                  <DropdownMenuItem>New message from Alex</DropdownMenuItem>
                  <DropdownMenuItem>Jamie liked your post</DropdownMenuItem>
                  <DropdownMenuItem>New follower: Taylor</DropdownMenuItem>
                </>
              ) : (
                <DropdownMenuItem disabled>No new notifications</DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Settings */}
          {/* <Button variant="ghost" size="icon" asChild>
            <Link href="/settings">
              <Settings className="h-5 w-5" />
              <span className="sr-only">Settings</span>
            </Link>
          </Button> */}

          {/* Profile */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-full">
                <Avatar>
                  <AvatarImage
                    src={user?.profileImageUrl || "/placeholder.svg?height=32&width=32"}
                    alt={user?.name || "User"}
                  />
                  <AvatarFallback>{getInitials()}</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>{user?.name || "My Account"}</DropdownMenuLabel>
              {user?.email && <div className="px-2 py-1.5 text-sm text-muted-foreground">{user.email}</div>}
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <Link href="/profile" className="flex w-full">
                  Profile
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Link href="/settings" className="flex w-full">
                  Settings
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Link href="/help" className="flex w-full">
                  Help
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout}>
                <span className="flex items-center gap-2">
                  <LogOut className="h-4 w-4" />
                  Logout
                </span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Mobile Search Bar - Expandable */}
      {isSearchOpen && (
        <div className="md:hidden px-4 pb-3">
          <div className="relative w-full">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input type="search" placeholder="Search..." className="w-full pl-8 bg-muted" />
          </div>
        </div>
      )}
    </header>
  )
}

