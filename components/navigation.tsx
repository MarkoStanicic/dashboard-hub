'use client'

import { useUser } from '@/components/auth/UserProvider'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Badge } from '@/components/ui/badge'
import { createClient } from '@/lib/supabase/client'
import { ChevronDownIcon, UserIcon, BarChart3Icon, BuildingIcon, ShieldIcon } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useRouter } from 'next/navigation'

export default function Navigation() {
  const { user, role, isSuperAdmin, loading } = useUser()
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()

  // Don't show navigation on auth pages
  if (pathname.startsWith('/auth/')) {
    return null
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/auth/login')
  }

  const isActive = (path: string) => {
    if (path === '/dashboard' && pathname === '/dashboard') return true
    if (path !== '/dashboard' && pathname.startsWith(path)) return true
    return false
  }

  const getLinkClass = (path: string) => {
    const baseClass = "px-3 py-2 rounded-md text-sm font-medium transition-colors"
    const activeClass = "bg-primary text-primary-foreground"
    const inactiveClass = "text-muted-foreground hover:text-foreground hover:bg-accent"
    return `${baseClass} ${isActive(path) ? activeClass : inactiveClass}`
  }

  return (
    <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo/Brand */}
          <div className="flex items-center space-x-8">
            <Link href="/dashboard" className="flex items-center space-x-2">
              <BarChart3Icon className="h-6 w-6 text-primary" />
              <span className="font-bold text-xl">Dashboard Hub</span>
            </Link>

            {/* Main Navigation */}
            {user && !loading && (
              <div className="hidden md:flex items-center space-x-1">
                <Link href="/dashboard" className={getLinkClass('/dashboard')}>
                  <BarChart3Icon className="h-4 w-4 mr-2 inline" />
                  Dashboards
                </Link>
                
                <Link href="/company" className={getLinkClass('/company')}>
                  <BuildingIcon className="h-4 w-4 mr-2 inline" />
                  Company
                </Link>
                
                {(role === 'admin' || isSuperAdmin) && (
                  <Link href="/admin" className={getLinkClass('/admin')}>
                    <ShieldIcon className="h-4 w-4 mr-2 inline" />
                    Admin
                  </Link>
                )}
              </div>
            )}
          </div>

          {/* User Menu */}
          <div className="flex items-center space-x-4">
            {loading ? (
              <div className="w-8 h-8 rounded-full bg-muted animate-pulse" />
            ) : user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="h-8 px-3 flex items-center space-x-2">
                    <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                      <UserIcon className="h-4 w-4 text-primary-foreground" />
                    </div>
                    <div className="hidden sm:flex items-center space-x-2">
                      <span className="text-sm font-medium">
                        {user.email?.split('@')[0] || 'User'}
                      </span>
                      <ChevronDownIcon className="h-4 w-4" />
                    </div>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>
                    <div className="flex flex-col space-y-1">
                      <span className="text-sm font-medium">
                        {user.email?.split('@')[0] || 'User'}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {user.email}
                      </span>
                    </div>
                  </DropdownMenuLabel>
                  
                  <DropdownMenuSeparator />
                  
                  {/* Role Badge */}
                  <div className="px-2 py-1.5">
                    <div className="flex items-center space-x-2">
                      <span className="text-xs text-muted-foreground">Role:</span>
                      <Badge variant={isSuperAdmin ? "default" : "secondary"} className="text-xs">
                        {isSuperAdmin ? 'Super Admin' : role || 'User'}
                      </Badge>
                    </div>
                  </div>
                  
                  <DropdownMenuSeparator />
                  
                  {/* Mobile Navigation Links */}
                  <div className="md:hidden">
                    <DropdownMenuItem asChild>
                      <Link href="/dashboard" className="w-full">
                        <BarChart3Icon className="h-4 w-4 mr-2" />
                        Dashboards
                      </Link>
                    </DropdownMenuItem>
                    
                    <DropdownMenuItem asChild>
                      <Link href="/company" className="w-full">
                        <BuildingIcon className="h-4 w-4 mr-2" />
                        Company
                      </Link>
                    </DropdownMenuItem>
                    
                    {(role === 'admin' || isSuperAdmin) && (
                      <DropdownMenuItem asChild>
                        <Link href="/admin" className="w-full">
                          <ShieldIcon className="h-4 w-4 mr-2" />
                          Admin
                        </Link>
                      </DropdownMenuItem>
                    )}
                    
                    <DropdownMenuSeparator />
                  </div>
                  
                  {/* Debug Links */}
                  <DropdownMenuItem asChild>
                    <Link href="/debug" className="w-full">
                      🔍 Debug Database
                    </Link>
                  </DropdownMenuItem>
                  
                  <DropdownMenuItem asChild>
                    <Link href="/test-data" className="w-full">
                      🧪 Test API Data
                    </Link>
                  </DropdownMenuItem>
                  
                  <DropdownMenuSeparator />
                  
                  <DropdownMenuItem onClick={handleSignOut}>
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="flex items-center space-x-2">
                <Button variant="ghost" asChild>
                  <Link href="/auth/login">Sign In</Link>
                </Button>
                <Button asChild>
                  <Link href="/auth/sign-up">Sign Up</Link>
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
} 