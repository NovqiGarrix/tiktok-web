import { Router } from 'express';

import { setPostDataRequest, changePostPrivacyRequest, changeAllowCommentingReq, deletedPostRequest } from '../../middleware/postRouteMiddleware';
import { addPostView, addPostLikes, changeAllowCommenting, changePostPrivacy, deletedPost, getFollowingPosts, getPost, likePost, searchByDesc, searchByTag, setPostData, unLikePost, uploadPost } from '../../controller/posts.controller';

const router = Router();

router.get('/:postId/one', getPost);
router.get('/following/post', getFollowingPosts);
router.get('/search', searchByDesc);
router.get('/search/tag', searchByTag);

router.post('/', uploadPost);
router.post('/post_data', setPostDataRequest, setPostData);
router.post('/:postId', addPostLikes);
router.post('/:postId/like', likePost); // POST for Like

router.patch('/:postId/like', unLikePost); // PATCH for UnLike
router.patch('/:postId/post_privacy', changePostPrivacyRequest, changePostPrivacy);
router.post('/:postId/post_commenting', changeAllowCommentingReq, changeAllowCommenting);
router.patch('/:postId/view', addPostView);

router.delete('/:postId', deletedPostRequest, deletedPost);

export default router