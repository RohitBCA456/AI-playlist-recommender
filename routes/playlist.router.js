import { Router } from "express";
import upload from "../middlewares/multer.js";
import { facialRecognition, getPlaylist, getPlaylistByMood } from "../controllers/playlist.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.post("/cameraData", upload.single("image"), facialRecognition);
router.route("/playlistByMood").post(verifyJWT, getPlaylistByMood);
router.route("/getPlaylist").get(verifyJWT, getPlaylist);

export default router;
