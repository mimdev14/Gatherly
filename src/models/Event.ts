import { Schema, models, model } from "mongoose";

const EventSchema = new Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    date: { type: Date, required: true },
    location: { type: String, required: true },
    category: { type: String, required: true },
    capacity: { type: Number, required: true, min: 1 },
    requiredSkills: [{ type: String }],
    registrationDeadline: { type: Date, required: true },
    status: { type: String, enum: ["draft", "published", "closed"], default: "draft" },
    organizer: { type: Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

export default models.Event || model("Event", EventSchema);