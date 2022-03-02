import { GoogleApis } from '../googleapis';


describe('Googleapis Utility Unit Testing', () => {

    describe('getOAuthClient function', () => {

        describe('For Server', () => {

            it('Should return oAuthClient for server', () => {

                const oAuthClient = GoogleApis.getOAuthClient();

                const REDIRECT_URI = oAuthClient.generateAuthUrl({ access_type: 'offline' });
                const serverPORT = REDIRECT_URI.indexOf('localhost%3A3001') > 0;

                expect(serverPORT).toBeTruthy();
            })

        })

    })

})