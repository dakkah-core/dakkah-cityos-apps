import { Router, type IRouter } from "express";
import healthRouter from "./health";
import gatewayRouter from "./gateway";
import aiRouter from "./ai";

const router: IRouter = Router();

router.use(healthRouter);
router.use(gatewayRouter);
router.use("/ai", aiRouter);

export default router;
