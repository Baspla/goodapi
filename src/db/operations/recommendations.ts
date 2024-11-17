import {recommendations} from "../schema.js";
import db from "../db.js";
import {eq} from "drizzle-orm";

export type Recommendation = typeof recommendations.$inferSelect;
export type NewRecommendation = typeof recommendations.$inferInsert;

export async function createRecommendation(recommendationData: NewRecommendation): Promise<Recommendation> {
    console.debug('Creating recommendation:', recommendationData);
    try {
        const result = await db.insert(recommendations).values(recommendationData).returning();
        return result[0];
    } catch (error) {
        console.error('Error creating recommendation:', error);
        throw error;
    }
}

export async function getRecommendations(): Promise<Recommendation[]> {
    console.debug('Getting recommendations');
    try {
        return await db.select().from(recommendations);
    } catch (error) {
        console.error('Error getting recommendations:', error);
        throw error;
    }
}

export async function getRecommendationsByUserId(userId: number): Promise<Recommendation[]> {
    console.debug('Getting recommendations by user ID:', userId);
    try {
        return await db.select().from(recommendations).where(eq(recommendations.userId, userId))
    } catch (error) {
        console.error('Error getting recommendations by user ID:', error);
        throw error;
    }
}

export async function getRecommendationById(recommendationId: number): Promise<Recommendation | undefined> {
    console.debug('Getting recommendation by ID:', recommendationId);
    try {
        const result = await db.select().from(recommendations).where(eq(recommendations.id, recommendationId));
        return result[0];
    } catch (error) {
        console.error('Error getting recommendation by ID:', error);
        throw error;
    }
}

export async function deleteRecommendation(recommendationId: number): Promise<void> {
    console.debug('Deleting recommendation by ID:', recommendationId);
    try {
        await db.delete(recommendations).where(eq(recommendations.id, recommendationId));
    } catch (error) {
        console.error('Error deleting recommendation by ID:', error);
        throw error;
    }
}