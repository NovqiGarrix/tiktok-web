# Backend Side

![Typescript](https://miro.medium.com/max/1756/1*fzcYZIhdZjuQaT8gTk1YAQ.png)

## Getting Started

### 1. Setting up .env variables

1. Create a .env file <br>
   Create a .env file in the root directory. See .env.example for variables naming!

2. Generate Public and Private keys <br />
   `Public and private key are used to generate JWT Tokens more securely`.
   You can easily generate them in here: https://app.id123.io/free-tools/key-generator/. <br />
   OR
   <br>
   Open up your terminal and type this: <br />
   mkdir keys && openssl genrsa -out ./keys/privateKey.pem 4096 && openssl req -new -x509 -key ./keys/privateKey.pem -out ./keys/publicKey.cer -days 1825. Press enter on each question, and you will have privateKey.pem and publicKey.cer.
   <br>
   <br>
   Next, you need to encode each keys to base64. To do so, go to https://base64encode.org, and simply paste each key. After that copy each encoded key, and paste it in the **.env** file based on variables naming in the **.env.example**
   <br>

3. Getting MongoDb URL Connection <br>
   If you are using MongoDb in you local computer, the regular url connection is `mongodb://127.0.0.1:27017/database_name`. You can change `database_name` with your project name, for example `tiktok-server`, so the url connection will be `mongodb://127.0.0.1:27017/tiktok-server`. <br />
   <br />
   But, if you are using MongoDb with Atlas, you can get the url connection from your Atlas account.
   Check out this tutorial to do so: https://medium.com/@sergio13prez/connecting-to-mongodb-atlas-d1381f184369.
   <br>
   After getting the URL Connection, paste it in the .env file based on variables naming in the .env.example.

4. Getting Google ClientID and ClientSecret <br>
   Check out this awesome blog to do so: https://bit.ly/33lmnLa. For the Authorized redirect URIs, fill that field with this url: `http://localhost:3001/api/v1/google/callback`
   After that, go to https://bit.ly/3rIKwo8 and enable the Google Drive API. I'm using google drive as a storage for the video and profile picture because it's free and has 15GB of cloud storage. You also want to put the Google ClientId and ClientSecret in the .env file.

5. Create Profile Picture Folder and Videos Folder in Google Drive <br>
   This is used to manage your drive better, so when you upload a user's profile picture and videos, it's not directly be placed on `My Drive`. After creating it, take the Ids from both folders, and put that Ids in the .env file. To get the folder ID, just right click on the folder and choose get link. Then, the folderId will be after `/folders/`.
   https://drive.google.com/drive/folders/folderId?usp=sharing

### 2. Install All The Dependencies

Open up your terminal, and type <br >

`yarn`, if you are using yarn
<br />
`npm install`, if you are using npm.

## Run the Server

Open up your terminal, and type <br >

`yarn dev`, if you are using yarn
<br />
`npm run dev`, if you are using npm.

## Set Up Google Credentials

Because I'm using Google Drive API in this project, then you need the access_token and refresh_token. To do so, just go to http://localhost:3001/api/v1/google/authURL, and login to your account. Then the server will automatically generate `google-credentials.json` in the root directory.

## Run unit testing

I highly recommended running unit testing first before using all the features on this project. You can do so by opening up your terminal, and type <br >

`yarn test`, if you are using yarn
<br />
`npm test`, if you are using npm.

if you found a **FAIL** test which is coming from uploadPost.test.ts, do not worry. It's not a bug that come from this project, maybe it's coming from **supertest** npm package. See this [**issue**](https://github.com/visionmedia/supertest/issues/230)
You can try to test on that single file, by typing `yarn test uploadPost` in your command line.

## Build the Server

To host this server on a hosting or maybe private server, you have to compile all the typescript code into vanilla javascript code first . To do so, open up your terminal, and type <br >

`yarn build`, if you are using yarn
<br />
`npm run build`, if you are using npm.
<br>

## 2. API Specification

## Auth Route

### 1. Register

Request:

- Method: POST
- Endpoint: `/api/v1/auth/signUp`
- Header:
  - Content-Type: application/json
  - Accept: application/json
- Body:

```json
{
  "username": "string",
  "name": "string",
  "email": "string",
  "password": "string",
  "type": "admin | user",
  "country": "string",
  "isGoogleAccount": "boolean" // Just the code name. Ex: Indonesia -> ID
}
```

Response:
<br>
`If success will return status code 201`

`If one of the body is null or undefined`

```json
{
  "data": null,
  "error": [
    {
      "field": "string",
      "message": "string"
    }
  ]
}
```

### 2. Login

Request:

- Method: POST
- Endpoint: `/api/v1/auth/`
- Header:
  - Content-Type: application/json
  - Accept: application/json
- Body:

```json
{
  "email": "string",
  "password": "string"
}
```

Response:
<br>

#### If success

```json
{
  "data": {
    "_id": "string",
    "username": "string",
    "name": "string",
    "email": "string",
    "type": "string",
    "role": "number",
    "country": "string",
    "profile_picture": "string",
    "following": "string[]",
    "followers": "string",
    "bio": "string",
    "likes": "string",
    "verified": "string",
    "videos": "string",
    "liked": "string",
    "showLikedVideos": "string",
    "isGoogleAccount": "boolean",
    "createdAt": "string",
    "updatedAt": "string",
    "accessToken": "string",
    "refreshToken": "string"
  },
  "error": null
}
```

#### If email or password is null or undefined

```json
{
  "data": null,
  "error": [
    {
      "field": "string",
      "message": "string"
    }
  ]
}
```

#### If email and password are wrong

```json
{
  "data": null,
  "error": "string"
}
```

## Google Route

### 1. Generate Google Authentication URL

Request:

- Method: GET
- Endpoint: `/api/v1/google/authURL`
- Header:
  - Content-Type: application/json
  - Accept: application/json

Response: <br>

```json
{
  "data": "string",
  "error": null
}
```

### 2. Generate Google Authentication URL For Client

Request:

- Method: GET
- Endpoint: `/api/v1/google/authURL/client`
- Header:
  - Content-Type: application/json
  - Accept: application/json

Response: <br>

```json
{
  "data": "string",
  "error": null
}
```

### 3. Callback Handler after Login using Google Authentication URL

Request:

- Method: GET
- Endpoint: `/api/v1/google/callback`
- Header:
  - Content-Type: application/json
  - Accept: application/json

Response: <br>
Only send 200 as status code, and generate `google-credentials.json`

### 4. Login or SignUp with Google Account

Request:

- Method: POST
- Endpoint: `/api/v1/google/login`
- Header:
  - Content-Type: application/json
  - Accept: application/json
    body:

```json
{
  "code": "string" // Code that google give with the redirect URL
}
```

Response: <br>

```json
{
  "data": {
    "_id": "string",
    "username": "string",
    "name": "string",
    "email": "string",
    "type": "string",
    "role": "number",
    "country": "string",
    "profile_picture": "string",
    "following": "string[]",
    "followers": "string",
    "bio": "string",
    "likes": "string",
    "verified": "string",
    "videos": "string",
    "liked": "string",
    "showLikedVideos": "string",
    "isGoogleAccount": "boolean",
    "createdAt": "string",
    "updatedAt": "string",
    "accessToken": "string",
    "refreshToken": "string"
  },
  "error": null
}
```

## User Route

### 1. Get Current Logged User

Request:

- Method: GET
- Endpoint: `/api/v1/user`
- Header:
  - Content-Type: application/json
  - Accept: application/json
  - x-access-token: "string" // Access token will receive when user logged in
  - x-refresh-token: "string" // Refresh token will receive when user logged in

Response: <br>

```json
{
  "data": {
    "_id": "string",
    "username": "string",
    "name": "string",
    "email": "string",
    "type": "string",
    "role": "number",
    "country": "string",
    "profile_picture": "string",
    "following": [
      {
        "userId": "string",
        "username": "string",
        "name": "string",
        "verified": "number",
        "profile_picture": "string"
      }
    ],
    "following": [
      {
        "userId": "string",
        "username": "string",
        "name": "string",
        "verified": "number",
        "profile_picture": "string"
      }
    ],
    "bio": "string",
    "likes": "string",
    "verified": "string",
    "videos": "string[]",
    "liked": "string[]",
    "showLikedVideos": "string",
    "isGoogleAccount": "boolean",
    "createdAt": "string",
    "updatedAt": "string"
  },
  "newAccessToken": "string", // This field only avaible when previous accessToken was expired
  "error": null
}
```

### 2. Get Any User filtered with req.query (Admin user only)

Request:

- Method: GET
- Endpoint: `/api/v1/user/users`
- Header:
  - Content-Type: application/json
  - Accept: application/json
  - x-access-token: "string" // Access token will receive when user logged in
  - x-refresh-token: "string" // Refresh token will receive when user logged in

Response: <br>

```json
{
  "data": {
    "user": [
      {
        "_id": "string",
        "username": "string",
        "name": "string",
        "email": "string",
        "type": "string",
        "role": "number",
        "country": "string",
        "profile_picture": "string",
        "following": "string[]",
        "followers": "string",
        "bio": "string",
        "likes": "string",
        "verified": "string",
        "videos": "string[]",
        "liked": "string[]",
        "showLikedVideos": "string",
        "isGoogleAccount": "boolean",
        "createdAt": "string",
        "updatedAt": "string"
      }
    ],
    "nextURL": "string",
    "allPage": "number",
    "page": "number"
  },
  "newAccessToken": "string", // This field only avaible when previous accessToken was expired
  "error": null
}
```

### 3. Do Follow a user

Request:

- Method: POST
- Endpoint: `/api/v1/user/:userId/follow`
- Header:
  - Content-Type: application/json
  - Accept: application/json
  - x-access-token: "string" // Access token will receive when user logged in
  - x-refresh-token: "string" // Refresh token will receive when user logged in

Response: <br>

```json
{
  "data": {
    "_id": "string",
    "username": "string",
    "name": "string",
    "email": "string",
    "type": "string",
    "role": "number",
    "country": "string",
    "profile_picture": "string",
    "following": [
      {
        "userId": "string",
        "username": "string",
        "name": "string",
        "verified": "number",
        "profile_picture": "string"
      }
    ],
    "following": [
      {
        "userId": "string",
        "username": "string",
        "name": "string",
        "verified": "number",
        "profile_picture": "string"
      }
    ],
    "bio": "string",
    "likes": "string",
    "verified": "string",
    "videos": "string[]",
    "liked": "string[]",
    "showLikedVideos": "string",
    "isGoogleAccount": "boolean",
    "createdAt": "string",
    "updatedAt": "string"
  },
  "newAccessToken": "string", // This field only avaible when previous accessToken was expired
  "error": null
}
```

### 4. Change profile picture

Request:

- Method: PATCH
- Endpoint: `/api/v1/user/profile_picture`
- Header:
  - Content-Type: application/json
  - Accept: application/json
  - x-access-token: "string" // Access token will receive when user logged in
  - x-refresh-token: "string" // Refresh token will receive when user logged in
- FormData

```json
"file": File // Only png and jpeg were allowed
```

Response: <br>

```json
{
  "data": {
    "_id": "string",
    "username": "string",
    "name": "string",
    "email": "string",
    "type": "string",
    "role": "number",
    "country": "string",
    "profile_picture": "string",
    "following": [
      {
        "userId": "string",
        "username": "string",
        "name": "string",
        "verified": "number",
        "profile_picture": "string"
      }
    ],
    "following": [
      {
        "userId": "string",
        "username": "string",
        "name": "string",
        "verified": "number",
        "profile_picture": "string"
      }
    ],
    "bio": "string",
    "likes": "string",
    "verified": "string",
    "videos": "string[]",
    "liked": "string[]",
    "showLikedVideos": "string",
    "isGoogleAccount": "boolean",
    "createdAt": "string",
    "updatedAt": "string"
  },
  "newAccessToken": "string", // This field only avaible when previous accessToken was expired
  "error": null
}
```

### 5. Change Liked Video Privacy

Request:

- Method: PATCH
- Endpoint: `/api/v1/user/liked_video_status`
- Header:
  - Content-Type: application/json
  - Accept: application/json
  - x-access-token: "string" // Access token will receive when user logged in
  - x-refresh-token: "string" // Refresh token will receive when user logged in

Response: <br>

```json
{
  "data": {
    "_id": "string",
    "username": "string",
    "name": "string",
    "email": "string",
    "type": "string",
    "role": "number",
    "country": "string",
    "profile_picture": "string",
    "following": [
      {
        "userId": "string",
        "username": "string",
        "name": "string",
        "verified": "number",
        "profile_picture": "string"
      }
    ],
    "following": [
      {
        "userId": "string",
        "username": "string",
        "name": "string",
        "verified": "number",
        "profile_picture": "string"
      }
    ],
    "bio": "string",
    "likes": "string",
    "verified": "string",
    "videos": "string[]",
    "liked": "string[]",
    "showLikedVideos": "string",
    "isGoogleAccount": "boolean",
    "createdAt": "string",
    "updatedAt": "string"
  },
  "newAccessToken": "string", // This field only avaible when previous accessToken was expired
  "error": null
}
```

### 6. Update Bio

Request:

- Method: PATCH
- Endpoint: `/api/v1/user/bio`
- Header:
  - Content-Type: application/json
  - Accept: application/json
  - x-access-token: "string" // Access token will receive when user logged in
  - x-refresh-token: "string" // Refresh token will receive when user logged in
- body:

```json
{
  "newBio": "string"
}
```

Response: <br>

```json
{
  "data": {
    "_id": "string",
    "username": "string",
    "name": "string",
    "email": "string",
    "type": "string",
    "role": "number",
    "country": "string",
    "profile_picture": "string",
    "following": [
      {
        "userId": "string",
        "username": "string",
        "name": "string",
        "verified": "number",
        "profile_picture": "string"
      }
    ],
    "following": [
      {
        "userId": "string",
        "username": "string",
        "name": "string",
        "verified": "number",
        "profile_picture": "string"
      }
    ],
    "bio": "string",
    "likes": "string",
    "verified": "string",
    "videos": "string[]",
    "liked": "string[]",
    "showLikedVideos": "string",
    "isGoogleAccount": "boolean",
    "createdAt": "string",
    "updatedAt": "string"
  },
  "newAccessToken": "string", // This field only avaible when previous accessToken was expired
  "error": null
}
```

### 7. Get User by Username

Request:

- Method: GET
- Endpoint: `/api/v1/user/:username/one`
- Header:
  - Content-Type: application/json
  - Accept: application/json
  - x-access-token: "string" // Access token will receive when user logged in
  - x-refresh-token: "string" // Refresh token will receive when user logged in

Response: <br>

```json
{
  "data": {
    "_id": "string",
    "username": "string",
    "name": "string",
    "email": "string",
    "type": "string",
    "role": "number",
    "country": "string",
    "profile_picture": "string",
    "following": "string[]",
    "followers": "string",
    "bio": "string",
    "likes": "string",
    "verified": "string",
    "videos": "string[]",
    "liked": "string[]",
    "showLikedVideos": "string",
    "isGoogleAccount": "boolean",
    "createdAt": "string",
    "updatedAt": "string"
  },
  "newAccessToken": "string", // This field only avaible when previous accessToken was expired
  "error": null
}
```

### 8. Search Users by name

Request:

- Method: GET
- Endpoint: `/api/v1/user/search`
- Header:
  - Content-Type: application/json
  - Accept: application/json
  - x-access-token: "string" // Access token will receive when user logged in
  - x-refresh-token: "string" // Refresh token will receive when user logged in

Response: <br>

```json
{
  "data": {
    "user": [
      {
        "_id": "string",
        "username": "string",
        "name": "string",
        "email": "string",
        "type": "string",
        "role": "number",
        "country": "string",
        "profile_picture": "string",
        "following": "string[]",
        "followers": "string",
        "bio": "string",
        "likes": "string",
        "verified": "string",
        "videos": "string[]",
        "liked": "string[]",
        "showLikedVideos": "string",
        "isGoogleAccount": "boolean",
        "createdAt": "string",
        "updatedAt": "string"
      }
    ],
    "nextURL": "string",
    "allPage": "number",
    "page": "number"
  },
  "newAccessToken": "string", // This field only avaible when previous accessToken was expired
  "error": null
}
```

## Post Route

### 1. Get public posts based on req.query

Request:

- Method: GET
- Endpoint: `/api/v1/post
- Header:
  - Content-Type: application/json
  - Accept: application/json
  - x-access-token: "string" // Access token will receive when user logged in
  - x-refresh-token: "string" // Refresh token will receive when user logged in

Response: <br>

```json
{
  "data": {
    "result": [
      {
        "post": {
          "_id": "string",
          "userId": "string",
          "file": "string",
          "title": "string",
          "desc": "string",
          "country": "string",
          "likes": "number",
          "privacy": "string",
          "viewed": "number",
          "allowComment": "string",
          "comments": "string[]",
          "createdAt": "string",
          "updatedAt": "string"
        },
        "user": {
          "userId": "string",
          "name": "string",
          "username": "string",
          "profile_picture": "string",
          "verified": "number"
        }
      }
    ],
    "nextURL": "string",
    "allPage": "number",
    "page": "number"
  },
  "newAccessToken": "string", // This field only avaible when previous accessToken was expired
  "error": null
}
```

### 2. Get posts by following users

Request:

- Method: GET
- Endpoint: `/api/v1/post/following/post`
- Header:
  - Content-Type: application/json
  - Accept: application/json
  - x-access-token: "string" // Access token will receive when user logged in
  - x-refresh-token: "string" // Refresh token will receive when user logged in

Response: <br>

```json
{
  "data": {
    "result": [
      {
        "post": {
          "_id": "string",
          "userId": "string",
          "file": "string",
          "title": "string",
          "desc": "string",
          "country": "string",
          "likes": "number",
          "privacy": "string",
          "viewed": "number",
          "allowComment": "string",
          "comments": "string[]",
          "createdAt": "string",
          "updatedAt": "string"
        },
        "user": {
          "userId": "string",
          "name": "string",
          "username": "string",
          "profile_picture": "string",
          "verified": "number"
        }
      }
    ]
  },
  "newAccessToken": "string", // This field only avaible when previous accessToken was expired
  "error": null
}
```

### 3. Get a post

Request:

- Method: GET
- Endpoint: `/api/v1/post/:postId/one`
- Header:
  - Content-Type: application/json
  - Accept: application/json
  - x-access-token: "string" // Access token will receive when user logged in
  - x-refresh-token: "string" // Refresh token will receive when user logged in

Response: <br>

```json
{
  "data": {
    "post": {
      "_id": "string",
      "userId": "string",
      "file": "string",
      "title": "string",
      "desc": "string",
      "country": "string",
      "likes": "number",
      "privacy": "string",
      "viewed": "number",
      "allowComment": "string",
      "comments": "string[]",
      "createdAt": "string",
      "updatedAt": "string"
    },
    "user": {
      "userId": "string",
      "name": "string",
      "username": "string",
      "profile_picture": "string",
      "verified": "number"
    }
  },
  "newAccessToken": "string", // This field only avaible when previous accessToken was expired
  "error": null
}
```

### 4. Upload a post / video

Request:

- Method: POST
- Endpoint: `/api/v1/post`
- Header:
  - Content-Type: application/json
  - Accept: application/json
  - x-access-token: "string" // Access token will receive when user logged in
  - x-refresh-token: "string" // Refresh token will receive when user logged in
- FormData:

```json
   file: File // Only mp4 and mkv were allowed
```

Response: <br>

```json
{
  "data": {
    "saveTo": "string",
    "fileId": "string"
  },
  "newAccessToken": "string", // This field only avaible when previous accessToken was expired
  "error": null
}
```

### 5. Set the post data // Such as post desc, etc...

Request:

- Method: POST
- Endpoint: `/api/v1/post/post_data`
- Header:
  - Content-Type: application/json
  - Accept: application/json
  - x-access-token: "string" // Access token will receive when user logged in
  - x-refresh-token: "string" // Refresh token will receive when user logged in
- body:

```json
   {
       "desc": "string",
       "privacy": "public" | "private" | "friends",
       "saveTo": "string",
       "fileId": "string"
   }
```

Response: <br>

```json
{
  "data": {
    "_id": "string",
    "userId": "string",
    "file": "string",
    "title": "string",
    "desc": "string",
    "country": "string",
    "likes": "number",
    "privacy": "string",
    "viewed": "number",
    "allowComment": "string",
    "comments": "string[]",
    "createdAt": "string",
    "updatedAt": "string"
  },
  "newAccessToken": "string", // This field only avaible when previous accessToken was expired
  "error": null
}
```

### 6. Like a post

Request:

- Method: POST
- Endpoint: `/api/v1/post/:postId/like`
- Header:
  - Content-Type: application/json
  - Accept: application/json
  - x-access-token: "string" // Access token will receive when user logged in
  - x-refresh-token: "string" // Refresh token will receive when user logged in

Response: <br>

```json
{
  "data": {
    "_id": "string",
    "userId": "string",
    "file": "string",
    "title": "string",
    "desc": "string",
    "country": "string",
    "likes": "number",
    "privacy": "string",
    "viewed": "number",
    "allowComment": "string",
    "comments": "string[]",
    "createdAt": "string",
    "updatedAt": "string"
  },
  "newAccessToken": "string", // This field only avaible when previous accessToken was expired
  "error": null
}
```

### 7. UnLike a post

Request:

- Method: PATCH
- Endpoint: `/api/v1/post/:postId/like`
- Header:
  - Content-Type: application/json
  - Accept: application/json
  - x-access-token: "string" // Access token will receive when user logged in
  - x-refresh-token: "string" // Refresh token will receive when user logged in

Response: <br>

```json
{
  "data": {
    "_id": "string",
    "userId": "string",
    "file": "string",
    "title": "string",
    "desc": "string",
    "country": "string",
    "likes": "number",
    "privacy": "string",
    "viewed": "number",
    "allowComment": "string",
    "comments": "string[]",
    "createdAt": "string",
    "updatedAt": "string"
  },
  "newAccessToken": "string", // This field only avaible when previous accessToken was expired
  "error": null
}
```

### 8. Change Post Privacy

Request:

- Method: PATCH
- Endpoint: `/api/v1/post/:postId/post_privacy`
- Header:
  - Content-Type: application/json
  - Accept: application/json
  - x-access-token: "string" // Access token will receive when user logged in
  - x-refresh-token: "string" // Refresh token will receive when user logged in
- body:

```json
{
  "newPrivacy": "string"
}
```

Response: <br>

```json
{
  "data": {
    "_id": "string",
    "userId": "string",
    "file": "string",
    "title": "string",
    "desc": "string",
    "country": "string",
    "likes": "number",
    "privacy": "string",
    "viewed": "number",
    "allowComment": "string",
    "comments": "string[]",
    "createdAt": "string",
    "updatedAt": "string"
  },
  "newAccessToken": "string", // This field only avaible when previous accessToken was expired
  "error": null
}
```

### 9. Add a comment to a post

Request:

- Method: POST
- Endpoint: `/api/v1/post/:postId/post_commenting`
- Header:
  - Content-Type: application/json
  - Accept: application/json
  - x-access-token: "string" // Access token will receive when user logged in
  - x-refresh-token: "string" // Refresh token will receive when user logged in
- body:

```json
   {
       "allowCommenting": "allow" | "disallowed"
   }
```

Response: <br>

```json
{
  "data": {
    "_id": "string",
    "userId": "string",
    "file": "string",
    "title": "string",
    "desc": "string",
    "country": "string",
    "likes": "number",
    "privacy": "string",
    "viewed": "number",
    "allowComment": "string",
    "comments": "string[]",
    "createdAt": "string",
    "updatedAt": "string"
  },
  "newAccessToken": "string", // This field only avaible when previous accessToken was expired
  "error": null
}
```

### 10. Delete a post

Request:

- Method: DELETE
- Endpoint: `/api/v1/post/:postId`
- Header:
  - Content-Type: application/json
  - Accept: application/json
  - x-access-token: "string" // Access token will receive when user logged in
  - x-refresh-token: "string" // Refresh token will receive when user logged in

Response: <br>

```json
{
  "data": "boolean",
  "newAccessToken": "string", // This field only avaible when previous accessToken was expired
  "error": null
}
```

### 11. Search public posts by the post description

Request:

- Method: GET
- Endpoint: `/api/v1/post/search?keyword=your keyword&page=which page` _// If the page undefined, it will start from 1_
- Header:
  - Content-Type: application/json
  - Accept: application/json
  - x-access-token: "string" // Access token will receive when user logged in
  - x-refresh-token: "string" // Refresh token will receive when user logged in

Response: <br>

```json
{
  "data": {
    "result": [
      {
        "post": {
          "_id": "string",
          "userId": "string",
          "file": "string",
          "title": "string",
          "desc": "string",
          "country": "string",
          "likes": "number",
          "privacy": "string",
          "viewed": "number",
          "allowComment": "string",
          "comments": "string[]",
          "createdAt": "string",
          "updatedAt": "string"
        },
        "user": {
          "userId": "string",
          "name": "string",
          "username": "string",
          "profile_picture": "string"
        }
      }
    ],
    "nextURL": "string",
    "allPage": "number",
    "page": "number"
  },
  "newAccessToken": "string", // This field only avaible when previous accessToken was expired
  "error": null
}
```

### 12. Search public posts by the post tag

Request:

- Method: GET
- Endpoint: `/api/v1/post/search?tag=your base64 encoded tag&page=which page` _// If the page undefined, it will start from 1_
- Header:
  - Content-Type: application/json
  - Accept: application/json
  - x-access-token: "string" // Access token will receive when user logged in
  - x-refresh-token: "string" // Refresh token will receive when user logged in

Response: <br>

```json
{
  "data": {
    "result": [
      {
        "post": {
          "_id": "string",
          "userId": "string",
          "file": "string",
          "title": "string",
          "desc": "string",
          "country": "string",
          "likes": "number",
          "privacy": "string",
          "viewed": "number",
          "allowComment": "string",
          "comments": "string[]",
          "createdAt": "string",
          "updatedAt": "string"
        },
        "user": {
          "userId": "string",
          "name": "string",
          "username": "string",
          "profile_picture": "string"
        }
      }
    ],
    "nextURL": "string",
    "allPage": "number",
    "page": "number"
  },
  "newAccessToken": "string", // This field only avaible when previous accessToken was expired
  "error": null
}
```

### 13. Update (add) post views

Request:

- Method: PATCH
- Endpoint: `/api/v1/post/:postId/view`
- Header:
  - Content-Type: application/json
  - Accept: application/json
  - x-access-token: "string" // Access token will receive when user logged in
  - x-refresh-token: "string" // Refresh token will receive when user logged in

Response: <br>

```json
{
  "data": {
    "postId": "string",
    "viewed": "number"
  },
  "newAccessToken": "string", // This field only avaible when previous accessToken was expired
  "error": null
}
```

## # That's it.

If you have any doubts or errors, please post it in issues!. I'd love to read and solve it!.
Thanks, `Novrii`
