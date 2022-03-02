import mongoose from 'mongoose';

// Everytime people like user video, check how many all likes that the user receive. If likes > 5000, change the verified to 1 (Mean its true)
export type Verified = 0 | 1;
export type ShowLikedVideos = 'true' | 'false';
export type Role = 1 | 2;
export type UserType = 'admin' | 'user';

export interface User {
    _id: string;
    username: string; // required
    name: string; // required
    email: string; // required
    password?: string; // required
    type: UserType; // required
    role: Role;
    country: string;
    profile_picture: string;
    following: Array<string>; // userId
    followers: Array<string>; // userId
    bio: string;
    likes: number;
    verified: Verified;
    videos: Array<string>; // postId
    liked: Array<string>; // postId
    showLikedVideos: ShowLikedVideos;
    isGoogleAccount: boolean;
    // likeType: Array<string> | Whether it's fyp, music, other video's genre. Check the liked video's genre to fill this thing!

    createdAt: string;
    updatedAt: string;
}

export type UserReturn = Omit<User, 'password'>

const schema = new mongoose.Schema({

    username: {
        required: true,
        type: String
    },

    name: {
        required: true,
        type: String
    },

    email: {
        required: true,
        unique: true,
        type: String,
    },

    password: String,

    type: {
        type: String,
        required: true
    },

    role: {
        type: Number,
        required: true
    },

    country: {
        type: String,
        required: true
    },

    profile_picture: {
        type: String,
        required: true
    },

    following: [String],

    followers: [String],

    bio: {
        type: String,
        required: true
    },

    likes: {
        type: Number,
        default: 0
    },

    verified: {
        type: Number,
        default: 0
    },

    videos: [String],

    liked: [String], // will containt VideoId

    showLikedVideos: {
        type: String,
        default: 'true'
    },

    isGoogleAccount: {
        type: Boolean,
        required: true
    }

    // likeType: [String]

}, { timestamps: true });
schema.index({ 'name': 'text', 'username': 'text' }, { name: 'name_index' });

const UserModel = mongoose.model<User>('User', schema);
export default UserModel

