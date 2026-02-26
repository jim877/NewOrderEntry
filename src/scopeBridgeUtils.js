export const SCOPE_BRIDGE_PENDING_ISSUES = [
  'Contacting Customer',
  'Authorization',
  'Test Results',
  'IH Results',
  'Coverage Determination',
  'Bill To Determination',
  'Scope Approval',
  'Estimate Approval',
  'Customer might clean it themselves',
  'Unsure if submitting a claim',
  'Awaiting Signed Authorization',
  'Awaiting Estimate Approval',
  'Awaiting Hygienist Results',
  'Awaiting Coverage Determination',
  'Awaiting Test Group Results',
  'Limit Issues',
  'Deciding Who Will Pay',
  'Customer is not open to cleaning',
  'PA is not open to cleaning'
];

export const SCOPE_BRIDGE_RED_REASONS = [
  'Cancel Order (no charges)',
  'Claims Expenses Only',
  'Nothing for us',
  'Return dirty',
  'Dispose',
  'Submit report'
];

export const SCOPE_BRIDGE_GROUP_OPTIONS = [
  'RD',
  'RFD',
  'STD',
  'STFD',
  'LTD',
  'LTFD',
  'Inhome',
  'TLI',
  'Test',
  'Dispose',
  'Storage Only',
  'Rush',
  'Wet',
  'Damp'
];

export const SCOPE_BRIDGE_PICKUP_OPTIONS = [
  { id: 'wait', label: 'Wait for authorization' },
  { id: 'urgent', label: 'Urgent groups only' }
];

export const SCOPE_BRIDGE_PROCESSING_OPTIONS = [
  { id: 'tag_hold', label: 'Tag and Hold' },
  { id: 'urgent', label: 'Urgent Groups Only' },
  { id: 'cod', label: 'COD / Payment Required' },
  { id: 'all', label: 'Process All' },
  { id: 'specific', label: 'Specific Groups Only' }
];

export const SCOPE_BRIDGE_NEXT_STEP_OPTIONS = [
  { id: 'pickup_hold', label: 'Pickup is on hold' },
  { id: 'processing_hold', label: 'Processing is on hold (tag and hold)' },
  { id: 'delivery_hold', label: 'Delivery is on hold' },
  { id: 'schedule', label: 'Ready to schedule final retrieval' },
  { id: 'wait_approval', label: 'Awaiting adjuster approval' },
  { id: 'wait_test', label: 'Awaiting test results' }
];

const normalizeStatus = (value) => {
  const v = (value || '').toString().trim().toLowerCase();
  if (v === 'green' || v === 'yellow' || v === 'red') return v;
  return '';
};

const normalizeList = (value) => (Array.isArray(value) ? value.filter(Boolean) : []);

const normalizeObject = (value) => (value && typeof value === 'object' && !Array.isArray(value) ? value : {});

const normalizeManualStates = (value) => {
  const raw = normalizeObject(value);
  const out = {};
  Object.entries(raw).forEach(([key, state]) => {
    const normalized = (state || '').toString().trim().toLowerCase();
    if (normalized === 'on' || normalized === 'off') out[key] = normalized;
  });
  return out;
};

const normalizeMilestones = (value) => {
  const raw = normalizeObject(value);
  return {
    authorizationOnFile: !!raw.authorizationOnFile,
    authorizationOnFileAt: (raw.authorizationOnFileAt || '').toString(),
    authorizationOnFileBy: (raw.authorizationOnFileBy || '').toString(),
    scopeApproved: !!raw.scopeApproved,
    scopeApprovedAt: (raw.scopeApprovedAt || '').toString(),
    scopeApprovedBy: (raw.scopeApprovedBy || '').toString(),
    estimateApproved: !!raw.estimateApproved,
    estimateApprovedAt: (raw.estimateApprovedAt || '').toString(),
    estimateApprovedBy: (raw.estimateApprovedBy || '').toString(),
  };
};

export const createScopeBridgeState = (overrides = {}) => {
  const source = overrides && typeof overrides === 'object' ? overrides : {};
  return {
    projectStatus: normalizeStatus(source.projectStatus),
    pendingIssues: normalizeList(source.pendingIssues),
    statusReason: (source.statusReason || '').toString(),
    estimateBlockerBy: (source.estimateBlockerBy || '').toString(),
    estimateBlockerType: (source.estimateBlockerType || '').toString(),
    authBlockerBy: (source.authBlockerBy || '').toString(),
    cleaningPreferenceNotes: normalizeObject(source.cleaningPreferenceNotes),
    blockerScopes: normalizeList(source.blockerScopes),
    blockerFollowUps: normalizeObject(source.blockerFollowUps),
    blockerManualState: normalizeManualStates(source.blockerManualState),
    milestones: normalizeMilestones(source.milestones),
    pickupOption: (source.pickupOption || '').toString(),
    processingOption: (source.processingOption || '').toString(),
    selectedGroups: normalizeList(source.selectedGroups),
    nextStep: (source.nextStep || '').toString(),
    snippet: (source.snippet || '').toString(),
    updatedAt: (source.updatedAt || '').toString(),
  };
};

export const normalizeScopeBridgeState = (value) => createScopeBridgeState(value);

export const statusBadgeLabel = (status) => {
  if (status === 'green') return 'GREEN';
  if (status === 'yellow') return 'YELLOW';
  if (status === 'red') return 'RED';
  return 'Not set';
};

export const nextStepLabel = (nextStep) => {
  const match = SCOPE_BRIDGE_NEXT_STEP_OPTIONS.find((option) => option.id === nextStep);
  return match ? match.label : '';
};

export const buildScopeBridgeSnippet = (rawFormData = {}) => {
  const formData = normalizeScopeBridgeState(rawFormData);
  const parts = [];

  if (formData.projectStatus) {
    const emoji =
      formData.projectStatus === 'green'
        ? 'G'
        : formData.projectStatus === 'yellow'
          ? 'Y'
          : 'R';

    let statusDetail = '';

    if (formData.projectStatus === 'yellow' && formData.pendingIssues.length > 0) {
      const processedIssues = formData.pendingIssues.map((issue) => {
        if (
          issue === 'Awaiting Estimate Approval' &&
          (formData.estimateBlockerBy || formData.estimateBlockerType)
        ) {
          const details = [];
          if (formData.estimateBlockerBy) details.push(`req by ${formData.estimateBlockerBy}`);
          if (formData.estimateBlockerType) details.push(`type: ${formData.estimateBlockerType}`);
          return `${issue} (${details.join(', ')})`;
        }

        if (issue === 'Awaiting Signed Authorization' && formData.authBlockerBy) {
          return `${issue} (from ${formData.authBlockerBy})`;
        }

        if (
          (issue === 'Customer is not open to cleaning' || issue === 'PA is not open to cleaning') &&
          formData.cleaningPreferenceNotes[issue]
        ) {
          return `${issue} [Action: ${formData.cleaningPreferenceNotes[issue]}]`;
        }

        return issue;
      });
      statusDetail = ` - PENDING: ${processedIssues.join(', ')}`;
    } else if (formData.statusReason) {
      statusDetail = ` - ${formData.statusReason}`;
    }

    parts.push(`${emoji} [STATUS: ${formData.projectStatus.toUpperCase()}${statusDetail}]`);
  }

  if (formData.pickupOption === 'wait') {
    parts.push('PICKUP: HOLD - Wait for schedule authorization.');
  } else if (formData.pickupOption === 'urgent' && formData.selectedGroups.length > 0) {
    parts.push(`PICKUP: URGENT ONLY - Proceed with retrieval of [${formData.selectedGroups.join(', ')}] groups.`);
  }

  if (formData.blockerScopes.length > 0) {
    parts.push(`BLOCKERS: ${formData.blockerScopes.join(', ')}`);
  }

  if (formData.processingOption) {
    const groupText = formData.selectedGroups.length > 0 ? ` [${formData.selectedGroups.join(', ')}]` : '';

    if (formData.processingOption === 'tag_hold') {
      parts.push('PROCESSING: TAG & HOLD - Secure inventory; do not process until authorized.');
    } else if (formData.processingOption === 'urgent') {
      parts.push(`PROCESSING: URGENT ONLY - Authorized for mitigation groups${groupText} only.`);
    } else if (formData.processingOption === 'cod') {
      parts.push('PROCESSING: COD - Payment required prior to release/processing.');
    } else if (formData.processingOption === 'all') {
      parts.push('PROCESSING: PROCEED - Authorized for all inventory groups.');
    } else if (formData.processingOption === 'specific') {
      parts.push(`PROCESSING: SPECIFIC - Authorized for${groupText} only. Hold all others.`);
    }
  }

  if (formData.projectStatus === 'red' && formData.statusReason === 'Claims Expenses Only') {
    parts.push('NOTE: Project limited to Cash-out, TLI, and Consulting expenses only.');
  }

  const milestones = formData.milestones || {};
  if (milestones.authorizationOnFile) parts.push('AUTHORIZATION: ON FILE.');
  if (milestones.scopeApproved) parts.push('SCOPE: APPROVED.');
  if (milestones.estimateApproved) parts.push('ESTIMATE: APPROVED.');

  if (formData.nextStep) {
    const logiMap = {
      pickup_hold: 'Pickup is on hold.',
      processing_hold: 'Processing is on hold (tag and hold).',
      delivery_hold: 'Delivery is on hold.',
      schedule: 'Ready for final retrieval.',
      wait_approval: 'Awaiting Adjuster Approval.',
      wait_test: 'Awaiting test results.',
    };
    parts.push(`LOGISTICS: ${logiMap[formData.nextStep] || formData.nextStep}`);
  }

  return parts.join(' ').trim();
};

export const withScopeBridgeSnippet = (rawFormData = {}) => {
  const normalized = normalizeScopeBridgeState(rawFormData);
  return {
    ...normalized,
    snippet: buildScopeBridgeSnippet(normalized),
    updatedAt: new Date().toISOString(),
  };
};
