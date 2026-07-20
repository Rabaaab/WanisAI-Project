import { Router, type IRouter } from "express";
import healthRouter from "./health";
import storageRouter from "./storage";
import profileRouter from "./profile";
import familyRouter from "./family";
import routinesRouter from "./routines";
import checkInsRouter from "./check-ins";
import rufqaRouter from "./rufqa";
import memoryRouter from "./memory";
import geminiRouter from "./gemini";
import togetherRouter from "./together";
import lifeStoryRouter from "./life-story";
import medicationsRouter from "./medications";
import doctorBriefsRouter from "./doctor-briefs";
import demoRouter from "./demo";

const router: IRouter = Router();

router.use(healthRouter);
router.use(storageRouter);
router.use(profileRouter);
router.use(familyRouter);
router.use(routinesRouter);
router.use(checkInsRouter);
router.use(rufqaRouter);
router.use(memoryRouter);
router.use(geminiRouter);
router.use(togetherRouter);
router.use(lifeStoryRouter);
router.use(medicationsRouter);
router.use(doctorBriefsRouter);
router.use(demoRouter);

export default router;
