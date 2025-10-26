import { User } from "../models/user.model.js";
import bcrypt from "bcrypt";
import httpStatus from "http-status";
import crypto from "crypto";
import meetingModule from "../models/meeting.model.js"; // Import the object
const Meeting = meetingModule.Meeting; // Extract Meeting from the object

const login = async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: "Please provide information" });
  }

  try {
    const user = await User.findOne({ username });
    if (!user) {
      return res
        .status(httpStatus.NOT_FOUND)
        .json({ message: "User not found" });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (isMatch) {
      let token = crypto.randomBytes(20).toString("hex");
      user.token = token;
      await user.save();
      return res.status(httpStatus.OK).json({ token: token });
    } else {
      return res
        .status(httpStatus.UNAUTHORIZED)
        .json({ message: "Invalid credentials" });
    }
  } catch (e) {
    return res.status(500).json({ message: `Something went wrong!!! ${e}` });
  }
};

const register = async (req, res) => {
  console.log("Register route hit");
  const { name, username, password } = req.body;

  try {
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res
        .status(httpStatus.FOUND)
        .json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({
      name: name,
      username: username,
      password: hashedPassword,
    });

    await newUser.save();
    res.status(httpStatus.CREATED).json({ message: "User registered" });
  } catch (e) {
    console.error("Error in register:", e);
    res.status(500).json({ message: `Something went wrong ${e}` });
  }
};

const getUserHistory = async (req, res) => {
  const { token } = req.query;

  try {
    if (!token) {
      return res
        .status(httpStatus.BAD_REQUEST)
        .json({ message: "Token is required" });
    }

    const user = await User.findOne({ token: token });

    if (!user) {
      return res
        .status(httpStatus.UNAUTHORIZED)
        .json({ message: "Invalid token" });
    }

    const meetings = await Meeting.find({ user_id: user.username });

    res.status(httpStatus.OK).json(meetings);
  } catch (e) {
    console.error("Error in getUserHistory:", e);
    res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ message: `Something went wrong: ${e.message}` });
  }
};

const addToHistory = async (req, res) => {
  const { token, meeting_code } = req.body;

  try {
    if (!token || !meeting_code) {
      return res
        .status(httpStatus.BAD_REQUEST)
        .json({ message: "Token and meeting code are required" });
    }

    const user = await User.findOne({ token: token });

    if (!user) {
      return res
        .status(httpStatus.UNAUTHORIZED)
        .json({ message: "Invalid token" });
    }

    const existingMeeting = await Meeting.findOne({
      user_id: user.username,
      meetingCode: meeting_code,
    });

    if (existingMeeting) {
      // Instead of throwing a duplicate error, just return OK
      return res
        .status(httpStatus.OK)
        .json({ message: "Meeting already exists in history" });
    }

    // Otherwise, create a new one
    const newMeeting = new Meeting({
      user_id: user.username,
      meetingCode: meeting_code,
    });

    await newMeeting.save();
    res.status(httpStatus.CREATED).json({ message: "Added to history" });
  } catch (e) {
    console.error("Error in addToHistory:", e);
    res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ message: `Something went wrong: ${e.message}` });
  }
};

export { login, register, getUserHistory, addToHistory };
