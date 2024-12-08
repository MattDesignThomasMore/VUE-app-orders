import { createApp } from "vue";
import "./style.css";
import App from "./App.vue";

import * as VueRouter from "vue-router";

import { createStore } from "vuex";


import Login from "./components/Login.vue";
import Signup from "./components/Signup.vue";
import Overview from "./components/Overview.vue";
import DetailOrder from "./components/DetailOrder.vue";


const store = createStore({
  state() {
    return {
      token: localStorage.getItem("token") || null,
    };
  },
  mutations: {
    setToken(state, token) {
      state.token = token;
      localStorage.setItem("token", token); 
    },
    clearToken(state) {
      state.token = null;
      localStorage.removeItem("token");
    },
  },
  actions: {
    async validateToken({ commit, state }) {
      if (!state.token) return false;

      try {
        const response = await fetch("https://sneaker-api-4zoy.onrender.com/users", {
          headers: { Authorization: `Bearer ${state.token}` },
        });

        if (response.ok) {
          return true;
        } else {
          commit("clearToken");
          return false;
        }
      } catch (error) {
        console.error("Fout bij token validatie", error);
        commit("clearToken");
        return false;
      }
    },
  },
});


const routes = [
  { path: "/", component: Login },
  { path: "/orders", component: Overview, meta: { requiresAuth: true } },
  { path: "/orders/:id", component: DetailOrder, props: true },
  { path: "/signup", component: Signup },
];


const router = VueRouter.createRouter({
  history: VueRouter.createWebHashHistory(),
  routes,
});


router.beforeEach(async (to, from, next) => {
  if (to.matched.some((record) => record.meta.requiresAuth)) {
    const isValid = await store.dispatch("validateToken");

    if (isValid) {
      next();
    } else {
      next({ path: "/" });
    }
  } else {
    next();
  }
});


const app = createApp(App);
app.use(router);
app.use(store);
app.mount("#app");
