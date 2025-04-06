import mongoose from "mongoose";

const ticketSchema = new mongoose.Schema({


    MuseumName:{
        type: String,
        required:true,
        unique:true
    },
     
    MuseumDetails:{
        type:String,
        required:true,
        unique:true
    },

    Price:{
        type: Number,
        required:true,
        unique:true
    },
});

const Ticket = mongoose.model("ticket", ticketSchema);
export default Ticket;