import {finds, reviews} from "../schema.js";
import {asc, desc, eq, ilike, sql} from "drizzle-orm";
import db from "../db.js";
import {isDev} from "../../env.js";
import {logEvent} from "../../util/logging.js";
import exp from "node:constants";
import {Find} from "./finds.js";

export type Review = typeof reviews.$inferSelect;
export type NewReview = typeof reviews.$inferInsert;

// Reviews operations
export async function createReview(reviewData: NewReview): Promise<Review> {
    console.debug('Creating review:', reviewData);
    try {
        const result = await db.insert(reviews).values(reviewData).returning();
        return result[0];
    } catch (error) {
        console.error('Error creating review:', error);
        throw error;
    }
}

export async function getReviews(
    page: number = 0,
    limit: number = 20,
    searchterm: string = '',
    sortBy: 'created_at' | 'updated_at' | 'title' = 'created_at',
    sortOrder: 'asc' | 'desc' = 'asc'
): Promise<Review[]> {
    console.debug('Getting reviews');
    try {
        return await db.select().from(reviews).where(searchterm ? ilike(reviews.content, '%'+searchterm+'%') : undefined).limit(limit).offset((page) * limit).orderBy(sortOrder == 'asc'?asc(sql.identifier(sortBy)):desc(sql.identifier(sortBy)));
    } catch (error) {
        console.error('Error getting reviews:', error);
        throw error;
    }
}

export async function getReviewById(reviewId: number): Promise<Review | undefined> {
    console.debug('Getting review by ID:', reviewId);
    try {
        const result = await db.select().from(reviews).where(eq(reviews.id, reviewId));
        return result[0];
    } catch (error) {
        console.error('Error getting review by ID:', error);
        throw error;
    }
}

export async function getReviewsByUserId(userId: number): Promise<Review[]> {
    console.debug('Getting reviews by user ID:', userId);
    try {
        const result = await db.select().from(reviews).where(eq(reviews.userId, userId));
        return result;
    } catch (error) {
        console.error('Error getting reviews by user ID:', error);
        throw error;
    }
}

export async function getReviewsByFindId(findId: number): Promise<Review[]> {
    console.debug('Getting reviews by find ID:', findId);
    try {
        const result = await db.select().from(reviews).where(eq(reviews.findId, findId));
        return result;
    } catch (error) {
        console.error('Error getting reviews by find ID:', error);
        throw error;
    }
}

export async function deleteReview(reviewId: number): Promise<void> {
    console.debug('Deleting review:', reviewId);
    try {
        await db.delete(reviews).where(eq(reviews.id, reviewId));
    } catch (error) {
        console.error('Error deleting review:', error);
        throw error;
    }
}

export async function deleteAllReviews(): Promise<void> {
    console.debug('Deleting all reviews');
    try {
        await db.delete(reviews);
    } catch (error) {
        console.error('Error deleting all reviews:', error);
        throw error;
    }
}

export async function updateReview(reviewId: number, reviewData: NewReview): Promise<Review> {
    console.debug('Updating review:', reviewId, reviewData);
    try {
        const result = await db.update(reviews).set(reviewData).where(eq(reviews.id, reviewId)).returning();
        return result[0];
    } catch (error) {
        console.error('Error updating review:', error);
        throw error;
    }
}