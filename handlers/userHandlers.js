import mongoose from "mongoose";
import User from "../models/users.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

// ---------------- //
//   REGISTRACIJA   //
// ---------------- //

function _excludeProperties(obj, excludedProps) {
    const { [excludedProps]: _, ...result } = obj;
    return result;
}

async function _generatePassword(password) {
    return await bcrypt.hash(password, 10);
}

async function createUser(name, email, password) {
    const hashPassword = await _generatePassword(password);
    const user = new User({username: name, email: email, password: hashPassword, isAdmin: false});
    await user.save();
    return _excludeProperties(user.toObject(), ['password']);
}

// --------- //
//   LOGIN   //
// --------- //

async function _comparePasswords(password, hashPassword) {
    return bcrypt.compareSync(password, hashPassword); 
}

async function checkCredentials(email, password) {
    const user = await User.findOne({email: email});
    if(!user) {
        return null;
    }
    return _comparePasswords(password, user.password) ? _excludeProperties(user, ['password']) : null; 
}



const methods = {
    createUser,
    checkCredentials,
};
export default methods;