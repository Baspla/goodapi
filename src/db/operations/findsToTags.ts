import {finds, findsToTags, tags} from "../schema.js";
import db from "../db.js";
import {and, asc, desc, eq, ilike, sql} from "drizzle-orm";

export async function createFindToTag(findId: number, tagId: number): Promise<void> {
    console.debug('Creating find to tag:', findId, tagId);
    try {
        await db.insert(findsToTags).values({findId, tagId}).execute();
    } catch (error) {
        console.error('Error creating find to tag:', error);
        throw error;
    }
}

export async function getFindsByTagId(tagId: number): Promise<any> {
    console.debug('Getting finds by tag ID:', tagId);
    try {
        return await db.query.findsToTags.findMany({
            where: eq(findsToTags.tagId, tagId),
            with: {
                find: true,
            }
        });
    } catch (error) {
        console.error('Error getting finds by tag ID:', error);
        throw error;
    }
}

export async function getTagsByFindId(findId: number): Promise<any> {
    console.debug('Getting tags by find ID:', findId);
    try {
        return await db.query.findsToTags.findMany({
            where: eq(findsToTags.findId, findId),
            with: {
                tag: true,
            }
        });
    } catch (error) {
        console.error('Error getting tags by find ID:', error);
        throw error;
    }
}

export async function deleteFindToTag(findId: number, tagId: number): Promise<void> {
    console.debug('Deleting find to tag:', findId, tagId);
    try {
        await db.delete(findsToTags).where(and(eq(findsToTags.findId, findId), eq(findsToTags.tagId, tagId)));
    } catch (error) {
        console.error('Error deleting find to tag:', error);
        throw error;
    }
}