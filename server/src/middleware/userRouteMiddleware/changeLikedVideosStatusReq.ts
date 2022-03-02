import { Request, Response, NextFunction } from 'express';

import { z } from 'zod';
import { createZodError } from '../../util/createZodError';
import sendHTTPError from '../../util/sendError';

const reqBody = z.object({
    newPrivacyStatus: z.enum(['true', 'false'])
})

export type ReqBodyChangeLikedVideoStatus = z.infer<typeof reqBody>

const changeLikedVideosStatusReq = (req: Request<{}, {}, ReqBodyChangeLikedVideoStatus>, res: Response, next: NextFunction): Response | void => {

    const validBody = reqBody.safeParse(req.body);

    if (!validBody.success) {
        const error = createZodError(validBody.error.issues);
        return sendHTTPError(res, error, 406);
    }

    return next();

}

export default changeLikedVideosStatusReq