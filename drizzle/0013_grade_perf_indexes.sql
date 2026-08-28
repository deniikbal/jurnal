CREATE INDEX "siswa_classroom_user_idx" ON "siswa" USING btree ("classroom_id","user_id");--> statement-breakpoint
CREATE INDEX "schedule_user_subject_idx" ON "schedule" USING btree ("user_id","subject_id");--> statement-breakpoint
CREATE INDEX "schedule_user_classroom_idx" ON "schedule" USING btree ("user_id","classroom_id");--> statement-breakpoint
CREATE INDEX "assessment_user_classroom_idx" ON "assessment" USING btree ("user_id","classroom_id");--> statement-breakpoint
CREATE INDEX "assessment_user_subject_idx" ON "assessment" USING btree ("user_id","subject_id");--> statement-breakpoint
CREATE INDEX "grade_assessment_idx" ON "grade" USING btree ("assessment_id");--> statement-breakpoint
CREATE UNIQUE INDEX "grade_assessment_siswa_uq" ON "grade" USING btree ("assessment_id","siswa_id");
