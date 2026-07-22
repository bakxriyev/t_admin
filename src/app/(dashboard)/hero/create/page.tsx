"use client";
import { EntityForm } from "@/components/shared/EntityForm";
import { heroSchema } from "@/lib/validations";
import { heroFields } from "@/lib/constants";

export default function CreateHeroPage() {
  return (
    <EntityForm
      schema={heroSchema}
      apiEndpoint="/api/hero"
      redirectPath="/hero"
      title="Yangi Hero Slayd"
      editTitle="Hero Slaydni tahrirlash"
      fields={heroFields}
    />
  );
}
