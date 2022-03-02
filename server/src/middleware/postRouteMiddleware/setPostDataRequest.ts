import { Request, Response, NextFunction } from 'express';

import { object, string, z } from 'zod';
import { createZodError } from '../../util/createZodError';
import sendHTTPError from '../../util/sendError';

const reqBody = object({
    title: string({ required_error: "Post Title is required!" }),
    desc: string({ required_error: "Post Description is required!" }),
    privacy: z.enum(['public', 'private', 'friends']),
    saveTo: string({ required_error: "saveTo is required!" }),
    fileId: string({ required_error: "fileId is required!" })
});

export type ReqBodySetPostData = z.infer<typeof reqBody>

const uploadPostRequest = (req: Request, res: Response, next: NextFunction): Response | void => {

    const validBody = reqBody.safeParse(req.body);

    if (!validBody.success) {
        const error = createZodError(validBody.error.issues);
        return sendHTTPError(res, error, 406);
    }

    return next();

}

export default uploadPostRequest