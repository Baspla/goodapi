import {recommendations, users} from "../schema.js";
import db from "../db.js";
import {asc, desc, eq, getTableColumns, ilike, sql} from "drizzle-orm";
import {validateTitle, validateUrl} from "../../util/validation.js";
import {RedactedUser} from "./users.js";
import {PgColumn} from "drizzle-orm/pg-core";

export type Recommendation = typeof recommendations.$inferSelect;
export type RecommendationWithUser = Recommendation & { user: RedactedUser | null };
export type NewRecommendation = typeof recommendations.$inferInsert;

function validateNewRecommendation(recommendationData: Partial<NewRecommendation>) : Promise<void> {
    if (!recommendationData.title) {
        return Promise.reject({status: 400, message: 'Title is required'});
    }
    if (!validateTitle(recommendationData.title)) {
        return Promise.reject({status: 400, message: 'Invalid title'});
    }
    if (recommendationData.url && !validateUrl(recommendationData.url)) {
        return Promise.reject({status: 400, message: 'Invalid URL'});
    }
    if (recommendationData.imageUrl && !validateUrl(recommendationData.imageUrl)) {
        return Promise.reject({status: 400, message: 'Invalid image URL'});
    }
    return Promise.resolve();
}

export async function createRecommendation(recommendationData: NewRecommendation): Promise<Recommendation> {
    console.debug('Creating recommendation:', recommendationData);
    await validateNewRecommendation(recommendationData).catch(error => {
        throw error;
    });
    try {
        const result = await db.insert(recommendations).values(recommendationData).returning();
        return result[0];
    } catch (error) {
        console.error('Error creating recommendation:', error);
        throw error;
    }
}

export async function getRecommendations(
    page: number = 0,
    limit: number = 20,
    searchterm: string = '',
    sortBy: 'created_at' | 'updated_at' | 'title' = 'created_at',
    sortOrder: 'asc' | 'desc' = 'asc'
): Promise<Recommendation[]> {
    console.debug('Getting recommendations with pagination, filtering, and sorting');
    try {
        return await db.select().from(recommendations).where(searchterm ? ilike(recommendations.title, '%'+searchterm+'%') : undefined).limit(limit).offset((page) * limit).orderBy(sortOrder == 'asc'?asc(sql.identifier(sortBy)):desc(sql.identifier(sortBy)));
    } catch (error) {
        console.error('Error getting recommendations:', error);
        throw error;
    }
}

export async function getRecommendationsExtended(
    page: number = 0,
    limit: number = 20,
    searchterm: string = '',
    sortBy: 'created_at' | 'updated_at' | 'title' = 'created_at',
    sortOrder: 'asc' | 'desc' = 'asc'
): Promise<RecommendationWithUser[]> {
    try {
        let orderIdentifier: PgColumn = recommendations.createdAt;
        switch (sortBy) {
            case 'updated_at':
                orderIdentifier = recommendations.updatedAt;
                break;
            case 'title':
                orderIdentifier = recommendations.title;
                break;
            case 'created_at':
                orderIdentifier = recommendations.createdAt;
                break;
        }
        return await db.query.recommendations.findMany({
            where: searchterm ? ilike(recommendations.title, '%'+searchterm+'%') : undefined,
            limit: limit,
            offset: (page) * limit,
            orderBy: (sortOrder=='asc'?asc(orderIdentifier):desc(orderIdentifier)),
            with: {
                user: {
                    columns: {
                        email: false,
                        discordId: false,
                        lastLogin: false,
                    }
                },
                recommendationsToTags: {
                    with: {
                        tag: true,
                    }
                }
            }
        })

    } catch (error) {
        console.error('Error getting recommendations with users:', error);
        throw error;
    }
}
/*export async function getRecommendationById2(id:any){
return await db.select({...getTableColumns(recommendations),user:{id:users.id,username:users.username,avatarUrl:users.avatarUrl,role:users.role,createdAt:users.createdAt}})
            .from(recommendations)
            .leftJoin(users, eq(recommendations.userId, users.id))
            .where(searchterm ? ilike(recommendations.title, '%'+searchterm+'%') : undefined)
            .limit(limit)
            .offset((page) * limit)
            .orderBy(sortOrder == 'asc'?asc(orderIdentifier):desc(orderIdentifier));
    return db.query.recommendations.findFirst({
        where: eq(recommendations.id, id),
        with: {
            recommendationsToTags: {
                with: {
                    tag: true,
                }
            }
        }
    });
}*/

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
        return await db.query.recommendations.findFirst({
            where: eq(recommendations.id, recommendationId),
            with: {
                user: {
                    columns: {
                        email: false,
                        discordId: false,
                        lastLogin: false,
                    }
                },
                recommendationsToTags: {
                    with: {
                        tag: true,
                    }
                }
            }
        })
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

export async function updateRecommendation(recommendationId: number, recommendationData: Partial<NewRecommendation>): Promise<Recommendation> {
    console.debug('Updating recommendation by ID:', recommendationId, recommendationData);
    await validateNewRecommendation(recommendationData).catch(error => {
        throw error;
    });
    try {
        const result = await db.update(recommendations).set(recommendationData).where(eq(recommendations.id, recommendationId)).returning();
        return result[0];
    } catch (error) {
        console.error('Error updating recommendation by ID:', error);
        throw error;
    }
}

export async function deleteAllRecommendations(): Promise<void> {
    console.debug('Deleting all recommendations');
    try {
        await db.delete(recommendations);
    } catch (error) {
        console.error('Error deleting all recommendations:', error);
        throw error;
    }
}