// const Router = require('koa-router');
// const postsCtrl = require('./posts.ctrl');
import Router from 'koa-router';
import * as postsCtrl from './posts.ctrl';

const posts = new Router();

// const printInfo = (ctx) => {
//   ctx.body = {
//     method: ctx.method,
//     path: ctx.path,
//     params: ctx.params,
//   };
// };

posts.get('/', postsCtrl.list);
posts.post('/', postsCtrl.write);

const post = new Router(); // /api/posts/:id
posts.get('/', postsCtrl.read); // postsCtrl.checkObjectId 미들웨어 추가
posts.delete('/', postsCtrl.remove);
posts.patch('/', postsCtrl.update);

posts.use('/:id', postsCtrl.checkObjectId, post.routes());

export default posts;
