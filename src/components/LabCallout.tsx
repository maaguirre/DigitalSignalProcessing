import type { ReactNode } from "react";
import { type Language, pick } from "../i18n.ts";
import { type CalloutVariant, calloutLabel } from "../content/labTypes.ts";

const icon: Record<CalloutVariant, string> = {
  tip: "💡",
  warning: "⚠",
  note: "✎",
  check: "✓",
};

// A highlighted aside — tip / warning / note / verification check. Used both as
// a standalone section and inline inside a step.
export default function LabCallout({
  variant,
  title,
  children,
  language,
}: {
  variant: CalloutVariant;
  title?: string;
  children: ReactNode;
  language: Language;
}) {
  return (
    <div className={`callout callout--${variant}`}>
      <span className="callout-icon" aria-hidden="true">
        {icon[variant]}
      </span>
      <div className="callout-body">
        <span className="callout-title">
          {title ?? pick(calloutLabel[variant], language)}
        </span>
        <p className="callout-text">{children}</p>
      </div>
    </div>
  );
}
