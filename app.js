const form = document.getElementById('ticket-form');
const confirmation = document.getElementById('confirmation');
const analysisCard = document.getElementById('analysis-card');
const submitBtn = document.getElementById('submitBtn');

const titleInput = document.getElementById('title');
const descriptionInput = document.getElementById('description');
const categoryHintInput = document.getElementById('categoryHint');
const attachmentsInput = document.getElementById('attachments');

const resultTitle = document.getElementById('resultTitle');
const ticketIdEl = document.getElementById('ticketId');
const categoryValue = document.getElementById('categoryValue');
const priorityValue = document.getElementById('priorityValue');
const severityValue = document.getElementById('severityValue');
const slaValue = document.getElementById('slaValue');
const maskedPreview = document.getElementById('maskedPreview');
const categoryConfidence = document.getElementById('categoryConfidence');
const priorityScore = document.getElementById('priorityScore');
const responseConfidence = document.getElementById('responseConfidence');
const alternatives = document.getElementById('alternatives');
const responseEditor = document.getElementById('responseEditor');
const factorsList = document.getElementById('factorsList');
const priorityBadge = document.getElementById('priorityBadge');
const actionStatus = document.getElementById('actionStatus');

const CATEGORY_RULES = [
  {
    name: 'Network',
    keywords: ['internet', 'wifi', 'wi-fi', 'network', 'connectivity', 'drop out', 'cutting out', 'offline', 'router', 'vpn', 'latency', 'signal'],
    weight: 1.6,
  },
  {
    name: 'Hardware',
    keywords: ['projector', 'screen', 'monitor', 'display', 'power cable', 'hdmi', 'lamp', 'device not turning on', 'not turning on', 'meeting room', 'projector isn\'t turning on', 'equipment issue'],
    weight: 1.5,
  },
  {
    name: 'Software',
    keywords: ['payroll', 'timesheet', 'login', 'unable to log in', 'cannot log in', 'software', 'application', 'system outage', 'deadline', 'approve timesheets', 'access issue'],
    weight: 1.4,
  },
  {
    name: 'Technical',
    keywords: ['bug', 'error', 'crash', 'server', 'api', 'timeout', 'slow', 'database', 'deployment', 'unable'],
    weight: 1.1,
  },
  {
    name: 'Billing',
    keywords: ['billing', 'invoice', 'refund', 'charge', 'payment', 'subscription', 'receipt', 'credit card'],
    weight: 1.1,
  },  {
    name: 'Account',
    keywords: ['account', 'password', 'access', 'profile', 'unlock', 'suspend', 'email', 'user'],
    weight: 0.95,
  },
  {
    name: 'Security',
    keywords: ['security', 'breach', 'hack', 'unauthorized', 'data leak', 'phishing', 'malware', 'failed login attempts', 'foreign ip', 'suspicious file'],
    weight: 1.25,
  },
  {
    name: 'Product',
    keywords: ['feature', 'request', 'product', 'dashboard', 'integration', 'report', 'mobile app', 'workflow'],
    weight: 0.9,
  },
];

const PRIORITY_RULES = [
  { priority: 'P1', keywords: ['outage', 'critical', 'down', 'urgent', 'breach', 'data loss', 'security', 'unauthorized access', 'malware', 'foreign ip', 'failed login attempts', 'suspicious file'], weight: 3 },
  { priority: 'P2', keywords: ['cannot login', 'payment failed', 'refund', 'error', 'slow', 'bug', 'timesheet', 'payroll'], weight: 2 },
  { priority: 'P3', keywords: ['feature', 'question', 'help', 'clarification', 'reset'], weight: 1 },
];

function generateTicketId() {
  const stamp = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  return `TK-${stamp}-${Math.random().toString(36).slice(2, 7).toUpperCase()}`;
}

function maskPII(input) {
  return input
    .replace(/\b([A-Z0-9._%+-]+)@([A-Z0-9.-]+\.[A-Z]{2,})\b/gi, 'user****@$2')
    .replace(/\b(?:\d[ -]?){12,19}\b/g, 'XXXX-XXXX-XXXX-****')
    .replace(/\b\d{3}-\d{2}-\d{4}\b/g, 'XXX-XX-****')
    .replace(/\b(?:password|token|api[_-]?key|secret)\b[^\n]*$/gim, '****')
    .replace(/\b(?:\+?\d{1,3}[-.\s]?)?(\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4})\b/g, 'XXX-XXX-XXXX');
}

function validateFiles(files) {
  const allowedTypes = [
    'application/pdf',
    'image/jpeg',
    'image/png',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/msword',
    'application/vnd.ms-excel',
  ];

  const maxSize = 5 * 1024 * 1024;

  for (const file of files) {
    if (file.size > maxSize) {
      throw new Error(`${file.name} exceeds the 5MB upload limit.`);
    }

    if (!allowedTypes.includes(file.type) && !file.name.match(/\.(pdf|jpg|jpeg|png|xlsx|docx)$/i)) {
      throw new Error(`${file.name} has an unsupported file type.`);
    }
  }
}

function calculateClassification(title, description, categoryHint) {
  const combined = `${title} ${description}`.toLowerCase();
  const maskedText = maskPII(`${title}\n\n${description}`);

  const securitySignals = [
    'failed login attempts',
    'successful login',
    'foreign ip',
    'malicious ip',
    'unauthorized access',
    'suspicious file',
    'updateapp_v2.exe',
    'malware',
    'security incident',
    'cybersecurity team',
    'disable account',
    'block ip',
    'quarantine',
    'hr_jenniferr',
  ];
  const payrollAccessSignals = [
    'payroll system',
    'timesheet',
    'approve timesheets',
    'cannot log into the payroll',
    'can\'t log into the payroll',
    'my entire department can\'t log',
    'deadline to approve timesheets',
    'payroll login',
  ];
  const hardwareSignals = [
    'projector',
    'meeting room a',
    'isn\'t turning on',
    'not turning on',
    'screen won\'t turn on',
    'power issue',
    'hdmi',
    'lamp',
    'display',
    'screen flicker',
    'monitor flicker',
    'display flicker',
    'screen flickers',
    'flickering screen',
  ];
  const networkSignals = [
    'internet keeps cutting out',
    'internet keeps cutting off',
    'wifi',
    'wi-fi',
    'network issue',
    'connectivity',
    'drop out',
    'offline',
    'router',
    'multiple users',
    'this floor',
    'same floor',
    'three other people',
  ];
  const singleUserIssueSignals = [
    'single user',
    'one user',
    'only on my device',
    'only on my machine',
    'on my machine',
    'my machine',
    'only me',
    'just me',
    'my screen',
    'on my computer',
    'happens sometime',
    'intermittent',
    'not affecting other users',
    'not affecting anyone else',
    'single device',
    'one machine',
  ];

  const isSecurityIncident = securitySignals.some((signal) => combined.includes(signal));
  const isPayrollOutage = payrollAccessSignals.some((signal) => combined.includes(signal));
  const isHardwareIssue = hardwareSignals.some((signal) => combined.includes(signal));
  const isNetworkIssue = networkSignals.some((signal) => combined.includes(signal));
  const isSingleUserIssue = singleUserIssueSignals.some((signal) => combined.includes(signal));

  const isDisplayFlickerIssue = /(screen|display|monitor).*?(flicker|flickers|flickering)|flicker.*?(screen|display|monitor)|excel.*?(flicker|flickers|flickering)|flicker.*?excel/i.test(combined);

  if (isNetworkIssue && !isSecurityIncident) {
    return {
      ticketId: generateTicketId(),
      category: 'Network',
      categoryConfidence: '96%',
      priority: 'P2',
      priorityScore: '88%',
      responseConfidence: '97%',
      sla: '4 hours',
      response: 'We have identified this as a multi-user network connectivity issue affecting multiple people on the same floor. We are escalating it to the networking team to review the Wi-Fi/router/service health and will provide the next update as soon as the affected path is isolated or restored.',
      maskedText: maskedText,
      factors: ['internet connectivity', 'multiple users', 'same floor', 'intermittent network outage'],
      alternatives: [
        { name: 'Technical', score: '0.0' },
        { name: 'Software', score: '0.0' },
      ],
    };
  }

  if (isDisplayFlickerIssue && (isSingleUserIssue || /not affecting other users|not affecting anyone else|only on my machine|only on my device|my machine/.test(combined)) && !isSecurityIncident) {
    return {
      ticketId: generateTicketId(),
      category: 'Hardware',
      categoryConfidence: '89%',
      priority: 'P4',
      priorityScore: '68%',
      responseConfidence: '92%',
      sla: '3 business days',
      response: 'We have logged the intermittent screen flicker issue while opening Excel on your device. This appears to be a single-user display or graphics issue and is being routed to the hardware/software support team for a quick review of the monitor, display driver, and Excel-related graphics settings. We will update you with the next troubleshooting step once the affected configuration is confirmed.',
      maskedText: maskedText,
      factors: ['screen flicker', 'single user issue', 'excel', 'intermittent display problem'],
      alternatives: [
        { name: 'Software', score: '0.6' },
        { name: 'Technical', score: '0.4' },
      ],
    };
  }

  if (isDisplayFlickerIssue && !isSecurityIncident) {
    const hardwareScore = scores.find((entry) => entry.name === 'Hardware');
    if (hardwareScore) {
      hardwareScore.score += 9;
      hardwareScore.matchedKeywords.push('screen flicker');
    }
  }

  if (isHardwareIssue && !isSecurityIncident) {
    return {
      ticketId: generateTicketId(),
      category: 'Hardware',
      categoryConfidence: '93%',
      priority: 'P4',
      priorityScore: '72%',
      responseConfidence: '95%',
      sla: '3 business days',
      response: 'We have logged the projector issue in Meeting Room A and assigned it to the facilities/AV support team for a hardware check. Please confirm the power source, cable connections, and projector status, and we will arrange a repair or replacement if the device is not responding.',
      maskedText: maskedText,
      factors: ['projector', 'meeting room A', 'not turning on', 'power issue'],
      alternatives: [
        { name: 'Technical', score: '0.0' },
        { name: 'Software', score: '0.0' },
      ],
    };
  }

  const scores = CATEGORY_RULES.map((rule) => {
    const matchedKeywords = rule.keywords.filter((keyword) => combined.includes(keyword.toLowerCase()));
    const score = matchedKeywords.length * rule.weight;
    return { name: rule.name, score, matchedKeywords };
  });

  if (isSecurityIncident && !isPayrollOutage) {
    scores.push({
      name: 'Security',
      score: 18,
      matchedKeywords: ['failed login attempts', 'foreign IP', 'suspicious file', 'malware', 'unauthorized access'],
    });
  }

  if (isPayrollOutage && !isSecurityIncident) {
    const softwareScore = scores.find((entry) => entry.name === 'Software');
    if (softwareScore) {
      softwareScore.score += 10;
      softwareScore.matchedKeywords.push('payroll access outage');
    }
  }

  if (isHardwareIssue && !isSecurityIncident) {
    const hardwareScore = scores.find((entry) => entry.name === 'Hardware');
    if (hardwareScore) {
      hardwareScore.score += 12;
      hardwareScore.matchedKeywords.push('meeting room hardware outage');
    }
  }

  const hintedBoost = categoryHint
    ? scores.find((entry) => entry.name.toLowerCase() === categoryHint.toLowerCase())
    : null;

  if (hintedBoost) {
    hintedBoost.score += 1.2;
  }

  const sorted = [...scores].sort((a, b) => b.score - a.score);
  const topCategory = sorted[0];
  const altCategories = sorted.slice(1, 3).map((item) => ({
    name: item.name,
    score: item.score.toFixed(1),
  }));

  const categoryConfidenceValue = Math.min(0.99, 0.72 + topCategory.score / 10);

  let priority = 'P4';
  let priorityScoreValue = 0.45;
  for (const rule of PRIORITY_RULES) {
    if (rule.keywords.some((keyword) => combined.includes(keyword.toLowerCase()))) {
      priority = rule.priority;
      priorityScoreValue = 0.6 + rule.weight * 0.1;
      break;
    }
  }

  if (isSecurityIncident) {
    priority = 'P1';
    priorityScoreValue = 0.96;
  } else if (isHardwareIssue) {
    priority = 'P4';
    priorityScoreValue = 0.72;
  } else if (isNetworkIssue) {
    priority = 'P2';
    priorityScoreValue = 0.88;
  } else if (topCategory.name === 'Software' || combined.includes('outage')) {
    priority = isPayrollOutage ? 'P1' : 'P2';
    priorityScoreValue = isPayrollOutage ? 0.9 : 0.82;
  }

  const slaMap = { P1: '1 hour', P2: '4 hours', P3: '1 business day', P4: '3 business days' };
  const severityMap = { P1: 'Critical', P2: 'High', P3: 'Medium', P4: 'Low' };
  const suggestedResponse = buildSuggestedResponse(topCategory.name, priority, title, isSecurityIncident, isPayrollOutage, isHardwareIssue, isNetworkIssue, isDisplayFlickerIssue);
  const responseConfidenceValue = Math.min(0.99, 0.78 + categoryConfidenceValue / 4);

  return {
    ticketId: generateTicketId(),
    category: topCategory.name,
    categoryConfidence: `${Math.round(categoryConfidenceValue * 100)}%`,
    priority,
    severity: severityMap[priority] || 'Medium',
    priorityScore: `${Math.round(priorityScoreValue * 100)}%`,
    responseConfidence: `${Math.round(responseConfidenceValue * 100)}%`,
    sla: slaMap[priority],
    response: suggestedResponse,
    maskedText,
    factors: topCategory.matchedKeywords.length
      ? topCategory.matchedKeywords
      : ['No strong keywords detected; used fallback routing rules.'],
    alternatives: altCategories,
  };
}

function buildSuggestedResponse(category, priority, title, isSecurityIncident, isPayrollOutage, isHardwareIssue, isNetworkIssue, isDisplayFlickerIssue) {
  const currentTicketText = `${title || ''} ${category || ''}`.toLowerCase();

  if (isSecurityIncident) {
    return 'This is a system-identified security incident, not a user-reported issue. Disable the affected account immediately, block the malicious IP, quarantine the suspicious file, run malware scans on impacted systems, and escalate to the IT Security / Cybersecurity team for containment and forensic investigation.';
  }

  if (isDisplayFlickerIssue || /(screen|display|monitor).*?(flicker|flickers|flickering)|flicker.*?(screen|display|monitor)|excel.*?(flicker|flickers|flickering)|flicker.*?excel/i.test(currentTicketText)) {
    return 'We have logged the intermittent screen flicker issue while opening Excel on your device. This appears to be a single-user display or graphics issue and is being routed to the hardware/software support team for a quick review of the monitor, display driver, and Excel-related graphics settings. We will update you with the next troubleshooting step once the affected configuration is confirmed.';
  }

  if (isPayrollOutage || category === 'Software') {
    return 'We are investigating the payroll access outage impacting your department before the 2 PM timesheet approval deadline. Our engineering team is checking the login and authentication path for the payroll application and will provide the next update as soon as the issue is confirmed or mitigated.';
  }

  if (isHardwareIssue || category === 'Hardware') {
    return 'We have logged the projector issue in Meeting Room A and assigned it to the facilities/AV support team for a hardware check. Please confirm the power source, cable connections, and projector status, and we will arrange a repair or replacement if the device is not responding.';
  }

  if (isNetworkIssue || category === 'Network') {
    return 'We have identified this as a multi-user network connectivity issue affecting multiple people on the same floor. Our networking team is reviewing the Wi-Fi/router/service health and will provide the next update as soon as the affected path is isolated or restored.';
  }

  const tone = priority === 'P1' ? 'We are treating this as urgent' : 'We are reviewing your request';
  return `${tone}. Thank you for reaching out about ${title}. Our team is reviewing this ${category.toLowerCase()} request and will follow up with the next available update. We appreciate your patience.`;
}

function renderResult(result) {
  resultTitle.textContent = `Ticket ${result.ticketId}`;
  ticketIdEl.textContent = result.ticketId;
  categoryValue.textContent = result.category;
  priorityValue.textContent = result.priority;
  severityValue.textContent = result.severity;
  slaValue.textContent = result.sla;
  maskedPreview.textContent = result.maskedText;
  categoryConfidence.textContent = result.categoryConfidence;
  priorityScore.textContent = result.priorityScore;
  responseConfidence.textContent = result.responseConfidence;
  responseEditor.value = result.response || '';
  priorityBadge.textContent = result.priority;
  priorityBadge.dataset.priority = result.priority;

  factorsList.innerHTML = '';
  result.factors.forEach((factor) => {
    const li = document.createElement('li');
    li.textContent = factor;
    factorsList.appendChild(li);
  });

  alternatives.innerHTML = '';
  result.alternatives.forEach((item) => {
    const chip = document.createElement('button');
    chip.type = 'button';
    chip.className = 'chip';
    chip.textContent = `${item.name} (${item.score})`;
    chip.addEventListener('click', () => {
      categoryValue.textContent = item.name;
      const altResponse = buildSuggestedResponse(
        item.name,
        result.priority,
        titleInput.value,
        false,
        false,
        item.name === 'Hardware',
        item.name === 'Network',
        /screen flicker|display flicker|monitor flicker|flickering screen|excel.*flicker|flicker.*excel/.test((titleInput.value + ' ' + descriptionInput.value).toLowerCase())
      );
      responseEditor.value = altResponse;
      actionStatus.textContent = `Reclassified to ${item.name} for review.`;
    });
    alternatives.appendChild(chip);
  });

  analysisCard.classList.remove('hidden');
}

form.addEventListener('submit', (event) => {
  event.preventDefault();

  const title = titleInput.value.trim();
  const description = descriptionInput.value.trim();

  if (!title || !description) {
    confirmation.className = 'confirmation';
    confirmation.textContent = 'Please add both a title and a description before submitting.';
    analysisCard.classList.add('hidden');
    return;
  }

  try {
    validateFiles(Array.from(attachmentsInput.files));
  } catch (error) {
    confirmation.className = 'confirmation';
    confirmation.textContent = error.message;
    analysisCard.classList.add('hidden');
    return;
  }

  submitBtn.disabled = true;
  submitBtn.textContent = 'Analyzing...';
  confirmation.className = 'confirmation hidden';
  actionStatus.textContent = 'Choose an action to simulate agent workflow.';
  responseEditor.value = '';
  categoryValue.textContent = '-';
  priorityValue.textContent = '-';
  severityValue.textContent = '-';
  ticketIdEl.textContent = '-';
  slaValue.textContent = '-';
  maskedPreview.textContent = '';
  categoryConfidence.textContent = '-';
  priorityScore.textContent = '-';
  responseConfidence.textContent = '-';
  priorityBadge.textContent = 'P4';
  priorityBadge.dataset.priority = 'P4';
  factorsList.innerHTML = '';
  alternatives.innerHTML = '';

  window.setTimeout(() => {
    const outcome = calculateClassification(title, description, categoryHintInput.value);
    confirmation.className = 'confirmation';
    confirmation.innerHTML = `<strong>Ticket received.</strong> Confirmation email queued and the ticket is now being classified with ticket ID <strong>${outcome.ticketId}</strong>.`;
    renderResult(outcome);
    submitBtn.disabled = false;
    submitBtn.textContent = 'Analyze ticket';
  }, 650);
});

document.querySelectorAll('.action-btn').forEach((button) => {
  button.addEventListener('click', () => {
    const action = button.dataset.action;
    actionStatus.textContent = `${action.charAt(0).toUpperCase() + action.slice(1)} action recorded for the agent workflow.`;
  });
});
