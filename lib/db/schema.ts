import {
  boolean,
  integer,
  pgTable,
  primaryKey,
  text,
  timestamp,
} from "drizzle-orm/pg-core"

export const users = pgTable("users", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  name: text("name"),
  email: text("email").unique(),
  emailVerified: timestamp("email_verified", { mode: "date" }),
  image: text("image"),
  role: text("role", { enum: ["user", "admin"] }).notNull().default("user"),
})

export const accounts = pgTable(
  "accounts",
  {
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    type: text("type").notNull(),
    provider: text("provider").notNull(),
    providerAccountId: text("provider_account_id").notNull(),
    refresh_token: text("refresh_token"),
    access_token: text("access_token"),
    expires_at: integer("expires_at"),
    token_type: text("token_type"),
    scope: text("scope"),
    id_token: text("id_token"),
    session_state: text("session_state"),
  },
  (account) => [
    primaryKey({ columns: [account.provider, account.providerAccountId] }),
  ],
)

export const sessions = pgTable("sessions", {
  sessionToken: text("session_token").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  expires: timestamp("expires", { mode: "date" }).notNull(),
})

export const verificationTokens = pgTable(
  "verification_tokens",
  {
    identifier: text("identifier").notNull(),
    token: text("token").notNull(),
    expires: timestamp("expires", { mode: "date" }).notNull(),
  },
  (verificationToken) => [
    primaryKey({
      columns: [verificationToken.identifier, verificationToken.token],
    }),
  ],
)

export const authenticators = pgTable(
  "authenticators",
  {
    credentialID: text("credential_id").notNull().unique(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    providerAccountId: text("provider_account_id").notNull(),
    credentialPublicKey: text("credential_public_key").notNull(),
    counter: integer("counter").notNull(),
    credentialDeviceType: text("credential_device_type").notNull(),
    credentialBackedUp: boolean("credential_backed_up").notNull(),
    transports: text("transports"),
  },
  (authenticator) => [
    primaryKey({ columns: [authenticator.userId, authenticator.credentialID] }),
  ],
)

export const kelas = pgTable("kelas", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  nama: text("nama").notNull(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at", { mode: "date" }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { mode: "date" }).notNull().defaultNow(),
})

export const classroom = pgTable("classroom", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  name: text("name").notNull(),
  waliKelas: text("wali_kelas"),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at", { mode: "date" }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { mode: "date" }).notNull().defaultNow(),
})

export const subject = pgTable("subject", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  name: text("name").notNull(),
  kode: text("kode").notNull(),
  status: text("status", { enum: ["aktif", "nonaktif"] }).notNull().default("aktif"),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at", { mode: "date" }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { mode: "date" }).notNull().defaultNow(),
})

export const schedule = pgTable("schedule", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  day: text("day", {
    enum: ["senin", "selasa", "rabu", "kamis", "jumat", "sabtu", "minggu"],
  }).notNull(),
  jamKe: integer("jam_ke").notNull(),
  startTime: text("start_time").notNull(),
  endTime: text("end_time").notNull(),
  subjectId: text("subject_id")
    .notNull()
    .references(() => subject.id, { onDelete: "cascade" }),
  classroomId: text("classroom_id")
    .notNull()
    .references(() => classroom.id, { onDelete: "cascade" }),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at", { mode: "date" }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { mode: "date" }).notNull().defaultNow(),
})

export const gradeWeight = pgTable("grade_weight", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  name: text("name").notNull(),
  weight: integer("weight").notNull(),
  subjectId: text("subject_id")
    .notNull()
    .references(() => subject.id, { onDelete: "cascade" }),
  status: text("status", { enum: ["aktif", "nonaktif"] }).notNull().default("aktif"),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at", { mode: "date" }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { mode: "date" }).notNull().defaultNow(),
})

export const siswa = pgTable("siswa", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  name: text("name").notNull(),
  nis: text("nis"),
  classroomId: text("classroom_id")
    .notNull()
    .references(() => classroom.id, { onDelete: "cascade" }),
  jenisKelamin: text("jenis_kelamin", { enum: ["laki-laki", "perempuan"] })
    .notNull()
    .default("laki-laki"),
  status: text("status", { enum: ["aktif", "keluar"] }).notNull().default("aktif"),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at", { mode: "date" }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { mode: "date" }).notNull().defaultNow(),
})

export const journal = pgTable("journal", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  date: text("date").notNull(),
  scheduleId: text("schedule_id")
    .notNull()
    .references(() => schedule.id, { onDelete: "cascade" }),
  subjectId: text("subject_id").notNull(),
  subjectName: text("subject_name").notNull(),
  subjectKode: text("subject_kode"),
  classroomId: text("classroom_id").notNull(),
  classroomName: text("classroom_name").notNull(),
  day: text("day").notNull(),
  jamKe: integer("jam_ke").notNull(),
  startTime: text("start_time").notNull(),
  endTime: text("end_time").notNull(),
  materi: text("materi").notNull(),
  kegiatan: text("kegiatan").notNull(),
  catatan: text("catatan"),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at", { mode: "date" }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { mode: "date" }).notNull().defaultNow(),
})

export const attendance = pgTable("attendance", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  date: text("date").notNull(),
  scheduleId: text("schedule_id")
    .notNull()
    .references(() => schedule.id, { onDelete: "cascade" }),
  siswaId: text("siswa_id")
    .notNull()
    .references(() => siswa.id, { onDelete: "cascade" }),
  status: text("status", { enum: ["hadir", "sakit", "izin", "alfa"] })
    .notNull()
    .default("hadir"),
  subjectId: text("subject_id").notNull(),
  subjectName: text("subject_name").notNull(),
  subjectKode: text("subject_kode"),
  classroomId: text("classroom_id").notNull(),
  classroomName: text("classroom_name").notNull(),
  day: text("day").notNull(),
  jamKe: integer("jam_ke").notNull(),
  startTime: text("start_time").notNull(),
  endTime: text("end_time").notNull(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at", { mode: "date" }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { mode: "date" }).notNull().defaultNow(),
})

export const assessment = pgTable("assessment", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  title: text("title").notNull(),
  description: text("description"),
  date: text("date"),
  gradeWeightId: text("grade_weight_id")
    .notNull()
    .references(() => gradeWeight.id, { onDelete: "cascade" }),
  gradeWeightName: text("grade_weight_name").notNull(),
  subjectId: text("subject_id").notNull(),
  subjectName: text("subject_name").notNull(),
  subjectKode: text("subject_kode"),
  classroomId: text("classroom_id")
    .notNull()
    .references(() => classroom.id, { onDelete: "cascade" }),
  classroomName: text("classroom_name").notNull(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at", { mode: "date" }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { mode: "date" }).notNull().defaultNow(),
})

export const grade = pgTable("grade", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  assessmentId: text("assessment_id")
    .notNull()
    .references(() => assessment.id, { onDelete: "cascade" }),
  siswaId: text("siswa_id")
    .notNull()
    .references(() => siswa.id, { onDelete: "cascade" }),
  score: integer("score").notNull().default(0),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at", { mode: "date" }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { mode: "date" }).notNull().defaultNow(),
})

export const jurnal = pgTable("jurnal", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  tanggal: timestamp("tanggal", { mode: "date" }).notNull().defaultNow(),
  isi: text("isi").notNull(),
  kelasId: text("kelas_id")
    .notNull()
    .references(() => kelas.id, { onDelete: "cascade" }),
  siswaId: text("siswa_id").references(() => siswa.id, { onDelete: "set null" }),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at", { mode: "date" }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { mode: "date" }).notNull().defaultNow(),
})
