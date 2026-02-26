// @ts-nocheck
import React, { useMemo, useRef } from "react";
import { normalizeScopeBridgeState, nextStepLabel } from "./scopeBridgeUtils";

const MAX_SEVERITY = 3;
const valueMap = [0, 1, 2, 3];

const BRAND = {
  name: "Renewal Claim Solutions",
  tagline: "Recovery starts here.",
  website: "renewalclaimsolutions.com",
  phone: "(877) 630-6273",
  email: "info@renewalclaims.com",
  logoSrc: "/renewal-logo-transparent.png",
  logoFallbackSrc: "/renewal-logo-graphics.png",
};

const BRAND_LOGO_TERTIARY_FALLBACK = "/renewal-logo-primary.jpg";

const BRAND_CARES_MEDIA = {
  fieldTech: "/renewal-cares-field-tech.png",
  careSpecialist: "/renewal-cares-specialist-female-partial.png",
  homeBanner: "/renewal-cares-home-banner.png",
};

const toAbsoluteAssetUrl = (src) => {
  if (!src) return src;
  if (/^(https?:|data:|blob:)/i.test(src)) return src;
  try {
    return new URL(src, window.location.href).href;
  } catch {
    return src;
  }
};

const interpolateColor = (color1, color2, factor) => {
  const clamp = (v) => Math.max(0, Math.min(1, v));
  const f = clamp(factor);
  const toHex = (c) => {
    const h = Math.round(c).toString(16);
    return h.length === 1 ? `0${h}` : h;
  };
  const r1 = parseInt(color1.slice(1, 3), 16);
  const g1 = parseInt(color1.slice(3, 5), 16);
  const b1 = parseInt(color1.slice(5, 7), 16);
  const r2 = parseInt(color2.slice(1, 3), 16);
  const g2 = parseInt(color2.slice(3, 5), 16);
  const b2 = parseInt(color2.slice(5, 7), 16);
  const r = r1 + f * (r2 - r1);
  const g = g1 + f * (g2 - g1);
  const b = b1 + f * (b2 - b1);
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
};

const getSliderBackground = (value, start, end, disabled) => {
  if (disabled) return "#e5e7eb";
  const rawValue = Number(value || 0);
  const position = (rawValue / MAX_SEVERITY) * 100;
  const mappedValue = valueMap[rawValue] || 0;
  const factor = mappedValue / MAX_SEVERITY;
  const mid = interpolateColor(start, end, factor);
  return `linear-gradient(to right, ${start}, ${mid} ${position}%, #e5e7eb ${position}%)`;
};

const sliderClasses =
  "w-full h-1 rounded-full appearance-none outline-none";

const LOSS_SEVERITY_CONFIG = [
  {
    key: "fire",
    label: "Fire",
    border: "border-gradient-fire",
    colorStart: "#fef3c7",
    colorEnd: "#f97316",
    seedField: "Heat",
    fields: ["Heat", "Soot", "Odor", "Extinguisher Powder", "Remediation Debris"],
  },
  {
    key: "water",
    label: "Water",
    border: "border-gradient-water",
    colorStart: "#dbeafe",
    colorEnd: "#3b82f6",
    seedField: "Water",
    fields: [
      "Water",
      "Humidity",
      "Musty Smell",
      "Visible Mildew",
      "Visible Mold",
      "Sprinkler Chemical",
      "Flood Cut Debris",
    ],
  },
];

const Slider = ({ value, onChange, colorStart, colorEnd, disabled }) => (
  <input
    type="range"
    min="0"
    max={MAX_SEVERITY}
    step="1"
    value={value}
    disabled={disabled}
    onChange={(e) => onChange(Number(e.target.value))}
    className={sliderClasses}
    style={{ background: getSliderBackground(value, colorStart, colorEnd, disabled) }}
  />
);

const SERVICE_HIGHLIGHTS = [
  "24/7 claim support",
  "Photo barcoding & inventory",
  "Specialized cleaning & deodorizing",
  "Flexible storage & delivery",
];

const SdsStableImage = React.memo(function SdsStableImage({
  src,
  alt,
  className,
  fallbackSrc,
  tertiaryFallbackSrc,
  onFinalError,
  loading = "lazy",
  fetchPriority = "auto",
  decoding = "async",
}) {
  const fallbackIndexRef = React.useRef(0);
  const finalErrorFiredRef = React.useRef(false);
  const resolvedSrc = toAbsoluteAssetUrl(src);
  const fallbackCandidates = React.useMemo(
    () => [fallbackSrc, tertiaryFallbackSrc].filter(Boolean).map(toAbsoluteAssetUrl),
    [fallbackSrc, tertiaryFallbackSrc]
  );

  React.useEffect(() => {
    fallbackIndexRef.current = 0;
    finalErrorFiredRef.current = false;
  }, [resolvedSrc, fallbackCandidates.join("|")]);

  const handleError = (e) => {
    while (fallbackIndexRef.current < fallbackCandidates.length) {
      const candidate = fallbackCandidates[fallbackIndexRef.current++];
      if (!candidate) continue;
      if (candidate === e.currentTarget.getAttribute("src")) continue;
      e.currentTarget.src = candidate;
      return;
    }

    if (!finalErrorFiredRef.current) {
      finalErrorFiredRef.current = true;
      onFinalError?.();
    }
  };

  return (
    <img
      src={resolvedSrc}
      alt={alt}
      className={className}
      loading={loading}
      decoding={decoding}
      fetchPriority={fetchPriority}
      onError={handleError}
    />
  );
});

SdsStableImage.displayName = "SdsStableImage";

const SdsBrandMark = React.memo(function SdsBrandMark({
  brand = BRAND,
  large = false,
  className = "",
  loading = "eager",
}) {
  const [showTextFallback, setShowTextFallback] = React.useState(false);
  const frameClass = large ? "h-24 w-full" : "h-[4.05rem] w-[18.9rem]";
  const imgClass = large ? "h-24 w-auto max-w-full object-contain" : "h-[4.05rem] w-auto max-w-full object-contain";

  React.useEffect(() => {
    setShowTextFallback(false);
  }, [brand.logoSrc, brand.logoFallbackSrc]);

  return (
    <div className={`${frameClass} flex items-center justify-center ${className}`}>
      {!showTextFallback ? (
        <SdsStableImage
          src={brand.logoSrc}
          alt={brand.name}
          className={imgClass}
          fallbackSrc={brand.logoFallbackSrc}
          tertiaryFallbackSrc={BRAND_LOGO_TERTIARY_FALLBACK}
          loading={loading}
          fetchPriority={loading === "eager" ? "high" : "auto"}
          decoding="sync"
          onFinalError={() => setShowTextFallback(true)}
        />
      ) : null}
      {showTextFallback ? (
        <div className={`text-slate-700 font-semibold ${large ? "text-2xl" : "text-sm"}`}>{brand.name}</div>
      ) : null}
    </div>
  );
});

SdsBrandMark.displayName = "SdsBrandMark";

const SdsBrandMediaCard = React.memo(function SdsBrandMediaCard({
  src,
  alt,
  className,
  imageClass,
  fallbackSrc,
  tertiaryFallbackSrc,
  loading = "lazy",
}) {
  const [imageMissing, setImageMissing] = React.useState(false);

  React.useEffect(() => {
    setImageMissing(false);
  }, [src, fallbackSrc, tertiaryFallbackSrc]);

  return (
    <div className={`relative overflow-hidden rounded-2xl border border-slate-200 bg-white ${className || ""}`}>
      {!imageMissing ? (
        <SdsStableImage
          src={src}
          alt={alt}
          className={imageClass || "h-full w-full object-contain object-center"}
          fallbackSrc={fallbackSrc}
          tertiaryFallbackSrc={tertiaryFallbackSrc}
          loading={loading}
          onFinalError={() => setImageMissing(true)}
        />
      ) : null}
      {imageMissing ? (
        <div className="absolute inset-0 flex items-center justify-center px-4 text-center text-xs font-semibold text-slate-500">
          {`Add image: ${src}`}
        </div>
      ) : null}
    </div>
  );
});

SdsBrandMediaCard.displayName = "SdsBrandMediaCard";

const SdsWidgetSection = ({ title, subtitle, children, className }) => (
  <div className={`rounded-2xl border border-slate-200 bg-white p-4 shadow-sm ${className || ""}`}>
    <div className="flex flex-col gap-1 mb-3">
      <div className="text-sm font-bold text-sky-600">{title}</div>
      {subtitle && <div className="text-xs text-slate-500">{subtitle}</div>}
    </div>
    {children}
  </div>
);

const SdsBrandHeader = ({ brand = BRAND }) => (
  <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-4">
    <div className="flex items-center gap-3">
      <SdsBrandMark brand={brand} loading="eager" />
    </div>
    <div className="text-xs text-slate-500 text-right">
      <div>{brand.website}</div>
      {(brand.phone || brand.email) && (
        <div>{[brand.phone, brand.email].filter(Boolean).join(" • ")}</div>
      )}
    </div>
  </div>
);

const SdsBrandFooter = ({ brand = BRAND }) => (
  <div className="border-t border-slate-200 pt-3 text-[11px] text-slate-500 flex justify-between">
    <span>{brand.name}</span>
    <span>{brand.website}</span>
  </div>
);

const SdsPageMarketingWidget = ({ brand = BRAND }) => (
  <div className="print-avoid rounded-xl border border-slate-200 bg-white px-3 py-2">
    <div className="flex items-center justify-between gap-3">
      <div className="flex min-w-0 items-center gap-3">
        <div className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50 px-2 py-1">
          <span className="h-3 w-3 rounded-full bg-emerald-500" />
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-700">RCS</span>
        </div>
        <div className="min-w-0">
          <div className="text-[11px] font-semibold text-slate-700">{brand.name}</div>
          <div className="truncate text-[10px] text-slate-500">
            Compassion-driven service from first call to final delivery.
          </div>
        </div>
      </div>
      <div className="shrink-0 rounded-full border border-slate-200 bg-slate-50 px-2 py-1 text-[10px] font-semibold text-slate-600">
        fire | smoke | water | mold
      </div>
    </div>
  </div>
);

const SdsPageBlock = ({ children, brand = BRAND, showHeader = true, showMarketingWidget = true }) => (
  <div className="print-page space-y-5">
    <div className="h-[3px] w-full rounded-full bg-[linear-gradient(90deg,#06b6d4_0%,#0ea5e9_45%,#22c55e_100%)]" aria-hidden />
    {showHeader ? <SdsBrandHeader brand={brand} /> : null}
    {children}
    {showMarketingWidget ? <SdsPageMarketingWidget brand={brand} /> : null}
    <SdsBrandFooter brand={brand} />
  </div>
);

const SdsSummaryField = ({ label, value }) => (
  <div className="rounded-xl border border-sky-100 bg-white px-3 py-2">
    <div className="text-[10px] font-bold uppercase tracking-widest text-slate-400">{label}</div>
    <div className="mt-1 text-sm font-semibold text-slate-800">{value || "—"}</div>
  </div>
);

const BLOCKER_ACTION_COPY = {
  "Wants Everything Replaced": "Confirm replacement-only expectation with customer.",
  "Not sure if submitting a claim": "Confirm whether a claim will be submitted.",
  "Customer Wants Estimate": "Awaiting estimate details from customer request.",
  "Won't Sign Authorization": "Awaiting signed authorization.",
  "Wants a cash-out": "Confirm cash-out request and eligibility.",
  "May clean themselves": "Confirm whether customer will self-clean.",
  "Limit Issue": "Resolve policy limit issue.",
  "Hasn't approved scope": "Awaiting scope approval.",
  "Adjuster Wants Estimate": "Awaiting estimate details from adjuster request.",
  "Hasn't determined coverage": "Awaiting coverage determination.",
  "Pushing another vendor": "Confirm vendor direction and next decision.",
  "Waiting on Hygienist Results": "Awaiting hygienist results.",
  "Contacting Customer": "Awaiting contact with the customer.",
  "Authorization": "Awaiting signed authorization.",
  "Scope Approval": "Awaiting scope approval.",
  "Estimate Approval": "Awaiting estimate approval.",
  "Test Results": "Awaiting test results.",
  "IH Results": "Awaiting results from hygienist.",
  "Coverage Determination": "Awaiting coverage determination.",
  "Bill To Determination": "Awaiting bill-to determination.",
  "Customer might clean it themselves": "Confirm whether the customer will self-clean.",
  "Unsure if submitting a claim": "Confirm whether a claim will be submitted.",
  "Limit Issues": "Resolve policy limit issues.",
};

const toActionOrientedBlockerText = (issue = "") => {
  const trimmed = (issue || "").toString().trim();
  if (!trimmed) return "";
  return BLOCKER_ACTION_COPY[trimmed] || `Action required: ${trimmed}.`;
};

const formatPrintableDateTime = (value = "") => {
  const text = (value || "").toString().trim();
  if (!text) return "";
  const parsed = new Date(text);
  if (Number.isNaN(parsed.getTime())) return text;
  return parsed.toLocaleString();
};

const buildLossTypeSummary = (orderTypes = [], lossDetails = {}) => {
  const types = Array.from(
    new Set((orderTypes || []).map((type) => (type || "").toString().trim()).filter(Boolean))
  );
  if (!types.length) return "";
  return types
    .map((type) => {
      const details = (lossDetails && lossDetails[type]) || {};
      const causes = Array.isArray(details.causes) ? details.causes.filter(Boolean) : [];
      const origins = Array.isArray(details.origins) ? details.origins.filter(Boolean) : [];
      const detailParts = [...causes, ...origins].map((item) => (item || "").toString().trim().toLowerCase()).filter(Boolean);
      if (!detailParts.length) return type;
      return `${type} (${detailParts.join(", ")})`;
    })
    .join(", ");
};

const wrapRoofAddress = (value = "", maxChars = 44, maxLines = 2) => {
  const text = (value || "").toString().trim();
  if (!text) return ["Address"];
  const words = text.split(/\s+/).filter(Boolean);
  const lines = [];
  let current = "";

  words.forEach((word) => {
    const candidate = current ? `${current} ${word}` : word;
    if (candidate.length <= maxChars) {
      current = candidate;
      return;
    }
    if (current) lines.push(current);
    current = word;
  });

  if (current) lines.push(current);
  if (lines.length <= maxLines) return lines;

  const kept = lines.slice(0, maxLines);
  const overflow = lines.slice(maxLines).join(" ");
  const mergedLast = `${kept[maxLines - 1]} ${overflow}`.trim();
  const truncated =
    mergedLast.length > maxChars ? `${mergedLast.slice(0, Math.max(0, maxChars - 1)).trim()}…` : mergedLast;
  kept[maxLines - 1] = truncated;
  return kept;
};

const SdsProjectSummarySection = ({
  orderName,
  primaryCustomerName,
  address,
  insuranceCompany,
  insuranceAdjuster,
  formattedDateOfLoss,
  claimNumber,
  serviceOfferings = [],
  orderTypes = [],
  lossDetails = {},
  siteInspected = false,
  scopeBridge,
}) => {
  const scopeSnapshot = normalizeScopeBridgeState(scopeBridge || {});
  const scopeNext = nextStepLabel(scopeSnapshot.nextStep);
  const activeIssues = Array.isArray(scopeSnapshot.pendingIssues) ? scopeSnapshot.pendingIssues : [];
  const normalizedServiceOfferings = Array.from(
    new Set((serviceOfferings || []).map((item) => (item || "").toString().trim()).filter(Boolean))
  );
  const lossTypeSummary = buildLossTypeSummary(orderTypes, lossDetails);
  const authMilestone = scopeSnapshot.milestones || {};
  const hasAuthorizationOnFile = !!authMilestone.authorizationOnFile;
  const authorizationAt = formatPrintableDateTime(authMilestone.authorizationOnFileAt);
  const authorizationBy = (authMilestone.authorizationOnFileBy || "").toString().trim();
  const statusCardCount = 1 + (hasAuthorizationOnFile ? 1 : 0) + 1;
  const statusGridClass = statusCardCount >= 3 ? "md:grid-cols-3" : statusCardCount === 2 ? "md:grid-cols-2" : "";
  const summaryBullets = React.useMemo(() => {
    const items = [];

    if (activeIssues.length > 0) {
      activeIssues.forEach((issue) => {
        const line = toActionOrientedBlockerText(issue);
        if (line) items.push(line);
      });
    } else {
      items.push("No active blockers at this time.");
    }

    if (scopeNext) {
      items.push(`Next step: ${scopeNext}.`);
    } else if (activeIssues.length > 0) {
      items.push("Next step: Resolve active blockers before proceeding.");
    } else {
      items.push("Next step: Proceed with project execution.");
    }

    if (scopeSnapshot.projectStatus === "red" && scopeSnapshot.statusReason) {
      items.push(`Status reason: ${scopeSnapshot.statusReason}.`);
    }

    return items;
  }, [activeIssues, scopeNext, scopeSnapshot.projectStatus, scopeSnapshot.statusReason]);
  const hasScopeSnapshot =
    !!scopeSnapshot.projectStatus ||
    (scopeSnapshot.pendingIssues || []).length > 0 ||
    !!scopeSnapshot.pickupOption ||
    !!scopeSnapshot.processingOption ||
    (scopeSnapshot.selectedGroups || []).length > 0 ||
    !!scopeSnapshot.nextStep;

  return (
    <div className="rounded-2xl border border-sky-200 bg-gradient-to-br from-sky-50 via-white to-sky-50 p-4 shadow-sm">
      <div className="mb-3 border-b border-sky-100 pb-2">
        <div className="text-sm font-bold text-sky-600">Project Summary</div>
      </div>
      <div className="grid gap-3 md:grid-cols-2">
        <div className="space-y-2">
          <SdsSummaryField label="Order Name" value={orderName} />
          <SdsSummaryField label="Customer" value={primaryCustomerName} />
          <SdsSummaryField label="Address" value={address} />
        </div>
        <div className="space-y-2">
          <SdsSummaryField label="Insurance Company" value={insuranceCompany} />
          <SdsSummaryField label="Adjuster" value={insuranceAdjuster} />
          <SdsSummaryField label="Date of Loss" value={formattedDateOfLoss} />
          <SdsSummaryField label="Claim Number" value={claimNumber} />
        </div>
      </div>
      <div className={`mt-3 grid gap-3 ${statusGridClass}`}>
        <div className="rounded-xl border border-sky-100 bg-white p-3">
          <div className="text-[11px] font-bold uppercase tracking-wider text-sky-700">Service Offerings</div>
          {normalizedServiceOfferings.length > 0 ? (
            <div className="mt-2 flex flex-wrap gap-1.5">
              {normalizedServiceOfferings.map((service) => (
                <span
                  key={service}
                  className="inline-flex items-center rounded-full border border-sky-200 bg-sky-50 px-2 py-0.5 text-[11px] font-semibold text-sky-700"
                >
                  {service}
                </span>
              ))}
            </div>
          ) : (
            <div className="mt-2 text-xs text-slate-500">No services selected yet.</div>
          )}
        </div>
        {hasAuthorizationOnFile ? (
          <div className="rounded-xl border border-emerald-200 bg-emerald-50/70 p-3">
            <div className="text-[11px] font-bold uppercase tracking-wider text-emerald-700">Authorization Status</div>
            <div className="mt-2 inline-flex items-center rounded-full border border-emerald-300 bg-white px-3 py-1 text-xs font-bold text-emerald-700">
              Signed Authorization On File
            </div>
            {authorizationBy || authorizationAt ? (
              <div className="mt-2 text-xs text-emerald-800">
                {[authorizationBy ? `By ${authorizationBy}` : "", authorizationAt].filter(Boolean).join(" • ")}
              </div>
            ) : null}
          </div>
        ) : null}
        <div className={`rounded-xl border p-3 ${siteInspected ? "border-emerald-200 bg-emerald-50/70" : "border-slate-200 bg-slate-50/70"}`}>
          <div className={`text-[11px] font-bold uppercase tracking-wider ${siteInspected ? "text-emerald-700" : "text-slate-600"}`}>
            Inspection Status
          </div>
          <div className={`mt-2 inline-flex items-center rounded-full border px-3 py-1 text-xs font-bold ${
            siteInspected
              ? "border-emerald-300 bg-white text-emerald-700"
              : "border-slate-300 bg-white text-slate-600"
          }`}>
            {siteInspected ? "Site Inspected" : "Site Inspection Pending"}
          </div>
        </div>
      </div>
      <div className="mt-3 rounded-xl border border-sky-100 bg-white p-3">
        <div className="text-[11px] font-bold uppercase tracking-wider text-sky-700">Loss Type</div>
        <div className="mt-2 text-xs leading-relaxed text-slate-700">
          {lossTypeSummary || "No loss types selected yet."}
        </div>
      </div>
      {hasScopeSnapshot ? (
        <div className="mt-4 rounded-xl border border-sky-100 bg-white p-3 space-y-2">
          <div className="rounded-lg border border-sky-100 bg-sky-50/40 px-3 py-2">
            <div className="text-[11px] font-bold uppercase tracking-wider text-sky-700">Summary & Next Steps</div>
            <ul className="mt-2 list-disc space-y-1 pl-4 text-xs leading-relaxed text-slate-700">
              {summaryBullets.map((line, idx) => (
                <li key={`scope-summary-${idx}`}>{line}</li>
              ))}
            </ul>
          </div>
        </div>
      ) : null}
      <div className="mt-4 rounded-xl border border-sky-100 bg-white p-3">
        <div className="flex justify-center">
          <div className="inline-flex items-center rounded-full border border-sky-300 bg-sky-50 px-5 py-2 text-sm font-bold text-sky-700">
            Approve
          </div>
        </div>
        <p className="mt-3 text-xs leading-relaxed text-slate-600 text-center">
          Simply reply 'Approve' if this looks good to you. If we haven&apos;t heard back within 3 days, we&apos;ll assume your approval and move forward with the project as outlined.
        </p>
      </div>
    </div>
  );
};

const SdsRestoreStoryPage = ({ brand = BRAND, media = BRAND_CARES_MEDIA, serviceHighlights = SERVICE_HIGHLIGHTS }) => (
  <SdsPageBlock brand={brand} showHeader={false}>
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
      <div className="rounded-2xl border border-slate-200 bg-white p-4">
        <div className="grid min-h-[240px] grid-cols-[170px_1fr] gap-5 items-end">
          <div className="relative h-full min-h-[200px] overflow-hidden rounded-xl bg-white">
            <SdsStableImage
              src={media.fieldTech}
              alt="Renewal Cares field specialist"
              className="absolute bottom-0 left-0 h-full w-full object-cover object-left-bottom"
              loading="lazy"
            />
          </div>
          <div className="self-center pr-2">
            <div className="text-[42px] font-bold leading-[1.02] text-slate-900">Restore. Renew. Restart.</div>
            <p className="mt-3 text-[20px] leading-relaxed text-slate-600">
              We help families recover after fire, water, and mold losses by handling pickup,
              inventory, cleaning, storage, and delivery of soft goods and belongings.
            </p>
          </div>
        </div>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        {serviceHighlights.map((item) => (
          <div key={item} className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-[15px] font-semibold text-slate-700">
            {item}
          </div>
        ))}
      </div>
    </div>
  </SdsPageBlock>
);

const SdsBrochurePage = ({ brand = BRAND, media = BRAND_CARES_MEDIA }) => (
  <SdsPageBlock brand={brand} showHeader={false}>
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="grid gap-4 lg:grid-cols-[1fr_1fr] lg:items-start">
        <div className="self-start rounded-2xl border border-slate-200 bg-white p-4">
          <div className="grid min-h-[210px] grid-cols-[108px_1fr] gap-4 items-end">
            <div className="relative h-full min-h-[168px] overflow-hidden rounded-xl bg-white">
              <SdsStableImage
                src={media.careSpecialist}
                alt="Renewal Cares support specialist"
                className="absolute bottom-0 left-0 h-full w-full object-contain object-left-bottom"
                loading="lazy"
              />
            </div>
            <div className="self-center pr-1">
              <div className="text-xs font-bold uppercase tracking-widest text-slate-400">Contact</div>
              <div className="mt-1 text-[30px] font-bold leading-tight text-slate-800">{brand.phone}</div>
              <div className="mt-1 text-lg text-slate-600">{brand.email}</div>
              <div className="text-lg text-slate-600">{brand.website}</div>
              <p className="mt-3 text-sm text-slate-500">
                Fast response, transparent communication, and claim-ready documentation.
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 text-center">
            <SdsBrandMark brand={brand} large loading="lazy" />
            <div className="mt-2 text-3xl font-semibold text-slate-700">Your trusted restoration partner</div>
            <div className="mt-1 text-xl text-slate-500">Serving Greater NYC and beyond</div>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-2">
            <SdsBrandMediaCard
              src={media.homeBanner}
              alt="Renewal Cares home banner"
              className="h-28 border-none rounded-xl bg-white"
              imageClass="h-full w-full object-contain object-center"
              fallbackSrc={brand.logoSrc}
              tertiaryFallbackSrc={BRAND_LOGO_TERTIARY_FALLBACK}
              loading="lazy"
            />
            <div className="mt-1 text-center text-sm font-medium text-slate-500">
              Compassion-driven service from first call to final delivery.
            </div>
          </div>
        </div>
      </div>
    </div>
  </SdsPageBlock>
);

export default function SdsDocument({ lossSeverity, onChange, onClose, rooms = [], orderTypes = [], lossDetails = {}, severityCodes = [], orderName = "", claimNumber = "", insuranceCompany = "", insuranceAdjuster = "", dateOfLoss = "", address = "", selectedServices = [], noeServiceOfferings = [], customers = [], familyMedicalIssues = "", soapFragAllergies = "", sdsConsiderations = [], sdsObservations = [], sdsServices = [], scopeBridge = {} }) {
  const docSeverity = lossSeverity || {};
  const printRootRef = useRef(null);

  const orderSeverityBySection = useMemo(() => {
    const map = { fire: 0, water: 0 };
    (severityCodes || []).forEach((code) => {
      const [group, levelRaw] = String(code || "").split("-");
      const level = Math.min(Math.max(Number(levelRaw) || 0, 0), MAX_SEVERITY);
      if (group === "Fire") map.fire = Math.max(map.fire, level);
      if (group === "Water") map.water = Math.max(map.water, level);
    });
    return map;
  }, [severityCodes]);

  const deriveSectionState = (section) => {
    const typeSelected = orderTypes.length ? orderTypes.includes(section.label) : false;
    const base = docSeverity[section.key] || { enabled: typeSelected, values: {} };
    const level = Number(orderSeverityBySection[section.key] || 0);
    const touched = Boolean(docSeverity?.touched);
    const values = { ...(base.values || {}) };

    // Seed one representative row from order-level severity until user edits in SDS.
    // This keeps non-selected rows hidden in the PDF.
    if (!touched && level >= 1) {
      const hasAnyExplicitValue = section.fields.some((field) => Number(values[field] ?? 0) > 0);
      if (!hasAnyExplicitValue) {
        const seedField = section.seedField || section.fields[0];
        if (seedField) values[seedField] = level;
      }
    }

    return {
      ...base,
      enabled: touched ? Boolean(base.enabled) : Boolean(base.enabled || typeSelected || level >= 1),
      values,
    };
  };

  const highSeverityFieldsForSection = (section, state) =>
    section.fields.filter((field) => Number(state.values?.[field] ?? 0) > 1);

  const handlePrint = async () => {
    const printNode = printRootRef.current;
    if (!printNode) {
      window.focus();
      window.print();
      return;
    }

    const popup = window.open("", "_blank", "noopener,noreferrer,width=1100,height=850");
    if (!popup) {
      window.focus();
      window.print();
      return;
    }

    const headMarkup = Array.from(document.querySelectorAll("style, link[rel='stylesheet']"))
      .map((el) => el.outerHTML)
      .join("\n");
    const baseHref = document.baseURI || window.location.href;
    const contentNode = printNode.children?.[1];
    const sourceForPrint = contentNode instanceof HTMLElement ? contentNode : printNode;
    const printableClone = sourceForPrint.cloneNode(true);
    Array.from(printableClone.querySelectorAll("img")).forEach((img) => {
      const src = img.getAttribute("src");
      if (!src) return;
      img.setAttribute("src", toAbsoluteAssetUrl(src));
    });
    const printMarkup = printableClone.outerHTML;

    popup.document.open();
    popup.document.write(`
      <!doctype html>
      <html>
        <head>
          <meta charset="utf-8" />
          <title>SDS Document</title>
          <base href="${baseHref}" />
          ${headMarkup}
          <style>
            @page { size: letter portrait; margin: 0.65in; }
            html, body { background: #fff; margin: 0; padding: 0; }
            .sds-popup-doc > .p-6 { padding: 0 !important; background: #fff !important; }
            .print-hidden { display: none !important; }
            .print-container { box-shadow: none !important; border: none !important; }
            .print-page { page-break-after: always; break-after: page; }
            .print-page:last-child { page-break-after: auto; break-after: auto; }
            .print-avoid { break-inside: avoid; }
            .print-scroll { max-height: none !important; overflow: visible !important; }
            .print-hide-low-severity { display: none !important; }
            .print-hide-empty-severity-card { display: none !important; }
            .print-hide-no-high-severity { display: none !important; }
            @media print {
              body * {
                visibility: visible !important;
                animation: none !important;
                transition: none !important;
              }
              .sds-popup-doc, .sds-popup-doc * {
                visibility: visible !important;
              }
            }
          </style>
        </head>
        <body>
          <div class="sds-popup-doc">
            ${printMarkup}
          </div>
        </body>
      </html>
    `);
    popup.document.close();

    const waitForAssets = async () => {
      const imagePromises = Array.from(popup.document.images || []).map((img) => {
        if (img.complete) return Promise.resolve();
        return new Promise((resolve) => {
          img.addEventListener("load", resolve, { once: true });
          img.addEventListener("error", resolve, { once: true });
        });
      });
      const stylePromises = Array.from(popup.document.querySelectorAll("link[rel='stylesheet']")).map((link) => {
        if (link.sheet) return Promise.resolve();
        return new Promise((resolve) => {
          link.addEventListener("load", resolve, { once: true });
          link.addEventListener("error", resolve, { once: true });
        });
      });
      await Promise.race([
        Promise.all([...imagePromises, ...stylePromises]),
        new Promise((resolve) => setTimeout(resolve, 1200)),
      ]);
    };

    await waitForAssets();
    popup.document.documentElement.scrollTop = 0;
    popup.document.body.scrollTop = 0;
    popup.focus();
    popup.print();
    setTimeout(() => popup.close(), 500);
  };

  const visibleSections = useMemo(() => {
    return LOSS_SEVERITY_CONFIG.filter((section) => {
      const state = deriveSectionState(section);
      return highSeverityFieldsForSection(section, state).length > 0;
    });
  }, [docSeverity, orderTypes, orderSeverityBySection]);

  const hasAnyHighSeverityRows = useMemo(() => {
    return visibleSections.some((section) => {
      const state = deriveSectionState(section);
      return highSeverityFieldsForSection(section, state).length > 0;
    });
  }, [visibleSections, docSeverity, orderTypes, orderSeverityBySection]);

  const primaryCustomerName = useMemo(() => {
    const list = Array.isArray(customers) ? customers : [];
    const primary = list.find((c) => c?.isPrimary) || list[0] || {};
    const first = String(primary?.first || "").trim();
    const last = String(primary?.last || "").trim();
    const combined = [first, last].filter(Boolean).join(" ");
    if (combined) return combined;
    const fallback = String(primary?.name || "").trim();
    return fallback || "";
  }, [customers]);

  const formattedDateOfLoss = useMemo(() => {
    const raw = String(dateOfLoss || "").trim();
    if (!raw) return "";
    const isoMatch = raw.match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if (!isoMatch) return raw;
    return `${isoMatch[2]}/${isoMatch[3]}/${isoMatch[1]}`;
  }, [dateOfLoss]);

  const normalizeSeverity = (s) => String(s ?? "").trim().toUpperCase().replace(/[^A-Z0-9]/g, "");

  const severityCodeForPeril = (peril) => {
    const entry = (severityCodes || []).find(c => (c || "").startsWith(peril === "fire" ? "Fire-" : "Water-"));
    if (!entry) return "";
    const level = Number(entry.split("-")[1] || 0);
    if (!level) return "";
    const letter = peril === "fire" ? "F" : "W";
    return `${letter}${Math.min(Math.max(level, 1), MAX_SEVERITY)}`;
  };

  const getPerils = () => {
    const picks = [];
    if (orderTypes.includes("Fire") && severityCodeForPeril("fire")) picks.push("fire");
    if (orderTypes.includes("Water") && severityCodeForPeril("water")) picks.push("water");
    return picks;
  };

  const severityColors = {
    W1: "#BAE6FD",
    W2: "#7DD3FC",
    W3: "#38BDF8",
    F1: "#FED7AA",
    F2: "#FDBA74",
    F3: "#FB923C",
    ORIGIN: "#1D4ED8",
  };

  const severityTint = (sev) => {
    const key = normalizeSeverity(sev);
    if (key.startsWith("W")) return "#E0F2FE";
    if (key.startsWith("F")) return "#FFEDD5";
    if (key === "ORIGIN") return "#DBEAFE";
    return "#FFFFFF";
  };

  const severityDotColor = (sev) => severityColors[normalizeSeverity(sev)] || "#94A3B8";

  const sortFloors = (a, b) => {
    const rank = (name) => {
      const lower = (name || "").toLowerCase();
      if (lower.includes("attic")) return 99;
      if (lower.includes("basement")) return 0;
      const match = lower.match(/(\d+)/);
      if (match) return Number(match[1]);
      return 50;
    };
    return rank(b.name) - rank(a.name);
  };

  const buildFloorsFromRooms = (sevCode) => {
    const scopeSummaryForRoom = (room, affected) => {
      const tasks = Array.isArray(room?.tasks) ? room.tasks : [];
      if (!affected) return "No scope needed.";
      if (!tasks.length) return "Scope not yet documented.";
      const rendered = tasks
        .slice(0, 2)
        .map((task) => {
          const label = (task?.label || "").toString().trim();
          if (!label) return "";
          const qty = Number(task?.quantity || 0) > 1 ? ` x${Number(task.quantity)}` : "";
          const prefix = task?.type === "take" ? "Pack out" : task?.type === "leave" ? "Leave onsite" : "Task";
          return `${prefix}: ${label}${qty}`;
        })
        .filter(Boolean);
      if (!rendered.length) return "Scope not yet documented.";
      return tasks.length > 2 ? `${rendered.join("; ")} +${tasks.length - 2} more.` : `${rendered.join("; ")}.`;
    };

    const byFloor = {};
    (rooms || []).forEach((room) => {
      const floor = room.floorLabel || "Unassigned";
      if (!byFloor[floor]) byFloor[floor] = { name: floor, rooms: [] };
      const affected = room.affected === true || (room.severitySelections || []).length > 0;
      byFloor[floor].rooms.push({
        name: room.name || "Room",
        affected,
        severity: affected ? sevCode : "none",
        scope: scopeSummaryForRoom(room, affected),
        origin: false
      });
    });
    return Object.values(byFloor)
      .map((floor) => {
        const anyAffected = floor.rooms.some(r => r.affected);
        return { ...floor, severity: anyAffected ? sevCode : "none" };
      })
      .sort(sortFloors);
  };

  const LossOverviewWidget = ({ peril }) => {
    const sevCode = severityCodeForPeril(peril);
    const floors = buildFloorsFromRooms(sevCode);
    if (!floors.length) return null;
    const perilLabel = peril === "fire" ? "Fire" : "Water";
    return (
      <div className="w-full">
        <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
          <div className="border-b border-slate-200 bg-slate-50 px-4 py-3">
            {RoofHeader({ addressText: address || "Address" })}
          </div>
          <div className="max-h-[520px] overflow-auto">
            <table className="w-full text-xs">
              <thead className="sticky top-0 bg-slate-50 text-left text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-4 py-2">Area</th>
                  <th className="px-4 py-2">Peril</th>
                  <th className="px-4 py-2">Scope</th>
                  <th className="px-4 py-2">Severity</th>
                </tr>
              </thead>
              <tbody>
                {floors.map((floor) => (
                  <React.Fragment key={floor.name}>
                    <tr className="border-t border-slate-200" style={{ backgroundColor: severityTint(floor.severity) }}>
                      <td colSpan={4} className="px-4 py-2 font-semibold text-slate-800">
                        <span className="inline-flex items-center gap-2">
                          <span className="inline-flex h-2 w-2 rounded-full" style={{ backgroundColor: severityDotColor(floor.severity) }} />
                          {floor.name}
                        </span>
                      </td>
                    </tr>
                    {floor.rooms.map((room) => {
                      const sevDisplay = room.severity || "";
                      return (
                        <tr key={`${floor.name}-${room.name}`} className="border-t border-slate-100">
                          <td className="px-4 py-2 text-slate-700">{room.name}</td>
                          <td className="px-4 py-2">
                            {room.affected ? (
                              <span className="inline-flex items-center gap-2 text-slate-700">
                                <Icon size={14} className={peril === "fire" ? "text-orange-500" : "text-sky-600"} />
                                {perilLabel}
                              </span>
                            ) : (
                              <span className="font-medium text-slate-500">None detected</span>
                            )}
                          </td>
                          <td className="px-4 py-2 text-slate-700">{room.scope || "—"}</td>
                          <td className="px-4 py-2">
                            {room.affected && sevDisplay ? (
                              <span className="inline-flex items-center gap-2 font-semibold text-slate-700">
                                <span className="h-2 w-2 rounded-full" style={{ backgroundColor: severityDotColor(sevDisplay) }} />
                                {sevDisplay}
                              </span>
                            ) : (
                              <span className="text-slate-300">—</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  };

  const SDS_ICON_MAP = {
    "Elderly": "/Gemini_Elderly.png",
    "Pregnancy": "/Gemini_Pregnancy.png",
    "Baby": "/Gemini_Baby.png",
    "Needs Assistance": "/Gemini_Needs_Assistance.png",
    "Respiratory Concerns": "/Gemini_Health_Concerns.png",
    "Premium Brands": "/Gemini_Premium_Brands.png",
    "Skin Sensitivity": "/Gemini_Skin_Sensitivity.png",
    "Pets": "/Gemini_Pets.png",
    "Fireplace": "/Gemini_Fireplace.png",
    "Insects": "/Gemini_Generated_Image_b58khsb58khsb58k.png",
    "Moth Damage": "/Gemini_Moth_Holes.png",
    "Sun Damage": "/Gemini_Generated_Image_7b5s067b5s067b5s.png",
    "Smoking": "/Gemini_Smoking.png",
    "Clutter": "/Clutter.png",
    "Fold as Much as Possible": "/Gemini_Fold_AMAP.png",
    "Re-Hanging": "/Gemini_Generated_Image_jv26rcjv26rcjv26.png",
    "Photo Inventory": "/Gemini_Photo_Inventory.png",
    "Unpacking": "/Gemini_Unpacking.png",
    "Anti-Microbial": "/Gemini_Anti_Microbial.png",
    "Drying Needed": "/Drying.jpg",
    "Drying": "/Drying.jpg",
    "Disposal": "/Gemini_Generated_Image_tydpketydpketydp.png",
    "Fiber Protection": "/Gemini_Fiber_Protection.png",
    "Moving": "/icon-moving.svg",
    "Rolling Racks": "/icon-rolling-racks.svg",
    "Total Loss Inventory": "/Total_Loss_Inventory.jpg",
    "Content Manipulation": "/Content_Manipulation.jpg",
    "High Density": "/High_Density_Parking.png",
    "Expert Stain Removal": "/Expert_Stain_Removal.jpg",
  };
  const TILE_SIZE = "1.5in";

  const SdsIconSelectionsWidget = () => {
    const mergedServices = Array.from(new Set([...(sdsServices || []), ...(selectedServices || [])]));
    const considerationIconItems = (sdsConsiderations || []).filter((item) => !!SDS_ICON_MAP[item]);
    const observationIconItems = (sdsObservations || []).filter((item) => !!SDS_ICON_MAP[item]);
    const serviceIconItems = mergedServices.filter((item) => !!SDS_ICON_MAP[item]);
    const hasAny = considerationIconItems.length || observationIconItems.length || serviceIconItems.length;
    if (!hasAny) return null;
    const renderGroup = (title, description, items) => {
      const iconItems = (items || []).filter((item) => !!SDS_ICON_MAP[item]);
      if (!iconItems.length) return null;
      return (
        <div className="rounded-xl border border-slate-200 p-3">
          <div className="text-xs font-bold text-slate-700 mb-0.5">{title}</div>
          <div className="text-[10px] text-slate-500 mb-2">{description}</div>
          <div className="flex flex-wrap gap-3">
            {iconItems.map(item => (
              <div key={item} className="flex flex-col items-center gap-1">
                <div className="sds-icon-tile">
                  <img src={SDS_ICON_MAP[item]} alt={item} className="sds-icon-img" />
                </div>
                <div className="text-[11px] font-semibold text-slate-600 text-center max-w-[120px]">{item}</div>
              </div>
            ))}
          </div>
        </div>
      );
    };
    return (
      <div className="space-y-3">
        {renderGroup(
          "Considerations",
          "Factors to consider when building a scope.",
          considerationIconItems
        )}
        {renderGroup(
          "Observations",
          "Potential complications to be aware of.",
          observationIconItems
        )}
        {renderGroup(
          "Services Requested",
          "Customized services requested for this project.",
          serviceIconItems
        )}
      </div>
    );
  };

  const hasSdsIconSelections =
    (sdsConsiderations || []).some((item) => !!SDS_ICON_MAP[item]) ||
    (sdsObservations || []).some((item) => !!SDS_ICON_MAP[item]) ||
    Array.from(new Set([...(sdsServices || []), ...(selectedServices || [])])).some((item) => !!SDS_ICON_MAP[item]);

  const WidgetSection = ({ title, subtitle, children, className }) => (
    <div className={`rounded-2xl border border-slate-200 bg-white p-4 shadow-sm ${className || ""}`}>
      <div className="flex flex-col gap-1 mb-3">
        <div className="text-sm font-bold text-sky-600">{title}</div>
        {subtitle && <div className="text-xs text-slate-500">{subtitle}</div>}
      </div>
      {children}
    </div>
  );

  const updateSeverity = (sectionKey, field, value) => {
    const config = LOSS_SEVERITY_CONFIG.find((item) => item.key === sectionKey);
    const section = config ? deriveSectionState(config) : (docSeverity[sectionKey] || { enabled: true, values: {} });
    const next = {
      ...docSeverity,
      [sectionKey]: {
        ...section,
        values: { ...(section.values || {}), [field]: value },
      },
      touched: true,
    };
    onChange?.(next);
  };

  const toggleSection = (sectionKey) => {
    const section = docSeverity[sectionKey] || { enabled: true, values: {} };
    const next = {
      ...docSeverity,
      [sectionKey]: { ...section, enabled: !section.enabled },
      touched: true,
    };
    onChange?.(next);
  };

  const RoofHeader = ({ addressText }) => {
    const addressLines = wrapRoofAddress(addressText || "Address", 46, 2);
    const twoLines = addressLines.length > 1;
    const hasLongLine = addressLines.some((line) => line.length > 40);
    const fontSize = hasLongLine ? 16 : 18;
    const firstLineY = twoLines ? 70 : 78;
    return (
      <div className="w-full">
        <svg viewBox="0 0 700 132" className="block h-[106px] w-full">
          <polygon points="5,120 695,120 350,14" fill="#E5E7EB" stroke="#CBD5E1" />
          <rect x="540" y="40" width="26" height="30" fill="#D6D3D1" stroke="#A8A29E" />
          <rect x="536" y="36" width="34" height="6" fill="#78716C" />
          <rect x="338" y="16" width="24" height="8" rx="2" fill="#94A3B8" stroke="#64748B" />
          {addressLines.map((line, idx) => (
            <text
              key={`roof-address-${idx}`}
              x="350"
              y={firstLineY + idx * 20}
              textAnchor="middle"
              fontSize={fontSize}
              fill="#1E293B"
              fontWeight="700"
            >
              {line}
            </text>
          ))}
        </svg>
      </div>
    );
  };

  const StableImage = React.memo(({ src, alt, className, fallbackSrc, onFinalError, loading = "eager" }) => {
    const triedFallbackRef = React.useRef(false);
    const finalErrorFiredRef = React.useRef(false);
    const resolvedSrc = toAbsoluteAssetUrl(src);
    const resolvedFallback = fallbackSrc ? toAbsoluteAssetUrl(fallbackSrc) : "";

    React.useEffect(() => {
      triedFallbackRef.current = false;
      finalErrorFiredRef.current = false;
    }, [resolvedSrc, resolvedFallback]);

    const handleError = (e) => {
      if (!triedFallbackRef.current && resolvedFallback) {
        triedFallbackRef.current = true;
        e.currentTarget.src = resolvedFallback;
        return;
      }
      if (!finalErrorFiredRef.current) {
        finalErrorFiredRef.current = true;
        onFinalError?.();
      }
    };

    return (
      <img
        src={resolvedSrc}
        alt={alt}
        className={className}
        loading={loading}
        decoding="sync"
        onError={handleError}
      />
    );
  });

  const BrandMark = ({ large = false, className = "" }) => {
    const [showTextFallback, setShowTextFallback] = React.useState(false);
    React.useEffect(() => {
      setShowTextFallback(false);
    }, []);
    const frameClass = large ? "h-24 w-full" : "h-12 w-56";
    const imgClass = large ? "h-24 w-auto max-w-full object-contain" : "h-12 w-auto max-w-full object-contain";
    return (
      <div className={`${frameClass} flex items-center justify-center ${className}`}>
        {!showTextFallback ? (
          <StableImage
            src={BRAND.logoSrc}
            alt={BRAND.name}
            className={imgClass}
            fallbackSrc={BRAND.logoFallbackSrc}
            onFinalError={() => setShowTextFallback(true)}
          />
        ) : null}
        {showTextFallback ? (
          <div className={`text-slate-700 font-semibold ${large ? "text-2xl" : "text-sm"}`}>{BRAND.name}</div>
        ) : null}
      </div>
    );
  };

  const BrandHeader = () => (
    <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-4">
      <div className="flex items-center gap-3">
        <BrandMark />
      </div>
      <div className="text-xs text-slate-500 text-right">
        <div>{BRAND.website}</div>
        {(BRAND.phone || BRAND.email) && (
          <div>{[BRAND.phone, BRAND.email].filter(Boolean).join(" • ")}</div>
        )}
      </div>
    </div>
  );

  const BrandFooter = () => (
    <div className="border-t border-slate-200 pt-3 text-[11px] text-slate-500 flex justify-between">
      <span>{BRAND.name}</span>
      <span>{BRAND.website}</span>
    </div>
  );

  const PageMarketingWidget = () => (
    <div className="print-avoid rounded-xl border border-slate-200 bg-white px-3 py-2">
      <div className="flex items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <div className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50 px-2 py-1">
            <span className="h-3 w-3 rounded-full bg-emerald-500" />
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-700">RCS</span>
          </div>
          <div className="min-w-0">
            <div className="text-[11px] font-semibold text-slate-700">{BRAND.name}</div>
            <div className="truncate text-[10px] text-slate-500">
              Compassion-driven service from first call to final delivery.
            </div>
          </div>
        </div>
        <div className="shrink-0 rounded-full border border-slate-200 bg-slate-50 px-2 py-1 text-[10px] font-semibold text-slate-600">
          fire | smoke | water | mold
        </div>
      </div>
    </div>
  );

  const PageBlock = ({ children, showHeader = true, showMarketingWidget = true }) => (
    <div className="print-page space-y-5">
      {showHeader ? <BrandHeader /> : null}
      {children}
      {showMarketingWidget ? <PageMarketingWidget /> : null}
      <BrandFooter />
    </div>
  );

  const SummaryField = ({ label, value }) => (
    <div className="rounded-xl border border-slate-200 bg-white px-3 py-2">
      <div className="text-[10px] font-bold uppercase tracking-widest text-slate-400">{label}</div>
      <div className="mt-1 text-sm font-semibold text-slate-800">{value || "—"}</div>
    </div>
  );

  const ProjectSummarySection = () => (
    <div className="rounded-2xl border border-slate-200 bg-gradient-to-br from-white via-slate-50 to-sky-50 p-4 shadow-sm">
      <div className="mb-3 flex items-center justify-between">
        <div className="text-sm font-bold text-sky-600">Project Summary</div>
      </div>
      <div className="grid gap-3 md:grid-cols-2">
        <div className="space-y-2">
          <SummaryField label="Order Name" value={orderName} />
          <SummaryField label="Customer" value={primaryCustomerName} />
          <SummaryField label="Address" value={address} />
        </div>
        <div className="space-y-2">
          <SummaryField label="Insurance Company" value={insuranceCompany} />
          <SummaryField label="Adjuster" value={insuranceAdjuster} />
          <SummaryField label="Date of Loss" value={formattedDateOfLoss} />
          <SummaryField label="Claim Number" value={claimNumber} />
        </div>
      </div>
      <div className="mt-4 rounded-xl border border-sky-100 bg-white p-3">
        <div className="flex justify-center">
          <div className="inline-flex items-center rounded-full border border-sky-300 bg-sky-50 px-5 py-2 text-sm font-bold text-sky-700">
            Approve
          </div>
        </div>
        <p className="mt-3 text-xs leading-relaxed text-slate-600 text-center">
          Simply reply 'Approve' if this looks good to you. If we haven&apos;t heard back within 3 days, we&apos;ll assume your approval and move forward with the project as outlined.
        </p>
      </div>
    </div>
  );

  const BrandMediaCard = ({ src, alt, className, imageClass, fallbackSrc }) => {
    const [imageMissing, setImageMissing] = React.useState(false);
    React.useEffect(() => {
      setImageMissing(false);
    }, [src, fallbackSrc]);

    return (
      <div className={`relative overflow-hidden rounded-2xl border border-slate-200 bg-white ${className || ""}`}>
        {!imageMissing ? (
          <StableImage
            src={src}
            alt={alt}
            className={imageClass || "h-full w-full object-contain object-center"}
            fallbackSrc={fallbackSrc}
            loading="eager"
            onFinalError={() => setImageMissing(true)}
          />
        ) : null}
        {imageMissing ? (
          <div className="absolute inset-0 flex items-center justify-center px-4 text-center text-xs font-semibold text-slate-500">
            {`Add image: ${src}`}
          </div>
        ) : null}
      </div>
    );
  };

  const SERVICE_HIGHLIGHTS = [
    "24/7 claim support",
    "Photo barcoding & inventory",
    "Specialized cleaning & deodorizing",
    "Flexible storage & delivery",
  ];

  const RestoreStoryPage = () => (
    <PageBlock showHeader={false}>
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-4">
          <div className="grid min-h-[240px] grid-cols-[170px_1fr] gap-5 items-end">
            <div className="relative h-full min-h-[200px] overflow-hidden rounded-xl bg-white">
              <StableImage
                src={BRAND_CARES_MEDIA.fieldTech}
                alt="Renewal Cares field specialist"
                className="absolute bottom-0 left-0 h-full w-full object-cover object-left-bottom"
                loading="eager"
              />
            </div>
            <div className="self-center pr-2">
              <div className="text-[42px] font-bold leading-[1.02] text-slate-900">Restore. Renew. Restart.</div>
              <p className="mt-3 text-[20px] leading-relaxed text-slate-600">
                We help families recover after fire, water, and mold losses by handling pickup,
                inventory, cleaning, storage, and delivery of soft goods and belongings.
              </p>
            </div>
          </div>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          {SERVICE_HIGHLIGHTS.map((item) => (
            <div key={item} className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-[15px] font-semibold text-slate-700">
              {item}
            </div>
          ))}
        </div>
      </div>
    </PageBlock>
  );

  const BrochurePage = () => (
    <PageBlock showHeader={false}>
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="grid gap-4 lg:grid-cols-[1fr_1fr]">
          <div className="rounded-2xl border border-slate-200 bg-white p-4">
            <div className="grid min-h-[240px] grid-cols-[122px_1fr] gap-4 items-end">
              <div className="relative h-full min-h-[196px] overflow-hidden rounded-xl bg-white">
                <StableImage
                  src={BRAND_CARES_MEDIA.careSpecialist}
                  alt="Renewal Cares support specialist"
                  className="absolute bottom-0 left-0 h-full w-full object-contain object-left-bottom"
                  loading="eager"
                />
              </div>
              <div className="self-center pr-1">
                <div className="text-xs font-bold uppercase tracking-widest text-slate-400">Contact</div>
                <div className="mt-1 text-[30px] font-bold leading-tight text-slate-800">{BRAND.phone}</div>
                <div className="mt-1 text-lg text-slate-600">{BRAND.email}</div>
                <div className="text-lg text-slate-600">{BRAND.website}</div>
                <p className="mt-3 text-sm text-slate-500">
                  Fast response, transparent communication, and claim-ready documentation.
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <div className="rounded-2xl border border-slate-200 bg-white p-5 text-center">
              <BrandMark large />
              <div className="mt-2 text-3xl font-semibold text-slate-700">Your trusted restoration partner</div>
              <div className="mt-1 text-xl text-slate-500">Serving Greater NYC and beyond</div>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-2">
              <BrandMediaCard
                src={BRAND_CARES_MEDIA.homeBanner}
                alt="Renewal Cares home banner"
                className="h-28 border-none rounded-xl bg-white"
                imageClass="h-full w-full object-contain object-center"
                fallbackSrc={BRAND.logoSrc}
              />
              <div className="mt-1 text-center text-sm font-medium text-slate-500">
                Compassion-driven service from first call to final delivery.
              </div>
            </div>
          </div>
        </div>
      </div>
    </PageBlock>
  );

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-slate-900/70 p-4 sds-print-overlay">
      <style>{`
        .border-gradient-fire {
          border: 2px solid transparent;
          background: linear-gradient(white, white) padding-box, linear-gradient(to right, #fb923c, #ef4444) border-box;
        }
        .border-gradient-water {
          border: 2px solid transparent;
          background: linear-gradient(white, white) padding-box, linear-gradient(to right, #7dd3fc, #a855f7) border-box;
        }
        input[type="range"]::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 12px;
          height: 12px;
          background: #ffffff;
          border: 2px solid #9ca3af;
          border-radius: 9999px;
          cursor: pointer;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        input[type="range"]::-moz-range-thumb {
          width: 12px;
          height: 12px;
          background: #ffffff;
          border: 2px solid #9ca3af;
          border-radius: 9999px;
          cursor: pointer;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        input[type="range"]:disabled::-webkit-slider-thumb {
          background-color: #f3f4f6;
          border-color: #d1d5db;
          cursor: not-allowed;
          box-shadow: none;
        }
        @page {
          size: letter portrait;
          margin: 0.65in;
        }
        @media print {
          html, body { background: #fff !important; }
          body * {
            visibility: hidden !important;
            animation: none !important;
            transition: none !important;
          }
          .sds-print-root, .sds-print-root * {
            visibility: visible !important;
          }
          .sds-print-overlay {
            position: static !important;
            inset: auto !important;
            display: block !important;
            padding: 0 !important;
            background: #fff !important;
            backdrop-filter: none !important;
            -webkit-backdrop-filter: none !important;
          }
          .sds-print-root {
            width: 100% !important;
            max-width: none !important;
            max-height: none !important;
            overflow: visible !important;
            border-radius: 0 !important;
          }
          .print-hidden { display: none !important; }
          .print-container { box-shadow: none !important; border: none !important; }
          .print-page { page-break-after: always; break-after: page; }
          .print-page:last-child { page-break-after: auto; break-after: auto; }
          .print-avoid { break-inside: avoid; }
          .print-scroll { max-height: none !important; overflow: visible !important; }
          .print-hide-low-severity { display: none !important; }
          .print-hide-empty-severity-card { display: none !important; }
          .print-hide-no-high-severity { display: none !important; }
        }
        .sds-icon-tile {
          width: ${TILE_SIZE};
          height: ${TILE_SIZE};
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 16px;
          background: transparent;
        }
        .sds-icon-img {
          width: 100%;
          height: 100%;
          object-fit: contain;
        }
      `}</style>

      <div ref={printRootRef} className="w-full max-w-5xl max-h-[90vh] overflow-y-auto rounded-3xl bg-white shadow-2xl border border-slate-200 print-container print-scroll sds-print-root">
        <div className="bg-sky-500 px-6 py-4 flex items-center justify-between print-hidden">
          <div>
            <h3 className="text-xl font-bold text-white">SDS Document</h3>
            <div className="text-sm text-sky-100">Print-ready summary</div>
          </div>
          <div className="flex gap-2">
            <button
              className="rounded-lg border border-white/40 px-3 py-1.5 text-xs font-bold text-white hover:bg-white/10"
              onClick={handlePrint}
            >
              Print / PDF
            </button>
            <button className="text-white/80 hover:text-white text-2xl font-bold leading-none" onClick={onClose}>
              ×
            </button>
          </div>
        </div>

        <div className="p-6 bg-slate-50 space-y-8">
          <SdsPageBlock brand={BRAND}>
            <SdsProjectSummarySection
              orderName={orderName}
              primaryCustomerName={primaryCustomerName}
              address={address}
              insuranceCompany={insuranceCompany}
              insuranceAdjuster={insuranceAdjuster}
              formattedDateOfLoss={formattedDateOfLoss}
              claimNumber={claimNumber}
              serviceOfferings={noeServiceOfferings}
              orderTypes={orderTypes}
              lossDetails={lossDetails}
              siteInspected={(rooms || []).some((room) => room?.affected !== null || (room?.severitySelections || []).length > 0 || (room?.tasks || []).length > 0)}
              scopeBridge={scopeBridge}
            />
          </SdsPageBlock>
          <SdsPageBlock brand={BRAND}>
            <SdsWidgetSection title="Loss Severity" className={`mx-auto w-full max-w-[22rem] ${hasAnyHighSeverityRows ? "" : "print-hide-no-high-severity"}`}>
              <div className="mb-2 pt-1 pb-2 border-b border-slate-200/60">
                <div className="px-1 text-center text-[11px] font-bold text-slate-600">
                  None 0 - 3 Extreme
                </div>
              </div>

              <div className="mx-auto max-w-[12rem] print-avoid">
                {visibleSections.length === 0 ? (
                  <div className="rounded-xl border border-dashed border-slate-200 bg-white px-3 py-4 text-center text-[11px] text-slate-500">
                    No severity rows above 1 to include.
                  </div>
                ) : (
                  <div className={`grid gap-2 ${visibleSections.length > 1 ? "md:grid-cols-2" : ""}`}>
                    {visibleSections.map(section => {
                    const state = deriveSectionState(section);
                    const highFields = highSeverityFieldsForSection(section, state);
                    const hasPrintableRows = highFields.length > 0;
                    return (
                      <div key={section.key} className={`p-2 rounded-xl ${section.border} ${hasPrintableRows ? "" : "print-hide-empty-severity-card"}`}>
                        <div className="flex justify-between items-center mb-2">
                          <h2 className="text-sm font-bold text-slate-800">{section.label}</h2>
                          <button
                            className={`h-5 w-5 rounded-md border-2 flex items-center justify-center text-[9px] font-bold ${state.enabled ? "bg-sky-500 border-sky-500 text-white" : "bg-white border-slate-400 text-slate-600"}`}
                            onClick={() => toggleSection(section.key)}
                            title={state.enabled ? "Disable" : "Enable"}
                          >
                            ✓
                          </button>
                        </div>
                        <div className="space-y-2">
                          {highFields.map(field => (
                            <div
                              key={field}
                              className={`slider-container ${Number(state.values?.[field] ?? 0) > 1 ? "" : "print-hide-low-severity"}`}
                              data-color-start={section.colorStart}
                              data-color-end={section.colorEnd}
                            >
                              <label className="block text-[10px] font-semibold text-slate-700 mb-1">{field}</label>
                              <Slider
                                value={state.values?.[field] ?? 0}
                                disabled={!state.enabled}
                                colorStart={section.colorStart}
                                colorEnd={section.colorEnd}
                                onChange={(val) => updateSeverity(section.key, field, val)}
                              />
                              <div className="flex justify-between text-[9px] font-medium text-slate-400 mt-0.5 px-0.5">
                                <span>0</span><span>1</span><span>2</span><span>3</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                  </div>
                )}
              </div>
            </SdsWidgetSection>
          </SdsPageBlock>

          {getPerils().length > 0 && (
            <div className="space-y-6">
              {getPerils().map((peril) => {
                const perilLabel = peril === "fire" ? "Fire" : "Water";
                  const subtitle = claimNumber
                  ? `Loss Type: ${perilLabel} · Claim #: ${claimNumber}`
                  : `Loss Type: ${perilLabel}`;
                return (
                  <SdsPageBlock key={peril} brand={BRAND}>
                    <SdsWidgetSection title="Home Loss Visualization" subtitle={subtitle}>
                      {LossOverviewWidget({ peril })}
                    </SdsWidgetSection>
                  </SdsPageBlock>
                );
              })}
            </div>
          )}
          {hasSdsIconSelections && (
            <SdsPageBlock brand={BRAND}>
              <SdsWidgetSection title="SDS Icons">
                {SdsIconSelectionsWidget()}
              </SdsWidgetSection>
            </SdsPageBlock>
          )}
          <SdsRestoreStoryPage brand={BRAND} media={BRAND_CARES_MEDIA} serviceHighlights={SERVICE_HIGHLIGHTS} />
          <SdsBrochurePage brand={BRAND} media={BRAND_CARES_MEDIA} />
        </div>
      </div>
    </div>
  );
}
