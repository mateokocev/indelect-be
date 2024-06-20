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
    }

});

const Exhibit = mongoose.model('exhibit', exhibitSchema);
export default Exhibit;