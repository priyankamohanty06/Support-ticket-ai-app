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
    name: 'Technical',
    keywords: ['bug', 'error', 'crash', 'server', 'api', 'timeout', 'slow', 'login', 'database', 'deployment', 'unable'],
    weight: 1.1,
  },
  {
    name: 'Billing',
    keywords: ['billing', 'invoice', 'refund', 'charge', 'payment', 'subscription', 'receipt', 'credit card'],
    weight: 1.1,
  },
  {
    name: 'Account',
    keywords: ['account', 'password', 'access', 'profile', 'unlock', 'suspend', 'email', 'user'],
    weight: 0.95,
  },
  {
    name: 'Security',
    keywords: ['security', 'breach', 'hack', 'unauthorized', 'data leak', 'phishing', 'malware'],
    weight: 1.25,
  },
  {
    name: 'Product',
    keywords: ['feature', 'request', 'product', 'dashboard', 'integration', 'report', 'mobile app', 'workflow'],
    weight: 0.9,
  },
];

const PRIORITY_RULES = [
  { priority: 'P1', keywords: ['outage', 'critical', 'down', 'urgent', 'breach', 'data loss', 'security'], weight: 3 },
  { priority: 'P2', keywords: ['cannot login', 'payment failed', 'refund', 'error', 'slow', 'bug'], weight: 2 },
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

  const scores = CATEGORY_RULES.map((rule) => {
    const matchedKeywords = rule.keywords.filter((keyword) => combined.includes(keyword.toLowerCase()));
    const score = matchedKeywords.length * rule.weight;
    return { name: rule.name, score, matchedKeywords };
  });

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

  const categoryConfidenceValue = Math.min(0.96, 0.7 + topCategory.score / 10);

  let priority = 'P4';
  let priorityScoreValue = 0.45;
  for (const rule of PRIORITY_RULES) {
    if (rule.keywords.some((keyword) => combined.includes(keyword.toLowerCase()))) {
      priority = rule.priority;
      priorityScoreValue = 0.6 + rule.weight * 0.1;
      break;
    }
  }

  if (topCategory.name === 'Security' || combined.includes('outage')) {
    priority = 'P1';
    priorityScoreValue = 0.92;
  }

  const slaMap = { P1: '1 hour', P2: '4 hours', P3: '1 business day', P4: '3 business days' };
  const suggestedResponse = buildSuggestedResponse(topCategory.name, priority, title);
  const responseConfidenceValue = Math.min(0.95, 0.74 + categoryConfidenceValue / 4);

  return {
    ticketId: generateTicketId(),
    category: topCategory.name,
    categoryConfidence: `${Math.round(categoryConfidenceValue * 100)}%`,
    priority,
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

function buildSuggestedResponse(category, priority, title) {
  const tone = priority === 'P1' ? 'We are treating this as urgent' : 'We are reviewing your request';
  return `${tone}. Thank you for reaching out about ${title}. Our team is reviewing this ${category.toLowerCase()} request and will follow up with the next available update. We appreciate your patience.`;
}

function renderResult(result) {
  resultTitle.textContent = `Ticket ${result.ticketId}`;
  ticketIdEl.textContent = result.ticketId;
  categoryValue.textContent = result.category;
  slaValue.textContent = result.sla;
  maskedPreview.textContent = result.maskedText;
  categoryConfidence.textContent = result.categoryConfidence;
  priorityScore.textContent = result.priorityScore;
  responseConfidence.textContent = result.responseConfidence;
  responseEditor.value = result.response;
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
      responseEditor.value = buildSuggestedResponse(item.name, result.priority, titleInput.value);
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
