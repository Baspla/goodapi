import db from "../db.js";
import {count} from "drizzle-orm";
import {lists, recommendations, reviews, users} from "../schema.js";

export async function getStats(){
    console.debug('Getting stats');
    try {
        const usersCount = await db.select({count: count()}).from(users);
        const recommendationsCount = await db.select({count: count()}).from(recommendations);
        const reviewsCount = await db.select({count: count()}).from(reviews);
        const listsCount = await db.select({count: count()}).from(lists);
        return { usersCount: usersCount[0].count, recommendationsCount: recommendationsCount[0].count, reviewsCount: reviewsCount[0].count, listsCount: listsCount[0].count };
    } catch (error) {
        console.error('Error getting stats:', error);
        throw error;
    }
}