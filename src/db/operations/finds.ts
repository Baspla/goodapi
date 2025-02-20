import {finds, findsToTags, tags, users} from "../schema.js";
import db from "../db.js";
import { asc, desc, eq, getTableColumns, ilike, or, SQL} from "drizzle-orm";
import {validateTitle, validateUrl} from "../../util/validation.js";
import {RedactedUser, redactedUserColumns, User} from "./users.js";
import {PgColumn} from "drizzle-orm/pg-core";
import {Tag} from "./tags.js";

export type Find = typeof finds.$inferSelect;
export type FindsToTags = typeof findsToTags.$inferSelect & { tag: Tag };
export type FindExtended = Find & { user: RedactedUser | null } & {
    findsToTags: FindsToTags[]
};
export type NewFind = typeof finds.$inferInsert;

function validateNewFind(findData: Partial<NewFind>): Promise<void> {
    if (!findData.title) {
        return Promise.reject({status: 400, message: 'Title is required'});
    }
    if (!validateTitle(findData.title)) {
        return Promise.reject({status: 400, message: 'Invalid title'});
    }
    if (findData.url && !validateUrl(findData.url)) {
        return Promise.reject({status: 400, message: 'Invalid URL'});
    }
    if (findData.imageUrl && !validateUrl(findData.imageUrl)) {
        return Promise.reject({status: 400, message: 'Invalid image URL'});
    }
    return Promise.resolve();
}

export async function createFind(findData: NewFind): Promise<Find> {
    console.debug('Creating find:', findData);
    await validateNewFind(findData).catch(error => {
        throw error;
    });
    try {
        const result = await db.insert(finds).values(findData).returning();
        return result[0];
    } catch (error) {
        console.error('Error creating find:', error);
        throw error;
    }
}

export async function getFinds(
    page: number = 0,
    limit: number = 20,
    searchterm: string = '',
    sortBy: 'created_at' | 'updated_at' | 'title' = 'created_at',
    sortOrder: 'asc' | 'desc' = 'asc'
): Promise<any> {
    try {
        let orderIdentifier: PgColumn = finds.createdAt;
        switch (sortBy) {
            case 'updated_at':
                orderIdentifier = finds.updatedAt;
                break;
            case 'title':
                orderIdentifier = finds.title;
                break;
            case 'created_at':
                orderIdentifier = finds.createdAt;
                break;
        }

        let where: SQL | undefined = ilike(finds.title, `%${searchterm}%`);
        if (searchterm.length > 0) {
            switch (searchterm[0]) {
                case '@':
                    where = or(where, ilike(users.username, `%${searchterm.slice(1)}%`));
                    break;
                case '#':
                    where = or(where, ilike(tags.name, `%${searchterm.slice(1)}%`));
                    break;
                default:
                    break;
            }
        }


        return await db.select({
            ...getTableColumns(finds),
            user: redactedUserColumns,
            tags: getTableColumns(tags),
        }).from(finds)
            .leftJoin(users, eq(finds.userId, users.id))
            .leftJoin(findsToTags, eq(finds.id, findsToTags.findId))
            .leftJoin(tags, eq(findsToTags.tagId, tags.id))
            .where(where)
            .orderBy(sortOrder == 'asc' ? asc(orderIdentifier) : desc(orderIdentifier))
            .limit(limit)
            .offset(page * limit);

    } catch (error) {
        console.error('Error getting finds with users:', error);
        throw error;
    }
}

export async function getFindsByUserId(userId: number): Promise<FindExtended[]> {
    console.debug('Getting finds by user ID:', userId);
    try {
        return await db.query.finds.findMany({
            where: eq(finds.userId, userId),
            with: {
                user: {
                    columns: {
                        email: false,
                        discordId: false,
                        lastLogin: false,
                    }
                },
                findsToTags: {
                    with: {
                        tag: true,
                    }
                }
            }
        })
    } catch (error) {
        console.error('Error getting finds by user ID:', error);
        throw error;
    }
}

export async function getFindById(findId: number): Promise<FindExtended | undefined> {
    console.debug('Getting find by ID:', findId);
    try {
        return await db.query.finds.findFirst({
            where: eq(finds.id, findId),
            with: {
                user: {
                    columns: {
                        email: false,
                        discordId: false,
                        lastLogin: false,
                    }
                },
                findsToTags: {
                    with: {
                        tag: true,
                    }
                }
            }
        })
    } catch (error) {
        console.error('Error getting find by ID:', error);
        throw error;
    }
}

export async function getFindsByTagId(tagId: number): Promise<FindExtended[]> {
    console.debug('Getting finds by tag ID:', tagId);
    try {
        return await db.query.finds.findMany({
            with: {
                findsToTags: {
                    where: eq(findsToTags.tagId, tagId),
                    with: {
                        tag: true,
                    }
                },
                user: {
                    columns: {
                        email: false,
                        discordId: false,
                        lastLogin: false,
                    }
                }
            }
        })
    } catch (error) {
        console.error('Error getting finds by tag ID:', error);
        throw error;
    }
}

export async function deleteFind(findId: number): Promise<void> {
    console.debug('Deleting find by ID:', findId);
    try {
        await db.delete(finds).where(eq(finds.id, findId));
    } catch (error) {
        console.error('Error deleting find by ID:', error);
        throw error;
    }
}

export async function updateFind(findId: number, findData: Partial<NewFind>): Promise<Find> {
    console.debug('Updating find by ID:', findId, findData);
    await validateNewFind(findData).catch(error => {
        throw error;
    });
    try {
        const result = await db.update(finds).set(findData).where(eq(finds.id, findId)).returning();
        return result[0];
    } catch (error) {
        console.error('Error updating find by ID:', error);
        throw error;
    }
}

export async function deleteAllFinds(): Promise<void> {
    console.debug('Deleting all finds');
    try {
        await db.delete(finds);
    } catch (error) {
        console.error('Error deleting all finds:', error);
        throw error;
    }
}