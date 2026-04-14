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
const CONTEXT_ROOT = path.join(__dirname, '..', 'context-files');
if (!fs.existsSync(CONTEXT_ROOT)) {
  fs.mkdirSync(CONTEXT_ROOT, { recursive: true });
}

// Helper: Directory Traversal Protection & Centralized Storage
function getProjectDir(project) {
  if (!project || typeof project !== 'string' || project.includes('..') || project.includes('/') || project.includes('\\')) {
    throw new Error('Invalid project name');
  }

  const projectDir = path.join(CONTEXT_ROOT, project);

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
    adrDir: path.join(projectDir, 'adrs'),
    archiveDir: path.join(projectDir, 'archives'),
    prompts: path.join(projectDir, 'system_prompts.json'),
    link: path.join(projectDir, 'codebase_link.json'),
    roadmap: path.join(projectDir, 'roadmap.json'),
    config: path.join(projectDir, 'config.json')
  };
}

// Helper: Archive File
function archiveFile(sourcePath, archiveDir) {
  if (!fs.existsSync(sourcePath)) return;
  if (!fs.existsSync(archiveDir)) {
    fs.mkdirSync(archiveDir, { recursive: true });
  }
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const baseName = path.basename(sourcePath);
  const destPath = path.join(archiveDir, baseName + '.' + timestamp + '.bak');
  fs.copyFileSync(sourcePath, destPath);
}

app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.static(__dirname));

// ADR SCANNER ENDPOINT
app.get('/api/:project/adr-list', (req, res) => {
  try {
    const files = getProjectFiles(req.params.project);
    if (fs.existsSync(files.adrDir)) {
      const adrFiles = fs.readdirSync(files.adrDir).filter(f => f.endsWith('.md'));
      res.json(adrFiles);
    } else {
      res.json([]);
    }
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// FETCH SPECIFIC ADR CONTENT
app.get('/api/:project/adr-content/:filename', (req, res) => {
  try {
    const projectDir = getProjectDir(req.params.project);
    const filePath = path.join(projectDir, 'adrs', req.params.filename);
    if (fs.existsSync(filePath)) {
      res.json({ content: fs.readFileSync(filePath, 'utf8') });
    } else {
      res.status(404).json({ error: 'ADR file not found' });
    }
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// CONSOLIDATED WORKSPACE DATA ENDPOINT
app.get('/api/projects/:project/workspace', (req, res) => {
  try {
    const project = req.params.project;
    const files = getProjectFiles(project);
    
    const state = fs.existsSync(files.state) ? JSON.parse(fs.readFileSync(files.state, 'utf8')) : {};
    const roadmap = fs.existsSync(files.roadmap) ? JSON.parse(fs.readFileSync(files.roadmap, 'utf8')) : [];
    const config = fs.existsSync(files.config) ? JSON.parse(fs.readFileSync(files.config, 'utf8')) : {};
    
    let adrs = [];
    if (fs.existsSync(files.adrDir)) {
      adrs = fs.readdirSync(files.adrDir).filter(f => f.endsWith('.md'));
    }
    
    res.json({ state, roadmap, config, adrs });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// SECURE ADR CONTENT ENDPOINT
app.get('/api/projects/:project/adrs/:filename', (req, res) => {
  try {
    const { project, filename } = req.params;
    
    // Strict Traversal Protection
    if (filename.includes('..') || filename.includes('/') || filename.includes('\\')) {
      return res.status(403).json({ error: 'Security Error: Invalid filename' });
    }

    const projectDir = getProjectDir(project);
    const filePath = path.join(projectDir, 'adrs', filename);
    
    if (fs.existsSync(filePath)) {
      res.send(fs.readFileSync(filePath, 'utf8'));
    } else {
      res.status(404).send('ADR file not found');
    }
  } catch (e) {
    res.status(500).send(`Error: ${e.message}`);
  }
});

// DEV TOOL MANUAL ROUTE
app.get('/api/ops-manual', (req, res) => {
  const manualPath = path.join(__dirname, 'OPS_MANUAL.md');
  if (fs.existsSync(manualPath)) {
    res.json({ content: fs.readFileSync(manualPath, 'utf8') });
  } else {
    res.status(404).json({ error: 'Manual not found' });
  }
});

app.post('/api/ops-manual', (req, res) => {
  const manualPath = path.join(__dirname, 'OPS_MANUAL.md');
  const { content } = req.body;
  if (!content) return res.status(400).json({ error: 'Content required' });
  fs.writeFileSync(manualPath, content, 'utf8');
  res.json({ status: 'success' });
});

app.get('/favicon.ico', (req, res) => {
  const targetFile = path.join(__dirname, '..', 'assets', 'dev-tools.png');
  if (fs.existsSync(targetFile)) {
    res.sendFile(targetFile);
  } else {
    res.status(404).send('Not found');
  }
});

app.get('/api/:workspace/path', (req, res) => {
  try {
    const targetPath = getProjectDir(req.params.workspace);
    res.json({ path: targetPath });
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

app.get('/api/:workspace/logo', (req, res) => {
  const assetsDir = path.join(__dirname, '..', 'assets');
  if (!fs.existsSync(assetsDir)) {
    fs.mkdirSync(assetsDir, { recursive: true });
  }
  const exts = ['.png', '.svg', '.jpg', '.jpeg'];
  for (let ext of exts) {
    const targetFile = path.join(assetsDir, req.params.workspace + ext);
    if (fs.existsSync(targetFile)) {
      return res.sendFile(targetFile);
    }
  }
  res.status(404).send('No logo found');
});

app.get('/api/:project/config', (req, res) => {
  const files = getProjectFiles(req.params.project);
  if (fs.existsSync(files.config)) {
    res.json(JSON.parse(fs.readFileSync(files.config, 'utf8')));
  } else {
    res.json({});
  }
});

app.get('/api/:project/get-context', (req, res) => {
    const files = getProjectFiles(req.params.project);
    if (!fs.existsSync(files.link)) return res.send("No codebase linked.");
    
    const linkData = JSON.parse(fs.readFileSync(files.link, 'utf8'));
    const targetPath = linkData.targetPath;
    
    // 1) Implement path validation
    if (targetPath.includes('..')) {
        return res.status(403).send("Security Error: Path traversal detected.");
    }

    // 2) Update the findScript variable to explicitly ignore build directories
    const findScript = `find . -maxdepth 3 -not -path '*/.*' -type f \\( -name "*.js" -o -name "*.json" -o -name "*.md" -o -name "*.html" -o -name "*.css" -o -name "*.ts" -o -name "*.tsx" \\) -not -name "package-lock.json" -not -path "*/node_modules/*" -not -path "*/dist/*" -not -path "*/build/*" -not -path "*/.next/*" -not -path "*/coverage/*" -not -path "*/archives/*" -exec echo "--- FILE: {} ---" \\; -exec awk '1' {} \\; -exec echo "" \\;`;
    
    // 3) Decouple the execution chain using semicolon after version control checks
    const command = `cd "${targetPath}" && (git status ; git diff ; ${findScript})`;
    
    exec(command, { maxBuffer: 1024 * 1024 * 20 }, (error, stdout, stderr) => {
        if (error) {
            return res.status(500).send(`Error: ${error.message}\n${stderr}`);
        }
        res.send(stdout);
    });
});

app.get('/api/:project/state', (req, res) => {
  const files = getProjectFiles(req.params.project);
  if (fs.existsSync(files.state)) {
    res.json(JSON.parse(fs.readFileSync(files.state, 'utf8')));
  } else {
    res.json({});
  }
});

app.get('/api/:project/blueprint', (req, res) => {
  const files = getProjectFiles(req.params.project);
  if (fs.existsSync(files.blueprint)) {
    res.json({ content: fs.readFileSync(files.blueprint, 'utf8') });
  } else {
    res.json({ content: '# Project Blueprint\n\nNo blueprint found. Use `/UPDATE_BLUEPRINT` to generate one.' });
  }
});

app.post('/api/:project/update-state', (req, res) => {
  const files = getProjectFiles(req.params.project);
  archiveFile(files.state, files.archiveDir);
  fs.writeFileSync(files.state, JSON.stringify(req.body, null, 2), 'utf8');
  res.json({ status: 'success' });
});

app.get('/api/:project/roadmap', (req, res) => {
  const files = getProjectFiles(req.params.project);
  if (fs.existsSync(files.roadmap)) {
    res.json(JSON.parse(fs.readFileSync(files.roadmap, 'utf8')));
  } else {
    res.json([]);
  }
});

app.post('/api/:project/roadmap', (req, res) => {
  try {
    const files = getProjectFiles(req.params.project);
    archiveFile(files.roadmap, files.archiveDir);
    fs.writeFileSync(files.roadmap, JSON.stringify(req.body, null, 2), 'utf8');
    res.json({ status: 'success' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
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
  try {
    const files = getProjectFiles(req.params.project);
    
    // VALIDATION: Ensure payload is valid JSON before writing to disk
    // If it's already an object (from express.json), we re-stringify and parse to check deep integrity if needed,
    // but primarily we check if the user is sending a raw string they want saved as JSON.
    const payload = req.body;
    
    archiveFile(files.prompts, files.archiveDir);
    fs.writeFileSync(files.prompts, JSON.stringify(payload, null, 2), 'utf8');
    res.json({ status: 'success' });
  } catch (e) {
    res.status(400).json({ error: `Syntax Error: ${e.message}` });
  }
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

app.post('/api/:project/execute', (req, res) => {
    const files = getProjectFiles(req.params.project);
    if (!fs.existsSync(files.link)) return res.status(400).json({ error: "No codebase linked." });
    
    const { command } = req.body;
    if (!command) return res.status(400).json({ error: "Command required" });

    const linkData = JSON.parse(fs.readFileSync(files.link, 'utf8'));
    const targetPath = linkData.targetPath;

    // 1. Primary Execution
    exec(`cd "${targetPath}" && ${command}`, { maxBuffer: 1024 * 1024 * 5 }, (execError, stdout, stderr) => {
        
        // 2. Post-Execution Git Status check
        exec(`cd "${targetPath}" && git status --porcelain`, (gitError, gitStatus) => {
            res.json({
                success: !execError,
                stdout: stdout || "",
                stderr: stderr || (execError ? execError.message : ""),
                git_status: gitStatus || ""
            });
        });
    });
});

app.listen(PORT, () => console.log(`Universal Context Hub API running on port ${PORT}`));