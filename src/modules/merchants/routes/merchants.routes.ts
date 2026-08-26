import { Router } from "express";

import { authMiddleware } from "../../../shared/middlewares/authMiddleware.js";

import { MerchantsController } from "../controllers/MerchantsController.js";

const router = Router();

const merchantsController = new MerchantsController();

// ======================================================
// AUTHENTICATION REQUIRED
// ======================================================

router.use(authMiddleware);

// ======================================================
// MERCHANT
// ======================================================

// Create merchant
router.post("/", (req, res) => merchantsController.createMerchant(req, res));

// Get my merchant
router.get("/me", (req, res) => merchantsController.getMyMerchant(req, res));

// Update my merchant
router.patch("/me", (req, res) =>
  merchantsController.updateMyMerchant(req, res),
);

// ======================================================
// MERCHANT MEMBERS
// ======================================================

// Get merchant members
router.get("/members", (req, res) => merchantsController.getMembers(req, res));

// Add merchant member
router.post("/members", (req, res) => merchantsController.addMember(req, res));

// Deactivate merchant member
router.patch("/members/:id/deactivate", (req, res) =>
  merchantsController.deactivateMember(req, res),
);

// ======================================================
// MERCHANT SETTINGS
// ======================================================

// Get merchant settings
router.get("/settings", (req, res) =>
  merchantsController.getSettings(req, res),
);

// Update merchant settings
router.patch("/settings", (req, res) =>
  merchantsController.updateSettings(req, res),
);

router.patch(
  "/members/:memberId/activate",
  authMiddleware,
  merchantsController.activateMember.bind(merchantsController),
);

// ======================================================
// TRANSFER MERCHANT OWNERSHIP
// ======================================================

router.patch(
  "/members/:memberId/transfer-ownership",
  authMiddleware,
  merchantsController.transferOwnership.bind(merchantsController),
);

router.patch(
  "/members/:memberId/role",
  authMiddleware,
  merchantsController.updateMemberRole.bind(merchantsController),
);

export default router;
