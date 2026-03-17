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
import healthcareRouter from "./healthcare";
import governanceRouter from "./governance";
import eventsCultureRouter from "./events-culture";
import platformRouter from "./platform";
import iotTelemetryRouter from "./iot-telemetry";
import socialRouter from "./social";

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
router.use("/healthcare", healthcareRouter);
router.use("/governance", governanceRouter);
router.use("/events", eventsCultureRouter);
router.use("/platform", platformRouter);
router.use("/iot", iotTelemetryRouter);
router.use("/social", socialRouter);

export default router;
