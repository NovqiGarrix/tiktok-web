import mongoose from 'mongoose';

export interface ISystem {
    _id: string;
    country: string;
    tag: string;
    music: string;
    popularity: string;
}

const schema = new mongoose.Schema({

    country: {
        type: String,
        required: true
    },

    tag: {
        type: String,
        required: true
    },

    music: {
        type: String,
        required: true
    },

    popularity: {
        type: Number,
        default: 0
    }

}, { timestamps: true });

const SystemModel = mongoose.model<ISystem>('System', schema);
export default SystemModel

