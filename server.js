const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const Ajv = require('ajv');
const ajv = new Ajv();

const app = express();
const PORT = 4000;

// TARGET PROJECT CONFIGURATION
// This points the dashboard exactly to your core engine repository
const TARGET_PROJECT_DIR = path.join(__dirname, '..', 'yield-force'); 

// Target Data Files (Live in the core engine)
const STATE_FILE = path.join(TARGET_PROJECT_DIR, 
'yf_governor_state.json');
const BLUEPRINT_FILE = path.join(TARGET_PROJECT_DIR, 'Yield Force 
Blueprint-2.md');

// Tooling Local Files (Live in the dev-tools repo)
const ARCHIVE_DIR = path.join(__dirname, 'archives');
const ADR_FILE = path.join(__dirname, 'session_adrs.json');

// Initialize ADR storage if not exists
if (!fs.existsSync(ADR_FILE)) {
  fs.writeFileSync(ADR_FILE, JSON.stringify([], null, 2), 'utf8');
}

// SCHEMAS
const coreSchema = {
  type: "object",
  properties: {
    governor_state: { type: "object" },
    media_mapping: { type: "object" }
  },
  required: ["governor_state"],
  additionalProperties: true
};

const tenantSchema = {
  type: "object",
  properties: {
    tenants: { type: "array" }
  },
  required: ["tenants"],
  additionalProperties: true
};

const validateCore = ajv.compile(coreSchema);
const validateTenant = ajv.compile(tenantSchema);

if (!fs.existsSync(ARCHIVE_DIR)) {
  fs.mkdirSync(ARCHIVE_DIR);
}

app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.static(__dirname));

function archiveFile(filePath) {
  if (fs.existsSync(filePath)) {
    const timestamp = Math.floor(Date.now() / 1000);
    const ext = path.extname(filePath);
    const base = path.basename(filePath, ext);
    const archivePath = path.join(ARCHIVE_DIR, 
`${base}_${timestamp}${ext}`);
    fs.copyFileSync(filePath, archivePath);
  }
}

/**
 * RIGID 100% FIDELITY COMPILER
 */
function compileBlueprintToMarkdown(governor_state, media_mapping) {
  let md = "# " + (governor_state.document_title || "YIELD FORCE: 
SOVEREIGN ARCHITECTURE BLUEPRINT") + "\n\n";

  const partKeys = ['part_I', 'part_II', 'part_III'];
  partKeys.forEach(partKey => {
    const part = governor_state[partKey];
    if (part) {
      md += `## ${part.title || partKey}\n\n`;

      if (part.chapters && Array.isArray(part.chapters)) {
        part.chapters.forEach(chapter => {
          md += `### Chapter ${chapter.chapter_number}: 
${chapter.title}\n\n`;
          let content = chapter.content || "";

          content = content.replace(/\[placeholder (.*?)\]/g, (match, 
key) => 
            media_mapping && media_mapping[key] ? 
`![${key}](./assets/${media_mapping[key]})` : match
          );

          content = content.replace(/```[\s\S]*?```/g, match => 
            match.split('\n').map(line => line.replace(/^\s+/, 
'')).join('\n')
          );

          md += `${content}\n\n`;
        });
      }
    }
  });

  fs.writeFileSync(BLUEPRINT_FILE, md, 'utf8');
  return md;
}

// ADR ROUTES
app.get('/api/adrs', (req, res) => {
  fs.readFile(ADR_FILE, 'utf8', (err, data) => {
    if (err) return res.status(500).json({ error: 'Read Error' });
    res.json(JSON.parse(data));
  });
});

app.post('/api/adrs', (req, res) => {
  fs.readFile(ADR_FILE, 'utf8', (err, data) => {
    if (err) return res.status(500).json({ error: 'Read Error' });
    const adrs = JSON.parse(data);
    
    const nextIdNum = adrs.length + 1;
    const adrId = `ADR-${nextIdNum.toString().padStart(3, '0')}`;
    
    const newAdr = {
      id: adrId,
      ...req.body,
      timestamp: new Date().toISOString()
    };
    
    adrs.push(newAdr);
    fs.writeFile(ADR_FILE, JSON.stringify(adrs, null, 2), 'utf8', 
(writeErr) => {
      if (writeErr) return res.status(500).json({ error: 'Write Error' 
});
      res.status(200).json(newAdr);
    });
  });
});

app.put('/api/adrs/:id', (req, res) => {
  fs.readFile(ADR_FILE, 'utf8', (err, data) => {
    if (err) return res.status(500).json({ error: 'Read Error' });
    let adrs = JSON.parse(data);
    const index = adrs.findIndex(a => a.id === req.params.id);
    
    if (index === -1) return res.status(404).json({ error: 'ADR not 
found' });
    
    // Maintain ID and Timestamp if not provided in body
    const updatedAdr = {
      ...adrs[index],
      ...req.body,
      id: req.params.id // Ensure ID remains consistent
    };
    
    adrs[index] = updatedAdr;
    fs.writeFile(ADR_FILE, JSON.stringify(adrs, null, 2), 'utf8', 
(writeErr) => {
      if (writeErr) return res.status(500).json({ error: 'Write Error' 
});
      res.status(200).json(updatedAdr);
    });
  });
});

// EXPORT HANDOVER ROUTE
app.get('/api/export-handover', (req, res) => {
  if (!fs.existsSync(BLUEPRINT_FILE)) {
    return res.status(404).json({ error: 'Blueprint Markdown not found' 
});
  }

  const blueprint = fs.readFileSync(BLUEPRINT_FILE, 'utf8');
  const adrData = JSON.parse(fs.readFileSync(ADR_FILE, 'utf8'));
  
  // Filter for Active ADRs
  const activeAdrs = adrData.filter(adr => adr.status === '[ACTIVE]');
  
  let exportPayload = blueprint + "\n\n---\n\n# ACTIVE ARCHITECTURE 
DECISION RECORDS (ADR)\n\n";
  
  if (activeAdrs.length > 0) {
    activeAdrs.forEach(adr => {
      exportPayload += `## ${adr.id}: ${adr.title || 'Untitled'}\n`;
      exportPayload += `- **Scope**: ${adr.scope || 'N/A'}\n`;
      exportPayload += `- **Friction**: ${adr.friction || 'N/A'}\n`;
      exportPayload += `- **Ruling**: ${adr.ruling || 'N/A'}\n`;
      exportPayload += `- **Boundary**: ${adr.boundary || 'N/A'}\n\n`;
    });
  } else {
    exportPayload += "_No active ADRs found._\n\n";
  }

  // House Rules Injection
  exportPayload += "---\n\n# MANDATORY LLM HOUSE RULES\n";
  exportPayload += "1. ADR Protocol: After every technical 
brainstorming loop, you MUST ask the PM if they want an 'ADR 
Breakdown'. If requested, you must output the Title (omitting the 
ADR-XXX number). Then, you MUST output the text for Friction, Ruling, 
and Boundary inside three SEPARATE plain text blocks (markdown code 
blocks) so the user can easily copy and paste them into their UI fields 
one by one.\n";
  exportPayload += "2. Constraint Adherence: You must never suggest 
code or architecture that violates the Boundaries listed in the Active 
ADRs.\n";

  res.json({ content: exportPayload });
});

// BLUEPRINT ROUTE
app.get('/api/blueprint', (req, res) => {
  if (!fs.existsSync(BLUEPRINT_FILE)) {
    return res.status(404).json({ error: 'Blueprint Markdown not found' 
});
  }
  fs.readFile(BLUEPRINT_FILE, 'utf8', (err, data) => {
    if (err) return res.status(500).json({ error: 'Read Error' });
    res.json({ content: data });
  });
});

// CORE GOVERNOR STATE ROUTES
app.get('/api/state', (req, res) => {
  if (!fs.existsSync(STATE_FILE)) return res.json({});
  fs.readFile(STATE_FILE, 'utf8', (err, data) => {
    if (err) return res.status(500).json({ error: 'Read Error' });
    res.json(JSON.parse(data));
  });
});

app.post('/api/update-state', (req, res) => {
  const valid = validateCore(req.body);
  if (!valid) {
    return res.status(400).json(validateCore.errors);
  }

  archiveFile(STATE_FILE);
  fs.writeFile(STATE_FILE, JSON.stringify(req.body, null, 2), 'utf8', 
(err) => {
    if (err) return res.status(500).json({ error: 'Write Error' });

    if (req.body.governor_state) {
      const newMarkdown = 
compileBlueprintToMarkdown(req.body.governor_state, 
req.body.media_mapping);
      fs.writeFile(BLUEPRINT_FILE, newMarkdown, 'utf8', (mdErr) => {
        if (mdErr) console.error("Markdown compilation failed:", 
mdErr);
      });
    }

    res.json({ message: 'Governor State Updated & Blueprint Compiled 
with 100% Fidelity' });
  });
});

// DYNAMIC TENANT ROUTING
app.get('/api/tenant-state/:tenantId', (req, res) => {
  const tenantFile = path.join(TARGET_PROJECT_DIR, 
`${req.params.tenantId}_domain_dictionary.json`);
  if (!fs.existsSync(tenantFile)) return res.json({});
  fs.readFile(tenantFile, 'utf8', (err, data) => {
    if (err) return res.status(500).json({ error: 'Read Error' });
    res.json(JSON.parse(data));
  });
});

app.post('/api/update-tenant-state/:tenantId', (req, res) => {
  const valid = validateTenant(req.body);
  if (!valid) {
    return res.status(400).json(validateTenant.errors);
  }

  const tenantFile = path.join(TARGET_PROJECT_DIR, 
`${req.params.tenantId}_domain_dictionary.json`);
  archiveFile(tenantFile);
  fs.writeFile(tenantFile, JSON.stringify(req.body, null, 2), 'utf8', 
(err) => {
    if (err) return res.status(500).json({ error: 'Write Error' });
    res.json({ message: `Tenant Registry [${req.params.tenantId}] 
Updated & Archived` });
  });
});

// EMERGENCY RESTORE ROUTE
app.post('/api/restore-latest', (req, res) => {
  const files = fs.readdirSync(ARCHIVE_DIR);

  const getLatest = (prefix) => files
    .filter(f => f.startsWith(prefix))
    .sort((a, b) => b.localeCompare(a))[0];

  const latestState = getLatest('yf_governor_state');
  const latestEcu = getLatest('ecu_domain_dictionary');

  if (latestState) fs.copyFileSync(path.join(ARCHIVE_DIR, latestState), 
STATE_FILE);
  if (latestEcu) {
    const defaultEcuFile = path.join(TARGET_PROJECT_DIR, 
'ecu_medical_domain_dictionary.json');
    fs.copyFileSync(path.join(ARCHIVE_DIR, latestEcu), defaultEcuFile);
  }

  res.json({ message: 'Emergency Restore Successful' });
});

app.listen(PORT, () => console.log(`Documentation Server running at 
http://localhost:${PORT}`));
