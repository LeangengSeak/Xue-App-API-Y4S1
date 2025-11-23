import { Router } from "express";
import ContentController from "../controllers/content.controller";
import { ContentService } from "../services/content.service";
import { requireServiceToken } from "../middlewares/xServiceAuth";
import requireAdminAuth from "../middlewares/requireAdminAuth";

const contentService = new ContentService();
const contentController = new ContentController(contentService);

const router = Router();

// Public endpoints
router.get("/", contentController.list);
router.get("/:contentId", contentController.getById);

// Admin protected - require admin auth (JWT) to create or update content
router.post("/", requireAdminAuth, contentController.create);
router.patch("/:contentId", requireAdminAuth, contentController.update);
router.delete("/:contentId", requireAdminAuth, contentController.delete);

// Internal endpoints protected by service token
router.post(
  "/internal/contents/:contentId/increment",
  requireServiceToken,
  contentController.increment
);

router.post(
  "/internal/contents/batch",
  requireServiceToken,
  contentController.batch
);

export default router;
