const Router = require('koa-router');
const posts = require('./posts');

const api = new Router();

// api.get('/test', (ctx) => {
//   ctx.body = 'test SUCCESS!';
// });
api.use('/posts', posts.routes());

// 라우터 내보냄
module.exports = api;
