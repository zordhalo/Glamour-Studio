CREATE SCHEMA IF NOT EXISTS "public";


CREATE TABLE "public"."payments" (
                                     "payment_id" integer NOT NULL,
                                     "appointment_id" integer NOT NULL,
                                     "user_id" integer NOT NULL,
                                     "amount" decimal NOT NULL,
                                     "status" varchar NOT NULL,
                                     "paid_at" date NOT NULL,
                                     PRIMARY KEY ("payment_id")
);



CREATE TABLE "public"."appointment_statuses" (
                                                 "status_id" integer NOT NULL,
                                                 "name" varchar NOT NULL,
                                                 PRIMARY KEY ("status_id")
);



CREATE TABLE "public"."users" (
                                  "user_id" integer,
                                  "name" varchar NOT NULL,
                                  "surname" varchar NOT NULL,
                                  "email" varchar UNIQUE,
                                  "phone_num" varchar,
                                  "password_hash" varchar NOT NULL,
    -- default = "user"
                                  "role" varchar NOT NULL,
                                  PRIMARY KEY ("user_id")
);

COMMENT ON COLUMN "public"."users"."role" IS 'default = "user"';


CREATE TABLE "public"."appointments" (
                                         "appointment_id" integer NOT NULL,
                                         "user_id" integer NOT NULL,
                                         "service_id" integer,
                                         "status_id" integer NOT NULL,
                                         "location" varchar NOT NULL,
                                         "scheduled_at" date NOT NULL,
                                         "description" text,
                                         PRIMARY KEY ("appointment_id")
);



CREATE TABLE "public"."availability_slots" (
                                               "slot_id" integer NOT NULL,
                                               "user_id" integer NOT NULL,
                                               "service_id" integer NOT NULL,
                                               "start_time" date NOT NULL,
                                               "end_time" date NOT NULL,
                                               "is_booked" boolean NOT NULL,
                                               PRIMARY KEY ("slot_id")
);



CREATE TABLE "public"."services" (
                                     "service_id" integer NOT NULL,
                                     "name" varchar,
                                     "description" text,
                                     "duration_min" integer,
                                     "price" decimal,
                                     PRIMARY KEY ("service_id")
);



CREATE TABLE "public"."notifications" (
                                          "notif_id" integer NOT NULL,
                                          "user_id" integer NOT NULL,
                                          "appointment_id" integer NOT NULL,
                                          "type" enum NOT NULL,
                                          "message" text NOT NULL,
                                          "sent_at" date NOT NULL,
                                          PRIMARY KEY ("notif_id")
);



CREATE TABLE "public"."reviews" (
                                    "review_id" integer NOT NULL,
                                    "appointment_id" integer NOT NULL,
                                    "user_id" integer NOT NULL,
                                    "rating" integer NOT NULL,
                                    "comment" text NOT NULL,
                                    "created_at" date NOT NULL,
                                    PRIMARY KEY ("review_id")
);



CREATE TABLE "public"."calendar_tokens" (
                                            "token_id" integer NOT NULL,
                                            "user_id" integer NOT NULL,
                                            "provider" varchar NOT NULL,
                                            "access_token" text NOT NULL,
                                            "refresh_token" text NOT NULL,
                                            "expires_at" date NOT NULL,
                                            PRIMARY KEY ("token_id")
);



ALTER TABLE "public"."appointments"
    ADD CONSTRAINT "fk_appointments_appointment_id_payments_appointment_id" FOREIGN KEY("appointment_id") REFERENCES "public"."payments"("appointment_id");

ALTER TABLE "public"."appointments"
    ADD CONSTRAINT "fk_appointments_status_id_appointment_statuses_status_id" FOREIGN KEY("status_id") REFERENCES "public"."appointment_statuses"("status_id");

ALTER TABLE "public"."appointments"
    ADD CONSTRAINT "fk_appointments_user_id_users_user_id" FOREIGN KEY("user_id") REFERENCES "public"."users"("user_id");

ALTER TABLE "public"."users"
    ADD CONSTRAINT "fk_users_user_id_payments_user_id" FOREIGN KEY("user_id") REFERENCES "public"."payments"("user_id");

ALTER TABLE "public"."users"
    ADD CONSTRAINT "fk_users_user_id_availability_slots_user_id" FOREIGN KEY("user_id") REFERENCES "public"."availability_slots"("user_id");

ALTER TABLE "public"."services"
    ADD CONSTRAINT "fk_services_service_id_appointments_service_id" FOREIGN KEY("service_id") REFERENCES "public"."appointments"("service_id");

ALTER TABLE "public"."services"
    ADD CONSTRAINT "fk_services_service_id_availability_slots_service_id" FOREIGN KEY("service_id") REFERENCES "public"."availability_slots"("service_id");

ALTER TABLE "public"."appointments"
    ADD CONSTRAINT "fk_appointments_appointment_id_notifications_appointment_id" FOREIGN KEY("appointment_id") REFERENCES "public"."notifications"("appointment_id");

ALTER TABLE "public"."users"
    ADD CONSTRAINT "fk_users_user_id_notifications_user_id" FOREIGN KEY("user_id") REFERENCES "public"."notifications"("user_id");

ALTER TABLE "public"."users"
    ADD CONSTRAINT "fk_users_user_id_reviews_user_id" FOREIGN KEY("user_id") REFERENCES "public"."reviews"("user_id");

ALTER TABLE "public"."appointments"
    ADD CONSTRAINT "fk_appointments_appointment_id_reviews_appointment_id" FOREIGN KEY("appointment_id") REFERENCES "public"."reviews"("appointment_id");

ALTER TABLE "public"."users"
    ADD CONSTRAINT "fk_users_user_id_calendar_tokens_user_id" FOREIGN KEY("user_id") REFERENCES "public"."calendar_tokens"("user_id");
