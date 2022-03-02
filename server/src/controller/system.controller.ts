import axios from 'axios';
import { Request, Response } from 'express';
import authService from '../service/auth.service';
import postsService from '../service/posts.service';
import sendHTTPError from '../util/sendError';

export const setUpSystemAccount = async (req: Request, res: Response): Promise<Response> => {

    try {

        const systemUser = await authService.register({
            username: 'system_test',
            name: 'System Account',
            country: 'EN',
            email: 'systemTest@gmail.com',
            password: 'systemTest@gmail.com',
            isGoogleAccount: false,
            type: 'admin'
        })

        const userId = systemUser._id.toString();

        // Create a system post, for users who are not logged in yet. So that, they can see some tiktok video 

        // I've been uploaded some sample video in my drive, and paste the videoId here :)
        const fileId1 = '1aplsZwYBgA66rjSkU4TS1E72S-6_mTMH';
        const fileId2 = '13RQ41P3WfWrMRZJZZGjZauSJzPsXXlVq';
        const fileId3 = '1i23-3llyY_GoZSmJrc6WC7QnCeTLqbPn';

        // To avoid duplicate post, when refreshing the page
        const isUploaded = await postsService.getPost({ userId });
        if (!isUploaded) {

            // I'm a fan of Spider-man, so all of these videos are Spider-Man's video
            await postsService.uploadPost(userId, {
                fileId: fileId1,
                title: 'Peter Maguire trying web shooter',
                desc: 'Peter Maguire trying his first Web Shooter in Spider-Man 2002 by Sam Raimi',
                country: 'EN',
                privacy: 'public'
            })

            await postsService.uploadPost(userId, {
                fileId: fileId2,
                title: 'Peter Maguire vs Flash Thompson',
                desc: 'Peter Maguire vs Flash Thompson in Spider-Man 2002 by Sam Raimi',
                country: 'EN',
                privacy: 'public'
            })

            await postsService.uploadPost(userId, {
                fileId: fileId3,
                title: 'Peter Maguire vs Green Goblin Pt. 1',
                desc: 'Peter Maguire vs Green Goblin Pt. 1 in Spider-Man 2002 by Sam Raimi',
                country: 'EN',
                privacy: 'public'
            })

        }

        const response = {
            messsage: "Copy and paste the userId in ./client/.env.local",
            data: systemUser,
            error: null
        }

        return res.send(response)

    } catch (error: any) {
        return sendHTTPError(res, error.message);
    }
}