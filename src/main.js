import '@/assets/css/reset.css'
import '@/assets/css/scrollbar.scss'
import 'vue-virtual-scroller/dist/vue-virtual-scroller.css'

import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'

import { RecycleScroller } from 'vue-virtual-scroller'

Vue.component('RecycleScroller', RecycleScroller)

Vue.config.productionTip = false

new Vue({
    router,
    store,
    render: function(h) {
        return h(App)
    },
}).$mount('#app')
