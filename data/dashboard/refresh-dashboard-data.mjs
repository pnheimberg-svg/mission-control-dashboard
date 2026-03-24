import fs from 'fs';
import path from 'path';

const dashboardPath = '/home/paulheimberg/.openclaw/workspace/dashboard/agent-dashboard-data.json';
const prioritiesPath = '/home/paulheimberg/.openclaw/workspace/agents/shared/current-priorities.md';
const openLoopsPath = '/home/paulheimberg/.openclaw/workspace/agents/shared/open-loops.md';

function bullets(file) {
  if (!fs.existsSync(file)) return [];
  return fs.readFileSync(file, 'utf8')
    .split(/\r?\n/)
    .map(l => l.trim())
    .filter(l => l.startsWith('- '))
    .map(l => l.slice(2));
}

const data = JSON.parse(fs.readFileSync(dashboardPath, 'utf8'));
data.currentFocus = bullets(prioritiesPath).slice(0, 5);
data.openLoops = bullets(openLoopsPath).slice(0, 8);
fs.writeFileSync(dashboardPath, JSON.stringify(data, null, 2));
console.log('Dashboard data refreshed');
