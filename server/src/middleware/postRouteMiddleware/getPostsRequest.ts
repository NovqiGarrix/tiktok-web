import { Request, Response, NextFunction } from 'express';

import compareArray from '../../util/compareArray';
import sendHTTPError from '../../util/sendError';

const getPostsRequest = (req: Request, res: Response, next: NextFunction): Response | void => {

    const validField = ['country', 'likes', 'page', 'userId']
    const validQueries = compareArray(validField, req.query);

    if (!validQueries) return sendHTTPError(res, 'Invalid queries!', 406);

    return next();
}

export default getPostsRequest