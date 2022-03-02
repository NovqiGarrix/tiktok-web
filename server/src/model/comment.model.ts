import mongoose from 'mongoose';

export interface IComment {

    _id: string;

    userId: string; // required
    postId: string; // required
    comment: string; // required
    replyTo?: string; // commentId

    createdAt: string;
    updatedAt: string;

}

export const schema = new mongoose.Schema({

    userId: {
        type: String,
        required: true
    },

    postId: {
        type: String,
        required: true
    },

    comment: {
        type: String,
        required: true
    },

    replyTo: String // commentId

}, { timestamps: true });

const CommentModel = mongoose.model<IComment>('Comment', schema);
export default CommentModel