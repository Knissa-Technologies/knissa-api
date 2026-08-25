import { Router } from "express";
import { UserRole } from "@prisma/client";

import { authMiddleware } from "../../../shared/middlewares/authMiddleware.js";
import { requireRole } from "../../../shared/middlewares/requireRole.js";

import { ComplianceController } from "../controllers/ComplianceController.js";

const router = Router();

const complianceController = new ComplianceController();

// ======================================================
// AUTHENTICATION REQUIRED
// ======================================================

router.use(authMiddleware);

// ======================================================
// CURRENT USER COMPLIANCE PROFILE
// ======================================================

// Get current user's compliance profile
router.get(
  "/me",
  (req, res) =>
    complianceController.getMyComplianceProfile(
      req,
      res,
    ),
);

// ======================================================
// COMPLIANCE DOCUMENTS
// ======================================================

// Submit a compliance document
router.post(
  "/documents",
  (req, res) =>
    complianceController.createDocument(
      req,
      res,
    ),
);

// Get current user's documents
router.get(
  "/documents",
  (req, res) =>
    complianceController.getMyDocuments(
      req,
      res,
    ),
);

// ======================================================
// ADMIN — COMPLIANCE REVIEWS
// ======================================================

// Review a compliance profile
router.post(
  "/reviews",
  requireRole(UserRole.ADMIN),
  (req, res) =>
    complianceController.createReview(
      req,
      res,
    ),
);

export default router;
