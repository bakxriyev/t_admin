"use client";
import { EntityForm } from "@/components/shared/EntityForm";
import { testimonialSchema } from "@/lib/validations";
import { testimonialFields } from "@/lib/constants";

export default function CreateTestimonialPage() {
  return (
    <EntityForm
      schema={testimonialSchema}
      apiEndpoint="/api/testimonials"
      redirectPath="/testimonials"
      title="Yangi Fikr"
      editTitle="Fikrni tahrirlash"
      fields={testimonialFields}
    />
  );
}
