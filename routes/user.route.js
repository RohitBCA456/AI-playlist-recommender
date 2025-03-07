import { Router } from "express";
import upload from "../middlewares/multer.js";
import { facialRecognition, getPlaylistByMood } from "../controllers/user.controller.js";
const router = Router();

router.route("/cameraData").post(upload.single("image"), facialRecognition);;
router.route("/promptData").post(getPlaylistByMood);
export default router;