import { Router, type IRouter } from "express";
import healthRouter from "./health";
import storageRouter from "./storage";
import profileRouter from "./profile";
import familyRouter from "./family";
import routinesRouter from "./routines";
import checkInsRouter from "./check-ins";
import guardianRouter from "./guardian";
import memoryRouter from "./memory";
import anthropicRouter from "./anthropic";
import togetherRouter from "./together";

const router: IRouter = Router();

router.use(healthRouter);
router.use(storageRouter);
router.use(profileRouter);
router.use(familyRouter);
router.use(routinesRouter);
router.use(checkInsRouter);
router.use(guardianRouter);
router.use(memoryRouter);
router.use(anthropicRouter);
router.use(togetherRouter);

export default router;
