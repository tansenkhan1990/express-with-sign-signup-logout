import bcrypt from "bcryptjs";
import { users } from "../data/users.js";
import { generateAccessToken, generateRefreshToken } from "../utils/generateTokens.js";
import { verifyRefreshToken } from "../utils/verifyToken.js";

export const signup = async (req, res) => {
  const { firstName, lastName, email, password } = req.body;

  const userExists = users.find((u) => u.email === email);
  if (userExists) return res.status(400).json({ message: "User already exists" });

  const hashedPassword = await bcrypt.hash(password, 10);
  const newUser = {
    id: Date.now(),
    firstName,
    lastName,
    email,
    password: hashedPassword,
  };

  users.push(newUser);

  const accessToken = generateAccessToken(newUser.id);
  const refreshToken = generateRefreshToken(newUser.id);

  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: false,
    sameSite: "Lax",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  const { password: _, ...userWithoutPassword } = newUser;

  res.status(201).json({
    message: "User created",
    accessToken,
    user: userWithoutPassword,
  });
};

export const signin = async (req, res) => {
  const { email, password } = req.body;

  const user = users.find((u) => u.email === email);
  if (!user) return res.status(401).json({ message: "Invalid credentials" });

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) return res.status(401).json({ message: "Invalid credentials" });

  const accessToken = generateAccessToken(user.id);
  const refreshToken = generateRefreshToken(user.id);

  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: false,
    sameSite: "Lax",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  const { password: _, ...userWithoutPassword } = user;

  res.status(200).json({
    message: "Signed in successfully",
    accessToken,
    user: userWithoutPassword,
  });
};

export const logout = (req, res) => {
  res.clearCookie("refreshToken", {
    httpOnly: true,
    secure: false,
    sameSite: "Lax",
  });
  res.status(200).json({ message: "Logged out" });
};

export const refresh = (req, res) => {
  const token = req.cookies.refreshToken;
  if (!token) return res.status(401).json({ message: "No refresh token" });

  try {
    const decoded = verifyRefreshToken(token);
    const accessToken = generateAccessToken(decoded.userId);
    res.status(200).json({ accessToken });
  } catch {
    res.status(401).json({ message: "Invalid refresh token" });
  }
};
