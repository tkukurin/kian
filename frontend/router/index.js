import Vue from 'vue';
import Router from 'vue-router';
import {
    routerHistory,
    writeHistory
} from 'vue-router-back-button';

Vue.use(Router);
Vue.use(routerHistory);

const router = new Router({
    routes: [
        {
            path: '/',
            component: require('../components/Dashboard').default,
        },
        {
            path: '/deck/:deckName',
            component: require('../components/DeckOverview.vue').default,
            props: true,
        },

        {
            path: '/study/:deckName',
            component: require('../components/Reviewer.vue').default,
            props: true,
        },

        {
            path: '/note/edit/:noteId',
            component: require('../components/NoteEdit.vue').default,
            props: true,
            name: 'note_edit',
        },

        {
            path: '/note/add',
            component: require('../components/NoteAdd.vue').default,
            props: true,
            name: 'note_add',
        },

        {
            path: '/browser',
            component: require('../components/Browser.vue').default,
            props: true,
            name: 'browser',
        },

        {
            path: '*',
            redirect: '/',
        },
    ],
});

router.afterEach(writeHistory);

export default router;
