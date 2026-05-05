import {
  pgTable,
  text,
  timestamp,
  boolean,
  jsonb,
  uuid,
  integer,
} from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  email: text('email').notNull().unique(),
  name: text('name').notNull(),
  passwordHash: text('password_hash'),
  role: text('role').notNull(), // gp | specialist | patient | government | researcher | admin
  institution: text('institution'),
  stateIndia: text('state_india'),
  invitedBy: uuid('invited_by'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

export const patientProfiles = pgTable('patient_profiles', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id),
  dateOfBirth: text('date_of_birth'), // ISO date string
  gender: text('gender'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

export const cases = pgTable('cases', {
  id: uuid('id').primaryKey().defaultRandom(),
  createdBy: uuid('created_by').notNull().references(() => users.id),
  patientId: uuid('patient_id').references(() => users.id),
  caseText: text('case_text').notNull(),
  aiResult: jsonb('ai_result'), // full CaseResult, immutable after write
  status: text('status').notNull().default('draft'), // draft | confirmed | archived
  confirmedAt: timestamp('confirmed_at'),
  confirmedDiagnosisName: text('confirmed_diagnosis_name'),
  confirmedOmimId: text('confirmed_omim_id'),
  confirmedOrphaCode: text('confirmed_orpha_code'),
  confirmedGene: text('confirmed_gene'),
  confirmedVariant: text('confirmed_variant'),
  symptomOnsetDate: text('symptom_onset_date'), // ISO date string
  doctorState: text('doctor_state'), // denormalized from doctor at confirm time
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

// Append-only — NEVER UPDATE, only INSERT
export const consents = pgTable('consents', {
  id: uuid('id').primaryKey().defaultRandom(),
  patientUserId: uuid('patient_user_id').notNull().references(() => users.id),
  consentType: text('consent_type').notNull(), // epidemiology | research_cohort | research_contact
  granted: boolean('granted').notNull(),
  grantedAt: timestamp('granted_at').notNull().defaultNow(),
});

export const patientInviteTokens = pgTable('patient_invite_tokens', {
  id: uuid('id').primaryKey().defaultRandom(),
  token: text('token').notNull().unique(),
  caseId: uuid('case_id').notNull().references(() => cases.id),
  createdBy: uuid('created_by').notNull().references(() => users.id),
  claimedBy: uuid('claimed_by').references(() => users.id),
  expiresAt: timestamp('expires_at').notNull(),
  claimedAt: timestamp('claimed_at'),
});

export const consultations = pgTable('consultations', {
  id: uuid('id').primaryKey().defaultRandom(),
  caseId: uuid('case_id').notNull().references(() => cases.id),
  requestingDoctorId: uuid('requesting_doctor_id').notNull().references(() => users.id),
  specialistId: uuid('specialist_id').notNull().references(() => users.id),
  status: text('status').notNull().default('pending'), // pending | completed
  specialistNotes: text('specialist_notes'),
  specialistRevisedDifferential: jsonb('specialist_revised_differential'),
  requestNote: text('request_note'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

export const researchRequests = pgTable('research_requests', {
  id: uuid('id').primaryKey().defaultRandom(),
  researcherId: uuid('researcher_id').notNull().references(() => users.id),
  queryDiseaseName: text('query_disease_name').notNull(),
  queryOmimId: text('query_omim_id'),
  queryGene: text('query_gene'),
  queryVariant: text('query_variant'),
  queryState: text('query_state'),
  matchedCount: integer('matched_count').notNull(), // snapshot at query time
  purpose: text('purpose').notNull(),
  institution: text('institution').notNull(),
  irbReference: text('irb_reference').notNull(),
  dataFieldsRequested: text('data_fields_requested').notNull(),
  status: text('status').notNull().default('pending'), // pending | approved | rejected | data_released
  adminNotes: text('admin_notes'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

export const researchRequestConsents = pgTable('research_request_consents', {
  id: uuid('id').primaryKey().defaultRandom(),
  researchRequestId: uuid('research_request_id').notNull().references(() => researchRequests.id),
  caseId: uuid('case_id').notNull().references(() => cases.id),
  treatingDoctorId: uuid('treating_doctor_id').notNull().references(() => users.id),
  patientReConfirmed: boolean('patient_re_confirmed'),
  reConfirmedAt: timestamp('re_confirmed_at'),
  dataReleasedAt: timestamp('data_released_at'),
});

// Append-only event log — timeline + audit trail
export const caseTimelineEvents = pgTable('case_timeline_events', {
  id: uuid('id').primaryKey().defaultRandom(),
  caseId: uuid('case_id').notNull().references(() => cases.id),
  eventType: text('event_type').notNull(), // case_created | diagnosis_confirmed | patient_invited | patient_claimed | consult_requested | consult_completed | research_consent_requested | research_data_released
  actorUserId: uuid('actor_user_id').references(() => users.id),
  metadata: jsonb('metadata'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Case = typeof cases.$inferSelect;
export type NewCase = typeof cases.$inferInsert;
export type Consultation = typeof consultations.$inferSelect;
export type ResearchRequest = typeof researchRequests.$inferSelect;
export type Consent = typeof consents.$inferSelect;
export type CaseTimelineEvent = typeof caseTimelineEvents.$inferSelect;
