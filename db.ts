import { and, desc, eq, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { careerPaths, interviewAnswers, interviews, type InsertUser, users } from "../drizzle/schema";
import { ENV } from "./_core/env";
import { DEFAULT_CAREER_PATHS } from "./careerPaths";
import type { GeneratedQuestion, InterviewFocus, ExperienceLevel, ResponseAssessment } from "./interviewLogic";

let _db: ReturnType<typeof drizzle> | null = null;

export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

function requireDb(db: Awaited<ReturnType<typeof getDb>>) {
  if (!db) throw new Error("قاعدة البيانات غير متاحة حاليًا. حاول مرة أخرى لاحقًا.");
  return db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) throw new Error("User openId is required for upsert");
  const db = await getDb();
  if (!db) return;

  const values: InsertUser = { openId: user.openId };
  const updateSet: Record<string, unknown> = {};
  for (const field of ["name", "email", "loginMethod"] as const) {
    if (user[field] !== undefined) {
      values[field] = user[field] ?? null;
      updateSet[field] = user[field] ?? null;
    }
  }
  if (user.role !== undefined) {
    values.role = user.role;
    updateSet.role = user.role;
  } else if (user.openId === ENV.ownerOpenId) {
    values.role = "admin";
    updateSet.role = "admin";
  }
  values.lastSignedIn = user.lastSignedIn ?? new Date();
  updateSet.lastSignedIn = values.lastSignedIn;
  await db.insert(users).values(values).onDuplicateKeyUpdate({ set: updateSet });
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return result[0];
}

export async function listCareerPaths() {
  const db = requireDb(await getDb());
  await db.insert(careerPaths).values([...DEFAULT_CAREER_PATHS]).onDuplicateKeyUpdate({
    set: {
      title: sql`VALUES(title)`,
      description: sql`VALUES(description)`,
      accent: sql`VALUES(accent)`,
    },
  });
  return db.select().from(careerPaths).orderBy(careerPaths.id);
}

export async function getCareerPathById(careerPathId: number) {
  const db = requireDb(await getDb());
  const result = await db.select().from(careerPaths).where(eq(careerPaths.id, careerPathId)).limit(1);
  return result[0] ?? null;
}

export async function createInterviewWithQuestions(input: {
  userId: number;
  careerPathId?: number;
  roleTitle: string;
  experienceLevel: ExperienceLevel;
  focus: InterviewFocus;
  questions: GeneratedQuestion[];
}) {
  const db = requireDb(await getDb());
  const created = await db.insert(interviews).values({
    userId: input.userId,
    careerPathId: input.careerPathId,
    roleTitle: input.roleTitle,
    experienceLevel: input.experienceLevel,
    focus: input.focus,
  });
  const interviewId = created[0].insertId;
  await db.insert(interviewAnswers).values(
    input.questions.map((item, index) => ({
      interviewId,
      sequence: index + 1,
      question: item.question,
      category: item.category,
    })),
  );
  return getInterviewForUser(interviewId, input.userId);
}

export async function getInterviewForUser(interviewId: number, userId: number) {
  const db = requireDb(await getDb());
  const interview = await db
    .select()
    .from(interviews)
    .where(and(eq(interviews.id, interviewId), eq(interviews.userId, userId)))
    .limit(1);
  if (!interview[0]) return null;
  const answers = await db
    .select()
    .from(interviewAnswers)
    .where(eq(interviewAnswers.interviewId, interviewId))
    .orderBy(interviewAnswers.sequence);
  return { ...interview[0], answers };
}

export async function listInterviewsForUser(userId: number) {
  const db = requireDb(await getDb());
  return db.select().from(interviews).where(eq(interviews.userId, userId)).orderBy(desc(interviews.createdAt));
}

export async function saveAnswer(input: {
  interviewId: number;
  answerId: number;
  answer: string;
  assessment: ResponseAssessment;
}) {
  const db = requireDb(await getDb());
  await db
    .update(interviewAnswers)
    .set({
      answer: input.answer,
      score: input.assessment.score,
      clarityScore: input.assessment.clarityScore,
      relevanceScore: input.assessment.relevanceScore,
      structureScore: input.assessment.structureScore,
      feedback: input.assessment.feedback,
      improvement: input.assessment.improvement,
      answeredAt: new Date(),
    })
    .where(and(eq(interviewAnswers.id, input.answerId), eq(interviewAnswers.interviewId, input.interviewId)));
}

export async function setCurrentQuestion(interviewId: number, sequence: number) {
  const db = requireDb(await getDb());
  await db.update(interviews).set({ currentQuestion: sequence }).where(eq(interviews.id, interviewId));
}

export async function completeInterview(interviewId: number, overallScore: number, summary: string) {
  const db = requireDb(await getDb());
  await db
    .update(interviews)
    .set({ status: "completed", overallScore, summary, completedAt: new Date() })
    .where(eq(interviews.id, interviewId));
}
