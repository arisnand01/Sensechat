import React, { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useAccessibility } from './AccessibilityProvider'
import { supabase } from '@/integrations/supabase/client'
import { 
  Send, 
  Mic, 
  MicOff, 
  Camera, 
  Image, 
  Hand, 
  Volume2, 
  Eye,
  MessageSquare,
  Bot
} from 'lucide-react'
import { toast } from 'sonner'

interface Message {
  id: string
  content: string
  message_type: 'text' | 'voice' | 'sign_language' | 'image' | 'video'
  sender_id: string
  sender_name: string
  created_at: string
  ai_processed_data?: any
}

interface ChatInterfaceProps {
  conversationId?: string
  participants?: Array<{
    userId: string
    name: string
    disabilityType: string
  }>
}

export const ChatInterface: React.FC<ChatInterfaceProps> = ({ 
  conversationId = 'demo-conversation',
  participants = []
}) => {
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [isRecording, setIsRecording] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [signLanguageMode, setSignLanguageMode] = useState(false)

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const { settings, announceToScreenReader, triggerHapticFeedback } = useAccessibility()

  // Auto scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Load demo messages
  useEffect(() => {
    const demoMessages: Message[] = [
      {
        id: '1',
        content: 'Halo! Selamat datang di aplikasi komunikasi inklusif.',
        message_type: 'text',
        sender_id: 'system',
        sender_name: 'Sistem',
        created_at: new Date(Date.now() - 300000).toISOString(),
        ai_processed_data: {
          signLanguageUrl: '/api/sign-language/welcome',
          audioDescription: 'Pesan sambutan dari sistem'
        }
      },
      {
        id: '2',
        content: 'Aplikasi ini mendukung berbagai mode komunikasi untuk semua pengguna.',
        message_type: 'text',
        sender_id: 'system',
        sender_name: 'AI Assistant',
        created_at: new Date(Date.now() - 240000).toISOString(),
        ai_processed_data: {
          signLanguageUrl: '/api/sign-language/support',
          audioDescription: 'Informasi tentang fitur aplikasi'
        }
      }
    ]
    setMessages(demoMessages)
  }, [])

  const sendMessage = async (content: string, type: 'text' | 'voice' | 'sign_language' = 'text') => {
    if (!content.trim()) return

    const newMsg: Message = {
      id: Date.now().toString(),
      content,
      message_type: type,
      sender_id: 'current-user',
      sender_name: 'Anda',
      created_at: new Date().toISOString()
    }

    setMessages(prev => [...prev, newMsg])
    setNewMessage('')
    setIsProcessing(true)

    try {
      // Process message with AI for accessibility features
      const { data, error } = await supabase.functions.invoke('ai_communication_processor_2025_12_06_14_53', {
        body: {
          type: type === 'text' ? 'text_to_speech' : 'speech_to_text',
          content: content,
          sourceDisability: settings.disabilityType,
          targetDisability: 'none', // Will be determined by recipient
          emotionalTone: 'friendly'
        }
      })

      if (error) throw error

      // Update message with AI processed data
      setMessages(prev => prev.map(msg => 
        msg.id === newMsg.id 
          ? { ...msg, ai_processed_data: data.result }
          : msg
      ))

      announceToScreenReader(`Pesan terkirim: ${content}`)
      triggerHapticFeedback('short')

      // Simulate AI response for demo
      setTimeout(() => {
        const aiResponse: Message = {
          id: (Date.now() + 1).toString(),
          content: `Saya memahami pesan Anda: "${content}". Bagaimana saya bisa membantu lebih lanjut?`,
          message_type: 'text',
          sender_id: 'ai-assistant',
          sender_name: 'AI Assistant',
          created_at: new Date().toISOString(),
          ai_processed_data: {
            signLanguageUrl: `/api/sign-language/${encodeURIComponent(content)}`,
            audioUrl: `/api/tts/${encodeURIComponent(content)}`,
            description: 'Respons AI yang memahami konteks pesan'
          }
        }
        setMessages(prev => [...prev, aiResponse])
        
        if (settings.screenReader) {
          announceToScreenReader(`Pesan baru dari AI Assistant: ${aiResponse.content}`)
        }
        triggerHapticFeedback('medium')
      }, 1500)

    } catch (error: any) {
      console.error('Error processing message:', error)
      toast.error('Gagal memproses pesan')
      announceToScreenReader('Gagal memproses pesan')
    } finally {
      setIsProcessing(false)
    }
  }

  const startVoiceRecording = async () => {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      toast.error('Perekaman suara tidak didukung di browser ini')
      return
    }

    try {
      setIsRecording(true)
      announceToScreenReader('Mulai merekam suara')
      triggerHapticFeedback('short')

      // Simulate voice recording
      setTimeout(() => {
        setIsRecording(false)
        const voiceMessage = 'Pesan suara telah direkam dan dikonversi ke teks'
        sendMessage(voiceMessage, 'voice')
        announceToScreenReader('Perekaman selesai, pesan terkirim')
      }, 3000)

    } catch (error) {
      console.error('Error starting voice recording:', error)
      setIsRecording(false)
      toast.error('Gagal memulai perekaman suara')
      announceToScreenReader('Gagal memulai perekaman suara')
    }
  }

  const stopVoiceRecording = () => {
    setIsRecording(false)
    announceToScreenReader('Perekaman dihentikan')
    triggerHapticFeedback('short')
  }

  const sendSignLanguageMessage = () => {
    const signMessage = 'Pesan bahasa isyarat telah direkam dan dikonversi'
    sendMessage(signMessage, 'sign_language')
    setSignLanguageMode(false)
  }

  const playAudioMessage = (message: Message) => {
    if (message.ai_processed_data?.audioUrl) {
      announceToScreenReader(`Memutar audio: ${message.content}`)
      triggerHapticFeedback('short')
      // In a real app, this would play the actual audio
      toast.success('Audio diputar (simulasi)')
    }
  }

  const showSignLanguageAvatar = (message: Message) => {
    if (message.ai_processed_data?.signLanguageUrl) {
      announceToScreenReader(`Menampilkan bahasa isyarat untuk: ${message.content}`)
      triggerHapticFeedback('medium')
      // In a real app, this would show the sign language avatar
      toast.success('Avatar bahasa isyarat ditampilkan (simulasi)')
    }
  }

  const describeImage = (message: Message) => {
    if (message.ai_processed_data?.description) {
      announceToScreenReader(`Deskripsi gambar: ${message.ai_processed_data.description}`)
      triggerHapticFeedback('medium')
    }
  }

  return (
    <Card className="w-full max-w-4xl mx-auto h-[600px] flex flex-col">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Chat Inklusif</span>
          <div className="flex gap-2">
            {settings.disabilityType === 'deaf' || settings.disabilityType === 'both' ? (
              <Badge variant="secondary" className="flex items-center gap-1">
                <Hand className="w-3 h-3" />
                Bahasa Isyarat
              </Badge>
            ) : null}
            {settings.disabilityType === 'blind' || settings.disabilityType === 'both' ? (
              <Badge variant="secondary" className="flex items-center gap-1">
                <Volume2 className="w-3 h-3" />
                Audio
              </Badge>
            ) : null}
          </div>
        </CardTitle>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col p-0">
        {/* Messages Area */}
        <ScrollArea className="flex-1 p-4">
          <div className="space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.sender_id === 'current-user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[70%] rounded-lg p-3 ${
                    message.sender_id === 'current-user'
                      ? 'bg-primary text-primary-foreground'
                      : message.sender_id === 'system' || message.sender_id === 'ai-assistant'
                      ? 'bg-secondary text-secondary-foreground'
                      : 'bg-muted text-muted-foreground'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-medium">{message.sender_name}</span>
                    {message.message_type === 'voice' && <Mic className="w-3 h-3" />}
                    {message.message_type === 'sign_language' && <Hand className="w-3 h-3" />}
                    {message.sender_id === 'ai-assistant' && <Bot className="w-3 h-3" />}
                  </div>
                  
                  <p className="text-sm mb-2">{message.content}</p>
                  
                  {/* Accessibility Action Buttons */}
                  <div className="flex gap-1 mt-2">
                    {/* Audio playback for blind users */}
                    {(settings.disabilityType === 'blind' || settings.disabilityType === 'both') && 
                     message.ai_processed_data?.audioUrl && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => playAudioMessage(message)}
                        className="h-6 px-2 text-xs touch-target"
                        aria-label={`Putar audio untuk pesan: ${message.content}`}
                      >
                        <Volume2 className="w-3 h-3" />
                      </Button>
                    )}
                    
                    {/* Sign language for deaf users */}
                    {(settings.disabilityType === 'deaf' || settings.disabilityType === 'both') && 
                     message.ai_processed_data?.signLanguageUrl && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => showSignLanguageAvatar(message)}
                        className="h-6 px-2 text-xs touch-target"
                        aria-label={`Tampilkan bahasa isyarat untuk pesan: ${message.content}`}
                      >
                        <Hand className="w-3 h-3" />
                      </Button>
                    )}
                    
                    {/* Image description for blind users */}
                    {(settings.disabilityType === 'blind' || settings.disabilityType === 'both') && 
                     message.message_type === 'image' && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => describeImage(message)}
                        className="h-6 px-2 text-xs touch-target"
                        aria-label="Dengarkan deskripsi gambar"
                      >
                        <Eye className="w-3 h-3" />
                      </Button>
                    )}
                  </div>
                  
                  <div className="text-xs opacity-70 mt-1">
                    {new Date(message.created_at).toLocaleTimeString('id-ID', {
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </div>
                </div>
              </div>
            ))}
            {isProcessing && (
              <div className="flex justify-start">
                <div className="bg-muted text-muted-foreground rounded-lg p-3 max-w-[70%]">
                  <div className="flex items-center gap-2">
                    <Bot className="w-4 h-4 animate-pulse" />
                    <span className="text-sm">AI sedang memproses...</span>
                  </div>
                </div>
              </div>
            )}
          </div>
          <div ref={messagesEndRef} />
        </ScrollArea>

        {/* Input Area */}
        <div className="border-t p-4 space-y-3">
          {/* Sign Language Mode */}
          {signLanguageMode && (
            <Card className="bg-green-50 border-green-200">
              <CardContent className="p-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Hand className="w-5 h-5 text-green-600 animate-pulse" />
                    <span className="text-green-800 font-medium">Mode Bahasa Isyarat Aktif</span>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={sendSignLanguageMessage}
                      className="touch-target"
                      aria-label="Kirim pesan bahasa isyarat"
                    >
                      Kirim
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setSignLanguageMode(false)}
                      className="touch-target"
                      aria-label="Batalkan mode bahasa isyarat"
                    >
                      Batal
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Text Input */}
          <div className="flex gap-2">
            <Input
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Ketik pesan Anda..."
              className="flex-1 touch-target"
              onKeyPress={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault()
                  sendMessage(newMessage)
                }
              }}
              aria-label="Ketik pesan Anda"
            />
            
            <Button
              onClick={() => sendMessage(newMessage)}
              disabled={!newMessage.trim() || isProcessing}
              className="touch-target"
              aria-label="Kirim pesan teks"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>

          {/* Input Mode Buttons */}
          <div className="flex gap-2 justify-center">
            {/* Voice Input */}
            <Button
              variant={isRecording ? "destructive" : "secondary"}
              onClick={isRecording ? stopVoiceRecording : startVoiceRecording}
              disabled={isProcessing}
              className="touch-target"
              aria-label={isRecording ? "Hentikan perekaman suara" : "Mulai perekaman suara"}
            >
              {isRecording ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
              {isRecording ? 'Stop' : 'Suara'}
            </Button>

            {/* Sign Language Input */}
            <Button
              variant={signLanguageMode ? "default" : "secondary"}
              onClick={() => setSignLanguageMode(!signLanguageMode)}
              disabled={isProcessing}
              className="touch-target"
              aria-label={signLanguageMode ? "Matikan mode bahasa isyarat" : "Aktifkan mode bahasa isyarat"}
            >
              <Hand className="w-4 h-4" />
              Isyarat
            </Button>

            {/* Image Input */}
            <Button
              variant="secondary"
              disabled={isProcessing}
              className="touch-target"
              aria-label="Kirim gambar"
              onClick={() => {
                toast.success('Fitur kirim gambar (simulasi)')
                announceToScreenReader('Fitur kirim gambar akan segera tersedia')
              }}
            >
              <Image className="w-4 h-4" />
              Gambar
            </Button>

            {/* Video Input */}
            <Button
              variant="secondary"
              disabled={isProcessing}
              className="touch-target"
              aria-label="Kirim video"
              onClick={() => {
                toast.success('Fitur kirim video (simulasi)')
                announceToScreenReader('Fitur kirim video akan segera tersedia')
              }}
            >
              <Camera className="w-4 h-4" />
              Video
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}