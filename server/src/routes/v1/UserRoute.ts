import { Router } from 'express';

import { changeLikedVideosStatus, changeProfilePicture, follow, getCurrentUser, getUserByUsername, getUsers, searchByName, updateBio } from '../../controller/user.controller';
import { changeLikedVideosStatusReq, getUserRequest, updateBioRequest } from '../../middleware/userRouteMiddleware';

const router = Router();

router.get('/', getCurrentUser);
router.get('/users', [getUserRequest], getUsers);
router.get('/:username/one', getUserByUsername);
router.get('/search', searchByName);

router.post('/:userId/follow', follow);

router.patch('/profile_picture', changeProfilePicture); // For production
router.patch('/liked_video_status', changeLikedVideosStatusReq, changeLikedVideosStatus);
router.patch('/bio', updateBioRequest, updateBio);


export default router