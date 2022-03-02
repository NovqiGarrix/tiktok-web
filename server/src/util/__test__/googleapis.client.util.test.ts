import { GoogleApisClient } from '../googleapis.client';


describe('googleapis.client.util Unit Testing', () => {

    describe('Should generate Authentication URL for Client Side', () => {

        it('Should return oAuthClient for client', () => {

            const oAuthClient = GoogleApisClient.getOAuthClient();

            const REDIRECT_URI = oAuthClient.generateAuthUrl({ access_type: 'offline' });
            const serverPORT = REDIRECT_URI.indexOf('localhost%3A3000') > 0;

            expect(serverPORT).toBeTruthy();
        })

    })

})