import { GoogleGenerativeAI } from "@google/generative-ai";
import { uploadOnCloudinary } from "../utility/cloudinary.js";
import axios from "axios";
import { Playlist } from "../models/user.model.js";

const facialRecognition = async (req, res) => {
  try {
    const facialExpression = req.file;
    if (!facialExpression) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    console.log("Uploading image to Cloudinary...");
    const cloudinaryResponse = await uploadOnCloudinary(facialExpression.path);
    if (!cloudinaryResponse || !cloudinaryResponse.secure_url) {
      return res
        .status(500)
        .json({ error: "Failed to upload image to Cloudinary" });
    }

    const imageUrl = cloudinaryResponse.secure_url;
    console.log("Image uploaded to Cloudinary:", imageUrl);

    const base64Image = await getBase64FromUrl(
      imageUrl,
      facialExpression.mimetype
    );
    
    if (!base64Image) {
      return res.status(500).json({ error: "Failed to convert image to Base64" });
    }
    
    const rawBase64 = base64Image.split(",")[1];
    

    console.log("Sending Base64 image to Gemini AI...");

    const systemMessage =
      "Analyze the human expression in the provided image and respond with only ONE word: happy, sad, energetic, calm, or romantic. Do not provide any extra text.";

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const imagePart = {
      inlineData: {
        data: rawBase64,
        mimeType: facialExpression.mimetype,
      },
    };

    const result = await model.generateContent([systemMessage, imagePart]);
    console.log("Gemini AI Response:", result);

    const mood = result.response.candidates[0]?.content?.parts[0]?.text
      ?.trim()
      .toLowerCase();

    if (!mood || !moodToGenre[mood]) {
      console.error("Invalid mood detected:", mood);
      return res.status(400).json({
        error: "Invalid mood. Try: happy, sad, energetic, calm, romantic.",
      });
    }
    console.log("Fetching Spotify playlist for mood:", mood);
    const accessToken = await getAccessToken();
    const genre = moodToGenre[mood];
    const randomOffset = Math.floor(Math.random() * 100);

    const response = await axios.get(
      `https://api.spotify.com/v1/search?q=${encodeURIComponent(
        genre
      )}&type=playlist&limit=10&offset=${randomOffset}`,
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
      mood,
    }));
    await Playlist.insertMany(playlists);
    console.log("Playlists saved to the database.");

    return res.status(200).json({ playlists, mood: mood });
  } catch (error) {
    console.error("Error in backend:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const getBase64FromUrl = async (imageUrl, mimeType) => {
  try {
    const response = await axios.get(imageUrl, { responseType: "arraybuffer" });
    const base64 = Buffer.from(response.data).toString("base64");
    return `data:${mimeType};base64,${base64}`;
  } catch (error) {
    console.error("Error converting image to Base64:", error);
    return null;
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
  sad: "sad",
  energetic: "work-out",
  calm: "chill",
  romantic: "romance",
  angry: "metal",
  nostalgic: "classic-rock",
  focused: "study",
  excited: "dance",
  lazy: "ambient",
  anxious: "piano",
  hopeful: "indie",
  lonely: "blues",
  confident: "hip-hop",
  inspired: "classical",
  moody: "alternative",
  dreamy: "synth-pop",
  playful: "k-pop",
  heartbroken: "r-n-b",
  adventurous: "rock"
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
      `https://api.spotify.com/v1/search?q=genre:${genre}&type=playlist&limit=10&offset=${randomOffset}`,
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

    await Playlist.insertMany(playlists);
    console.log("Playlists saved to the database.");

    res
      .status(200)
      .json({ playlist: playlists, message: "Playlist fetched successfully." });
  } catch (error) {
    console.error("Error fetching playlists:", error.message);
    res.status(500).json({ error: "Failed to fetch playlists from Spotify." });
  }
};

const getPlaylist = async (req, res) => {
  try {
    const playlists = await Playlist.find();

    if (!playlists || playlists.length === 0) {
      return res.status(404).json({ message: "No playlists found." });
    }

    res.status(200).json({ playlist: playlists });

    await Playlist.deleteMany();
    console.log("All playlists deleted from the database.");
  } catch (error) {
    console.error("Error fetching playlists:", error.message);
    res
      .status(500)
      .json({ error: "Failed to fetch playlists from the database." });
  }
};

export { facialRecognition, getPlaylistByMood, getPlaylist };
