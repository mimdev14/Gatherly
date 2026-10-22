import { Schema, models, model } from "mongoose";

const RegistrationSchema = new Schema(
  {
    event: { type: Schema.Types.ObjectId, ref: "Event", required: true },
    volunteer: { type: Schema.Types.ObjectId, ref: "User", required: true },
    selectedSkill: { type: String, required: true },
    status: {
      type: String,
      enum: ["registered", "confirmed", "attended", "cancelled"],
      default: "registered",
    },
  },
  { timestamps: true }
);

// One registration per volunteer per event (blocks duplicates at the DB level)
RegistrationSchema.index({ event: 1, volunteer: 1 }, { unique: true });

export default models.Registration || model("Registration", RegistrationSchema);