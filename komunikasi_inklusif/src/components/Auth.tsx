import React, { useState, useEffect } from 'react'
import { supabase } from '@/integrations/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { useAccessibility } from './AccessibilityProvider'
import { toast } from 'sonner'
import { User, Session } from '@supabase/supabase-js'

interface AuthProps {
  onAuthSuccess?: () => void
}

export const Auth: React.FC<AuthProps> = ({ onAuthSuccess }) => {
  const [isLogin, setIsLogin] = useState(true)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [username, setUsername] = useState('')
  const [fullName, setFullName] = useState('')
  const [disabilityType, setDisabilityType] = useState<'none' | 'deaf' | 'blind' | 'both'>('none')
  const [loading, setLoading] = useState(false)
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)

  const { settings, updateSettings, announceToScreenReader, triggerHapticFeedback } = useAccessibility()

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setUser(session?.user ?? null)
      if (session?.user) {
        announceToScreenReader('Anda sudah masuk ke aplikasi')
        onAuthSuccess?.()
      }
    })

    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session)
        setUser(session?.user ?? null)
        
        if (event === 'SIGNED_IN' && session?.user) {
          announceToScreenReader('Berhasil masuk ke aplikasi')
          triggerHapticFeedback('medium')
          
          // Create or update user profile
          await createUserProfile(session.user.id)
          onAuthSuccess?.()
        } else if (event === 'SIGNED_OUT') {
          announceToScreenReader('Anda telah keluar dari aplikasi')
          triggerHapticFeedback('short')
        }
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  const createUserProfile = async (userId: string) => {
    try {
      const { error } = await supabase
        .from('user_profiles_2025_12_06_14_53')
        .upsert({
          user_id: userId,
          username: username || email.split('@')[0],
          full_name: fullName,
          disability_type: disabilityType,
          accessibility_preferences: settings
        })

      if (error) throw error
    } catch (error: any) {
      console.error('Error creating user profile:', error)
    }
  }

  const handleSignUp = async () => {
    if (!email || !password) {
      toast.error('Email dan password harus diisi')
      announceToScreenReader('Email dan password harus diisi')
      return
    }

    setLoading(true)
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/`,
          data: {
            username: username || email.split('@')[0],
            full_name: fullName,
            disability_type: disabilityType
          }
        }
      })

      if (error) throw error

      toast.success('Registrasi berhasil! Silakan cek email Anda untuk verifikasi.')
      announceToScreenReader('Registrasi berhasil. Silakan cek email Anda untuk verifikasi.')
      triggerHapticFeedback('medium')
    } catch (error: any) {
      toast.error(error.message)
      announceToScreenReader(`Error: ${error.message}`)
      triggerHapticFeedback('long')
    } finally {
      setLoading(false)
    }
  }

  const handleSignIn = async () => {
    if (!email || !password) {
      toast.error('Email dan password harus diisi')
      announceToScreenReader('Email dan password harus diisi')
      return
    }

    setLoading(true)
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      })

      if (error) throw error

      toast.success('Berhasil masuk!')
      announceToScreenReader('Berhasil masuk ke aplikasi')
      triggerHapticFeedback('medium')
    } catch (error: any) {
      toast.error(error.message)
      announceToScreenReader(`Error: ${error.message}`)
      triggerHapticFeedback('long')
    } finally {
      setLoading(false)
    }
  }

  const handleSignOut = async () => {
    try {
      const { error } = await supabase.auth.signOut()
      if (error) throw error
      
      toast.success('Berhasil keluar')
      announceToScreenReader('Berhasil keluar dari aplikasi')
      triggerHapticFeedback('short')
    } catch (error: any) {
      toast.error(error.message)
      announceToScreenReader(`Error: ${error.message}`)
    }
  }

  if (user) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader>
          <CardTitle>Selamat Datang!</CardTitle>
          <CardDescription>
            Anda masuk sebagai {user.email}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button 
            onClick={handleSignOut} 
            variant="outline" 
            className="w-full touch-target"
            aria-label="Keluar dari aplikasi"
          >
            Keluar
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="text-center">
          {isLogin ? 'Masuk' : 'Daftar'} - Komunikasi Inklusif
        </CardTitle>
        <CardDescription className="text-center">
          {isLogin 
            ? 'Masuk ke aplikasi komunikasi untuk semua' 
            : 'Buat akun baru untuk bergabung dengan komunitas inklusif'
          }
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            placeholder="email@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="touch-target"
            aria-describedby="email-help"
          />
          <div id="email-help" className="sr-only">
            Masukkan alamat email Anda
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="touch-target"
            aria-describedby="password-help"
          />
          <div id="password-help" className="sr-only">
            Masukkan password Anda
          </div>
        </div>

        {!isLogin && (
          <>
            <div className="space-y-2">
              <Label htmlFor="username">Username (Opsional)</Label>
              <Input
                id="username"
                type="text"
                placeholder="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="touch-target"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="fullName">Nama Lengkap (Opsional)</Label>
              <Input
                id="fullName"
                type="text"
                placeholder="Nama Lengkap"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="touch-target"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="disability-type">Jenis Disabilitas</Label>
              <Select value={disabilityType} onValueChange={(value: any) => setDisabilityType(value)}>
                <SelectTrigger className="touch-target" id="disability-type">
                  <SelectValue placeholder="Pilih jenis disabilitas" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Tidak Ada</SelectItem>
                  <SelectItem value="deaf">Tunarungu</SelectItem>
                  <SelectItem value="blind">Tunanetra</SelectItem>
                  <SelectItem value="both">Tunarungu dan Tunanetra</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </>
        )}

        <Button
          onClick={isLogin ? handleSignIn : handleSignUp}
          disabled={loading}
          className="w-full touch-target"
          aria-label={isLogin ? 'Masuk ke aplikasi' : 'Daftar akun baru'}
        >
          {loading ? 'Memproses...' : (isLogin ? 'Masuk' : 'Daftar')}
        </Button>

        <Button
          variant="ghost"
          onClick={() => {
            setIsLogin(!isLogin)
            announceToScreenReader(isLogin ? 'Beralih ke halaman daftar' : 'Beralih ke halaman masuk')
          }}
          className="w-full touch-target"
          aria-label={isLogin ? 'Beralih ke halaman daftar' : 'Beralih ke halaman masuk'}
        >
          {isLogin ? 'Belum punya akun? Daftar' : 'Sudah punya akun? Masuk'}
        </Button>
      </CardContent>
    </Card>
  )
}