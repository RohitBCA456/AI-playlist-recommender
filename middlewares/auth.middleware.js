import { User } from "../models/user.model.js";
import jwt from "jsonwebtoken";

export const verifyJWT = async (req, res, next) => {
  try {
    const token =
      req.cookies?.accessToken ||
      req.header("Authorization")?.replace("Bearer", "");
    if (!token) {
      return res.status(400).json({message: 'Unauthorised.'})
    }
    const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    const user = await User.findById(decodedToken?._id).select("-password");
    if (!user) {
      return res.status(404).json({message: 'Invalid access Token.'})
    }
    req.user = user;
    next();
  } catch (error) {
          return res.status(404).json({message: 'Invalid access Token error.'})
  }
};