import mongoose from "mongoose";
import User from "./models/users";
import bcrypt from "bcrypt";

function _excludeProperties(obj, excludedProps) {
    const { [excludedProps]: _, ...result } = obj;
    return result;
}

async function _generatePassword(password) {
    return await bcrypt.hash(password, 10);
}

async function createUser(name, email, password) {
    const hashPassword = await _generatePassword(password);
    const user = new User(name, email, hashPassword);
    user.save();
    return _excludeProperties(user, 'password');
}

export const methods = {
    createUser,
}