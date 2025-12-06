import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Slider } from '@/components/ui/slider'
import { Button } from '@/components/ui/button'
import { useAccessibility } from './AccessibilityProvider'
import { 
  Eye, 
  Volume2, 
  Hand, 
  Smartphone, 
  Contrast, 
  Type, 
  Mic,
  Settings
} from 'lucide-react'

export const AccessibilitySettings: React.FC = () => {
  const { settings, updateSettings, announceToScreenReader, triggerHapticFeedback } = useAccessibility()

  const handleSettingChange = (key: keyof typeof settings, value: any) => {
    updateSettings({ [key]: value })
    announceToScreenReader(`Pengaturan ${key} diubah`)
    triggerHapticFeedback('short')
  }

  const resetSettings = () => {
    updateSettings({
      highContrast: false,
      largeText: false,
      extraLargeText: false,
      voiceNavigation: false,
      hapticFeedback: true,
      screenReader: false,
      disabilityType: 'none'
    })
    announceToScreenReader('Semua pengaturan aksesibilitas direset ke default')
    triggerHapticFeedback('medium')
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="w-5 h-5" />
          Pengaturan Aksesibilitas
        </CardTitle>
        <CardDescription>
          Sesuaikan aplikasi dengan kebutuhan aksesibilitas Anda
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        
        {/* Disability Type Selection */}
        <div className="space-y-3">
          <Label className="text-base font-medium">Jenis Disabilitas</Label>
          <Select 
            value={settings.disabilityType} 
            onValueChange={(value: any) => handleSettingChange('disabilityType', value)}
          >
            <SelectTrigger className="touch-target">
              <SelectValue placeholder="Pilih jenis disabilitas" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">Tidak Ada</SelectItem>
              <SelectItem value="deaf">Tunarungu</SelectItem>
              <SelectItem value="blind">Tunanetra</SelectItem>
              <SelectItem value="both">Tunarungu dan Tunanetra</SelectItem>
            </SelectContent>
          </Select>
          <p className="text-sm text-muted-foreground">
            Pilihan ini akan mengaktifkan fitur aksesibilitas yang sesuai secara otomatis
          </p>
        </div>

        {/* Visual Accessibility */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium flex items-center gap-2">
            <Eye className="w-5 h-5" />
            Aksesibilitas Visual
          </h3>
          
          <div className="space-y-4 pl-7">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label htmlFor="high-contrast" className="text-sm font-medium">
                  Mode Kontras Tinggi
                </Label>
                <p className="text-xs text-muted-foreground">
                  Meningkatkan kontras untuk visibilitas yang lebih baik
                </p>
              </div>
              <Switch
                id="high-contrast"
                checked={settings.highContrast}
                onCheckedChange={(checked) => handleSettingChange('highContrast', checked)}
                className="touch-target"
                aria-label="Toggle mode kontras tinggi"
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label htmlFor="large-text" className="text-sm font-medium">
                  Teks Besar
                </Label>
                <p className="text-xs text-muted-foreground">
                  Memperbesar ukuran teks untuk kemudahan membaca
                </p>
              </div>
              <Switch
                id="large-text"
                checked={settings.largeText}
                onCheckedChange={(checked) => handleSettingChange('largeText', checked)}
                className="touch-target"
                aria-label="Toggle teks besar"
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label htmlFor="extra-large-text" className="text-sm font-medium">
                  Teks Ekstra Besar
                </Label>
                <p className="text-xs text-muted-foreground">
                  Ukuran teks maksimal untuk visibilitas optimal
                </p>
              </div>
              <Switch
                id="extra-large-text"
                checked={settings.extraLargeText}
                onCheckedChange={(checked) => handleSettingChange('extraLargeText', checked)}
                className="touch-target"
                aria-label="Toggle teks ekstra besar"
              />
            </div>
          </div>
        </div>

        {/* Audio Accessibility */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium flex items-center gap-2">
            <Volume2 className="w-5 h-5" />
            Aksesibilitas Audio
          </h3>
          
          <div className="space-y-4 pl-7">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label htmlFor="voice-navigation" className="text-sm font-medium">
                  Navigasi Suara
                </Label>
                <p className="text-xs text-muted-foreground">
                  Kontrol aplikasi menggunakan perintah suara
                </p>
              </div>
              <Switch
                id="voice-navigation"
                checked={settings.voiceNavigation}
                onCheckedChange={(checked) => handleSettingChange('voiceNavigation', checked)}
                className="touch-target"
                aria-label="Toggle navigasi suara"
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label htmlFor="screen-reader" className="text-sm font-medium">
                  Dukungan Screen Reader
                </Label>
                <p className="text-xs text-muted-foreground">
                  Optimasi untuk pembaca layar
                </p>
              </div>
              <Switch
                id="screen-reader"
                checked={settings.screenReader}
                onCheckedChange={(checked) => handleSettingChange('screenReader', checked)}
                className="touch-target"
                aria-label="Toggle dukungan screen reader"
              />
            </div>
          </div>
        </div>

        {/* Motor Accessibility */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium flex items-center gap-2">
            <Smartphone className="w-5 h-5" />
            Aksesibilitas Motor
          </h3>
          
          <div className="space-y-4 pl-7">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label htmlFor="haptic-feedback" className="text-sm font-medium">
                  Umpan Balik Haptic
                </Label>
                <p className="text-xs text-muted-foreground">
                  Getaran untuk notifikasi dan konfirmasi
                </p>
              </div>
              <Switch
                id="haptic-feedback"
                checked={settings.hapticFeedback}
                onCheckedChange={(checked) => handleSettingChange('hapticFeedback', checked)}
                className="touch-target"
                aria-label="Toggle umpan balik haptic"
              />
            </div>
          </div>
        </div>

        {/* Disability-Specific Features */}
        {settings.disabilityType !== 'none' && (
          <div className="space-y-4">
            <h3 className="text-lg font-medium flex items-center gap-2">
              <Hand className="w-5 h-5" />
              Fitur Khusus Disabilitas
            </h3>
            
            <div className="space-y-3 pl-7">
              {(settings.disabilityType === 'deaf' || settings.disabilityType === 'both') && (
                <Card className="bg-blue-50 border-blue-200">
                  <CardContent className="p-4">
                    <h4 className="font-medium text-blue-900 mb-2">Fitur untuk Tunarungu</h4>
                    <ul className="text-sm text-blue-800 space-y-1">
                      <li>• Live Caption otomatis dalam panggilan video</li>
                      <li>• Avatar bahasa isyarat 3D</li>
                      <li>• Konversi suara ke teks real-time</li>
                      <li>• Notifikasi visual yang diperkuat</li>
                    </ul>
                  </CardContent>
                </Card>
              )}
              
              {(settings.disabilityType === 'blind' || settings.disabilityType === 'both') && (
                <Card className="bg-green-50 border-green-200">
                  <CardContent className="p-4">
                    <h4 className="font-medium text-green-900 mb-2">Fitur untuk Tunanetra</h4>
                    <ul className="text-sm text-green-800 space-y-1">
                      <li>• Deskripsi audio untuk gambar dan video</li>
                      <li>• Navigasi lengkap dengan suara</li>
                      <li>• Text-to-speech dengan intonasi emosional</li>
                      <li>• Umpan balik haptic yang diperkuat</li>
                    </ul>
                  </CardContent>
                </Card>
              )}
              
              {settings.disabilityType === 'both' && (
                <Card className="bg-purple-50 border-purple-200">
                  <CardContent className="p-4">
                    <h4 className="font-medium text-purple-900 mb-2">Mode Bridge Communication</h4>
                    <p className="text-sm text-purple-800">
                      Komunikasi dua arah otomatis antara pengguna dengan disabilitas berbeda.
                      AI akan menerjemahkan pesan secara real-time sesuai kebutuhan masing-masing pengguna.
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div className="space-y-3">
          <Label className="text-base font-medium">Aksi Cepat</Label>
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => {
                // Quick setup for deaf users
                updateSettings({
                  disabilityType: 'deaf',
                  highContrast: true,
                  largeText: true,
                  hapticFeedback: true
                })
                announceToScreenReader('Pengaturan cepat untuk tunarungu diaktifkan')
                triggerHapticFeedback('medium')
              }}
              className="touch-target"
              aria-label="Setup cepat untuk tunarungu"
            >
              <Hand className="w-4 h-4 mr-2" />
              Setup Tunarungu
            </Button>
            
            <Button
              variant="outline"
              onClick={() => {
                // Quick setup for blind users
                updateSettings({
                  disabilityType: 'blind',
                  screenReader: true,
                  voiceNavigation: true,
                  hapticFeedback: true,
                  largeText: true
                })
                announceToScreenReader('Pengaturan cepat untuk tunanetra diaktifkan')
                triggerHapticFeedback('medium')
              }}
              className="touch-target"
              aria-label="Setup cepat untuk tunanetra"
            >
              <Eye className="w-4 h-4 mr-2" />
              Setup Tunanetra
            </Button>
            
            <Button
              variant="outline"
              onClick={resetSettings}
              className="touch-target"
              aria-label="Reset semua pengaturan"
            >
              Reset
            </Button>
          </div>
        </div>

        {/* Current Settings Summary */}
        <Card className="bg-muted/50">
          <CardContent className="p-4">
            <h4 className="font-medium mb-2">Ringkasan Pengaturan Aktif</h4>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>Jenis Disabilitas: <span className="font-medium">{
                settings.disabilityType === 'none' ? 'Tidak Ada' :
                settings.disabilityType === 'deaf' ? 'Tunarungu' :
                settings.disabilityType === 'blind' ? 'Tunanetra' :
                'Tunarungu & Tunanetra'
              }</span></div>
              <div>Kontras Tinggi: <span className="font-medium">{settings.highContrast ? 'Ya' : 'Tidak'}</span></div>
              <div>Teks Besar: <span className="font-medium">{settings.largeText ? 'Ya' : 'Tidak'}</span></div>
              <div>Navigasi Suara: <span className="font-medium">{settings.voiceNavigation ? 'Ya' : 'Tidak'}</span></div>
              <div>Screen Reader: <span className="font-medium">{settings.screenReader ? 'Ya' : 'Tidak'}</span></div>
              <div>Haptic Feedback: <span className="font-medium">{settings.hapticFeedback ? 'Ya' : 'Tidak'}</span></div>
            </div>
          </CardContent>
        </Card>
      </CardContent>
    </Card>
  )
}