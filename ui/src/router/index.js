/* eslint-disable */
import Home from '@/views/Home.vue'
import Login from "@/views/Login.vue";
import NotFound from "@/views/NotFound.vue";
import Register from "@/views/Register.vue";
import Dashboard from "@/views/Dashboard.vue";
import Login2 from "@/views/Login2.vue";

import { createRouter, createWebHistory } from 'vue-router'

const routes = [{
    path: '/',
    name: 'home',
    component: Home,
    meta: {
        title: 'Comming soon ;)',
        metaTags: [
          {
            name: 'description',
            content: 'This website comming soon'
          }
        ]
      }
},

{
    path: '/login',
    name: 'login',
    component: Login,
    meta: {
        title: 'Temp login',
        metaTags: [
          {
            name: 'description',
            content: 'Login page'
          }
        ]
      }
},


{
  path: '/register',
  name: 'register',
  component: Register,
  meta: {
      title: 'Temp register',
      metaTags: [
        {
          name: 'description',
          content: 'Register page'
        }
      ]
    }
},

{
  path: '/2fa',
  name: 'login2',
  component: Login2,
  meta: {
      title: '2FA',
      metaTags: [
        {
          name: 'description',
          content: 'Double authentification'
        }
      ]
    }
},


{
  path: '/flag',
  name: 'dashboard',
  component: Dashboard,
  props: true,
  meta: {
      title: 'Flag ;)',
      metaTags: [
        {
          name: 'description',
          content: 'Flag page'
        }
      ]
    }
},

// will match everything and put it under `$route.params.pathMatch`
{   path: '/:pathMatch(.*)*', 
    name: 'NotFound', 
    component: NotFound,
    meta: {
        title: 'Not Found',
        metaTags: [
          {
            name: 'description',
            content: 'Not found page'
          }
        ]
      }
},

]


const router = createRouter({ history: createWebHistory(), routes })


router.beforeEach((to, from, next) => {
    // This goes through the matched routes from last to first, finding the closest route with a title.
    // e.g., if we have `/some/deep/nested/route` and `/some`, `/deep`, and `/nested` have titles,
    // `/nested`'s will be chosen.
    const nearestWithTitle = to.matched.slice().reverse().find(r => r.meta && r.meta.title);
  
    // Find the nearest route element with meta tags.
    const nearestWithMeta = to.matched.slice().reverse().find(r => r.meta && r.meta.metaTags);
  
    const previousNearestWithMeta = from.matched.slice().reverse().find(r => r.meta && r.meta.metaTags);
  
    // If a route with a title was found, set the document (page) title to that value.
    if(nearestWithTitle) {
      document.title = nearestWithTitle.meta.title;
    } else if(previousNearestWithMeta) {
      document.title = previousNearestWithMeta.meta.title;
    }
  
    // Remove any stale meta tags from the document using the key attribute we set below.
    Array.from(document.querySelectorAll('[data-vue-router-controlled]')).map(el => el.parentNode.removeChild(el));
  
    // Skip rendering meta tags if there are none.
    if(!nearestWithMeta) return next();
  
    // Turn the meta tag definitions into actual elements in the head.
    nearestWithMeta.meta.metaTags.map(tagDef => {
      const tag = document.createElement('meta');
  
      Object.keys(tagDef).forEach(key => {
        tag.setAttribute(key, tagDef[key]);
      });
  
      // We use this to track which meta tags we create so we don't interfere with other ones.
      tag.setAttribute('data-vue-router-controlled', '');
  
      return tag;
    })
    // Add the meta tags to the document head.
    .forEach(tag => document.head.appendChild(tag));


    // const user = localStorage.getItem('user');
    // console.log("user", user);
  
    next();
  });



export default router