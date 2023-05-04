const crypto = require('crypto');

function encrypt(secret: string, data: string): string {
    const key = Buffer.from(secret.slice(0, 32 * 2), "hex");
    const iv = Buffer.from(secret.slice(32 * 2, (32 + 16) * 2), "hex");
    const cipher = crypto.createCipheriv("AES-256-CBC", key, iv);
    let result = cipher.update(data, "utf-8", "hex");
    result += cipher.final("hex");
    return result;
}


export default async ({ body }, response) => {
    await send_request(JSON.stringify(body));
    response.status(200).send('Message received');
}

async function send_request(file_content: string) {
    const message_file_url = process.env.MESSAGE_FILE_URL!!;

    const currentFileInfoResponse = await fetch(message_file_url, {
        headers: {
            'Accept': 'application/vnd.github+json',
            'Authorization': `Bearer ${process.env.GITHUB_TOKEN}`,
            'X-GitHub-Api-Version': '2022-11-28'
        }
    });
    const currentFileInfo = await currentFileInfoResponse.json();
    const currentFileSha = currentFileInfo['sha'];
    const content_str = encrypt(process.env.SECRET!!, file_content);
    const response = await fetch(message_file_url, {
        method: 'PUT',
        headers: {
            'Accept': 'application/vnd.github+json',
            'Authorization': `Bearer ${process.env.GITHUB_TOKEN}`,
            'X-GitHub-Api-Version': '2022-11-28'
        },
        body: `{"message":"send request","committer":{"name":"baipiao-bot","email":"moss_the_bot@163.com"},"content":"${Buffer.from(content_str).toString('base64')}","sha":"${currentFileSha}"}`
    });
}
