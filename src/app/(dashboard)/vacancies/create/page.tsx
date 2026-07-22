"use client";

import { EntityForm } from "@/components/shared/EntityForm";
import { vacancySchema } from "@/lib/validations";

const fields = [
  { name: "title", label: "Sarlavha", type: "multilang" as const, placeholder: "Sarlavha" },
  { name: "description", label: "Tavsif", type: "multilang-textarea" as const, placeholder: "Tavsif" },
  { name: "requirements", label: "Talablar", type: "multilang-textarea" as const, placeholder: "Talablar" },
  {
    name: "type", label: "Turi", type: "select" as const,
    options: [
      { value: "full_time", label: "To'liq vaqt" },
      { value: "part_time", label: "Yarim vaqt" },
      { value: "internship", label: "Amaliyot" },
    ],
  },
  { name: "salary", label: "Maosh", type: "text" as const, placeholder: "Masalan: $1000-2000" },
  { name: "is_active", label: "Faol", type: "boolean" as const },
];

export default function CreateVacancyPage() {
  return (
    <EntityForm
      schema={vacancySchema}
      apiEndpoint="/api/vacancies"
      redirectPath="/vacancies"
      title="Yangi vakansiya"
      editTitle="Vakansiyani tahrirlash"
      fields={fields}
    />
  );
}
