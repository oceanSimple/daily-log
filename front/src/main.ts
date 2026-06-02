import { createApp } from 'vue'
import App from './App.vue'
import router from './router'

import './assets/styles/global.css'

async function enableMocking() {
  if (import.meta.env.VITE_ENABLE_MOCK === 'true') {
    const { worker } = await import('./mock/browser')
    return worker.start({
      onUnhandledRequest: 'bypass'
    })
  }
}

enableMocking().then(() => {
  const app = createApp(App)
  app.use(router)
  app.mount('#app')
})
