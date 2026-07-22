"use client";
import { useParams } from "next/navigation";
import { EntityForm } from "@/components/shared/EntityForm";
import { courseOfferSchema } from "@/lib/validations";
import { courseOfferFields } from "@/lib/constants";

export default function EditCourseOfferPage() {
  const params = useParams();
  return (
    <EntityForm
      schema={courseOfferSchema}
      apiEndpoint="/api/courses/offers"
      redirectPath="/courses-offers"
      title="Yangi Kurs"
      editTitle="Kursni tahrirlash"
      fields={courseOfferFields}
      isEdit={true}
    />
  );
}
