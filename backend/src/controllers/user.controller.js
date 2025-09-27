import { User } from "../models/user.model";
import bcrypt, { hash } from "bcrypt";
import httpStatus from "http-status";

const login = async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: "Please provide information" });
  }

  try {
    const user = await User.find({ username });
    if (!user) {
      return res
        .status(httpStatus.NOT_FOUND)
        .json({ message: "User not found" });
    }

    if (bcrypt.compare(password, user.password)) {
      //cant use hashedpassword as it is different everytime
      let token = crypto.randomBytes(20).toString("hex"); //token stored in local storage (Only token passed for get meeting)=> More secure
      //Token absent => move user out
      user.token = token;
      await user.save();
    }
  } catch (e) {}
};

const register = async (req, res) => {
  const { name, username, password } = req.body;

  try {
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res
        .status(httpStatus.FOUND)
        .json({ message: "User already exists" }); //early return statement
    }

    const hashedPassword = await bcrypt.hash(password, 10); //different everytime
    const newUser = new User({
      name: name,
      username: username,
      password: hashedPassword,
    });

    await newUser.save();
    res.status(htttpStatus.CREATED).json({ message: "User registered" });
  } catch (e) {
    res.json({ message: `Something went wrong ${e}` });
  }
};
