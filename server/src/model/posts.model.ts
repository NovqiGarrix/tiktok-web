import mongoose from 'mongoose';

export type PostPrivacy = 'public' | 'private' | 'friends'
export type AllowComment = 'allow' | 'disallowed'

export interface IPost {
    _id: string;

    userId: string; // required
    file: string; // required
    title: string; // required
    desc: string; // required
    country: string; // required
    likes: number; // required
    privacy: PostPrivacy; // required
    viewed: number;
    allowComment: AllowComment;
    comments: Array<string>

    createdAt: string;
    updatedAt: string;
}

const schema = new mongoose.Schema({

    userId: {
        type: String,
        required: true
    },

    title: {
        type: String,
        required: true
    },

    desc: {
        type: String,
        required: true
    },

    file: {
        type: String,
        required: true
    },

    country: {
        type: String,
        required: true
    },

    likes: {
        type: Number,
        default: 0
    },

    privacy: {
        type: String,
        required: true
    },

    viewed: {
        type: Number,
        default: 0
    },

    allowComment: {
        type: String,
        default: 'allow'
    },

    comments: [String] // commentId

}, { timestamps: true });
schema.index({ 'title': 'text', 'desc': 'text' }, { name: 'title_desc_index' });
const PostModel = mongoose.model<IPost>('Post', schema);

export default PostModel;