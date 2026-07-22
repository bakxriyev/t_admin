"use client";

import { EntityForm } from "@/components/shared/EntityForm";
import { reviewSchema } from "@/lib/validations";

const fields = [
  { name: "name", label: "Ism", type: "multilang" as const, placeholder: "Ism" },
  { name: "position", label: "Lavozim", type: "multilang" as const, placeholder: "Lavozim" },
  { name: "content", label: "Matn", type: "multilang-textarea" as const, placeholder: "Sharh matni" },
  { name: "rating", label: "Reyting (1-5)", type: "number" as const },
  { name: "photo", label: "Rasm", type: "file" as const },
  { name: "is_active", label: "Faol", type: "boolean" as const },
];

export default function EditReviewPage() {
  return (
    <EntityForm
      schema={reviewSchema}
      apiEndpoint="/api/reviews"
      redirectPath="/reviews"
      title="Yangi sharh"
      editTitle="Sharhni tahrirlash"
      fields={fields}
      isEdit
    />
  );
}
