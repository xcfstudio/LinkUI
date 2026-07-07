import { createApp } from 'vue'
import pinia from './stores'
import App from './App.vue'
import router from './router'
import '@/assets/styles/reset.scss'
import '@/assets/styles/color.scss'
import '@/assets/styles/size.scss'
import '@/assets/styles/iconfont.scss'

const app = createApp(App)

app.use(router)
app.use(pinia)

app.mount('#app')
