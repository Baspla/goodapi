import express from "express";
import {getStats} from "../../db/operations/stats.js";

export const router = express.Router();

router.get("/", async function (req, res, next) {
    try {
        const stats = await getStats();
        res.json({
            stats
        });
    } catch (error) {
        next(error);
    }
});