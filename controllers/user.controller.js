import { GoogleGenerativeAI } from "@google/generative-ai";
import * as fs from "node:fs";
import axios from "axios";
const facialRecognition = async (req, res) => {
  try {
    const facialExpression = req.file;
    console.log("Image received:", facialExpression);

    if (!facialExpression) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const systemMessage =
      "Analyze the human expression in the provided image and respond with only ONE word: happy, sad, energetic, calm or romantic. Do not provide any extra text.";

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    function fileToGenerativePart(path, mimeType) {
      console.log("Converting image to base64...");
      return {
        inlineData: {
          data: Buffer.from(fs.readFileSync(path)).toString("base64"),
          mimeType,
        },
      };
    }

    const imagePart = fileToGenerativePart(
      facialExpression.path,
      facialExpression.mimetype
    );

    console.log("Sending image to Gemini AI...");
    const result = await model.generateContent([systemMessage, imagePart]);

    console.log("Gemini AI Response:", result);

    const mood = result.response.text();
    if (!mood || !moodToGenre[mood.toLowerCase().trim()]) {
      console.error("Invalid mood detected:", mood);
      return res.status(400).json({
        error: "Invalid mood. Try: happy, sad, energetic, calm, romantic.",
      });
    }

    console.log("🎵 Fetching Spotify playlist for mood:", mood);
    const accessToken = await getAccessToken();
    const genre = moodToGenre[mood.toLowerCase()];
    const randomOffset = Math.floor(Math.random() * 50);
    const response = await axios.get(
      `https://api.spotify.com/v1/search?q=${genre}&type=playlist&limit=5&offset=${randomOffset}`,
      { headers: { Authorization: `Bearer ${accessToken}` } }
    );

    console.log("Spotify API Response:", response.data);

    const validPlaylists = response.data.playlists.items.filter(
      (item) => item !== null
    );

    const playlists = validPlaylists.map((playlist) => ({
      name: playlist.name || "Unknown Name",
      url: playlist.external_urls?.spotify || "#",
      image: playlist.images?.[0]?.url || "No Image Available",
    }));
    console.log(playlists);
    res.status(200).json({ playlist: playlists });
  } catch (error) {
    console.error("Error in backend:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const getAccessToken = async () => {
  try {
    const CLIENT_ID = process.env.SPOTIFY_CLIENT_ID;
    const CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET;
    const response = await axios.post(
      "https://accounts.spotify.com/api/token",
      new URLSearchParams({ grant_type: "client_credentials" }),
      {
        headers: {
          Authorization:
            "Basic " +
            Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString("base64"),
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    );
    return response.data.access_token;
  } catch (error) {
    console.error(
      "Error fetching access token:",
      error.response?.data || error.message
    );
    throw new Error("Failed to authenticate with Spotify.");
  }
};

const moodToGenre = {
  happy: "pop",
  sad: "acoustic",
  energetic: "workout",
  calm: "chill",
  romantic: "romance",
};

const getPlaylistByMood = async (req, res) => {
  try {
    const mood = req.body.mood;

    if (!mood || !moodToGenre[mood.toLowerCase()]) {
      return res.status(400).json({
        error: "Invalid mood. Try: happy, sad, energetic, calm, romantic.",
      });
    }

    const accessToken = await getAccessToken();
    const genre = moodToGenre[mood.toLowerCase()];

    if (!genre) {
      return res
        .status(400)
        .json({ error: "Genre mapping not found for mood." });
    }

    const randomOffset = Math.floor(Math.random() * 50);
    const response = await axios.get(
      `https://api.spotify.com/v1/search?q=genre:${genre}&type=playlist&limit=5&offset=${randomOffset}`,
      { headers: { Authorization: `Bearer ${accessToken}` } }
    );

    const validPlaylists = response.data.playlists.items.filter(
      (item) => item !== null
    );

    const playlists = validPlaylists.map((playlist) => ({
      name: playlist.name || "Unknown Name",
      url: playlist.external_urls?.spotify || "#",
      image: playlist.images?.[0]?.url || "No Image Available",
    }));

    res
      .status(200)
      .json({ playlist: playlists, message: "Playlist fetched successfully." });
  } catch (error) {
    console.error("Error fetching playlists:", error.message);
    res.status(500).json({ error: "Failed to fetch playlists from Spotify." });
  }
};

export { facialRecognition, getPlaylistByMood };
