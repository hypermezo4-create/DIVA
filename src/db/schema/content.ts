import {index, pgTable, primaryKey, text, timestamp} from 'drizzle-orm/pg-core';
import {user} from './auth';
import {localeEnum} from './catalog';

export const siteContent = pgTable(
  'site_content',
  {
    key: text('key').notNull(),
    locale: localeEnum('locale').notNull(),
    value: text('value').notNull(),
    updatedBy: text('updated_by').references(() => user.id, {onDelete: 'set null'}),
    updatedAt: timestamp('updated_at', {withTimezone: true}).notNull().defaultNow()
  },
  (table) => [
    primaryKey({columns: [table.key, table.locale]}),
    index('site_content_updated_at_idx').on(table.updatedAt)
  ]
);
