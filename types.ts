export type RentalModel = {
  name: string
  slug: string
  brand: string
  category: string
  description?: string
  lift_height?: string
  capacity?: string
  power_type?: string
  image_url?: string
}

// Google Analytics gtag type declaration
declare global {
  interface Window {
    gtag: (
      command: 'config' | 'event' | 'js' | 'set',
      targetId: string | Date,
      config?: Record<string, any>
    ) => void
  }
}

export {} 