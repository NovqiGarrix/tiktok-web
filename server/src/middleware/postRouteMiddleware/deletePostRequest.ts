import { Request, Response, NextFunction } from 'express';
import postsService from '../../service/posts.service';

import sendHTTPError from '../../util/sendError';

const deletedPostRequest = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {

    const { _id: userId } = res.locals.user
    const { postId } = req.params

    try {

        const post = await postsService.getPost({ _id: postId, userId });
        if (!post) return sendHTTPError(res, 'Post does not found!', 404);

        return next();

    } catch (error: any) {
        return sendHTTPError(res, error.message);
    }

}

export default deletedPostRequest