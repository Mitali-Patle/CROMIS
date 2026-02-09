import { Router } from "express";
import auth from "../middleware/auth.js";
import {
  saveDraft,
  getMyDrafts,
  deleteDraft,
} from "../controllers/draftController.js";

const router = Router();

// Save or update a draft
router.post("/", auth, saveDraft);

// Get my drafts
router.get("/", auth, getMyDrafts);

// Delete a draft
router.delete("/:id", auth, deleteDraft);

export default router;
