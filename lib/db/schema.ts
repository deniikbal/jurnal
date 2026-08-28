import { index, integer, pgTable, text, timestamp, uniqueIndex } from "drizzle-orm/pg-core"

export const users = pgTable("users", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  name: text("name"),
  email: text("email").unique(),
  emailVerified: timestamp("email_verified", { mode: "date" }),
  image: text("image"),
  role: text("role", { enum: ["user", "admin"] }).notNull().default("user"),
  createdAt: timestamp("created_at", { mode: "date" }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { mode: "date" }).notNull().defaultNow(),
})

// ── better-auth tables ────────────────────────────────────────────────

export const session = pgTable("session", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  token: text("token").notNull().unique(),
  expiresAt: timestamp("expires_at", { mode: "date" }).notNull(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  createdAt: timestamp("created_at", { mode: "date" }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { mode: "date" }).notNull().defaultNow(),
})

export const account = pgTable("account", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  issuer: text("issuer"),
  accountId: text("account_id").notNull(),
  providerId: text("provider_id").notNull(),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  accessTokenExpiresAt: timestamp("access_token_expires_at", { mode: "date" }),
  refreshTokenExpiresAt: timestamp("refresh_token_expires_at", { mode: "date" }),
  scope: text("scope"),
  idToken: text("id_token"),
  password: text("password"),
  createdAt: timestamp("created_at", { mode: "date" }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { mode: "date" }).notNull().defaultNow(),
})

export const verification = pgTable("verification", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: timestamp("expires_at", { mode: "date" }).notNull(),
  createdAt: timestamp("created_at", { mode: "date" }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { mode: "date" }).notNull().defaultNow(),
})

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

export const classroom = pgTable(
  "classroom",
  {
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
  },
  (table) => [index("classroom_user_idx").on(table.userId)],
)

export const subject = pgTable(
  "subject",
  {
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
  },
  (table) => [index("subject_user_idx").on(table.userId)],
)

export const schedule = pgTable(
  "schedule",
  {
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
  },
  (table) => [
    index("schedule_user_subject_idx").on(table.userId, table.subjectId),
    index("schedule_user_classroom_idx").on(table.userId, table.classroomId),
  ],
)

export const gradeWeight = pgTable(
  "grade_weight",
  {
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
  },
  (table) => [index("grade_weight_user_idx").on(table.userId)],
)

export const siswa = pgTable(
  "siswa",
  {
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
  },
  (table) => [index("siswa_classroom_user_idx").on(table.classroomId, table.userId)],
)

export const journal = pgTable(
  "journal",
  {
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
  },
  (table) => [index("journal_user_idx").on(table.userId)],
)

export const attendance = pgTable(
  "attendance",
  {
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
  },
  (table) => [index("attendance_user_idx").on(table.userId)],
)

export const assessment = pgTable(
  "assessment",
  {
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
  },
  (table) => [
    index("assessment_user_classroom_idx").on(table.userId, table.classroomId),
    index("assessment_user_subject_idx").on(table.userId, table.subjectId),
  ],
)

export const grade = pgTable(
  "grade",
  {
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
  },
  (table) => [
    index("grade_assessment_idx").on(table.assessmentId),
    uniqueIndex("grade_assessment_siswa_uq").on(table.assessmentId, table.siswaId),
    index("grade_user_idx").on(table.userId),
  ],
)

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

export const biodataSiswa = pgTable("biodata_siswa", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  nama: text("nama").notNull(),
  alamat: text("alamat"),
  nohpOrtu: text("nohp_ortu"),
  namaAyah: text("nama_ayah"),
  namaIbu: text("nama_ibu"),
  statusPernikahan: text("status_pernikahan", {
    enum: ["Menikah", "Cerai Hidup", "Cerai Meninggal"],
  }),
  kondisiKeluarga: text("kondisi_keluarga", {
    enum: ["Anak Yatim", "Anak Piatu", "Anak Yatim Piatu"],
  }),
  fotoRumah: text("foto_rumah"),
  siswaId: text("siswa_id").references(() => siswa.id, { onDelete: "set null" }),
  createdAt: timestamp("created_at", { mode: "date" }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { mode: "date" }).notNull().defaultNow(),
})
