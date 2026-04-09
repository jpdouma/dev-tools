const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const Ajv = require('ajv');
const { exec } = require('child_process');
const ajv = new Ajv();

const app = express();
const PORT = 4000;

// Global Workspace Configuration
const WORKSPACES_DIR = path.join(__dirname, 'workspaces');
if (!fs.existsSync(WORKSPACES_DIR)) {
  fs.mkdirSync(WORKSPACES_DIR, { recursive: true });
}

// Helper: Directory Traversal Protection
function getProjectDir(project) {
  if (!project || typeof project !== 'string' || project.includes('..') || project.includes('/') || project.includes('\\')) {
    throw new Error('Invalid project name');
  }
  const projectDir = path.join(WORKSPACES_DIR, project);
  if (!fs.existsSync(projectDir)) {
    fs.mkdirSync(projectDir, { recursive: true });
    fs.mkdirSync(path.join(projectDir, 'archives'), { recursive: true });
  }
  return projectDir;
}

// Helper: Get Project File Paths
function getProjectFiles(project) {
  const projectDir = getProjectDir(project);
  return {
    state: path.join(projectDir, 'core_state.json'),
    blueprint: path.join(projectDir, 'blueprint.md'),
    adrs: path.join(projectDir, 'adrs.json'),
    archiveDir: path.join(projectDir, 'archives'),
    prompts: path.join(projectDir, 'system_prompts.json'),
    link: path.join(projectDir, 'codebase_link.json')
  };
}

// Helper: Archive File
function archiveFile(filePath, archiveDir) {
  if (fs.existsSync(filePath)) {
    // ARCHITECTURAL FIX: Ensure the archive directory exists before copying
    if (!fs.existsSync(archiveDir)) {
      fs.mkdirSync(archiveDir, { recursive: true });
    }
    
    const timestamp = Math.floor(Date.now() / 1000);
    const fileName = path.basename(filePath);
    const project = path.basename(path.dirname(filePath));
    const archivePath = path.join(archiveDir, `[${project}]_${fileName.replace('.json', '')}_${timestamp}.json`);
    fs.copyFileSync(filePath, archivePath);
  }
}

app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.static(__dirname));

// DEV TOOL MANUAL ROUTE
app.get('/api/ops-manual', (req, res) => {
  const manualPath = path.join(__dirname, 'OPS_MANUAL.md');
  if (fs.existsSync(manualPath)) {
    res.json({ content: fs.readFileSync(manualPath, 'utf8') });
  } else {
    res.status(404).json({ error: 'Manual not found' });
  }
});

app.get('/api/:project/state', (req, res) => {
  const files = getProjectFiles(req.params.project);
  if (fs.existsSync(files.state)) {
    res.json(JSON.parse(fs.readFileSync(files.state, 'utf8')));
  } else {
    res.json({});
  }
});

app.post('/api/:project/update-state', (req, res) => {
  const files = getProjectFiles(req.params.project);
  archiveFile(files.state, files.archiveDir);
  fs.writeFileSync(files.state, JSON.stringify(req.body, null, 2), 'utf8');
  res.json({ status: 'success' });
});

app.get('/api/:project/tenant-state/:tenantId', (req, res) => {
  const projectDir = getProjectDir(req.params.project);
  const tenantFile = path.join(projectDir, 'instances', `${req.params.tenantId}.json`);
  if (fs.existsSync(tenantFile)) {
    res.json(JSON.parse(fs.readFileSync(tenantFile, 'utf8')));
  } else {
    res.json({});
  }
});

app.post('/api/:project/update-tenant-state/:tenantId', (req, res) => {
  const projectDir = getProjectDir(req.params.project);
  const instancesDir = path.join(projectDir, 'instances');
  if (!fs.existsSync(instancesDir)) fs.mkdirSync(instancesDir, { recursive: true });
  
  const tenantFile = path.join(instancesDir, `${req.params.tenantId}.json`);
  archiveFile(tenantFile, getProjectFiles(req.params.project).archiveDir);
  fs.writeFileSync(tenantFile, JSON.stringify(req.body, null, 2), 'utf8');
  res.json({ status: 'success' });
});

app.get('/api/:project/prompts', (req, res) => {
  const files = getProjectFiles(req.params.project);
  if (fs.existsSync(files.prompts)) {
    res.json(JSON.parse(fs.readFileSync(files.prompts, 'utf8')));
  } else {
    res.json({});
  }
});

app.post('/api/:project/prompts', (req, res) => {
  const files = getProjectFiles(req.params.project);
  archiveFile(files.prompts, files.archiveDir);
  fs.writeFileSync(files.prompts, JSON.stringify(req.body, null, 2), 'utf8');
  res.json({ status: 'success' });
});

app.get('/api/:project/adrs', (req, res) => {
  const files = getProjectFiles(req.params.project);
  if (fs.existsSync(files.adrs)) {
    res.json(JSON.parse(fs.readFileSync(files.adrs, 'utf8')));
  } else {
    res.json([]);
  }
});

app.post('/api/:project/adrs', (req, res) => {
  const files = getProjectFiles(req.params.project);
  archiveFile(files.adrs, files.archiveDir);
  let adrs = [];
  if (fs.existsSync(files.adrs)) {
    adrs = JSON.parse(fs.readFileSync(files.adrs, 'utf8'));
  }
  const newAdr = {
    id: `ADR-${String(adrs.length + 1).padStart(3, '0')}`,
    ...req.body,
    timestamp: new Date().toISOString()
  };
  adrs.unshift(newAdr);
  fs.writeFileSync(files.adrs, JSON.stringify(adrs, null, 2), 'utf8');
  res.json(newAdr);
});

app.put('/api/:project/adrs/:id', (req, res) => {
  const files = getProjectFiles(req.params.project);
  archiveFile(files.adrs, files.archiveDir);
  let adrs = JSON.parse(fs.readFileSync(files.adrs, 'utf8'));
  const index = adrs.findIndex(a => a.id === req.params.id);
  if (index !== -1) {
    adrs[index] = { ...adrs[index], ...req.body, updated_at: new Date().toISOString() };
    fs.writeFileSync(files.adrs, JSON.stringify(adrs, null, 2), 'utf8');
    res.json(adrs[index]);
  } else {
    res.status(404).json({ error: 'ADR not found' });
  }
});

app.delete('/api/:project/adrs/:id', (req, res) => {
  const files = getProjectFiles(req.params.project);
  archiveFile(files.adrs, files.archiveDir);
  if (fs.existsSync(files.adrs)) {
    let adrs = JSON.parse(fs.readFileSync(files.adrs, 'utf8'));
    const initialLength = adrs.length;
    adrs = adrs.filter(a => a.id !== req.params.id);
    if (adrs.length < initialLength) {
      fs.writeFileSync(files.adrs, JSON.stringify(adrs, null, 2), 'utf8');
      return res.json({ status: 'success' });
    }
  }
  res.status(404).json({ error: 'ADR not found' });
});

app.get('/api/:project/link-codebase', (req, res) => {
    const files = getProjectFiles(req.params.project);
    if (fs.existsSync(files.link)) {
        const linkData = JSON.parse(fs.readFileSync(files.link, 'utf8'));
        res.json({ linkedPath: linkData.targetPath });
    } else {
        res.json({ linkedPath: null });
    }
});

app.post('/api/:project/link-codebase', (req, res) => {
    const files = getProjectFiles(req.params.project);
    const { path: targetPath } = req.body;
    if (!targetPath) return res.status(400).json({ error: 'Path required' });
    
    fs.writeFileSync(files.link, JSON.stringify({ targetPath, linkedAt: new Date().toISOString() }, null, 2), 'utf8');
    res.json({ status: 'success' });
});

app.delete('/api/:project/link-codebase', (req, res) => {
    const files = getProjectFiles(req.params.project);
    if (fs.existsSync(files.link)) {
        fs.unlinkSync(files.link);
    }
    res.json({ status: 'success' });
});

app.post('/api/:project/run-context', (req, res) => {
    const files = getProjectFiles(req.params.project);
    if (!fs.existsSync(files.link)) return res.json({ output: "No codebase linked." });
    
    const linkData = JSON.parse(fs.readFileSync(files.link, 'utf8'));
    const targetPath = linkData.targetPath;
    
    const command = `cd "${targetPath}" && git diff && git status`;
    exec(command, (error, stdout, stderr) => {
        if (error) {
            return res.json({ output: `Error: ${error.message}\n${stderr}` });
        }
        res.json({ output: stdout });
    });
});

app.listen(PORT, () => console.log(`Universal Context Hub API running on port ${PORT}`));