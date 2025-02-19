import {recommendations, tags, users} from "../schema.js";
import db from "../db.js";
import {asc, desc, eq, ilike, like} from "drizzle-orm";
import {PgColumn} from "drizzle-orm/pg-core";

export type Tag = typeof tags.$inferSelect;
export type NewTag = typeof tags.$inferInsert;

export async function createTag(tagData: NewTag): Promise<Tag> {
    console.debug('Creating tag:', tagData);
    try {
        const result = await db.insert(tags).values(tagData).returning();
        return result[0];
    } catch (error) {
        console.error('Error creating tag:', error);
        throw error;
    }
}

export async function getTags(
    page: number = 0,
    limit: number = 20,
    searchterm: string = '',
    sortBy: 'created_at' | 'updated_at' | 'title' = 'created_at',
    sortOrder: 'asc' | 'desc' = 'asc'
): Promise<Tag[]> {
    console.debug('Getting all tags');
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
        return await db.query.tags.findMany({
            where: searchterm ? ilike(tags.name, `%${searchterm}%`) : undefined,
            limit: limit,
            offset: (page) * limit,
            orderBy: (sortOrder == 'asc' ? asc(orderIdentifier) : desc(orderIdentifier))
        });
    } catch (error) {
        console.error('Error getting all users:', error);
        throw error;
    }
}

export async function getTagById(tagId: number): Promise<Tag | undefined> {
    console.debug('Getting tag by ID:', tagId);
    try {
        const result = await db.select().from(tags).where(eq(tags.id,tagId));
        return result[0];
    } catch (error) {
        console.error('Error getting tag by ID:', error);
        throw error;
    }
}

export async function deleteTag(tagId: number): Promise<void> {
    console.debug('Deleting tag by ID:', tagId);
    try {
        await db.delete(tags).where(eq(tags.id,tagId));
    } catch (error) {
        console.error('Error deleting tag by ID:', error);
        throw error;
    }
}

export async function getTagByName(name: string): Promise<Tag> {
    console.debug('Getting tag by name:', name);
    try {
        const result = await db.select().from(tags).where(eq(tags.name,name));
        return result[0];
    } catch (error) {
        console.error('Error getting tag by name:', error);
        throw error;
    }
}

//search tags by name close to the provided name
export async function searchTagsByName(name: string): Promise<Tag[]> {
    console.debug('Searching tags by name:', name);
    try {
        return await db.select().from(tags).where(like(tags.name,`%${name}%`));
    } catch (error) {
        console.error('Error searching tags by name:', error);
        throw error;
    }

}

export async function deleteAllTags(): Promise<void> {
    console.debug('Deleting all tags');
    try {
        await db.delete(tags);
    } catch (error) {
        console.error('Error deleting all tags:', error);
        throw error;
    }
}