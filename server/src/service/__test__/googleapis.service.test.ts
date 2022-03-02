
import { readFile } from 'fs/promises';
import googleapisService from "../googleapis.service"

describe('Googleapis Service Test', () => {

    describe('generateAuthURL function', () => {
        it('should return authURL', async () => {

            const authURL = await googleapisService.generateAuthURL();
            expect(authURL).toStrictEqual(expect.any(String))

        })
    })

    describe('storeNewAccessToken function', () => {
        it('Should stored new access_token', (done) => {
            const path = './google-credentials.json'
            readFile(path).then((value) => {
                const { access_token: prevAccessToken } = JSON.parse(value.toString());

                googleapisService.storeNewAccessToken(path).then(async () => {
                    const { access_token } = JSON.parse((await readFile(path)).toString());

                    expect(access_token).not.toBeUndefined();
                    expect(access_token).not.toBe(prevAccessToken);
                    done();
                });
            })
        })
    })

})