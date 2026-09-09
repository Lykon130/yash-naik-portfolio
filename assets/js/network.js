const CLUSTERS = [
  { org: 'MCX', projects: [
      { title: 'CSQ AI Engine', tags: ['MCX', 'Ongoing'],
        desc: 'An AI-powered customer support helpdesk for MCX (commodity exchange) traders — combining a RAG-based knowledge base, LLM query answering, multi-channel ingestion (email/audio/documents), and compliance/audit tooling, all built to run fully air-gapped on-premises with local models for LLM inference, embeddings, transcription, and NER.' },
      { title: 'Compliance AI Engine', tags: ['MCX', 'Ongoing'],
        desc: 'An AI-powered Compliance chatbot for MCX (commodity exchange) internal staff — combining a RAG-based knowledge base, LLM query answering, and compliance/audit tooling, all built to run fully air-gapped on-premises with local models for LLM inference and embeddings.' },
      { title: 'Trade Alert Monitoring & Visualization', tags: ['MCX', 'Ongoing'],
        desc: 'Python-based automated validation engine that extracts trade alerts from databases and evaluates them against configurable time windows, threshold checks, and multiple business-rule conditions to classify alerts as genuine or false positives. Built an end-to-end analysis and audit layer that generates visualizations and validation metrics, maintains detailed execution logs, and provides traceability for every alert decision.' },
      { title: 'Investor Protection Deepfake Analyser', tags: ['MCX', 'Ongoing'],
        desc: 'AI-powered media verification system to detect potential deepfakes across images and videos by analyzing visual artifacts, facial/manipulation patterns, and contextual information associated with the content. Designed the system to assess media authenticity and flag potentially manipulated or misleading content, supporting investor protection and reducing risks from AI-generated misinformation.' }
    ] },
  { org: 'Aeonx', projects: [
      { title: 'Azure to GCP Migration', tags: ['Aeonx', 'Client', '2026'],
        desc: 'End-to-end migration of enterprise data infrastructure and processing workloads from Azure to Google Cloud Platform (GCP), including databases, stored procedures, views, data pipelines, and dependent business processes. Ensured functional parity, data integrity, pipeline continuity, and minimal disruption while adapting Azure-native components to GCP services and architecture.' },
      { title: 'Lead Prediction Model', tags: ['Aeonx', 'Client', '2025'],
        desc: 'Machine Learning–based lead scoring system to predict the probability of prospective clients purchasing a property, enabling sales teams to prioritize high-intent leads. Evaluated and combined multiple ML models with feature engineering, model validation, and probability-based scoring to improve prediction reliability and support data-driven sales decisions.' },
      { title: 'CommHum', tags: ['Aeonx', '2026'],
        desc: 'AI-driven communication platform that consolidates and analyzes messages, emails, call transcripts, and field/visit reports to provide a unified view of customer and stakeholder interactions. Built intelligent response-generation capabilities that analyze conversation context, intent, and sentiment to draft contextually appropriate replies while adapting the language and tone to match the original communication.' }
    ] },
  { org: 'TCS', projects: [
      { title: 'PDF Splitter & Payload Generator', tags: ['TCS', 'Client', '2025'],
        desc: 'Java-based document processing application to split large consolidated PDF records into client ID–specific document chunks, enabling efficient downstream ingestion and retrieval. Automated the generation of detailed XML metadata for each extracted document, ensuring accurate client-level mapping, traceability, and structured document processing.' },
      { title: 'Policy & Claim Management System', tags: ['TCS', 'Client', '2025'],
        desc: 'AI-driven insurance platform to streamline policy and claim processing by extracting and validating information from claim documents, automating claim form completion, and assessing claims against policy rules and historical patterns. Implemented AI/ML-based fraud detection to identify anomalous, inconsistent, or potentially fraudulent claims and flag them for further investigation.' },
      { title: 'CMIO Migration', tags: ['TCS', 'Client', '2024'],
        desc: 'Java-based end-to-end migration solution to transfer banking applications, programs, business processes, databases, and enterprise data from an acquired bank to the parent bank. Ensured data integrity, process compatibility, and seamless integration of migrated systems while minimizing disruption to critical banking operations.' },
      { title: 'Archive Conditioner', tags: ['TCS', 'Client', '2023'],
        desc: 'Java-based data archival solution to identify and archive redundant, inactive, and historical client data from banking systems based on predefined retention and archival policies. Automated data extraction, validation, and archival workflows while maintaining data integrity, auditability, and accessibility of archived records for regulatory and business requirements.' }
    ] },
  { org: 'CSPL', projects: [
      { title: 'Attendance Manager', tags: ['CSPL', 'Client', '2021'],
        desc: 'C#/.NET-based attendance management system for MNC clients to automate employee attendance tracking, shift and work-hour management, and attendance record processing. Implemented backend business logic, database integration, validations, and reporting workflows to support accurate and scalable workforce management across enterprise environments.' },
      { title: 'Office Manager', tags: ['CSPL', 'Client', '2021'],
        desc: 'C# based internal office management platform for a Maharashtra-based political organization to digitize and streamline day-to-day administrative operations, employee coordination, task tracking, and organizational workflows. Implemented backend services, database management, role-based access, and workflow automation to improve operational efficiency and centralized information management.' }
    ] },
  { org: 'CShells', projects: [
      { title: 'Inventory Buddy', tags: ['CShells', '2020'],
        desc: 'Java-based inventory management application to automate end-to-end inventory operations, including product management, stock tracking, inward/outward transactions, inventory updates, and low-stock monitoring. Implemented database-driven workflows and validation mechanisms to maintain accurate inventory records and provide reliable visibility into stock levels and movement.' },
      { title: 'Billing Buddy', tags: ['CShells', '2019'],
        desc: 'Java-based billing application to automate invoice generation, product and customer management, pricing calculations, tax/discount handling, and transaction record maintenance. Implemented database-backed business logic and validation workflows to ensure accurate billing, transaction processing, and reliable financial record management.' },
      { title: 'MoneyD', tags: ['CShells', '2019'],
        desc: 'Splitwise-like expense management application that enables users to create groups, record shared expenses, and automatically calculate individual liabilities and settlements. Extended the standard expense-splitting model with a "Going Dutch" option for equal bill sharing, along with transaction tracking and simplified settlement calculations.' }
    ] }
];

const PERSONAL = [
  { title: 'NEST', tags: ['Personal', 'Ongoing'],
    desc: 'Building an 11-specialist federated transformer system (~9.4B params) from scratch on a single consumer GPU, using memory-bounded sequential training (bf16, 8-bit offloaded Adam, gradient checkpointing) under a milestone-gated developmental curriculum. Validates staged curriculum learning and workspace-based specialist federation as core research questions; provenance/fault-tolerance infrastructure complete, training pipeline in progress.' },
  { title: 'RE Predict', tags: ['Personal', 'Ongoing'],
    desc: 'A full-stack real-estate intelligence SaaS enabling multi-source data ingestion, dynamic ML buyer-propensity predictions, and lead scoring. Developed analytics dashboards and a sales CRM for lead outcomes, property insights, deal pipelines, revenue, commissions, targets, and sales-representative performance tracking.' },
  { title: 'PsyBuddy', tags: ['Personal', '2025'],
    desc: 'AI-Powered Mental Health Assistant. Designed and developed a scalable RAG-based conversational AI platform featuring emotion detection, semantic memory, and personalized multi-turn conversations. Engineered a modular backend with triple persona orchestration, long-term memory retrieval, and secure cloud-ready architecture, optimizing AI response quality, contextual relevance, and user experience.' },
  { title: 'A.T.H.E.N.A', tags: ['Personal', 'Ongoing'],
    desc: 'A modular AI command platform that orchestrates domain-specific skills across engineering, finance research, planning, and analytics through a centralized routing layer. Designed persistent knowledge management using an Obsidian-based graph vault, with planned HUD and local voice interfaces, while enforcing policy-based safety controls for restricted operations such as automated trading.' },
  { title: 'The Uno AI', tags: ['Personal', '2026'],
    desc: 'AI-Powered Social Media Strategy Engine. Designed and developed an AI engine that transforms organization context, budget, objectives, and timelines into data-driven, customized social media strategies.' },
  { title: 'Park Assist', tags: ['Personal', 'Ongoing'],
    desc: 'AI-Powered Parking Allocation Engine. Developed an AI-driven parking allocation system that analyzes building and parking blueprints to dynamically assign parking spaces to apartments based on predefined allocation rules and constraints.' },
  { title: 'B.H.A.I', tags: ['Personal', '2018'],
    desc: 'Early-stage AI chatbot using Hidden Markov Models (HMMs) and pre-Transformer NLP techniques to experiment with adaptive, personality-driven conversations. Designed the system to learn from user interactions and dynamically adapt its conversational style, with a focus on creating a friendly, sarcastic, and personalized AI personality.' }
];

function buildGraph() {
  const nodes = [];
  const rawEdges = [];
  const cx = 50, cy = 50;
  const orgRadius = 36;
  const firstIds = [];
  CLUSTERS.forEach((cluster, ci) => {
    const angle = (ci / CLUSTERS.length) * 2 * Math.PI - Math.PI / 2;
    const ccx = cx + orgRadius * Math.cos(angle);
    const ccy = cy + orgRadius * Math.sin(angle) * 0.8;
    const ids = [];
    cluster.projects.forEach((p, pi) => {
      const n = cluster.projects.length;
      const subAngle = n === 1 ? 0 : (pi / n) * 2 * Math.PI;
      const r = n === 1 ? 0 : 10;
      const nx = Math.max(6, Math.min(94, ccx + r * Math.cos(subAngle)));
      const ny = Math.max(8, Math.min(94, ccy + r * Math.sin(subAngle) * 0.8));
      const id = cluster.org + '-' + pi;
      nodes.push({ id, title: p.title, org: cluster.org, desc: p.desc, tags: p.tags, x: nx, y: ny, personal: false });
      ids.push(id);
    });
    for (let a = 0; a < ids.length; a++) for (let b = a + 1; b < ids.length; b++) rawEdges.push([ids[a], ids[b]]);
    firstIds.push(ids[0]);
  });

  const nestData = PERSONAL.find((p) => p.title === 'NEST');
  const ringPersonal = PERSONAL.filter((p) => p.title !== 'NEST');
  const nestId = 'Personal-NEST';
  nodes.push({ id: nestId, title: nestData.title, org: 'Personal', desc: nestData.desc, tags: nestData.tags, x: cx, y: cy, personal: true, isHub: true });

  const personalIds = [];
  ringPersonal.forEach((p, pi) => {
    const n = ringPersonal.length;
    const subAngle = (pi / n) * 2 * Math.PI + Math.PI / 4;
    const r = 14;
    const nx = cx + r * Math.cos(subAngle);
    const ny = cy + r * Math.sin(subAngle) * 0.8;
    const id = 'Personal-' + pi;
    nodes.push({ id, title: p.title, org: 'Personal', desc: p.desc, tags: p.tags, x: nx, y: ny, personal: true });
    personalIds.push(id);
  });
  personalIds.forEach((id) => rawEdges.push([nestId, id]));
  for (let a = 0; a < personalIds.length; a++) for (let b = a + 1; b < personalIds.length; b++) rawEdges.push([personalIds[a], personalIds[b]]);
  firstIds.forEach((id) => rawEdges.push([nestId, id]));
  firstIds.forEach((id, i) => rawEdges.push([id, firstIds[(i + 1) % firstIds.length]]));
  return { nodes, rawEdges };
}

function hashSeed(str) {
  let h = 0;
  for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) % 9973;
  return h;
}

function wanderOffset(seed, t, amp) {
  const f1 = 0.0001848 + (seed % 7) * 0.0000672;
  const f2 = 0.0003276 + (seed % 5) * 0.0000924;
  const f3 = 0.0004704 + (seed % 11) * 0.0000672;
  const p1 = seed * 0.71;
  const p2 = seed * 1.93;
  const p3 = seed * 3.17;
  const dx = Math.sin(t * f1 + p1) * 0.45 + Math.sin(t * f2 * 1.7 + p2 * 1.3) * 0.35 + Math.sin(t * f3 + p3) * 0.35;
  const dy = Math.cos(t * f1 * 1.3 + p2) * 0.45 + Math.cos(t * f2 + p1 * 1.1) * 0.35 + Math.cos(t * f3 * 1.6 + p3 * 0.8) * 0.35;
  return { dx: dx * amp, dy: dy * amp };
}

document.addEventListener('DOMContentLoaded', () => {
  initStarfield('starfield', 160);

  const accent = 'oklch(68% 0.19 200)';
  const accent2 = 'oklch(74% 0.15 135)';

  const GRAPH = buildGraph();
  const NODE_MAP = {};
  GRAPH.nodes.forEach((n) => { NODE_MAP[n.id] = n; });

  const svg = document.getElementById('graph-svg');
  const nodesWrap = document.getElementById('graph-nodes');
  const graphWrap = document.getElementById('graph-wrap');
  const tooltip = document.getElementById('node-tooltip');
  const tooltipOrg = document.getElementById('tooltip-org');
  const tooltipTitle = document.getElementById('tooltip-title');
  const tooltipDesc = document.getElementById('tooltip-desc');
  const tooltipTags = document.getElementById('tooltip-tags');

  const lineEls = {};
  GRAPH.rawEdges.forEach((edge, i) => {
    const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    line.setAttribute('vector-effect', 'non-scaling-stroke');
    svg.appendChild(line);
    lineEls[i] = line;
  });

  const dotEls = {};
  GRAPH.nodes.forEach((n) => {
    const dot = document.createElement('div');
    dot.className = 'node-dot';
    nodesWrap.appendChild(dot);
    dotEls[n.id] = dot;
  });

  let hoveredId = null;
  let livePos = {};

  function render(t) {
    livePos = {};
    GRAPH.nodes.forEach((n) => {
      if (n.isHub) {
        const r = 4;
        livePos[n.id] = { x: n.x + r * Math.cos(t * 0.000294), y: n.y + r * Math.sin(t * 0.000294) * 0.8 };
        return;
      }
      const seed = hashSeed(n.id);
      const off = wanderOffset(seed, t, n.personal ? 26 : 22);
      livePos[n.id] = { x: Math.max(4, Math.min(96, n.x + off.dx)), y: Math.max(6, Math.min(96, n.y + off.dy)) };
    });

    GRAPH.rawEdges.forEach(([a, b], i) => {
      const pa = livePos[a], pb = livePos[b];
      const active = hoveredId && (a === hoveredId || b === hoveredId);
      const dim = hoveredId && !active;
      const line = lineEls[i];
      line.setAttribute('x1', pa.x); line.setAttribute('y1', pa.y);
      line.setAttribute('x2', pb.x); line.setAttribute('y2', pb.y);
      line.style.stroke = active ? accent : accent2;
      line.style.strokeWidth = active ? 0.6 : 0.35;
      line.style.opacity = dim ? 0.15 : (active ? 1 : 0.85);
      line.style.filter = active ? `drop-shadow(0 0 3px ${accent})` : `drop-shadow(0 0 1.5px ${accent2})`;
    });

    GRAPH.nodes.forEach((n) => {
      const isHovered = hoveredId === n.id;
      const dim = hoveredId && !isHovered;
      const size = isHovered ? 24 : 17;
      const pos = livePos[n.id];
      const dot = dotEls[n.id];
      dot.style.left = pos.x + '%';
      dot.style.top = pos.y + '%';
      dot.style.width = size + 'px';
      dot.style.height = size + 'px';
      dot.style.background = n.personal ? accent2 : accent;
      dot.style.boxShadow = isHovered ? `0 0 22px ${n.personal ? accent2 : accent}` : `0 0 8px ${n.personal ? accent2 : accent}`;
      dot.style.opacity = dim ? 0.35 : 1;
      dot.style.zIndex = isHovered ? 3 : 2;
      dot.style.animation = dim ? 'none' : `nodeGlow ${3 + (n.x % 3)}s ease-in-out infinite`;
    });

    if (hoveredId) {
      const pos = livePos[hoveredId];
      const node = NODE_MAP[hoveredId];
      tooltip.style.display = 'block';
      tooltip.style.left = pos.x + '%';
      tooltip.style.top = pos.y + '%';
      tooltipOrg.textContent = node.org;
      tooltipOrg.style.color = node.personal ? accent2 : accent;
      tooltipTitle.textContent = node.title;
      tooltipDesc.textContent = node.desc;
      tooltipTags.innerHTML = '';
      (node.tags || []).forEach((tag) => {
        const chip = document.createElement('span');
        chip.className = 't-tag';
        chip.textContent = tag;
        tooltipTags.appendChild(chip);
      });
    } else {
      tooltip.style.display = 'none';
    }
  }

  let lastTs = null;
  let tAccum = 0;
  function tick(ts) {
    if (lastTs == null) lastTs = ts;
    const dt = ts - lastTs;
    lastTs = ts;
    if (!hoveredId) tAccum += dt;
    render(tAccum);
    requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);

  graphWrap.addEventListener('mousemove', (e) => {
    const rect = graphWrap.getBoundingClientRect();
    const px = ((e.clientX - rect.left) / rect.width) * 100;
    const py = ((e.clientY - rect.top) / rect.height) * 100;
    let nearest = null, nearestDist = Infinity;
    Object.entries(livePos).forEach(([id, p]) => {
      const d = Math.hypot(p.x - px, p.y - py);
      if (d < nearestDist) { nearestDist = d; nearest = id; }
    });
    hoveredId = (nearest && nearestDist < 8) ? nearest : null;
  });
  graphWrap.addEventListener('mouseleave', () => { hoveredId = null; });
});
