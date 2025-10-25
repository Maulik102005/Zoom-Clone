import express from "express";
import { Router } from "express";
import {
  login,
  register,
  addToHistory,
  getUserHistory,
} from "../controllers/user.controller.js";

const router = express.Router();
console.log("✅ userRoutes loaded");

router.route("/login").post(login);
router.route("/register").post(register);
router.route("/add_to_activity").post(addToHistory);
router.route("/get_all_activity").get(getUserHistory);

export default router;
