import { useState, useEffect, createContext, useContext } from 'react'
import { supabase, getCurrentUser, signOut } from '../config/supabase'
import toast from 'react-hot-toast'

const AuthContext = createContext({})

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [profile, setProfile] = useState(null)

  useEffect(() => {
    // Get initial session
    checkUser()
    
    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' && session?.user) {
          setUser(session.user)
          await fetchProfile(session.user.id)
        } else if (event === 'SIGNED_OUT') {
          setUser(null)
          setProfile(null)
        }
        setLoading(false)
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  const checkUser = async () => {
    try {
      const user = await getCurrentUser()
      setUser(user)
      if (user) {
        await fetchProfile(user.id)
      }
    } catch (error) {
      console.error('Error checking user:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchProfile = async (userId) => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .maybeSingle()

      if (error) {
        console.error('Error fetching profile:', error)
        return
      }

      setProfile(data)
    } catch (error) {
      console.error('Error fetching profile:', error)
    }
  }

  const logout = async () => {
    try {
      setLoading(true)
      const { error } = await signOut()
      if (error) {
        toast.error('Error logging out')
        return
      }
      setUser(null)
      setProfile(null)
      toast.success('Logged out successfully')
    } catch (error) {
      toast.error('Error logging out')
    } finally {
      setLoading(false)
    }
  }

  const updateProfile = async (profileData) => {
    try {
      const { error } = await supabase
        .from('users')
        .upsert({ 
          id: user.id, 
          email: user.email,
          ...profileData,
          updated_at: new Date().toISOString()
        })

      if (error) throw error

      setProfile(prev => ({ ...prev, ...profileData }))
      toast.success('Profile updated successfully')
      return { success: true }
    } catch (error) {
      toast.error('Error updating profile')
      return { success: false, error: error.message }
    }
  }

  const value = {
    user,
    profile,
    loading,
    logout,
    updateProfile,
    fetchProfile
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}