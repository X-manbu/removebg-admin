import type { App } from "vue";
import { createRouter, createWebHashHistory, type RouteRecordRaw } from "vue-router";

export const Layout = () => import("@/layouts/index.vue");

// 静态路由
export const constantRoutes: RouteRecordRaw[] = [
  {
    path: "/redirect",
    component: Layout,
    meta: { hidden: true },
    children: [
      {
        path: "/redirect/:path(.*)",
        component: () => import("@/views/redirect/index.vue"),
      },
    ],
  },

  {
    path: "/login",
    component: () => import("@/views/login/index.vue"),
    meta: { hidden: true },
  },

  {
    path: "/",
    name: "/",
    component: Layout,
    redirect: "/removebg/config",
    children: [
      // {
      //   path: "dashboard",
      //   component: () => import("@/views/dashboard/index.vue"),
      //   name: "Dashboard",
      //   meta: {
      //     title: "dashboard",
      //     icon: "homepage",
      //     affix: true,
      //     keepAlive: true,
      //   },
      // },
      {
        path: "401",
        component: () => import("@/views/error/401.vue"),
        meta: { hidden: true },
      },
      {
        path: "404",
        component: () => import("@/views/error/404.vue"),
        meta: { hidden: true },
      },
      {
        path: "profile",
        name: "Profile",
        component: () => import("@/views/profile/index.vue"),
        meta: { title: "个人中心", icon: "user", hidden: true },
      },
      {
        path: "my-notice",
        name: "MyNotice",
        component: () => import("@/views/profile/notice/index.vue"),
        meta: { title: "我的通知", icon: "user", hidden: true },
      },
      {
        path: "/detail/:id(\\d+)",
        name: "DemoDetail",
        component: () => import("@/views/demo/detail.vue"),
        meta: { title: "详情页缓存", icon: "user", hidden: true, keepAlive: true },
      },
    ],
  },
];

// 抠图管理
constantRoutes.push({
  path: "/removebg",
  component: Layout,
  redirect: "/removebg/config",
  meta: { title: "抠图管理", icon: "setting" },
  children: [
    {
      path: "config",
      component: () => import("@/views/removebg/config/index.vue"),
      name: "RemovebgConfig",
      meta: { title: "系统配置" },
    },
    {
      path: "redemption-codes",
      component: () => import("@/views/removebg/redemption-codes/index.vue"),
      name: "RedemptionCodes",
      meta: { title: "兑换码管理" },
    },
    {
      path: "logs/point-changes",
      component: () => import("@/views/removebg/logs/point-changes.vue"),
      name: "PointChangeLogs",
      meta: { title: "点数变更日志" },
    },
    {
      path: "logs/redemptions",
      component: () => import("@/views/removebg/logs/redemptions.vue"),
      name: "RedemptionLogs",
      meta: { title: "兑换记录" },
    },
  ],
});

/**
 * 创建路由
 */
const router = createRouter({
  history: createWebHashHistory(),
  routes: constantRoutes,
  // 刷新时，滚动条位置还原
  scrollBehavior: () => ({ left: 0, top: 0 }),
});

// 全局注册 router
export function setupRouter(app: App<Element>) {
  app.use(router);
}

export default router;
