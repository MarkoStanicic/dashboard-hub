'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Session, User } from '@supabase/supabase-js'

type Role = 'admin' | 'editor' | 'viewer'

interface UserContextType {
  session: Session | null
  user: User | null
  role: Role | null
  companyId: string | null
  isSuperAdmin: boolean
  loading: boolean
}

const defaultContextValue: UserContextType = {
  session: null,
  user: null,
  role: null,
  companyId: null,
  isSuperAdmin: false,
  loading: true
}

const UserContext = createContext<UserContextType>(defaultContextValue)

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const supabase = createClient()
  const [session, setSession] = useState<Session | null>(null)
  const [user, setUser] = useState<User | null>(null)
  const [role, setRole] = useState<Role | null>(null)
  const [companyId, setCompanyId] = useState<string | null>(null)
  const [isSuperAdmin, setIsSuperAdmin] = useState(false)
  const [loading, setLoading] = useState(true)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!mounted) return

    const getUserData = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession()
      setSession(session)
      setUser(session?.user ?? null)

      if (!session?.user) {
        setLoading(false)
        return
      }

      const { data, error } = await supabase
        .from('users')
        .select(
          `company_id, is_super_admin,
            user_roles(role_id),
            user_roles(role:role_id(name))`
        )
        .eq('id', session.user.id)
        .single()

      if (error) {
        console.warn('Failed to fetch user profile:', error.message || error)
      } else {
        setCompanyId(data.company_id)
        setIsSuperAdmin(data.is_super_admin)
        setRole(data.user_roles?.[0]?.role?.name ?? null)
      }

      setLoading(false)
    }

    getUserData()

    // Set up auth state listener
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      setUser(session?.user ?? null)
      if (!session?.user) {
        setRole(null)
        setCompanyId(null)
        setIsSuperAdmin(false)
      }
    })

    return () => subscription.unsubscribe()
  }, [supabase, mounted])

  const contextValue: UserContextType = {
    session,
    user,
    role,
    companyId,
    isSuperAdmin,
    loading: loading || !mounted
  }

  return (
    <UserContext.Provider value={contextValue}>
      {children}
    </UserContext.Provider>
  )
}

export const useUser = () => {
  const context = useContext(UserContext)
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider')
  }
  return context
}