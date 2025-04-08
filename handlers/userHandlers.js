import mongoose from "mongoose";
import User from "../models/users.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

//////////////////////
//   REGISTRACIJA   //
//////////////////////

function _excludeProperties(obj, excludedProps) {
  let result = { ...obj };
  excludedProps.forEach((prop) => {
    const { [prop]: _, ...rest } = result;
    result = rest;
  });
  return result;
}

async function _generatePassword(password) {
  return await bcrypt.hash(password, 10);
}

async function createUser(name, email, password) {
  const hashPassword = await _generatePassword(password);
  const user = new User({
    username: name,
    email: email,
    password: hashPassword,
    isAdmin: false,
  });
  await user.save();
  return _excludeProperties(user.toObject(), ["password"]);
}

///////////////
//   LOGIN   //
///////////////

async function _comparePasswords(password, hashPassword) {
  return bcrypt.compare(password, hashPassword);
}

async function checkCredentials(email, password) {
  const user = await User.findOne({ email: email });
  if (!user) {
    return null;
  }
  const isMatch = await _comparePasswords(password, user.password);
  console.log(`Password match: ${isMatch}`);
  
  return isMatch ? _excludeProperties(user.toObject(), ["password"]) : null;
}

////////////////
//   EXPORT   //
////////////////

const methods = {
  createUser,
  checkCredentials,
};
export default methods;