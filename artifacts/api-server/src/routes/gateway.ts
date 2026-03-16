import { Router, type IRouter } from "express";
import { handleGatewayRequest, handleHealthDashboard } from "../services/gateway";

const router: IRouter = Router();

router.post("/gateway", handleGatewayRequest);
router.get("/health/dashboard", handleHealthDashboard);

export default router;
