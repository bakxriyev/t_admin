"use client";
import { useParams } from "next/navigation";
import { EntityForm } from "@/components/shared/EntityForm";
import { videoReviewSchema } from "@/lib/validations";
import { videoReviewFields } from "@/lib/constants";

export default function EditVideoReviewPage() {
  const params = useParams();
  return (
    <EntityForm
      schema={videoReviewSchema}
      apiEndpoint="/api/video-reviews"
      redirectPath="/video-reviews"
      title="Yangi Video Sharh"
      editTitle="Video Sharhni tahrirlash"
      fields={videoReviewFields}
      isEdit={true}
    />
  );
}
