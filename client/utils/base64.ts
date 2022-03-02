



export function encodeBase64(input: string): string {
    return Buffer.from(input).toString('base64');
}

export function decodeBase64(input: string): string {
    return Buffer.from(input, 'base64').toString();
}