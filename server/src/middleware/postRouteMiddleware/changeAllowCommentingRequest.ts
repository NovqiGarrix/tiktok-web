import { NextFunction, Request, Response } from 'express';

import { z } from 'zod';
import postsService from '../../service/posts.service';
import { createZodError } from '../../util/createZodError';
import sendHTTPError from '../../util/sendError';

const reqBody = z.object({
    allowCommenting: z.enum(['allow', 'disallowed']),
})

export type ReqBodyChangeAllowCommenting = z.infer<typeof reqBody>

const changeAllowCommentingReq = async (req: Request<{ postId: string }, {}, ReqBodyChangeAllowCommenting>, res: Response, next: NextFunction): Promise<Response | void> => {

    const { postId } = req.params
    const { _id: userId } = res.locals.user

    try {

        const validBody = reqBody.safeParse(req.body);

        if (!validBody.success) {
            const error = createZodError(validBody.error.issues);
            return sendHTTPError(res, error, 406);
        }

        const post = await postsService.getPost({ userId, _id: postId });
        if (!post) return sendHTTPError(res, 'Invalid request!', 406);

        return next();

    } catch (error: any) {
        return sendHTTPError(res, error.message);
    }
}

export default changeAllowCommentingReq