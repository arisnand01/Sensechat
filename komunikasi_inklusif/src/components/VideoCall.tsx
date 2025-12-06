import React, { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useAccessibility } from './AccessibilityProvider'
import { supabase } from '@/integrations/supabase/client'
import { Mic, MicOff, Video, VideoOff, Phone, PhoneOff, Volume2, VolumeX, Eye, Hand, MessageSquare } from 'lucide-react'

interface VideoCallProps {
  callId?: string
  participants?: Array<{
    userId: string
    disabilityType: string
    name: string
  }>
  onEndCall?: () => void
}

export const VideoCall: React.FC<VideoCallProps> = ({ callId, participants = [], onEndCall }) => {
  const [isCallActive, setIsCallActive] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [isVideoOff, setIsVideoOff] = useState(false)
  const [liveCaptions, setLiveCaptions] = useState('')
  const [signLanguageActive, setSignLanguageActive] = useState(false)
  const [audioDescription, setAudioDescription] = useState('')
  const [callDuration, setCallDuration] = useState(0)

  const localVideoRef = useRef<HTMLVideoElement>(null)
  const remoteVideoRef = useRef<HTMLVideoElement>(null)
  const { settings, announceToScreenReader, triggerHapticFeedback } = useAccessibility()

  // Simulate call duration timer
  useEffect(() => {
    let interval: NodeJS.Timeout
    if (isCallActive) {
      interval = setInterval(() => {
        setCallDuration(prev => prev + 1)
      }, 1000)
    }
    return () => clearInterval(interval)
  }, [isCallActive])

  // Simulate live captions
  useEffect(() => {
    if (isCallActive && (settings.disabilityType === 'deaf' || settings.disabilityType === 'both')) {
      const captionInterval = setInterval(() => {
        const sampleCaptions = [
          'Halo, apa kabar?',
          'Saya sedang berbicara tentang proyek baru',
          'Bisakah Anda mendengar saya dengan jelas?',
          'Mari kita diskusikan rencana selanjutnya',
          'Terima kasih atas waktunya'
        ]
        const randomCaption = sampleCaptions[Math.floor(Math.random() * sampleCaptions.length)]
        setLiveCaptions(randomCaption)
        
        if (settings.screenReader) {
          announceToScreenReader(`Caption: ${randomCaption}`)
        }
      }, 3000)

      return () => clearInterval(captionInterval)
    }
  }, [isCallActive, settings.disabilityType, settings.screenReader])

  // Simulate audio description for blind users
  useEffect(() => {
    if (isCallActive && (settings.disabilityType === 'blind' || settings.disabilityType === 'both')) {
      const descriptionInterval = setInterval(() => {
        const descriptions = [
          'Peserta terlihat tersenyum dan mengangguk',
          'Lawan bicara sedang menunjuk ke layar',
          'Ekspresi wajah terlihat serius dan fokus',
          'Peserta sedang mengangkat tangan',
          'Latar belakang ruangan terang dengan pencahayaan baik'
        ]
        const randomDescription = descriptions[Math.floor(Math.random() * descriptions.length)]
        setAudioDescription(randomDescription)
        
        if (settings.screenReader) {
          announceToScreenReader(`Deskripsi visual: ${randomDescription}`)
        }
      }, 5000)

      return () => clearInterval(descriptionInterval)
    }
  }, [isCallActive, settings.disabilityType, settings.screenReader])

  const startCall = async () => {
    try {
      // Call the video call processor edge function
      const { data, error } = await supabase.functions.invoke('video_call_processor_2025_12_06_14_53', {
        body: {
          action: 'start_call',
          participants: participants.map(p => ({
            userId: p.userId,
            disabilityType: p.disabilityType,
            preferences: settings
          }))
        }
      })

      if (error) throw error

      setIsCallActive(true)
      announceToScreenReader('Panggilan video dimulai dengan fitur aksesibilitas aktif')
      triggerHapticFeedback('medium')

      // Simulate getting user media
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({ 
            video: !isVideoOff, 
            audio: !isMuted 
          })
          if (localVideoRef.current) {
            localVideoRef.current.srcObject = stream
          }
        } catch (mediaError) {
          console.error('Error accessing media devices:', mediaError)
          announceToScreenReader('Tidak dapat mengakses kamera atau mikrofon')
        }
      }

    } catch (error: any) {
      console.error('Error starting call:', error)
      announceToScreenReader(`Error memulai panggilan: ${error.message}`)
      triggerHapticFeedback('long')
    }
  }

  const endCall = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('video_call_processor_2025_12_06_14_53', {
        body: {
          action: 'end_call',
          callId: callId,
          participants: participants
        }
      })

      if (error) throw error

      setIsCallActive(false)
      setCallDuration(0)
      setLiveCaptions('')
      setAudioDescription('')
      
      // Stop media streams
      if (localVideoRef.current?.srcObject) {
        const stream = localVideoRef.current.srcObject as MediaStream
        stream.getTracks().forEach(track => track.stop())
      }

      announceToScreenReader(`Panggilan berakhir. Durasi: ${Math.floor(callDuration / 60)} menit ${callDuration % 60} detik`)
      triggerHapticFeedback('short')
      onEndCall?.()

    } catch (error: any) {
      console.error('Error ending call:', error)
      announceToScreenReader(`Error mengakhiri panggilan: ${error.message}`)
    }
  }

  const toggleMute = () => {
    setIsMuted(!isMuted)
    announceToScreenReader(isMuted ? 'Mikrofon dinyalakan' : 'Mikrofon dimatikan')
    triggerHapticFeedback('short')
  }

  const toggleVideo = () => {
    setIsVideoOff(!isVideoOff)
    announceToScreenReader(isVideoOff ? 'Kamera dinyalakan' : 'Kamera dimatikan')
    triggerHapticFeedback('short')
  }

  const toggleSignLanguage = () => {
    setSignLanguageActive(!signLanguageActive)
    announceToScreenReader(signLanguageActive ? 'Avatar bahasa isyarat dimatikan' : 'Avatar bahasa isyarat dinyalakan')
    triggerHapticFeedback('medium')
  }

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Panggilan Video Inklusif</span>
          {isCallActive && (
            <Badge variant="secondary" className="text-lg px-3 py-1">
              {formatDuration(callDuration)}
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Video Area */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 min-h-[300px]">
          {/* Local Video */}
          <div className="relative bg-gray-100 rounded-lg overflow-hidden">
            <video
              ref={localVideoRef}
              autoPlay
              muted
              playsInline
              className="w-full h-full object-cover"
              style={{ display: isVideoOff ? 'none' : 'block' }}
            />
            {isVideoOff && (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-200">
                <VideoOff className="w-12 h-12 text-gray-500" />
              </div>
            )}
            <div className="absolute bottom-2 left-2 bg-black/50 text-white px-2 py-1 rounded text-sm">
              Anda {isMuted && <MicOff className="inline w-4 h-4 ml-1" />}
            </div>
          </div>

          {/* Remote Video */}
          <div className="relative bg-gray-100 rounded-lg overflow-hidden">
            <video
              ref={remoteVideoRef}
              autoPlay
              playsInline
              className="w-full h-full object-cover"
            />
            <div className="absolute bottom-2 left-2 bg-black/50 text-white px-2 py-1 rounded text-sm">
              {participants[0]?.name || 'Peserta'}
            </div>
            
            {/* Sign Language Avatar Overlay */}
            {signLanguageActive && (
              <div className="absolute top-2 right-2 w-32 h-32 bg-blue-100 rounded-lg border-2 border-blue-500 flex items-center justify-center">
                <Hand className="w-8 h-8 text-blue-600 animate-pulse" />
                <span className="sr-only">Avatar bahasa isyarat aktif</span>
              </div>
            )}
          </div>
        </div>

        {/* Accessibility Features */}
        <div className="space-y-3">
          {/* Live Captions for Deaf Users */}
          {(settings.disabilityType === 'deaf' || settings.disabilityType === 'both') && liveCaptions && (
            <Card className="bg-blue-50 border-blue-200">
              <CardContent className="p-3">
                <div className="flex items-center gap-2 mb-2">
                  <MessageSquare className="w-4 h-4 text-blue-600" />
                  <span className="text-sm font-medium text-blue-800">Live Caption</span>
                </div>
                <p className="text-blue-900 text-lg">{liveCaptions}</p>
              </CardContent>
            </Card>
          )}

          {/* Audio Description for Blind Users */}
          {(settings.disabilityType === 'blind' || settings.disabilityType === 'both') && audioDescription && (
            <Card className="bg-green-50 border-green-200">
              <CardContent className="p-3">
                <div className="flex items-center gap-2 mb-2">
                  <Eye className="w-4 h-4 text-green-600" />
                  <span className="text-sm font-medium text-green-800">Deskripsi Visual</span>
                </div>
                <p className="text-green-900 text-lg">{audioDescription}</p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Call Controls */}
        <div className="flex justify-center gap-3 pt-4">
          {!isCallActive ? (
            <Button
              onClick={startCall}
              size="lg"
              className="touch-target bg-green-600 hover:bg-green-700"
              aria-label="Mulai panggilan video"
            >
              <Phone className="w-5 h-5 mr-2" />
              Mulai Panggilan
            </Button>
          ) : (
            <>
              <Button
                onClick={toggleMute}
                variant={isMuted ? "destructive" : "secondary"}
                size="lg"
                className="touch-target"
                aria-label={isMuted ? "Nyalakan mikrofon" : "Matikan mikrofon"}
              >
                {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
              </Button>

              <Button
                onClick={toggleVideo}
                variant={isVideoOff ? "destructive" : "secondary"}
                size="lg"
                className="touch-target"
                aria-label={isVideoOff ? "Nyalakan kamera" : "Matikan kamera"}
              >
                {isVideoOff ? <VideoOff className="w-5 h-5" /> : <Video className="w-5 h-5" />}
              </Button>

              {(settings.disabilityType === 'deaf' || settings.disabilityType === 'both') && (
                <Button
                  onClick={toggleSignLanguage}
                  variant={signLanguageActive ? "default" : "secondary"}
                  size="lg"
                  className="touch-target"
                  aria-label={signLanguageActive ? "Matikan avatar bahasa isyarat" : "Nyalakan avatar bahasa isyarat"}
                >
                  <Hand className="w-5 h-5" />
                </Button>
              )}

              <Button
                onClick={endCall}
                variant="destructive"
                size="lg"
                className="touch-target"
                aria-label="Akhiri panggilan"
              >
                <PhoneOff className="w-5 h-5 mr-2" />
                Akhiri
              </Button>
            </>
          )}
        </div>

        {/* Participants List */}
        {participants.length > 0 && (
          <div className="mt-4">
            <h3 className="text-sm font-medium mb-2">Peserta ({participants.length})</h3>
            <div className="flex flex-wrap gap-2">
              {participants.map((participant, index) => (
                <Badge key={index} variant="outline" className="text-sm">
                  {participant.name}
                  {participant.disabilityType !== 'none' && (
                    <span className="ml-1 text-xs">
                      ({participant.disabilityType === 'deaf' ? '🤟' : 
                        participant.disabilityType === 'blind' ? '👁️' : '🤟👁️'})
                    </span>
                  )}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}