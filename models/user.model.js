import mongoose from "mongoose";

const PlaylistSchema = new mongoose.Schema({
          name: {
                    type: String,
                    required: true,
          },
          url: {
                    type: String,
                    required: true,
          },
          image: {
                    type: String,
                    required: true,
          },
}, { timestamps: true });

export const Playlist = mongoose.model("Playlist", PlaylistSchema);