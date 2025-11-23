import { Router } from "express";
import ReadController from "../controllers/read.controller";
import requireAuth from "../middlewares/requireAuth";

const controller = new ReadController();
const router = Router();

// Read progress
router.get("/progress/:contentId", requireAuth, controller.getProgress);
router.post("/progress/:contentId", requireAuth, controller.upsertProgress);

// Bookmarks
router.post("/bookmarks", requireAuth, controller.addBookmark);
router.get("/bookmarks", requireAuth, controller.listBookmarks);
router.delete("/bookmarks/:contentId", requireAuth, controller.removeBookmark);

// Downloads
router.post("/downloads", requireAuth, controller.recordDownload);

export default router;
