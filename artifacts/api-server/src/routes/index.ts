import { Router, type IRouter } from "express";
import healthRouter from "./health";
import categoriesRouter from "./categories";
import productsRouter from "./products";
import cartRouter from "./cart";
import ordersRouter from "./orders";
import authRouter from "./auth";
import openaiRouter from "./openai";

const router: IRouter = Router();

router.use(healthRouter);
router.use(categoriesRouter);
router.use(productsRouter);
router.use(cartRouter);
router.use(ordersRouter);
router.use(authRouter);
router.use(openaiRouter);

export default router;
