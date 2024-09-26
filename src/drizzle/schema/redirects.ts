import { pgTable, text, uuid, timestamp, integer } from 'drizzle-orm/pg-core';

export const redirects = pgTable('redirects', {
  uuid: uuid('uuid').primaryKey().defaultRandom(),
  url: text('url').notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
  description: text('text'),
  number: integer('number'),
  group: integer('group'),
  xLocation: integer('x_location'),
  zLocation: integer('z_location')
});