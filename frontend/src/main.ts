import { createApp } from 'vue';
import { createPinia } from 'pinia';

import App from './App.vue';
import router from './router';
import { setupStores } from './store';
import './styles/index.css';

const app = createApp(App);
const pinia = createPinia();

app.use(pinia);
setupStores(pinia);
app.use(router);

app.mount('#app');
