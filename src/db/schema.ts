// noinspection JSUnusedGlobalSymbols

import {boolean, integer, pgEnum, pgTable, serial, text, timestamp, varchar} from "drizzle-orm/pg-core";
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
    recommendations: many(recommendations),
    logs: many(logs),
    reviews: many(reviews),
    customEmoji: many(customEmoji),
    lists: many(lists),
    notifications: many(notifications),
    subscriptions: many(subscriptions),
    reviewComments: many(reviewComments),
    recommendationComments: many(recommendationComments),
    listComments: many(listComments)
}));


export const recommendations = pgTable('recommendation', {
    id: serial('id').primaryKey(),
    userId: integer('user_id').references(() => users.id, {onDelete: 'cascade'}).notNull(),
    title: varchar('title', {length: 255}).notNull(),
    tldr: varchar('tldr', {length: 512}),
    url: text('url'),
    imageUrl: text('image_url'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const recommendationRelations = relations(recommendations, ({one, many}) => ({
    user: one(users, {
        fields: [recommendations.userId],
        references: [users.id],
    }),
    recommendationsToTags: many(recommendationsToTags),
    reviews: many(reviews),
    listItems: many(listItems),
    subscriptionToRecommendations: many(subscriptionsToRecommendations),
    recommendationComments: many(recommendationComments)
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
    recommendationsToTags: many(recommendationsToTags),
    subscriptionToTags: many(subscriptionsToTags)
}));

export const recommendationsToTags = pgTable('recommendations_to_tags', {
    recommendationId: integer('recommendation_id').references(() => recommendations.id, {onDelete: 'cascade'}).notNull(),
    tagId: integer('tag_id').references(() => tags.id, {onDelete: 'cascade'}).notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull()
})

export const recommendationToTagRelations = relations(recommendationsToTags, ({one}) => ({
    recommendation: one(recommendations, {
        fields: [recommendationsToTags.recommendationId],
        references: [recommendations.id]
    }),
    tag: one(tags, {
        fields: [recommendationsToTags.tagId],
        references: [tags.id]
    })
}));

export const rating = pgEnum('rating', ['good', 'neutral', 'bad']);

export const reviews = pgTable('reviews', {
    id: serial('id').primaryKey(),
    userId: integer('user_id').references(() => users.id, {onDelete: 'cascade'}).notNull(),
    recommendationId: integer('recommendation_id').references(() => recommendations.id, {onDelete: 'cascade'}).notNull(),
    rating: rating('rating').notNull(),
    content: text('content'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull()
});

export const reviewRelations = relations(reviews, ({one,many}) => ({
    user: one(users, {
        fields: [reviews.userId],
        references: [users.id]
    }),
    recommendation: one(recommendations, {
        fields: [reviews.recommendationId],
        references: [recommendations.id]
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
    recommendationId: integer('recommendation_id').references(() => recommendations.id, {onDelete: 'cascade'}).notNull(),
    userId: integer('user_id').references(() => users.id, {onDelete: 'cascade'}).notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull()
});

export const listItemRelations = relations(listItems, ({one,many}) => ({
    list: one(lists, {
        fields: [listItems.listId],
        references: [lists.id]
    }),
    recommendation: one(recommendations, {
        fields: [listItems.recommendationId],
        references: [recommendations.id]
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
    subscriptionToRecommendations: one(subscriptionsToRecommendations),
    subscriptionToTags: one(subscriptionsToTags),
    subscriptionToUsers: one(subscriptionsToUsers),
    subscriptionToLists: one(subscriptionsToLists),
    subscriptionToListChanges: one(subscriptionsToListChanges)
}));

export const subscriptionsToReviews = pgTable('subscriptions_to_reviews', {
    subscriptionId: integer('subscription_id').references(() => subscriptions.id, {onDelete: 'cascade'}).notNull(),
    reviewId: integer('review_id').references(() => reviews.id, {onDelete: 'cascade'}).notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull()
});

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

export const subscriptionsToRecommendations = pgTable('subscriptions_to_recommendations', {
    subscriptionId: integer('subscription_id').references(() => subscriptions.id, {onDelete: 'cascade'}).notNull(),
    recommendationId: integer('recommendation_id').references(() => recommendations.id, {onDelete: 'cascade'}).notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull()
});

export const subscriptionToRecommendationRelations = relations(subscriptionsToRecommendations, ({one}) => ({
    subscription: one(subscriptions, {
        fields: [subscriptionsToRecommendations.subscriptionId],
        references: [subscriptions.id]
    }),
    recommendation: one(recommendations, {
        fields: [subscriptionsToRecommendations.recommendationId],
        references: [recommendations.id]
    })
}));

export const subscriptionsToTags = pgTable('subscriptions_to_tags', {
    subscriptionId: integer('subscription_id').references(() => subscriptions.id, {onDelete: 'cascade'}).notNull(),
    tagId: integer('tag_id').references(() => tags.id, {onDelete: 'cascade'}).notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull()
});

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
});

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
});

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
});

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

export const recommendationComments = pgTable('recommendation_comments', {
    id: serial('id').primaryKey(),
    userId: integer('user_id').references(() => users.id, {onDelete: 'cascade'}).notNull(),
    recommendationId: integer('recommendation_id').references(() => recommendations.id, {onDelete: 'cascade'}).notNull(),
    content: text('content').notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull()
});

export const recommendationCommentRelations = relations(recommendationComments, ({one}) => ({
    user: one(users, {
        fields: [recommendationComments.userId],
        references: [users.id]
    }),
    recommendation: one(recommendations, {
        fields: [recommendationComments.recommendationId],
        references: [recommendations.id]
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

