import { createRouter, createWebHashHistory } from "vue-router";

const routes = [
    {
        path: "/",
        component: () => import("@/views/About.vue"),
    },
    {
        path: "/sudoku",
        component: () => import("@/modules/sudoku/views/index.vue"),
    }
];

const router = createRouter({
  history: createWebHashHistory(import.meta.env.BASE_URL),
  routes,
});

export default router;