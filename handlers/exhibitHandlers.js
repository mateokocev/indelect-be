import mongoose from "mongoose";
import Exhibit from "../models/exhibits.js";

function _excludeProperties(obj, excludedProps) {
  let result = { ...obj };
  excludedProps.forEach((prop) => {
    const { [prop]: _, ...rest } = result;
    result = rest;
  });
  return result;
}

//////////////////////
//   NOVA IZLOZBA   //
//////////////////////

async function createExhibit(
  name,
  description,
  images = [],
  isDisplayed = true
) {
  const exhibit = new Exhibit({
    name: name,
    description: description,
    images: images,
    isDisplayed: isDisplayed,
  });
  await exhibit.save();
  return exhibit.toObject();
}

////////////////////////////
//   AZURIRANJE IZLOZBA   //
////////////////////////////

async function updateExhibit(id, updateData) {
  const exhibit = await Exhibit.findByIdAndUpdate(id, updateData, {
    new: true,
  });
  if (!exhibit) {
    throw new Error("Exhibit not found");
  }
  return exhibit.toObject();
}

async function deleteExhibitById(id) {
  const exhibit = await Exhibit.findByIdAndDelete(id);
  if (!exhibit) {
    throw new Error("Exhibit not found");
  }
  return exhibit.toObject();
}

///////////////////////////////
//   PRETRAZIVANJE IZLOZBA   //
///////////////////////////////

async function getAllExhibits() {
  const exhibits = await Exhibit.find();
  return exhibits.map((exhibit) => exhibit.toObject());
}

async function getExhibitById(id) {
  const exhibit = await Exhibit.findById(id);
  if (!exhibit) {
    throw new Error("Exhibit not found");
  }
  return exhibit.toObject();
}

////////////////
//   EXPORT   //
////////////////

const methods = {
  createExhibit,
  updateExhibit,
  getAllExhibits,
  getExhibitById,
  deleteExhibitById,
};
export default methods;
