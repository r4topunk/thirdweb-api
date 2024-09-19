import { pgTable, text, uuid, timestamp } from 'drizzle-orm/pg-core';

export const redirects = pgTable('redirects', {
  uuid: uuid('uuid').primaryKey().defaultRandom(),
  url: text('url').notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});