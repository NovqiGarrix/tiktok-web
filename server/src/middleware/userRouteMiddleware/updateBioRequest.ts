import { NextFunction, Request, Response } from 'express';

import z, { object, string } from 'zod';
import { createZodError } from '../../util/createZodError';
import sendHTTPError from '../../util/sendError';

const reqBody = object({
    newBio: string({ required_error: 'Please provide the new bio!' })
});

export type ReqBodyUpdateBio = z.infer<typeof reqBody>
const updateBioRequest = (req: Request, res: Response, next: NextFunction): Response | void => {

    const validBody = reqBody.safeParse(req.body);

    if (!validBody.success) {
        const error = createZodError(validBody.error.issues);
        return sendHTTPError(res, error, 406);
    }

    return next();
}

export default updateBioRequest