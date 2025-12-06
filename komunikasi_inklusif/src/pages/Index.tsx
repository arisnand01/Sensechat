import React, { useState, useEffect } from 'react'
import { AccessibilityProvider } from '@/components/AccessibilityProvider'
import { Auth } from '@/components/Auth'
import { ChatInterface } from '@/components/ChatInterface'
import { VideoCall } from '@/components/VideoCall'
import { AccessibilitySettings } from '@/components/AccessibilitySettings'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Toaster } from '@/components/ui/sonner'
import { supabase } from '@/integrations/supabase/client'
import { 
  MessageSquare, 
  Video, 
  Settings, 
  Users, 
  Hand, 
  Eye, 
  Volume2, 
  Smartphone,
  Bot,
  Heart,
  Accessibility
} from 'lucide-react'
import { User } from '@supabase/supabase-js'

const Index = () => {
  const [user, setUser] = useState<User | null>(null)
  const [activeTab, setActiveTab] = useState('chat')
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  useEffect(() => {
    // Check initial auth state
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      setIsAuthenticated(!!session?.user)
    })

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setUser(session?.user ?? null)
        setIsAuthenticated(!!session?.user)
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  const handleAuthSuccess = () => {
    setIsAuthenticated(true)
  }

  if (!isAuthenticated) {
    return (
      <AccessibilityProvider>
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex items-center justify-center p-4">
          <div className="w-full max-w-md">
            {/* Welcome Header */}
            <div className="text-center mb-8">
              <div className="flex justify-center items-center gap-3 mb-4">
                <Accessibility className="w-12 h-12 text-primary" />
                <Hand className="w-8 h-8 text-secondary" />
                <Eye className="w-8 h-8 text-accent" />
              </div>
              <h1 className="text-3xl font-bold text-foreground mb-2">
                Komunikasi Inklusif
              </h1>
              <p className="text-muted-foreground text-lg">
                Platform komunikasi untuk semua, tanpa batasan
              </p>
            </div>

            {/* Features Preview */}
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="text-center text-lg">Fitur Utama</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="flex items-center gap-2">
                    <Hand className="w-4 h-4 text-secondary" />
                    <span>Bahasa Isyarat AI</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Volume2 className="w-4 h-4 text-accent" />
                    <span>Narasi Emosional</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Eye className="w-4 h-4 text-primary" />
                    <span>Deskripsi Visual</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Video className="w-4 h-4 text-green-600" />
                    <span>Video Call Inklusif</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Bot className="w-4 h-4 text-purple-600" />
                    <span>AI Bridge Mode</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Smartphone className="w-4 h-4 text-orange-600" />
                    <span>Haptic Feedback</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Auth onAuthSuccess={handleAuthSuccess} />
          </div>
          <Toaster />
        </div>
      </AccessibilityProvider>
    )
  }

  return (
    <AccessibilityProvider>
      <div className="min-h-screen bg-background">
        {/* Header */}
        <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-50">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Accessibility className="w-8 h-8 text-primary" />
                <div>
                  <h1 className="text-xl font-bold">Komunikasi Inklusif</h1>
                  <p className="text-sm text-muted-foreground">Platform untuk semua</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <Badge variant="secondary" className="hidden sm:flex">
                  {user?.email}
                </Badge>
                <Auth />
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="container mx-auto px-4 py-6">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-4 mb-6">
              <TabsTrigger value="chat" className="touch-target flex items-center gap-2">
                <MessageSquare className="w-4 h-4" />
                <span className="hidden sm:inline">Chat</span>
              </TabsTrigger>
              <TabsTrigger value="video" className="touch-target flex items-center gap-2">
                <Video className="w-4 h-4" />
                <span className="hidden sm:inline">Video Call</span>
              </TabsTrigger>
              <TabsTrigger value="community" className="touch-target flex items-center gap-2">
                <Users className="w-4 h-4" />
                <span className="hidden sm:inline">Komunitas</span>
              </TabsTrigger>
              <TabsTrigger value="settings" className="touch-target flex items-center gap-2">
                <Settings className="w-4 h-4" />
                <span className="hidden sm:inline">Pengaturan</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="chat" className="space-y-6">
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold mb-2">Chat Inklusif</h2>
                <p className="text-muted-foreground">
                  Komunikasi dengan AI AutoSign, Voice-to-Meaning, dan Bridge Mode
                </p>
              </div>
              <ChatInterface />
            </TabsContent>

            <TabsContent value="video" className="space-y-6">
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold mb-2">Panggilan Video Inklusif</h2>
                <p className="text-muted-foreground">
                  Video call dengan Live Caption, Sign Language Avatar, dan Audio Description
                </p>
              </div>
              <VideoCall 
                participants={[
                  { userId: 'demo-user', name: 'Demo User', disabilityType: 'none' }
                ]}
              />
            </TabsContent>

            <TabsContent value="community" className="space-y-6">
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold mb-2">Komunitas Inklusif</h2>
                <p className="text-muted-foreground">
                  Bergabung dengan komunitas, belajar bahasa isyarat, dan berbagi pengalaman
                </p>
              </div>
              
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Hand className="w-5 h-5 text-secondary" />
                      Belajar Bahasa Isyarat
                    </CardTitle>
                    <CardDescription>
                      Pelajari bahasa isyarat dengan AI interaktif
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button className="w-full touch-target" variant="outline">
                      Mulai Belajar
                    </Button>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Users className="w-5 h-5 text-primary" />
                      Forum Dukungan
                    </CardTitle>
                    <CardDescription>
                      Berbagi pengalaman dan saling mendukung
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button className="w-full touch-target" variant="outline">
                      Bergabung Forum
                    </Button>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Heart className="w-5 h-5 text-red-500" />
                      Layanan Sosial
                    </CardTitle>
                    <CardDescription>
                      Informasi layanan dan bantuan sosial
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button className="w-full touch-target" variant="outline">
                      Lihat Layanan
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="settings" className="space-y-6">
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold mb-2">Pengaturan Aksesibilitas</h2>
                <p className="text-muted-foreground">
                  Sesuaikan aplikasi dengan kebutuhan aksesibilitas Anda
                </p>
              </div>
              <AccessibilitySettings />
            </TabsContent>
          </Tabs>
        </main>

        {/* Footer */}
        <footer className="border-t bg-card/30 mt-12">
          <div className="container mx-auto px-4 py-6">
            <div className="text-center text-sm text-muted-foreground">
              <p className="mb-2">
                Komunikasi Inklusif - Platform untuk semua, tanpa batasan
              </p>
              <div className="flex justify-center items-center gap-4">
                <span className="flex items-center gap-1">
                  <Hand className="w-4 h-4" /> Bahasa Isyarat
                </span>
                <span className="flex items-center gap-1">
                  <Eye className="w-4 h-4" /> Deskripsi Visual
                </span>
                <span className="flex items-center gap-1">
                  <Volume2 className="w-4 h-4" /> Audio Narasi
                </span>
                <span className="flex items-center gap-1">
                  <Smartphone className="w-4 h-4" /> Haptic Feedback
                </span>
              </div>
            </div>
          </div>
        </footer>
      </div>
      <Toaster />
    </AccessibilityProvider>
  )
}

export default Index
