"use client";
import { EntityForm } from "@/components/shared/EntityForm";
import { courseOfferSchema } from "@/lib/validations";
import { courseOfferFields } from "@/lib/constants";

export default function CreateCourseOfferPage() {
  return (
    <EntityForm
      schema={courseOfferSchema}
      apiEndpoint="/api/courses/offers"
      redirectPath="/courses-offers"
      title="Yangi Kurs"
      editTitle="Kursni tahrirlash"
      fields={courseOfferFields}
    />
  );
}
