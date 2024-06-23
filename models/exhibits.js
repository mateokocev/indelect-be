import mongoose from "mongoose";

const exhibitSchema = new mongoose.Schema({

    exhibitName: {
        type: String,
        required: true,
        unique: true
    },
    description: {
        type: String,
        required: true,
    },
    images: {
        type: [String],
        default: []
    },
    isDisplayed: {
        type: Boolean,
        default: true
    },
    toMuseum: {
        type: String,
        required: true,
        enum: ['art', 'science', 'history', 'technology']
    },

});
const Exhibit = mongoose.model('exhibit', exhibitSchema);
export default Exhibit;