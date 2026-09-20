import { Router } from "express";
import { loadKnowledge } from "../lib/knowledge.js";

const router = Router();

const STORE_PROFILE = {
  name: "Moon's Food Store",
  address: "14000 Detroit Avenue, Cleveland, Ohio",
  phone: "216-860-2588",
  hours: "Monday through Sunday, 8:00 a.m. to 12:30 a.m.",
  services: ["ATM", "Ohio Lottery", "Delivery", "ASG"],
  productCategories: [
    "groceries",
    "snacks",
    "beverages",
    "frozen foods",
    "beer",
    "wine",
    "tobacco",
    "vape products"
  ]
};

router.get("/", (_req, res) => {
  try {
    res.json(STORE_PROFILE);
  } catch {
    res.status(500).json({
      error: true,
      message: "Store details could not be loaded. Please ask a store employee for help."
    });
  }
});

router.get("/knowledge", (_req, res) => {
  try {
    const knowledge = loadKnowledge()
      .filter((entry) => entry && typeof entry === "object")
      .map((entry) => ({
        id: entry.id,
        category: entry.category,
        title: entry.title,
        lastUpdated: entry.lastUpdated,
        restricted: Boolean(entry.restricted)
      }));
    res.json({ knowledge });
  } catch {
    res.status(500).json({
      error: true,
      message:
        "Approved store information could not be loaded. Please ask a store employee for help."
    });
  }
});

export default router;
