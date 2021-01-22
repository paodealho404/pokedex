import { createApp } from 'vue';
import App from './App.vue';
import 'bootstrap';
import "bootstrap/dist/css/bootstrap.min.css";

const app = createApp(App);
app.config.globalProperties.$pokedexCache = new Map();
app.mount('#app');
