import { getCertificateByPublicId } from "@/lib/db";
import { notFound } from "next/navigation";

interface Props {
  params: Promise<{ certificateId: string }>;
}

export default async function VerifyPage({ params }: Props) {
  const { certificateId } = await params;
  const cert = await getCertificateByPublicId(certificateId);

  if (!cert) {
    notFound();
  }

  return (
    <div className="py-16 sm:py-24">
      <div className="mx-auto max-w-lg px-4">
        <div className="glass-card overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-br from-green-500 to-emerald-600 px-6 py-8 text-center text-white">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm">
              <svg className="h-9 w-9" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 01-1.043 3.296 3.745 3.745 0 01-3.296 1.043A3.745 3.745 0 0112 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 01-3.296-1.043 3.746 3.746 0 01-1.043-3.296A3.745 3.745 0 013 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 011.043-3.296 3.746 3.746 0 013.296-1.043A3.746 3.746 0 0112 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 013.296 1.043 3.746 3.746 0 011.043 3.296A3.745 3.745 0 0121 12z" />
              </svg>
            </div>
            <h1 className="text-xl font-bold">Certificate Verified</h1>
            <p className="mt-1 text-sm text-white/80">
              This certificate is authentic and was issued by IntelliForge Learning.
            </p>
          </div>

          {/* Details */}
          <div className="space-y-4 p-6">
            <Detail label="Recipient" value={cert.user_name} />
            <Detail label="Course" value={cert.training_session} />
            <Detail label="Completion Date" value={cert.completion_date} />
            <Detail label="Instructor" value={cert.instructor_name} />
            <Detail
              label="Issued On"
              value={new Date(cert.generated_at).toLocaleDateString("en-US", {
                month: "long",
                day: "numeric",
                year: "numeric",
              })}
            />
            <div className="border-t pt-4" style={{ borderColor: "var(--card-border)" }}>
              <p className="text-[10px] font-mono break-all" style={{ color: "var(--muted)" }}>
                Certificate ID: {cert.certificate_id}
              </p>
            </div>
          </div>
        </div>

        <p className="mt-6 text-center text-xs" style={{ color: "var(--muted)" }}>
          Verified by{" "}
          <a
            href="https://learning.intelliforge.tech"
            className="font-semibold text-primary-600 hover:underline"
          >
            IntelliForge Learning
          </a>
        </p>
      </div>
    </div>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-4">
      <span className="text-sm font-medium shrink-0" style={{ color: "var(--muted)" }}>
        {label}
      </span>
      <span className="text-sm font-semibold text-right" style={{ color: "var(--foreground)" }}>
        {value}
      </span>
    </div>
  );
}
