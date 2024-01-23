import { createPinia } from 'pinia'
import { createApp } from 'vue'
import router from '@/router'
import './style.css'
import App from './App.vue'
// import vuetify from './plugins/vuetify';

// Vuetify
import 'vuetify/styles'
import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'
import '@mdi/font/css/materialdesignicons.css'

const vuetify = createVuetify({
  components,
  directives,
})

createApp(App)
.use(router)
.use(createPinia())
.use(vuetify)
.mount('#app')
