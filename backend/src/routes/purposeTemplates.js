import { Router } from "express";
import auth from "../middleware/auth.js";
import roleAuth from "../middleware/roleAuth.js";
import {
  getTemplates,
  createTemplate,
} from "../controllers/purposeTemplateController.js";

const router = Router();

router.get("/", auth, getTemplates);
router.post("/", auth, roleAuth(["admin"]), createTemplate);

export default router;
