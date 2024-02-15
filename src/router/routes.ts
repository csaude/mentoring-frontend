import { RouteRecordRaw } from 'vue-router';

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    component: () => import('layouts/MainLayout.vue'),
    beforeEnter(o, from, next) {
      const authUser = localStorage.getItem('userInfo');
      if (authUser === null || String(authUser).includes('null')) {
        next('/Login');
      } else {
        next();
      }
    },
    children: [
      {
        path: '/mentors',
        component: () => import('pages/Mentors/Mentors.vue'),
      },
      { path: '/home', component: () => import('pages/home/Home.vue') },
      {
        path: '/mentorados',
        component: () => import('pages/Mentorados/Mentorados.vue'),
      },
      {
        path: '/mentoradosEdit:id?',
        name: 'mentoradosEdit',
        component: () => import('pages/Mentorados/MentoradosEdit.vue'),
      },
    ],
  },
  {
    path: '/Login',
    name: 'Login',
    component: () => import('pages/Login/Login.vue'),
    meta: { requiresAuth: false },
  },
  // Always leave this as last one,
  // but you can also remove it
  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/ErrorNotFound.vue'),
  },
];

export default routes;
