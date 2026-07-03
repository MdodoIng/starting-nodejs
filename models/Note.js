import mongoose from "mongoose";

const noteSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Title is required"],
      minlength: [3, "Title must be at least 3 characters"],
      trim: true,
    },
    body: { type: String, default: "" },
    done: { type: Boolean, default: false },
    tags: [{ type: mongoose.Schema.Types.ObjectId, ref: "Tag" }],
  },
  { timestamps: true },
);

noteSchema.pre("save", async function () {
  if (this.isModified("done") && this.done) {
    this.completedAt = new Date();
  }
});

export const Note = mongoose.model("Note", noteSchema);
