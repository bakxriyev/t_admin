"use client";
import { useParams } from "next/navigation";
import { EntityForm } from "@/components/shared/EntityForm";
import { testimonialSchema } from "@/lib/validations";
import { testimonialFields } from "@/lib/constants";

export default function EditTestimonialPage() {
  const params = useParams();
  return (
    <EntityForm
      schema={testimonialSchema}
      apiEndpoint="/api/testimonials"
      redirectPath="/testimonials"
      title="Yangi Fikr"
      editTitle="Fikrni tahrirlash"
      fields={testimonialFields}
      isEdit={true}
    />
  );
}
