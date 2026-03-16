import { Router, type IRouter } from "express";
import healthRouter from "./health";
import gatewayRouter from "./gateway";
import aiRouter from "./ai";
import threadsRouter from "./threads";
import sduiRouter from "./sdui";
import commerceRouter from "./commerce";
import notificationsRouter from "./notifications";
import transportRouter from "./transport";
import merchantRouter from "./merchant";
import posRouter from "./pos";

const router: IRouter = Router();

router.use(healthRouter);
router.use(gatewayRouter);
router.use("/ai", aiRouter);
router.use(threadsRouter);
router.use("/sdui", sduiRouter);
router.use("/commerce", commerceRouter);
router.use("/commerce", merchantRouter);
router.use("/commerce", posRouter);
router.use(notificationsRouter);
router.use(transportRouter);

export default router;
