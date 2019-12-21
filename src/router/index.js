import Vue from 'vue'
import VueRouter from 'vue-router'

Vue.use(VueRouter)

const routes = [
    {
        path: '/',
        name: 'workspace',
        component: () => import('@/views/workspace'),
        children: [
            {
                path: 'file/:path',
                name: 'file',
                component: () => import('@/components/workspace/editor'),
                props: true,
            },
        ],
    },
    {
        path: '/config',
        name: 'config',
        component: () => import('@/views/config'),
    },
    {
        path: '*',
        redirect: '/',
    },
]

const router = new VueRouter({
    mode: 'history',
    base: process.env.BASE_URL,
    routes,
})

const routerPush = VueRouter.prototype.push
VueRouter.prototype.push = function push(location) {
    return routerPush.call(this, location).catch(error => error)
}

export default router
