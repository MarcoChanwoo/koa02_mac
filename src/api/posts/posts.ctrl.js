import Post from '../../models/post';
import mongoose from 'mongoose';
import Joi from '../../../node_modules/joi/lib/index';

const { ObjectId } = mongoose.Types;

export const getPostById = async (ctx, next) => {
  const { id } = ctx.params;
  if (!ObjectId.isValid(id)) {
    ctx.status = 400; // Bad Request
    return;
  }
  try {
    const post = await Post.findById(id);
    // 포스트가 없을 시
    if (!post) {
      ctx.status = 404; //Not Found
      return;
    }
    ctx.state.post = post;
    return next();
  } catch (e) {
    ctx.throw(500, e);
  }
  return next();
};

/* 
Post /api/posts
{
  title: '제목',
  body: '내용',
  tags: ['태그1', '태그2']
}
*/
export const write = async (ctx) => {
  const schema = Joi.object().keys({
    // 객체가 다음 필드를 갖고 있음을 검증
    title: Joi.string().required(), // required()가 있으면 필수 항목
    body: Joi.string().required(),
    tags: Joi.array().items(Joi.string()).required(),
  });

  // 검증 후 검증 실패인 경우 에러 처리
  const result = schema.validate(ctx.request.body);
  if (result.error) {
    ctx.status = 400; // Bad Request
    ctx.body = result.error;
    return;
  }

  const { title, body, tags } = ctx.request.body;
  const post = new Post({
    title,
    body,
    tags,
    user: ctx.state.user,
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
  // query는 문자열이므로 숫자로 변환해야 한다!
  // 값이 주어지지 않았다면 1을 기본으로 사용한다.
  const page = parseInt(ctx.query.page || '1', 10);

  if (page < 1) {
    ctx.status = 400;
    return;
  }
  const { tag, username } = ctx.query;
  // tag, username 값이 유효하다면 객체 안에 넣고, 그렇지 않으면 넣지 않음
  const query = {
    ...(username ? { 'user.username': username } : {}),
    ...(tag ? { tags: tag } : {}),
  };

  try {
    const posts = await Post.find(query)
      .sort({ _id: -1 })
      .limit(10)
      .skip((page - 1) * 10)
      .exec();
    const postCount = await Post.countDocuments(query).exec();
    ctx.set('Last-Page', Math.ceil(postCount / 10));
    ctx.body = posts
      .map((post) => post.toJSON())
      .map((post) => ({
        ...post,
        body:
          post.body.length < 200 ? post.body : `${post.body.slice(0, 200)}...`,
      }));
  } catch (e) {
    ctx.throw(500, e);
  }
};

/* 
  GET /api/posts/:id
*/
export const read = (ctx) => {
  ctx.body = ctx.state.post;
  // const { id } = ctx.params;
  // try {
  //   const post = await Post.findById(id).exec();
  //   if (!post) {
  //     ctx.status = 404; // Not Found
  //     return;
  //   }
  //   ctx.body = post;
  // } catch (e) {
  //   ctx.throw(500, e);
  // }
};

export const checkOwnPost = (ctx, next) => {
  const { user, post } = ctx.state;
  if (post.user._id.toString() !== user._id) {
    ctx.status = 403;
    return;
  }
  return next();
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
  // write에서 사용한 schema과 유사하나 required()가 없음
  const schema = Joi.object().keys({
    title: Joi.string(),
    body: Joi.string(),
    tags: Joi.array().items(Joi.string()),
  });

  // 검증 후 실패인 경우 에러 처리
  const result = schema.validate(ctx.request.body);
  if (result.error) {
    ctx.status = 400;
    ctx.body = result.error;
    return;
  }

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
