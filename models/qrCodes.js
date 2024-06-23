
import mongoose from "mongoose";

const qrCodeSchema = new mongoose.Schema({

    url: {
        type: String,
        required: true,
        unique: true
    },
 

});

const QrCode = mongoose.model('qrCode', qrCodeSchema);
export default QrCode;