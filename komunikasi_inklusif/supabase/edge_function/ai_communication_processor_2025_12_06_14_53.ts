import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Authorization, X-Client-Info, apikey, Content-Type, X-Application-Name',
}

interface ProcessingRequest {
  type: 'speech_to_text' | 'text_to_speech' | 'sign_language_generate' | 'image_describe' | 'bridge_translate'
  content: string
  sourceDisability?: string
  targetDisability?: string
  emotionalTone?: string
  mediaUrl?: string
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { type, content, sourceDisability, targetDisability, emotionalTone, mediaUrl }: ProcessingRequest = await req.json()

    let result: any = {}

    switch (type) {
      case 'speech_to_text':
        // Simulate speech-to-text processing
        result = {
          text: `[Converted from speech] ${content}`,
          confidence: 0.95,
          timestamp: new Date().toISOString()
        }
        break

      case 'text_to_speech':
        // Simulate text-to-speech with emotional intonation
        const tone = emotionalTone || 'neutral'
        result = {
          audioUrl: `/api/tts/${encodeURIComponent(content)}`,
          duration: Math.ceil(content.length / 10), // Estimate duration
          tone: tone,
          ssml: `<speak><prosody rate="medium" pitch="medium" volume="medium">${content}</prosody></speak>`
        }
        break

      case 'sign_language_generate':
        // Simulate sign language avatar generation
        result = {
          avatarUrl: `/api/sign-language/${encodeURIComponent(content)}`,
          gestures: content.split(' ').map((word, index) => ({
            word,
            gesture: `gesture_${word.toLowerCase()}`,
            timing: index * 0.5,
            duration: 0.5
          })),
          totalDuration: content.split(' ').length * 0.5
        }
        break

      case 'image_describe':
        // Simulate AI image description for blind users
        result = {
          description: `Deskripsi gambar: Sebuah foto menunjukkan ${content}. Terdapat objek utama di tengah dengan pencahayaan yang baik. Suasana terlihat ${Math.random() > 0.5 ? 'ceria' : 'tenang'}.`,
          objects: ['person', 'background', 'lighting'],
          emotions: ['happy', 'calm'],
          colors: ['blue', 'white', 'green'],
          confidence: 0.88
        }
        break

      case 'bridge_translate':
        // Bridge communication between different disabilities
        if (sourceDisability === 'deaf' && targetDisability === 'blind') {
          result = {
            originalType: 'sign_language',
            convertedType: 'audio_description',
            content: `[Dari bahasa isyarat] ${content}`,
            audioUrl: `/api/tts/${encodeURIComponent(content)}`,
            description: `Pengguna tunarungu mengirim pesan melalui bahasa isyarat: "${content}"`
          }
        } else if (sourceDisability === 'blind' && targetDisability === 'deaf') {
          result = {
            originalType: 'voice',
            convertedType: 'sign_language',
            content: content,
            signLanguageUrl: `/api/sign-language/${encodeURIComponent(content)}`,
            textVersion: content
          }
        } else {
          result = {
            originalType: 'text',
            convertedType: 'text',
            content: content
          }
        }
        break

      default:
        throw new Error('Invalid processing type')
    }

    // Store processing result in database for learning
    const { error: dbError } = await supabase
      .from('messages_2025_12_06_14_53')
      .update({
        ai_processed_data: {
          ...result,
          processedAt: new Date().toISOString(),
          processingType: type
        }
      })
      .eq('id', req.headers.get('message-id'))

    if (dbError) {
      console.error('Database update error:', dbError)
    }

    return new Response(
      JSON.stringify({ success: true, result }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )

  } catch (error) {
    console.error('AI Processing Error:', error)
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message || 'Internal server error' 
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    )
  }
})