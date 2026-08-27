import { index, int, mysqlEnum, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";

export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export const careerPaths = mysqlTable("careerPaths", {
  id: int("id").autoincrement().primaryKey(),
  slug: varchar("slug", { length: 80 }).notNull().unique(),
  title: varchar("title", { length: 160 }).notNull(),
  description: text("description").notNull(),
  accent: varchar("accent", { length: 32 }).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const interviews = mysqlTable(
  "interviews",
  {
    id: int("id").autoincrement().primaryKey(),
    userId: int("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
    careerPathId: int("careerPathId").references(() => careerPaths.id, { onDelete: "set null" }),
    roleTitle: varchar("roleTitle", { length: 200 }).notNull(),
    experienceLevel: mysqlEnum("experienceLevel", ["graduate", "junior", "mid", "senior"]).notNull(),
    focus: mysqlEnum("focus", ["balanced", "technical", "behavioral"]).default("balanced").notNull(),
    status: mysqlEnum("status", ["in_progress", "completed"]).default("in_progress").notNull(),
    currentQuestion: int("currentQuestion").default(1).notNull(),
    overallScore: int("overallScore"),
    summary: text("summary"),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    completedAt: timestamp("completedAt"),
  },
  table => [
    index("interviews_user_created_idx").on(table.userId, table.createdAt),
    index("interviews_career_path_idx").on(table.careerPathId),
  ],
);

export const interviewAnswers = mysqlTable(
  "interviewAnswers",
  {
    id: int("id").autoincrement().primaryKey(),
    interviewId: int("interviewId").notNull().references(() => interviews.id, { onDelete: "cascade" }),
    sequence: int("sequence").notNull(),
    question: text("question").notNull(),
    category: mysqlEnum("category", ["general", "technical", "behavioral"]).notNull(),
    answer: text("answer"),
    score: int("score"),
    clarityScore: int("clarityScore"),
    relevanceScore: int("relevanceScore"),
    structureScore: int("structureScore"),
    feedback: text("feedback"),
    improvement: text("improvement"),
    answeredAt: timestamp("answeredAt"),
  },
  table => [index("answers_interview_sequence_idx").on(table.interviewId, table.sequence)],
);

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;
export type Interview = typeof interviews.$inferSelect;
export type InterviewAnswer = typeof interviewAnswers.$inferSelect;
