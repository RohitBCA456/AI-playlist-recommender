import { Router } from "express";
import upload from "../middlewares/multer.js";
import { facialRecognition, getPlaylist, getPlaylistByMood } from "../controllers/user.controller.js";

const router = Router();

router.post("/cameraData", upload.single("image"), facialRecognition);
router.route("/playlistByMood").post(getPlaylistByMood);
router.route("/getPlaylist").get(getPlaylist);

export default router;
