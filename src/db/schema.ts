// noinspection JSUnusedGlobalSymbols

import {
    boolean,
    integer,
    pgEnum,
    pgTable,
    serial,
    text,
    timestamp,
    unique,
    varchar
} from "drizzle-orm/pg-core";
import {relations} from "drizzle-orm";

export const userRoles = pgEnum('user_role', ['admin', 'user']);

export const users = pgTable('users', {
    id: serial('id').primaryKey(),
    discordId: varchar('discord_id', {length: 255}).notNull().unique(),
    username: varchar('username', {length: 255}).notNull(),
    email: varchar('email', {length: 255}).notNull().unique(),
    avatarUrl: text('avatar_url'),
    role: userRoles('role').default('user').notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    lastLogin: timestamp('last_login').defaultNow().notNull()
});

export const userRelations = relations(users, ({many}) => ({
    finds: many(finds),
    logs: many(logs),
    reviews: many(reviews),
    customEmoji: many(customEmoji),
    lists: many(lists),
    notifications: many(notifications),
    subscriptions: many(subscriptions),
    reviewComments: many(reviewComments),
    findComments: many(findComments),
    listComments: many(listComments)
}));


export const finds = pgTable('find', {
    id: serial('id').primaryKey(),
    userId: integer('user_id').references(() => users.id, {onDelete: 'cascade'}).notNull(),
    title: varchar('title', {length: 255}).notNull(),
    url: text('url'),
    imageUrl: text('image_url'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const findRelations = relations(finds, ({one, many}) => ({
    user: one(users, {
        fields: [finds.userId],
        references: [users.id],
    }),
    findsToTags: many(findsToTags),
    reviews: many(reviews),
    listItems: many(listItems),
    subscriptionToFinds: many(subscriptionsToFinds),
    findComments: many(findComments)
}));

export const logs = pgTable('logs', {
    id: serial('id').primaryKey(),
    userId: integer('user_id').references(() => users.id, {onDelete: 'set null'}),
    message: text('message').notNull(),
    meta: text('meta'),
    timestamp: timestamp('timestamp').defaultNow().notNull()
});

export const logRelations = relations(logs, ({one}) => ({
    user: one(users, {
        fields: [logs.userId],
        references: [users.id]
    })
}));

export const tags = pgTable('tags', {
    id: serial('id').primaryKey(),
    name: varchar('name', {length: 255}).notNull().unique(),
    createdAt: timestamp('created_at').defaultNow().notNull()
});

export const tagRelations = relations(tags, ({many}) => ({
    findsToTags: many(findsToTags),
    subscriptionToTags: many(subscriptionsToTags)
}));

export const findsToTags = pgTable('finds_to_tags', {
        findId: integer('find_id').references(() => finds.id, {onDelete: 'cascade'}).notNull(),
        tagId: integer('tag_id').references(() => tags.id, {onDelete: 'cascade'}).notNull(),
        createdAt: timestamp('created_at').defaultNow().notNull(),
    }, (table) => ({
        unique: unique().on(table.findId, table.tagId)
    })
);

export const findToTagRelations = relations(findsToTags, ({one}) => ({
    find: one(finds, {
        fields: [findsToTags.findId],
        references: [finds.id]
    }),
    tag: one(tags, {
        fields: [findsToTags.tagId],
        references: [tags.id]
    })
}));

export const rating = pgEnum('rating', ['good', 'neutral', 'bad']);

export const reviews = pgTable('reviews', {
    id: serial('id').primaryKey(),
    userId: integer('user_id').references(() => users.id, {onDelete: 'cascade'}).notNull(),
    findId: integer('find_id').references(() => finds.id, {onDelete: 'cascade'}).notNull(),
    rating: rating('rating').notNull(),
    content: text('content'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull()
});

export const reviewRelations = relations(reviews, ({one, many}) => ({
    user: one(users, {
        fields: [reviews.userId],
        references: [users.id]
    }),
    find: one(finds, {
        fields: [reviews.findId],
        references: [finds.id]
    }),
    subscriptionToReviews: many(subscriptionsToReviews),
    reviewComments: many(reviewComments)
}));

export const lists = pgTable('lists', {
    id: serial('id').primaryKey(),
    userId: integer('user_id').references(() => users.id, {onDelete: 'cascade'}).notNull(),
    title: varchar('title', {length: 255}).notNull(),
    description: text('description'),
    isCollaborative: boolean('is_collaborative').default(false).notNull(),
    isPrivate: boolean('is_private').default(false).notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull()
});

export const listRelations = relations(lists, ({one, many}) => ({
    user: one(users, {
        fields: [lists.userId],
        references: [users.id]
    }),
    listItems: many(listItems),
    subscriptionToLists: many(subscriptionsToLists),
    subscriptionToListChanges: many(subscriptionsToListChanges),
    listComments: many(listComments)
}));

export const listItems = pgTable('list_items', {
    listId: integer('list_id').references(() => lists.id, {onDelete: 'cascade'}).notNull(),
    findId: integer('find_id').references(() => finds.id, {onDelete: 'cascade'}).notNull(),
    userId: integer('user_id').references(() => users.id, {onDelete: 'cascade'}).notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull()
});

export const listItemRelations = relations(listItems, ({one, many}) => ({
    list: one(lists, {
        fields: [listItems.listId],
        references: [lists.id]
    }),
    find: one(finds, {
        fields: [listItems.findId],
        references: [finds.id]
    }),
    user: one(users, {
        fields: [listItems.userId],
        references: [users.id]
    }),
    subscriptionToListChanges: many(subscriptionsToListChanges)
}));

export const customEmoji = pgTable('custom_emoji', {
    id: serial('id').primaryKey(),
    name: varchar('name', {length: 32}).notNull().unique(),
    userId: integer('user_id').references(() => users.id, {onDelete: 'cascade'}).notNull(),
    imageUrl: text('image_url').notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const customEmojiRelations = relations(customEmoji, ({one}) => ({
    user: one(users, {
        fields: [customEmoji.userId],
        references: [users.id]
    })
}));

export const notifications = pgTable('notifications', {
    id: serial('id').primaryKey(),
    userId: integer('user_id').references(() => users.id, {onDelete: 'cascade'}).notNull(),
    message: text('message').notNull(),
    subscriptionId: integer('subscription_id').references(() => subscriptions.id).notNull(),
    read: boolean('read').default(false).notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull()
});

export const notificationRelations = relations(notifications, ({one}) => ({
    subscription: one(subscriptions, {
        fields: [notifications.subscriptionId],
        references: [subscriptions.id]
    }),
}));

export const subscriptions = pgTable('subscriptions', {
    id: serial('id').primaryKey(),
    userId: integer('user_id').references(() => users.id, {onDelete: 'cascade'}).notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull()
});

export const subscriptionRelations = relations(subscriptions, ({one, many}) => ({
    user: one(users, {
        fields: [subscriptions.userId],
        references: [users.id]
    }),
    notifications: many(notifications),
    subscriptionToReviews: one(subscriptionsToReviews),
    subscriptionToFinds: one(subscriptionsToFinds),
    subscriptionToTags: one(subscriptionsToTags),
    subscriptionToUsers: one(subscriptionsToUsers),
    subscriptionToLists: one(subscriptionsToLists),
    subscriptionToListChanges: one(subscriptionsToListChanges)
}));

export const subscriptionsToReviews = pgTable('subscriptions_to_reviews', {
    subscriptionId: integer('subscription_id').references(() => subscriptions.id, {onDelete: 'cascade'}).notNull(),
    reviewId: integer('review_id').references(() => reviews.id, {onDelete: 'cascade'}).notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull()
}, (table) => ({
        unique: unique().on(table.subscriptionId, table.reviewId)
    })
);

export const subscriptionToReviewRelations = relations(subscriptionsToReviews, ({one}) => ({
    subscription: one(subscriptions, {
        fields: [subscriptionsToReviews.subscriptionId],
        references: [subscriptions.id]
    }),
    review: one(reviews, {
        fields: [subscriptionsToReviews.reviewId],
        references: [reviews.id]
    })
}));

export const subscriptionsToFinds = pgTable('subscriptions_to_finds', {
    subscriptionId: integer('subscription_id').references(() => subscriptions.id, {onDelete: 'cascade'}).notNull(),
    findId: integer('find_id').references(() => finds.id, {onDelete: 'cascade'}).notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull()
}, (table) => ({
    unique: unique().on(table.subscriptionId, table.findId)
}));

export const subscriptionToFindRelations = relations(subscriptionsToFinds, ({one}) => ({
    subscription: one(subscriptions, {
        fields: [subscriptionsToFinds.subscriptionId],
        references: [subscriptions.id]
    }),
    find: one(finds, {
        fields: [subscriptionsToFinds.findId],
        references: [finds.id]
    })
}));

export const subscriptionsToTags = pgTable('subscriptions_to_tags', {
    subscriptionId: integer('subscription_id').references(() => subscriptions.id, {onDelete: 'cascade'}).notNull(),
    tagId: integer('tag_id').references(() => tags.id, {onDelete: 'cascade'}).notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull()
}, (table) => ({
    unique: unique().on(table.subscriptionId, table.tagId)
}));

export const subscriptionToTagRelations = relations(subscriptionsToTags, ({one}) => ({
    subscription: one(subscriptions, {
        fields: [subscriptionsToTags.subscriptionId],
        references: [subscriptions.id]
    }),
    tag: one(tags, {
        fields: [subscriptionsToTags.tagId],
        references: [tags.id]
    })
}));

export const subscriptionsToUsers = pgTable('subscriptions_to_users', {
    subscriptionId: integer('subscription_id').references(() => subscriptions.id, {onDelete: 'cascade'}).notNull(),
    userId: integer('user_id').references(() => users.id, {onDelete: 'cascade'}).notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull()
}, (table) => ({
    unique: unique().on(table.subscriptionId, table.userId)
}));

export const subscriptionToUserRelations = relations(subscriptionsToUsers, ({one}) => ({
    subscription: one(subscriptions, {
        fields: [subscriptionsToUsers.subscriptionId],
        references: [subscriptions.id]
    }),
    user: one(users, {
        fields: [subscriptionsToUsers.userId],
        references: [users.id]
    })
}));

export const subscriptionsToLists = pgTable('subscriptions_to_lists', {
    subscriptionId: integer('subscription_id').references(() => subscriptions.id, {onDelete: 'cascade'}).notNull(),
    listId: integer('list_id').references(() => lists.id, {onDelete: 'cascade'}).notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull()
}, (table) => ({
    unique: unique().on(table.subscriptionId, table.listId)
}));

export const subscriptionToListRelations = relations(subscriptionsToLists, ({one}) => ({
    subscription: one(subscriptions, {
        fields: [subscriptionsToLists.subscriptionId],
        references: [subscriptions.id]
    }),
    list: one(lists, {
        fields: [subscriptionsToLists.listId],
        references: [lists.id]
    })
}));

export const subscriptionsToListChanges = pgTable('subscriptions_to_list_changes', {
    subscriptionId: integer('subscription_id').references(() => subscriptions.id, {onDelete: 'cascade'}).notNull(),
    listId: integer('list_id').references(() => lists.id, {onDelete: 'cascade'}).notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull()
}, (table) => ({
    unique: unique().on(table.subscriptionId, table.listId)
}));

export const subscriptionToListChangeRelations = relations(subscriptionsToListChanges, ({one}) => ({
    subscription: one(subscriptions, {
        fields: [subscriptionsToListChanges.subscriptionId],
        references: [subscriptions.id]
    }),
    list: one(lists, {
        fields: [subscriptionsToListChanges.listId],
        references: [lists.id]
    })
}));

export const reviewComments = pgTable('review_comments', {
    id: serial('id').primaryKey(),
    userId: integer('user_id').references(() => users.id, {onDelete: 'cascade'}).notNull(),
    reviewId: integer('review_id').references(() => reviews.id, {onDelete: 'cascade'}).notNull(),
    content: text('content').notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull()
});

export const reviewCommentRelations = relations(reviewComments, ({one}) => ({
    user: one(users, {
        fields: [reviewComments.userId],
        references: [users.id]
    }),
    review: one(reviews, {
        fields: [reviewComments.reviewId],
        references: [reviews.id]
    })
}));

export const findComments = pgTable('find_comments', {
    id: serial('id').primaryKey(),
    userId: integer('user_id').references(() => users.id, {onDelete: 'cascade'}).notNull(),
    findId: integer('find_id').references(() => finds.id, {onDelete: 'cascade'}).notNull(),
    content: text('content').notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull()
});

export const findCommentRelations = relations(findComments, ({one}) => ({
    user: one(users, {
        fields: [findComments.userId],
        references: [users.id]
    }),
    find: one(finds, {
        fields: [findComments.findId],
        references: [finds.id]
    })
}));

export const listComments = pgTable('list_comments', {
    id: serial('id').primaryKey(),
    userId: integer('user_id').references(() => users.id, {onDelete: 'cascade'}).notNull(),
    listId: integer('list_id').references(() => lists.id, {onDelete: 'cascade'}).notNull(),
    content: text('content').notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull()
});

export const listCommentRelations = relations(listComments, ({one}) => ({
    user: one(users, {
        fields: [listComments.userId],
        references: [users.id]
    }),
    list: one(lists, {
        fields: [listComments.listId],
        references: [lists.id]
    })
}));