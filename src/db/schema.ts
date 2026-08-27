import {
  pgTable,
  serial,
  text,
  timestamp,
  integer,
  boolean,
  jsonb,
  index,
} from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  role: text("role").notNull().default("student"),
  plan: text("plan").notNull().default("free"),
  planExpiresAt: timestamp("plan_expires_at"),
  referralCode: text("referral_code").unique(),
  referredByUserId: integer("referred_by_user_id"),
  walletBalance: integer("wallet_balance").notNull().default(0), // cents
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const referrals = pgTable(
  "referrals",
  {
    id: serial("id").primaryKey(),
    referrerId: integer("referrer_id").notNull(),
    refereeId: integer("referee_id").notNull(),
    refereeName: text("referee_name").notNull(),
    refereeEmail: text("referee_email").notNull(),
    code: text("code").notNull(),
    status: text("status").notNull().default("signed_up"), // signed_up | converted | paid_out
    rewardAmount: integer("reward_amount").notNull().default(0), // cents
    plan: text("plan"),
    convertedAt: timestamp("converted_at"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (t) => [index("referrals_referrer_idx").on(t.referrerId)],
);

export const payouts = pgTable("payouts", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  amount: integer("amount").notNull(), // cents
  method: text("method").notNull().default("mtn_momo"),
  destination: text("destination").notNull(),
  status: text("status").notNull().default("requested"),
  note: text("note").notNull().default(""),
  reviewedAt: timestamp("reviewed_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});


/** Single-use password reset codes. Surfaced to admins for manual verification. */
export const passwordResets = pgTable("password_resets", {
  id: serial("id").primaryKey(),
  userId: integer("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  code: text("code").notNull().unique(),
  // requested -> approved -> used | expired
  status: text("status").notNull().default("requested"),
  note: text("note").notNull().default(""),
  expiresAt: timestamp("expires_at").notNull(),
  usedAt: timestamp("used_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const sessions = pgTable("sessions", {
  id: text("id").primaryKey(),
  userId: integer("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  expiresAt: timestamp("expires_at").notNull(),
  userAgent: text("user_agent").notNull().default(""),
  ip: text("ip").notNull().default(""),
  deviceLabel: text("device_label").notNull().default(""),
  lastSeenAt: timestamp("last_seen_at").notNull().defaultNow(),
  revokedAt: timestamp("revoked_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

/** Audit trail for account-sharing detection and content protection events. */
export const securityEvents = pgTable("security_events", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id, { onDelete: "cascade" }),
  kind: text("kind").notNull(), // session_evicted | login | screenshot_attempt | devtools
  detail: text("detail").notNull().default(""),
  ip: text("ip").notNull().default(""),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const questions = pgTable(
  "questions",
  {
    id: serial("id").primaryKey(),
    exam: text("exam").notNull().default("NCLEX"),
    stem: text("stem").notNull(),
    options: jsonb("options").$type<string[]>().notNull(),
    correctIndex: integer("correct_index").notNull(),
    rationale: text("rationale").notNull(),
    category: text("category").notNull(),
    difficulty: text("difficulty").notNull(),
    clientNeed: text("client_need").notNull(),
    /** Body-system / subject area, as a second independent filter. */
    bodySystem: text("body_system"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (t) => [
    index("questions_category_idx").on(t.category),
    index("questions_exam_idx").on(t.exam),
  ],
);

export const tasks = pgTable(
  "tasks",
  {
    id: serial("id").primaryKey(),
    userId: integer("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    title: text("title").notNull(),
    notes: text("notes").notNull().default(""),
    category: text("category").notNull().default("Fundamentals"),
    priority: text("priority").notNull().default("medium"),
    status: text("status").notNull().default("todo"),
    dueDate: timestamp("due_date"),
    targetQuestions: integer("target_questions").notNull().default(25),
    completed: boolean("completed").notNull().default(false),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (t) => [index("tasks_user_idx").on(t.userId)],
);

export const payments = pgTable("payments", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id, { onDelete: "set null" }),
  email: text("email").notNull(),
  plan: text("plan").notNull(),
  amount: integer("amount").notNull(), // in cents (USD minor units)
  channel: text("channel").notNull().default("mtn_momo"),
  momoNumber: text("momo_number").notNull().default(""),
  payerName: text("payer_name").notNull().default(""),
  momoTransactionId: text("momo_transaction_id").notNull().default(""),
  reference: text("reference").notNull().unique(),
  // pending -> submitted -> success | rejected
  status: text("status").notNull().default("pending"),
  reviewNote: text("review_note").notNull().default(""),
  reviewedAt: timestamp("reviewed_at"),
  activationCode: text("activation_code"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const activationCodes = pgTable("activation_codes", {
  id: serial("id").primaryKey(),
  code: text("code").notNull().unique(),
  plan: text("plan").notNull(),
  months: integer("months").notNull().default(1),
  paymentId: integer("payment_id").references(() => payments.id, { onDelete: "set null" }),
  usedByUserId: integer("used_by_user_id").references(() => users.id, { onDelete: "set null" }),
  usedAt: timestamp("used_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const lessons = pgTable("lessons", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  exam: text("exam").notNull().default("ALL"),
  section: text("section").notNull(), // Body Systems | Common Conditions | Care Plans & Nursing Process | App Orientation
  topic: text("topic").notNull(),
  durationMin: integer("duration_min").notNull().default(12),
  searchQuery: text("search_query").notNull(),
  premium: boolean("premium").notNull().default(false),
  sortOrder: integer("sort_order").notNull().default(0),
});

export const attempts = pgTable("attempts", {
  id: serial("id").primaryKey(),
  userId: integer("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  exam: text("exam").notNull().default("NCLEX"),
  category: text("category").notNull(),
  mode: text("mode").notNull().default("practice"),
  total: integer("total").notNull(),
  correct: integer("correct").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});
