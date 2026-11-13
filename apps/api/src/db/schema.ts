import { pgTable, uuid, varchar, timestamp } from "drizzle-orm/pg-core";

// 1. User Table 
export const user = pgTable("user", {
    id: uuid("id").primaryKey().defaultRandom(),
    name: varchar("name", { length: 255 }).notNull(),
    email: varchar("email", { length: 255 }).notNull().unique(),
    passwordHash: varchar("password", { length: 255 }).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
})

// 2. Refresh Token Session Table
export const refreshTokenSession = pgTable("refresh_token_session", {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id").notNull().references(() => user.id),
    refreshToken: varchar("refresh_token", { length: 255 }).notNull(),
    expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(), 
    revokedAt: timestamp('revoked_at', { withTimezone: true }), // Null until logged out or rotated 
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
})

export type User = typeof user.$inferSelect;
export type NewUser = typeof user.$inferInsert;
export type RefreshTokenSession = typeof refreshTokenSession.$inferSelect;
export type NewRefreshTokenSession = typeof refreshTokenSession.$inferInsert;