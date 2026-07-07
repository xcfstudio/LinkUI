import { createApp, type App } from 'vue'
import LMessageComponent from './LMessage.vue'

export interface LMessageOptions {
  message: string
  type?: 'success' | 'warning' | 'error' | 'info'
  duration?: number
  closable?: boolean
}

let instance: App | null = null

export const LMessage = (options: LMessageOptions) => {
  if (instance) {
    instance.unmount()
  }

  const container = document.createElement('div')
  document.body.appendChild(container)

  instance = createApp(LMessageComponent, {
    message: options.message,
    type: options.type || 'info',
    duration: options.duration || 3000,
    closable: options.closable || false,
  })

  instance.mount(container)

  return {
    close: () => {
      if (instance) {
        instance.unmount()
        instance = null
        if (container.parentNode) {
          container.parentNode.removeChild(container)
        }
      }
    },
  }
}

LMessage.success = (message: string, options?: Omit<LMessageOptions, 'message' | 'type'>) => {
  return LMessage({ message, type: 'success', ...options })
}

LMessage.warning = (message: string, options?: Omit<LMessageOptions, 'message' | 'type'>) => {
  return LMessage({ message, type: 'warning', ...options })
}

LMessage.error = (message: string, options?: Omit<LMessageOptions, 'message' | 'type'>) => {
  return LMessage({ message, type: 'error', ...options })
}

LMessage.info = (message: string, options?: Omit<LMessageOptions, 'message' | 'type'>) => {
  return LMessage({ message, type: 'info', ...options })
}

export default LMessage
