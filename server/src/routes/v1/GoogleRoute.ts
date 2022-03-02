import { Router } from 'express';

import { loginOrSignUpRequest } from '../../middleware/googleRoute';
import { generateAuthURL, generateAuthURLForClient, handleCallback, loginOrSignUp } from '../../controller/googleapis.controller';

const router = Router();

router.get('/authURL', generateAuthURL);
router.get('/authURL/client', generateAuthURLForClient);
router.get('/callback', handleCallback);

router.post('/login', loginOrSignUpRequest, loginOrSignUp);

export default router