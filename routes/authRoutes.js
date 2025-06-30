import express from "express";
import { signup, signin, logout, refresh } from "../controllers/authController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/signup", signup);
router.post("/signin", signin);
router.post("/logout", logout);
router.get("/refresh", refresh);
router.get("/protected", protect, (req, res) => {
  res.json({ message: "You are authorized", userId: req.user });
});

export default router;
