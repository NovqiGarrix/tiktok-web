import { Router } from 'express';

import AuthRoute from './AuthRoute';
import UserRoute from './UserRoute';
import GoogleRoute from './GoogleRoute';
import PostRoute from './PostRoute';

import { authenticationMiddleware } from '../../middleware';
import { getPostsRequest } from '../../middleware/postRouteMiddleware';
import { getPosts } from '../../controller/posts.controller';
import { setUpSystemAccount } from '../../controller/system.controller';

const router = Router();

router.get('/', (_req, res) => {

    return res.send(`
        <head>
            <title>Tiktok Server by Express.js</title>
            <link rel="preconnect" href="https://fonts.googleapis.com">
            <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
            <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500&display=swap" rel="stylesheet">
        </head>
        <body style="margin: 0; padding: 0; overflow: hidden; text-align: center; display: flex; justify-content: center; align-items: center; height: 100vh; width: 100vw; flex-direction: column">
            <div style="width: 42vw">
                <h1 style="color: rgb(74 222 128); font-family: 'Poppins', sans-serif; font-size: 3rem">
                    Welcome to RESTFull API V1.0 of Tiktok Server
                </h1>
                
                <a href="https://github.com/NovqiGarrix?tab=repositories" target="_blank" style="margin: 2rem 0; color: rgb(34 197 94); font-family: 'Poppins', sans-serif; font-size: 2rem">
                   NovqiGarrix's Github
                </a>

            <div>
        </body>
    `);

});

router.get('/setup', setUpSystemAccount);

router.use('/auth', AuthRoute);
router.use('/google', GoogleRoute);

router.get('/post/', getPostsRequest, getPosts);
router.use('/post', authenticationMiddleware, PostRoute);

router.use('/user', authenticationMiddleware, UserRoute);

export default router