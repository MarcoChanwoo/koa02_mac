// let postId = 1;

// const posts = [
//   {
//     id: 1,
//     title: '제목',
//     body: '내용',
//   },
// ];

// export const write = (ctx) => {
//   const { title, body } = ctx.request.body;
//   postId += 1;
//   const post = { id: postId, title, body };
//   posts.push(post);
//   ctx.body = post;
// };

// export const list = (ctx) => {
//   ctx.body = posts;
// };

// export const read = (ctx) => {
//   const { id } = ctx.params;
//   const post = posts.find((p) => p.id.toString() === id);
//   if (!post) {
//     ctx.status = 404;
//     ctx.body = {
//       message: '포스트 없음',
//     };
//     return;
//   }
//   ctx.body = post;
// };

// export const remove = (ctx) => {
//   const { id } = ctx.params;
//   const index = ctx.findIndex((p) => p.id.toString() === id);
//   if (index === -1) {
//     ctx.status = 404;
//     ctx.body = {
//       message: '포스트 없음',
//     };
//     return;
//   }
//   posts.splice(index, 1);
//   ctx.status = 204;
// };

// export const replace = (ctx) => {
//   const { id } = ctx.params;
//   const index = posts.findIndex((p) => p.id.toString() === id);
//   if (index === -1) {
//     ctx.status = 404;
//     ctx.body = {
//       message: '포스트 없음',
//     };
//     return;
//   }
//   posts[index] = {
//     id,
//     ...ctx.request.body,
//   };
//   ctx.body = posts[index];
// };

// export const update = (ctx) => {
//   const { id } = ctx.params;
//   const index = posts.findIndex((p) => p.id.toString() === id);
//   if (index === -1) {
//     ctx.status = 404;
//     ctx.body = {
//       message: '포스트 없음',
//     };
//     return;
//   }
//   posts[index] = {
//     ...posts[index],
//     ...ctx.request.body,
//   };
//   ctx.body = posts[index];
// };

import Post from '../../model/post';

/* 
Post /api/posts
{
  title: '제목',
  body: '내용',
  tags: ['태그1', '태그2']
}
*/
export const write = async (ctx) => {
  const { title, body, tags } = ctx.request.body;
  const post = new Post({
    title,
    body,
    tags,
  });
  try {
    await post.save();
    ctx.body = post;
  } catch (e) {
    ctx.throw(500, e);
  }
};

/* 
  GET /api/posts
*/
export const list = async (ctx) => {
  try {
    const posts = await Post.find().exec();
    ctx.body = posts;
  } catch (e) {
    ctx.throw(500, e);
  }
};

/* 
  GET /api/posts/:id
*/
export const read = async (ctx) => {
  const { id } = ctx.params;
  try {
    const post = await Post.findById(id).exec();
    if (!post) {
      ctx.status = 404; // Not Found
      return;
    }
    ctx.body = post;
  } catch (e) {
    ctx.throw(500, e);
  }
};

/* 여기선 id만 찾아 제거하도록 설정함 - findByIdAndRemove()
  DELETE /api/posts/:id
*/
export const remove = async (ctx) => {
  const { id } = ctx.params;
  try {
    await Post.findByIdAndRemove(id).exec();
    ctx.status = 204; // No Content - 성공했으나 응답할 데이터는 없음을 의미
  } catch (e) {
    ctx.throw(500, e);
  }
};

/* 
  PATCH /api/posts/:id
  {
    title: '수정',
    body: '수정 내용',
    tags: ['수정', '태그']
  }
*/
export const update = async (ctx) => {
  const { id } = ctx.params;
  try {
    const post = await Post.findByIdAndUpdate(id, ctx.request.body, {
      new: true,
      // true: 업데이트된 데이터를 반환함
      // false: 업데이트되기 전의 데이터를 반환함
    }).exec();
    if (!post) {
      ctx.status = 404;
      return;
    }
    ctx.body = post;
  } catch (e) {
    ctx.throw(500, e);
  }
};
