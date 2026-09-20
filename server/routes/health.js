import { Router } from "express";

const router = Router();

router.get("/", (_req, res) => {
  try {
    res.json({
      status: "ok",
      service: "moonguide-ai",
      time: new Date().toISOString()
    });
  } catch {
    res.status(500).json({
      error: true,
      message: "Something went wrong. Please try again or speak with a store employee."
    });
  }
});

export default router;
