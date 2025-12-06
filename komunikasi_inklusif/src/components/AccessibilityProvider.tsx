import React, { createContext, useContext, useState, useEffect } from 'react'

interface AccessibilitySettings {
  highContrast: boolean
  largeText: boolean
  extraLargeText: boolean
  voiceNavigation: boolean
  hapticFeedback: boolean
  screenReader: boolean
  disabilityType: 'none' | 'deaf' | 'blind' | 'both'
}

interface AccessibilityContextType {
  settings: AccessibilitySettings
  updateSettings: (newSettings: Partial<AccessibilitySettings>) => void
  announceToScreenReader: (message: string) => void
  triggerHapticFeedback: (pattern?: 'short' | 'medium' | 'long') => void
}

const AccessibilityContext = createContext<AccessibilityContextType | undefined>(undefined)

export const useAccessibility = () => {
  const context = useContext(AccessibilityContext)
  if (!context) {
    throw new Error('useAccessibility must be used within AccessibilityProvider')
  }
  return context
}

export const AccessibilityProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<AccessibilitySettings>({
    highContrast: false,
    largeText: false,
    extraLargeText: false,
    voiceNavigation: false,
    hapticFeedback: true,
    screenReader: false,
    disabilityType: 'none'
  })

  const updateSettings = (newSettings: Partial<AccessibilitySettings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }))
  }

  const announceToScreenReader = (message: string) => {
    const announcement = document.createElement('div')
    announcement.setAttribute('aria-live', 'polite')
    announcement.setAttribute('aria-atomic', 'true')
    announcement.className = 'sr-only'
    announcement.textContent = message
    
    document.body.appendChild(announcement)
    
    setTimeout(() => {
      document.body.removeChild(announcement)
    }, 1000)
  }

  const triggerHapticFeedback = (pattern: 'short' | 'medium' | 'long' = 'short') => {
    if (!settings.hapticFeedback) return

    // Simulate haptic feedback with visual cue
    const duration = pattern === 'short' ? 100 : pattern === 'medium' ? 200 : 300
    
    // Add haptic class to body for visual feedback
    document.body.classList.add('haptic-feedback')
    
    setTimeout(() => {
      document.body.classList.remove('haptic-feedback')
    }, duration)

    // Try to use actual vibration API if available
    if ('vibrate' in navigator) {
      const vibrationPattern = pattern === 'short' ? [100] : pattern === 'medium' ? [200] : [300]
      navigator.vibrate(vibrationPattern)
    }
  }

  // Apply accessibility classes to body
  useEffect(() => {
    const body = document.body
    
    // Remove all accessibility classes first
    body.classList.remove('high-contrast', 'large-text', 'extra-large-text')
    
    // Apply current settings
    if (settings.highContrast) body.classList.add('high-contrast')
    if (settings.largeText) body.classList.add('large-text')
    if (settings.extraLargeText) body.classList.add('extra-large-text')
    
    // Store settings in localStorage
    localStorage.setItem('accessibility-settings', JSON.stringify(settings))
  }, [settings])

  // Load settings from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem('accessibility-settings')
    if (stored) {
      try {
        const parsedSettings = JSON.parse(stored)
        setSettings(prev => ({ ...prev, ...parsedSettings }))
      } catch (error) {
        console.error('Failed to parse accessibility settings:', error)
      }
    }
  }, [])

  return (
    <AccessibilityContext.Provider value={{
      settings,
      updateSettings,
      announceToScreenReader,
      triggerHapticFeedback
    }}>
      {children}
    </AccessibilityContext.Provider>
  )
}