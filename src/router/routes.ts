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
        path: '/mentees',
        component: () => import('pages/Mentees/Mentees.vue'),
      },
      {
        path: '/tables',
        component: () => import('pages/Forms/Forms.vue'),
      },
      {
        path: '/resources',
        component: () => import('pages/resources/Resources.vue'),
      },
      {
        path: '/rondas',
        component: () => import('pages/rondas/Rondas.vue'),
      },
      {
        path: '/reports',
        component: () => import('pages/reports/ReportsLayout.vue'),
        children: [
          {
            path: '',
            redirect: '/reports/rondas',
          },
          {
            path: 'rondas',
            component: () => import('pages/reports/RondasReport.vue'),
          },
          {
            path: 'sessao-mentoria',
            component: () => import('pages/reports/MentoringSessionReport.vue'),
          },
        ],
      },
      {
        path: '/settings',
        component: () => import('pages/Settings/Settings.vue'),
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
