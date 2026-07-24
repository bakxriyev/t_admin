"use client";
import { EntityForm } from "@/components/shared/EntityForm";
import { statisticSchema } from "@/lib/validations";
import { statisticFields } from "@/lib/constants";

export default function CreateStatisticPage() {
  return (
    <EntityForm
      schema={statisticSchema}
      apiEndpoint="/api/statistics"
      redirectPath="/statistics"
      title="Yangi Statistika"
      editTitle="Statistikani tahrirlash"
      fields={statisticFields}
    />
  );
}
