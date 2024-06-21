import mongoose from "mongoose";

const ticketSchema = new mongoose.Schema({


    MuseumName:{
        type: String,
        require:true,
        unique:true
    },
     
    MuseumDetails:{
        type:String,
        require:true,
        unique:true
    },

    Price:{
        type: Number,
        require:true,
        unique:true
    },
});

const Ticket = mongoose.model("ticket", ticketSchema);
export default Ticket;