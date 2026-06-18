'use client'

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"

export function AuthenticationDialogComponent({ onAuthenticate }: { onAuthenticate: () => void }) {
  const [isSignUp, setIsSignUp] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Simulate authentication
    setTimeout(onAuthenticate, 1000)
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button className="w-full bg-emerald-600 hover:bg-emerald-700 text-white">
          {isSignUp ? "Create Account" : "Sign In"}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] bg-gray-800 text-gray-100">
        <DialogHeader>
          <DialogTitle>{isSignUp ? "Create an Account" : "Sign In"}</DialogTitle>
          <DialogDescription>
            {isSignUp ? "Join us to save and access your designs." : "Welcome back! Sign in to continue."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" placeholder="Enter your email" className="bg-gray-700 border-gray-600 text-gray-100" required />
          </div>
          <div>
            <Label htmlFor="password">Password</Label>
            <Input id="password" type="password" placeholder="Enter your password" className="bg-gray-700 border-gray-600 text-gray-100" required />
          </div>
          <Button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-700 text-white">
            {isSignUp ? "Sign Up" : "Sign In"}
          </Button>
        </form>
        <div className="mt-4 text-center">
          <Button variant="link" onClick={() => setIsSignUp(!isSignUp)} className="text-emerald-400">
            {isSignUp ? "Already have an account? Sign In" : "Don't have an account? Sign Up"}
          </Button>
        </div>
        <div className="mt-4 flex justify-center space-x-4">
          <Button onClick={onAuthenticate} className="bg-blue-600 hover:bg-blue-700 text-white">
            Sign in with Google
          </Button>
          <Button onClick={onAuthenticate} className="bg-blue-800 hover:bg-blue-900 text-white">
            Sign in with Facebook
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}