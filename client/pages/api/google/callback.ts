import axios from 'axios';
import { NextApiRequest, NextApiResponse } from 'next';
import { encodeBase64 } from '../../../utils/base64';


export default async function handler(req: NextApiRequest, res: NextApiResponse): Promise<void> {

    try {
        const code = req.query.code as string;

        const SERVER_URL = process.env.SERVER_URL!
        const V = process.env.CURRENT_API_VERSION!

        const reqBody = { code }

        const { data: { error, data, data: { username } } } = await axios.post(`${SERVER_URL}/api/${V}/google/login`, reqBody);

        const encodedData = encodeBase64(JSON.stringify(data));

        if (!error) {
            res.redirect(`/callback/google?data=${encodedData}`);
            return
        }

        const encodedMessage = encodeBase64('Cannot collect data from google');
        res.redirect(`/?msg=${encodedMessage}`);
        return;
    } catch (error: any) {
        return res.status(500).send(error.message);
    }

}