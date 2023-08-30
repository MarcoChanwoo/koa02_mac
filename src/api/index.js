// const Router = require('koa-router');
// const posts = require('./posts');
import Router from 'koa-router';
import posts from './posts';
import auth from './auth/index';

const api = new Router();

// api.get('/test', (ctx) => {
//   ctx.body = 'test SUCCESS!';
// });
api.use('/posts', posts.routes());
api.use('/auth', auth.routes());

// 라우터 내보냄
// module.exports = api;
export default api;
