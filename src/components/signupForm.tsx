"use client"

import { useState } from "react"
import { signup } from "@/lib/actions/auth"
import { useActionState } from "react"
import { EyeIcon, EyeOffIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Link from "next/link"

export default function SignUpForm() {
  const [state, formAction] = useActionState(signup, {
    errors: {},
    message: "",
  })

  const [showPassword, setShowPassword] = useState(false)

  return (
    <div className="w-full max-w-md mx-auto">
      <h2 className={`mt-6 text-center text-3xl font-extrabold text-gray-900`}>CREATE YOUR ACCOUNT</h2>
      <form action={formAction} className="mt-8 space-y-6">
        <div className="rounded-md shadow-sm space-y-3">
          <div>
            <Label htmlFor="name" className="sr-only">
              Name
            </Label>
            <Input id="name" name="name" type="text" required className="rounded-t-md" placeholder="Name" />
          </div>
          {state.errors?.name && <p className="text-red-500 text-sm mt-1">{state.errors.name.join(", ")}</p>}

          <div>
            <Label htmlFor="username" className="sr-only">
              Username
            </Label>
            <Input id="username" name="username" type="text" required className="rounded-none" placeholder="Username" />
          </div>
          {state.errors?.username && <p className="text-red-500 text-sm mt-1">{state.errors.username.join(", ")}</p>}

          <div>
            <Label htmlFor="email" className="sr-only">
              Email address
            </Label>
            <Input id="email" name="email" type="email" required className="rounded-none" placeholder="Email address" />
          </div>
          {state.errors?.email && <p className="text-red-500 text-sm mt-1">{state.errors.email.join(", ")}</p>}

          <div className="relative">
            <Label htmlFor="password" className="sr-only">
              Password
            </Label>
            <Input
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              required
              className="rounded-b-md"
              placeholder="Password"
            />
            <button
              type="button"
              className="absolute inset-y-0 right-0 pr-3 flex items-center"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? (
                <EyeOffIcon className="h-5 w-5 text-gray-400" />
              ) : (
                <EyeIcon className="h-5 w-5 text-gray-400" />
              )}
            </button>
          </div>
          {state.errors?.password && (
            <div className="text-red-500 text-sm mt-1">
              <p>Password must:</p>
              <ul className="list-disc list-inside">
                {state.errors.password.map((error) => (
                  <li key={error}>{error}</li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <div>
          <Button type="submit" className="w-full">
            Create account
          </Button>
        </div>

        {state.errors?.server && (
          <div className="text-red-500 text-sm">
            <p>Server Error:</p>
            <ul className="list-disc list-inside">
              {state.errors.server.map((error) => (
                <li key={error}>{error}</li>
              ))}
            </ul>
          </div>
        )}

        {state.message && <p className="text-green-500 text-sm text-center">{state.message}</p>}
      </form>

      <div className="mt-6">
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white text-gray-500">Or register with</span>
          </div>
        </div>

        <div className="mt-6">
          <Button variant="outline" className="w-full">
            <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24">
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                fill="#4285F4"
              />
              <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
              />
              <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                fill="#FBBC05"
              />
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                fill="#EA4335"
              />
              <path d="M1 1h22v22H1z" fill="none" />
            </svg>
            Sign up with Google
          </Button>
        </div>
      </div>
      <div className="mt-6 text-center">
        <p className="text-sm text-gray-600">
          Already have an account?{" "}
          <Link href="/auth/login" className="text-primary hover:text-primary/80 font-medium">
            Log in
          </Link>
        </p>
      </div>
    </div>
  )
}

