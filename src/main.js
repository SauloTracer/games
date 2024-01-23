import { createPinia } from 'pinia'
import { createApp } from 'vue'
import router from '@/router'
import './style.css'
import App from './App.vue'
import vuetify from './plugins/vuetify';

createApp(App)
.use(router)
.use(createPinia())
.use(vuetify)
.mount('#app')
