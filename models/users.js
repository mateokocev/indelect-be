import mongoose from "mongoose";

const userSchema = new mongoose.Schema({

    username: {
        type: String,
        required: true,
        unique: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        match: /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/
    },
    password: {
        type: String,
        minlength: 8,
        required: true,
    }

});

const User = mongoose.model("user", userSchema);
module.exports = User;
export const User = { User }