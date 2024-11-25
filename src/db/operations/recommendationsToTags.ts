import {recommendations, recommendationsToTags, tags} from "../schema.js";
import db from "../db.js";
import {and, asc, desc, eq, ilike, sql} from "drizzle-orm";

export async function createRecommendationToTag(recommendationId: number, tagId: number): Promise<void> {
    console.debug('Creating recommendation to tag:', recommendationId, tagId);
    try {
        await db.insert(recommendationsToTags).values({recommendationId, tagId}).execute();
    } catch (error) {
        console.error('Error creating recommendation to tag:', error);
        throw error;
    }
}

export async function getRecommendationsByTagId(tagId: number): Promise<any> {
    console.debug('Getting recommendations by tag ID:', tagId);
    try {
        return await db.query.recommendations.findMany({
            where: eq(recommendationsToTags.tagId, tagId),
        });
    } catch (error) {
        console.error('Error getting recommendations by tag ID:', error);
        throw error;
    }
}

export async function getTagsByRecommendationId(recommendationId: number): Promise<any> {
    console.debug('Getting tags by recommendation ID:', recommendationId);
    try {
        return await db.query.tags.findMany({
            where: eq(recommendationsToTags.recommendationId, recommendationId),
        });
    } catch (error) {
        console.error('Error getting tags by recommendation ID:', error);
        throw error;
    }
}

export async function deleteRecommendationToTag(recommendationId: number, tagId: number): Promise<void> {
    console.debug('Deleting recommendation to tag:', recommendationId, tagId);
    try {
        await db.delete(recommendationsToTags).where(and(eq(recommendationsToTags.recommendationId, recommendationId), eq(recommendationsToTags.tagId, tagId)));
    } catch (error) {
        console.error('Error deleting recommendation to tag:', error);
        throw error;
    }
}