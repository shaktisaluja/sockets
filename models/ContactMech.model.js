const { Schema, model } = require("mongoose");

const contactMechSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    contact_mech_type: {
      type: String,
      valueType: "String",
      trim: true,
    },
    contact_mech_value: {
      type: String,
      lowercase: true,
      unique: true,
      trim: true,
    },
  },
  {
    timestamps: { createdAt: "created_at", updatedAt: "updated_at" },
  }
);

const ContactMech = model("ContactMech", contactMechSchema, "contactmech");

// make this available to our users in our Node applications
module.exports = ContactMech;
