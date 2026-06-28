#!/usr/bin/env node
// Runs in casepocket-data. Walks cases/** recursively and regenerates manifest.json (the app's index).
// Each case file = one deep-dive entry; the manifest stores its path so the app can fetch it wherever it sits.
const fs = require('fs'), path = require('path');
const ROOT = process.cwd();
function walk(dir){let out=[];if(!fs.existsSync(dir))return out;for(const f of fs.readdirSync(dir)){const fp=path.join(dir,f);if(fs.statSync(fp).isDirectory())out=out.concat(walk(fp));else if(f.endsWith('.json'))out.push(fp);}return out;}
function cardOf(c,relPath){const m=c.meta||{},s=c.summary||{};const fam=m.family!==false;
  return {id:c.id, contentId:c.id, deep:true, path:relPath, court:fam?'fam':'env', cls:fam?'fam':'env',
    field:m.field||(fam?{key:'family',zh:'家事法',en:'Family law'}:{key:'env',zh:'规划环境',en:'Planning & Environment'}),
    areaTag:m.areaTag||m.court||{zh:'',en:''}, tag:m.court||{zh:'',en:''}, div:m.division||'', name:m.name||'', cit:m.citation||'',
    judge:m.judge||'', date:m.date||'', ago:m.date||'', place:m.place||'', family:fam,
    one:s.one||{zh:'',en:''}, issue:s.issue, legnums:s.legnums, catch:s.catchwords, subseq:s.subseq};}
const files = walk(path.join(ROOT,'cases'));
const manifest = files.map(fp=>{const c=JSON.parse(fs.readFileSync(fp,'utf8'));const rel=path.relative(ROOT,fp).split(path.sep).join('/');return cardOf(c,rel);})
  .sort((a,b)=>{const da=Date.parse(a.date),db=Date.parse(b.date);return (isNaN(da)||isNaN(db))?0:db-da;});
fs.writeFileSync(path.join(ROOT,'manifest.json'),JSON.stringify(manifest));
console.log('manifest.json regenerated: '+manifest.length+' cases');
