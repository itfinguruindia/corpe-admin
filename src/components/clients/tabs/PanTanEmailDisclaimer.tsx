import { Mail } from "lucide-react";

interface PanTanEmailDisclaimerProps {
  officeEmail?: string;
  variant?: "admin" | "client";
}

export function PanTanEmailDisclaimer({
  officeEmail,
  variant = "client",
}: PanTanEmailDisclaimerProps) {
  const trimmedEmail = officeEmail?.trim() || "";

  const clientText = trimmedEmail ? (
    <>
      This document will be sent directly to your company email address that you
      provided in the <strong>Corporate Structure</strong> step:{" "}
      <strong className="text-[#157A6E]">{trimmedEmail}</strong>. It is not
      available for download on this page. Please check your inbox and spam
      folder once CorpE has processed your registration.
    </>
  ) : (
    <>
      This document will be sent directly to the company email address from your{" "}
      <strong>Corporate Structure</strong> step. No company email is on file yet
      - please complete and verify your Company Email in Corporate Structure.
    </>
  );

  const adminText = trimmedEmail ? (
    <>
      This document is delivered directly to the client&apos;s company email
      from Corporate Structure:{" "}
      <strong className="text-[#F46A45]">{trimmedEmail}</strong>. Upload and
      download are not required for PAN/TAN on this portal.
    </>
  ) : (
    <>
      This document is delivered directly to the client&apos;s company email
      from Corporate Structure. No company email is on file yet - ask the client
      to complete and verify Company Email in Corporate Structure.
    </>
  );

  return (
    <div className="mt-2 max-w-2xl rounded-lg border border-sky-200 bg-sky-50 px-4 py-3 text-sm leading-relaxed text-slate-700">
      <div className="flex items-start gap-2">
        <Mail size={18} className="mt-0.5 shrink-0 text-sky-600" aria-hidden />
        <p className="mb-0">{variant === "admin" ? adminText : clientText}</p>
      </div>
    </div>
  );
}
