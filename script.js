/* 4. JAVASCRIPT LOGIC */

// 4.1 VARIABLES & CONSTANTS
let db = [];
let LOAD_STAMP = "LAST DATA UPDATED ON: DATA.XLSX NOT LOADED — CHECK FILE";
let selectedFrom = null;
let selectedTo = null;
let rootSearchFirst = null;
let rootSearchSecond = null;
const ARCHITECT_INFO = "System Architect : Imran Haider S/o Risalat Hussain Rizvi 📞 0332-787-6010";

// 4.2 HELPER FUNCTIONS
function displayName(str) { return str ? str.replace(/\s*-\s*\d+$/, "").trim() : ""; }
function properCase(str) {
    if (!str) return '';
    return str.toLowerCase().replace(/\b\w/g, c => c.toUpperCase());
}

function formatH2Value(raw) {
    if (!raw) return "---";
    const d = new Date(raw);
    if (isNaN(d)) return raw;
    const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
    return `${months[d.getMonth()]} ${d.getDate()}.${d.getFullYear()} - ${d.getHours()%12||12}:${String(d.getMinutes()).padStart(2,'0')} ${d.getHours()>=12?'pm':'am'}`;
}
function getTimestampFromExcel(wb) {
    try {
        const cell = wb.Sheets[wb.SheetNames[0]]['H2'];
        return cell ? "LAST DATA UPDATED ON " + formatH2Value(cell.w || cell.v).toUpperCase() : "LAST DATA UPDATED ON: TIMESTAMP MISSING";
    } catch { return "LAST DATA UPDATED ON: ERROR READING H2"; }
}

// 4.3 DATA LOADING (EXCEL)
async function autoLoadExcel() {
    const el = document.getElementById('ui-load-stamp');
    try {
        const resp = await fetch('data.xlsx', { cache: 'no-cache' });
        if (!resp.ok) throw new Error();
        const ab = await resp.arrayBuffer();
        const wb = XLSX.read(ab, { type: 'array' });
        const rows = XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]]);
        db = rows.map(r => ({
            name: String(r.Name || '').trim(),
            father: String(r.Father || '').trim(),
            gen: String(r.Gen || '').trim(),
            gender: String(r.Gender || 'M').trim().toUpperCase()
        })).filter(p => p.name !== '');
        LOAD_STAMP = getTimestampFromExcel(wb);
        el.innerText = LOAD_STAMP;
    } catch (e) {
        el.innerText = '⚠️ Auto‑load failed. Use ⚙️ (bottom right) to load manually.';
    }
}

// Password‑protected manual loader
document.getElementById('loader-gear').addEventListener('click', function() {
    const pwd = prompt('Enter admin password:');
    if (pwd === '6010') {
        document.getElementById('hidden-file-input').click();
    } else {
        alert('Incorrect password.');
    }
});

document.getElementById('hidden-file-input').addEventListener('change', function(e) {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = e => {
        const wb = XLSX.read(new Uint8Array(e.target.result), { type: 'array' });
        const rows = XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]]);
        db = rows.map(r => ({
            name: String(r.Name || '').trim(),
            father: String(r.Father || '').trim(),
            gen: String(r.Gen || '').trim(),
            gender: String(r.Gender || 'M').trim().toUpperCase()
        })).filter(p => p.name);
        LOAD_STAMP = getTimestampFromExcel(wb);
        document.getElementById('ui-load-stamp').innerText = LOAD_STAMP;
        alert('Data loaded successfully!');
        document.getElementById('hidden-file-input').value = '';
    };
    reader.readAsArrayBuffer(file);
});

// 4.4 MENU & UI INTERACTIONS
function clearAllSearchAndCanvas() {
    document.getElementById('si-from').value = '';
    document.getElementById('si-root1').value = '';
    document.getElementById('si-root2').value = '';
    selectedFrom = null;
    rootSearchFirst = null;
    rootSearchSecond = null;
    selectedTo = null;
    document.getElementById('canvas').innerHTML = '';
    document.getElementById('canvas-header').style.display = 'none';
}

function clearViewRadios() {
    document.querySelectorAll('input[name="view-mode"]').forEach(r => {
        if (r.value === 'tree') r.checked = true;
        else r.checked = false;
    });
}

function toggleCheckboxesVisibility() {
    const mode = document.querySelector('input[name="view-mode"]:checked')?.value;
    const sibLabel = document.getElementById('sib-check-label');
    const descLabel = document.getElementById('desc-check-label');
    const rootLabel = document.getElementById('root-check-label');
    
    if (sibLabel) sibLabel.style.display = 'flex';
    if (descLabel) descLabel.style.display = 'flex';
    
    if (mode === 'tree') {
        if (rootLabel) rootLabel.style.display = 'flex';
    } else {
        if (rootLabel) rootLabel.style.display = 'none';
    }
}

function initMenu() {
    const items = document.querySelectorAll('.menu-item');
    const panels = document.querySelectorAll('.menu-panel');
    items.forEach(item => {
        item.addEventListener('click', function(e) {
            const panelId = this.dataset.panel;
            clearAllSearchAndCanvas();
            
            if (panelId === 'search-panel') {
                clearViewRadios();
                toggleCheckboxesVisibility();
            }
            
            items.forEach(m => m.classList.remove('active'));
            this.classList.add('active');
            panels.forEach(p => p.classList.toggle('active', p.id === panelId));
        });
    });
}

function resetSearch() { 
    selectedFrom = null; 
    document.getElementById('si-from').value = ''; 
    document.getElementById('canvas').innerHTML = ''; 
    document.getElementById('canvas-header').style.display = 'none'; 
    clearViewRadios();
    toggleCheckboxesVisibility();
}

function resetRootPanel() { 
    document.getElementById('si-root1').value = ''; 
    document.getElementById('si-root2').value = ''; 
    rootSearchFirst = null; 
    rootSearchSecond = null; 
    selectedFrom = null;
    selectedTo = null;
    document.getElementById('canvas').innerHTML = ''; 
    document.getElementById('canvas-header').style.display = 'none'; 
}

// 4.5 SEARCH FUNCTIONS
function doSearch(input, dropId) {
    const q = input.value.toLowerCase();
    const sd = document.getElementById(dropId);
    sd.innerHTML = '';
    if (q.length < 1) { sd.style.display = 'none'; return; }
    const found = db.filter(p => p.name.toLowerCase().includes(q)).slice(0, 8);
    found.forEach(p => {
        const div = document.createElement('div');
        div.className = 'result-item';
        div.innerHTML = `<b>${displayName(p.name)}</b> <small>(${p.gen})</small><br><small>${p.gender && p.gender.startsWith('F') ? 'D/o' : 'S/o'}: ${displayName(p.father)}</small>`;
        div.onclick = () => {
            input.value = `${displayName(p.name)} (${p.gen})`;
            sd.style.display = 'none';
            if (dropId === 'sd-from') { 
                selectedFrom = p; 
                initRender(); 
            }
        };
        sd.appendChild(div);
    });
    sd.style.display = found.length ? 'block' : 'none';
}
function doSearchRoot(input, dropId, type) {
    const q = input.value.toLowerCase();
    const sd = document.getElementById(dropId);
    sd.innerHTML = '';
    if (q.length < 1) { sd.style.display = 'none'; return; }
    const found = db.filter(p => p.name.toLowerCase().includes(q)).slice(0, 8);
    found.forEach(p => {
        const div = document.createElement('div');
        div.className = 'result-item';
        div.innerHTML = `<b>${displayName(p.name)}</b> <small>(${p.gen})</small><br><small>${p.gender && p.gender.startsWith('F') ? 'D/o' : 'S/o'}: ${displayName(p.father)}</small>`;
        div.onclick = () => {
            input.value = `${displayName(p.name)} (${p.gen})`;
            sd.style.display = 'none';
            if (type === 'first') {
                rootSearchFirst = p;
                console.log('First member set:', rootSearchFirst.name);
            } else {
                rootSearchSecond = p;
                console.log('Second member set:', rootSearchSecond.name);
                
                // Auto-select Root-Tree view when second member is selected
                if (rootSearchFirst && rootSearchSecond) {
                    selectedFrom = rootSearchFirst; 
                    selectedTo = rootSearchSecond;
                    showBothRootsView();
                }
            }
        };
        sd.appendChild(div);
    });
    sd.style.display = found.length ? 'block' : 'none';
}
function findParent(p) { 
    if (!p || !p.father) return null;
    return p.father && p.father.toLowerCase() !== 'n/a' && p.father ? db.find(x => x.name.toLowerCase() === p.father.toLowerCase()) : null; 
}

function getAncestryChain(p) {
    let chain = [], cur = p, visited = new Set();
    while (cur && !visited.has(cur.name.toLowerCase())) {
        chain.push(cur); 
        visited.add(cur.name.toLowerCase()); 
        cur = findParent(cur);
    }
    return chain;
}

// 4.6 RENDERING LOGIC (TREE & TABLE)
function initRender() {
    const mode = document.querySelector('input[name="view-mode"]:checked')?.value;
    if (!mode) {
        document.getElementById('canvas').innerHTML = '';
        document.getElementById('canvas-header').style.display = 'none';
        return;
    }
    if (!selectedFrom) { 
        document.getElementById('canvas').innerHTML = ''; 
        document.getElementById('canvas-header').style.display = 'none';
        return; 
    }
    document.getElementById('canvas-header').style.display = 'block';
    if (mode === 'tree') renderTreeBlock(selectedFrom);
    else renderMemberTable(selectedFrom);
}

function renderTreeBlock(target) {
    const showSib = document.getElementById('sib-check')?.checked || false;
    const showDesc = document.getElementById('desc-check')?.checked || false;
    const fromRoot = document.getElementById('search-from-root-check')?.checked || false;
    let html = '<div class="tree-root-layout" id="pdf-area">';
    if (fromRoot) {
        const chain = getAncestryChain(target).reverse();
        chain.forEach((p, idx) => {
            const isTarget = p.name.toLowerCase() === target.name.toLowerCase();
            html += renderBox(p, idx === 0 ? 'First Ancestor' : (isTarget ? 'Selected' : 'Ancestor'), isTarget, isTarget, true);
            if (isTarget) {
                if (showSib && p.father) {
                    const sibs = db.filter(s => s.father.toLowerCase() === p.father.toLowerCase() && s.name.toLowerCase() !== p.name.toLowerCase());
                    if (sibs.length) html += renderSiblingsRow(sibs, p.father);
                }
                if (showDesc) {
                    const kids = db.filter(c => c.father.toLowerCase() === p.name.toLowerCase());
                    if (kids.length) {
                        html += `<div class="v-line"></div><div class="h-row">` +
                            kids.filter(c => !c.gender?.startsWith('F')).map(s => renderBox(s, 'Son', false, false, false)).join('') +
                            renderDaughtersBox(kids.filter(c => c.gender?.startsWith('F')), p.name, 'Daughters') + `</div>`;
                    }
                }
            } else html += '<div class="v-line"></div>';
        });
    } else {
        const father = findParent(target);
        const kids = db.filter(c => c.father.toLowerCase() === target.name.toLowerCase());
        let sibs = '';
        if (showSib && target.father && target.father.toLowerCase() !== 'n/a') {
            const sibsArr = db.filter(s => s.father.toLowerCase() === target.father.toLowerCase() && s.name.toLowerCase() !== target.name.toLowerCase());
            if (sibsArr.length) sibs = renderSiblingsRow(sibsArr, target.father);
        }
        let desc = '';
        if (showDesc && kids.length) {
            desc = `<div class="v-line"></div><div class="h-row">` +
                kids.filter(c => !c.gender?.startsWith('F')).map(s => renderBox(s, 'Son', false, false, false)).join('') +
                renderDaughtersBox(kids.filter(c => c.gender?.startsWith('F')), target.name, 'Daughters') + `</div>`;
        }
        html += (father ? renderBox(father, 'Father', false, false, true) + '<div class="v-line"></div>' : '') +
            renderBox(target, 'Selected', true, false, true) + sibs + desc;
    }
    html += `<div class="pdf-signature">${ARCHITECT_INFO}</div></div>`;
    document.getElementById('canvas').innerHTML = html;
}

function renderBox(p, label, isBlink, isPath, isDirect) {
    if (!p) return '';
    const hasNext = db.some(x => x.father && x.father.toLowerCase() === p.name.toLowerCase());
    const isFemale = p.gender?.startsWith('F');
    const prefix = isFemale ? 'D/o' : 'S/o';
    return `<div class="box ${isFemale ? 'female-box' : ''} ${isDirect ? 'direct-gen-box' : ''} ${isBlink ? 'active-box' : ''}" onclick='jumpTo("${p.name.replace(/'/g, "\\'")}", "${p.gen}")'>
        <div class="box-header ${isPath ? 'lineage-header' : ''}"><span>${label}</span><span>${p.gen}</span></div>
        <div class="box-body"><span class="member-name ${isBlink ? 'blinking-name' : ''}">${displayName(p.name)}</span>
        <span class="father-name">${prefix}: ${displayName(p.father)}</span>${hasNext ? '<div class="next-gen-indicator">▼</div>' : ''}</div></div>`;
}

function renderSiblingsRow(sibs, fatherName) {
    if (!sibs || !sibs.length) return '';
    return `<div class="h-row" style="margin-top:10px;">${sibs.filter(s => !s.gender?.startsWith('F')).map(b => renderBox(b, 'Brother', false, false, false)).join('')}${renderDaughtersBox(sibs.filter(s => s.gender?.startsWith('F')), fatherName, 'Sisters')}</div>`;
}

function renderDaughtersBox(list, fatherName, rel) {
    if (!list || !list.length) return '';
    return `<div class="box daughters-wrapper" style="min-width:280px;"><div class="d-header">${rel}</div><div style="padding:15px; text-align:left;">${list.map(d => `<div style="font-size:18px; font-weight:600; padding:5px 0; border-bottom:1px solid rgba(212,175,55,0.2); cursor:pointer;" onclick='jumpTo("${d.name.replace(/'/g, "\\'")}", "${d.gen}")'>${displayName(d.name)} [${d.gen}]</div>`).join('')}</div><div style="font-size:11px; color:black; padding:8px; border-top:1px solid rgba(212,175,55,0.1); font-weight:bold; text-align:center;">D/o ${displayName(fatherName)}</div></div>`;
}

function renderMemberTable(m) {
    if (!m) return;
    const chain = getAncestryChain(m);
    const showSib = document.getElementById('sib-check')?.checked || false;
    const showDesc = document.getElementById('desc-check')?.checked || false;
    let html = `<div class="tree-root-layout" id="pdf-area">`;
    html += `<div class="summary-box"><div class="summary-title">👤 ${properCase(displayName(m.name))}</div><div class="summary-content" style="grid-template-columns:repeat(3,1fr);">
        <div class="summary-item"><div class="summary-label">Name</div><div class="summary-value">${properCase(displayName(m.name))}</div></div>
        <div class="summary-item"><div class="summary-label">Father</div><div class="summary-value">${properCase(displayName(m.father))||'—'}</div></div>
        <div class="summary-item"><div class="summary-label">Generation</div><div class="summary-value">${m.gen}</div></div>
    </div></div>`;

    if (chain.length) {
        html += `<div class="lineage-table-container" style="max-width:100%; margin-bottom:20px;"><div class="table-title">📜 ${properCase(displayName(m.name))} – Ancestors</div><table class="lineage-table"><thead><tr><th>#</th><th>Name</th><th>Gen</th><th>Relation</th></tr></thead><tbody>`;
        chain.forEach((p,i) => {
            const isMember = i===0, isRoot = i===chain.length-1, isF = p.gender?.startsWith('F');
            html += `<tr class="${isRoot?'common-root':''} ${isMember?'member-row':''} ${isF?'female-row':''}"><td>${chain.length-i}</td><td><strong>${properCase(displayName(p.name))}</strong></td><td>${p.gen}</td><td>${isMember?'🔍 Member':(isRoot?'👑 Root':'⬆️ Ancestor')}</td></tr>`;
        });
        html += `</tbody></table></div>`;
    }
    if (showSib && m.father && m.father.toLowerCase() !== 'n/a') {
        const sibs = db.filter(s => s.father && s.father.toLowerCase() === m.father.toLowerCase() && s.name.toLowerCase() !== m.name.toLowerCase());
        if (sibs.length) {
            html += `<div class="lineage-table-container" style="max-width:100%; margin-bottom:20px;"><div class="table-title">👨‍👦 Siblings of ${properCase(displayName(m.name))}</div><table class="lineage-table"><thead><tr><th>Name</th><th>Gender</th><th>Gen</th></tr></thead><tbody>`;
            sibs.forEach(s => {
                const isF = s.gender?.startsWith('F');
                html += `<tr class="${isF?'female-row':''}" onclick='jumpTo("${s.name.replace(/'/g,"\\'")}","${s.gen}")' style="cursor:pointer;"><td><strong>${properCase(displayName(s.name))}</strong></td><td>${isF?'F':'M'}</td><td>${s.gen}</td></tr>`;
            });
            html += `</tbody></table></div>`;
        }
    }
    if (showDesc) {
        const kids = db.filter(c => c.father && c.father.toLowerCase() === m.name.toLowerCase());
        if (kids.length) {
            html += `<div class="lineage-table-container" style="max-width:100%; margin-bottom:20px;"><div class="table-title">👶 Descendants of ${properCase(displayName(m.name))}</div><table class="lineage-table"><thead><tr><th>Name</th><th>Gender</th><th>Gen</th></tr></thead><tbody>`;
            kids.forEach(c => {
                const isF = c.gender?.startsWith('F');
                html += `<tr class="${isF?'female-row':''}" onclick='jumpTo("${c.name.replace(/'/g,"\\'")}","${c.gen}")' style="cursor:pointer;"><td><strong>${properCase(displayName(c.name))}</strong></td><td>${isF?'F':'M'}</td><td>${c.gen}</td></tr>`;
            });
            html += `</tbody></table></div>`;
        }
    }
    html += `<div class="pdf-signature">${ARCHITECT_INFO}</div></div>`;
    document.getElementById('canvas').innerHTML = html;
}

// 4.7 ROOT RELATIVE LOGIC (TWO MEMBER SEARCH)
function findCommonRoot() {
    if (!rootSearchFirst || !rootSearchSecond) {
        alert('Please select both members first');
        return;
    }
    selectedFrom = rootSearchFirst; 
    selectedTo = rootSearchSecond;
    renderRootRelativeTable();
}

function showBothRootsView() {
    if (!rootSearchFirst || !rootSearchSecond) {
        alert('Please select both members first');
        return;
    }
    selectedFrom = rootSearchFirst; 
    selectedTo = rootSearchSecond;
    renderBothRoots();
}

function renderRootRelativeTable() {
    if (!rootSearchFirst || !rootSearchSecond) return;
    
    const c1 = getAncestryChain(rootSearchFirst);
    const c2 = getAncestryChain(rootSearchSecond);
    
    let meeting = null;
    for (let p of c1) {
        if (c2.some(x => x.name.toLowerCase() === p.name.toLowerCase())) { 
            meeting = p; 
            break; 
        }
    }
    
    if (!meeting) { 
        document.getElementById('canvas').innerHTML = '<div class="summary-box">❌ No common ancestor found</div>'; 
        document.getElementById('canvas-header').style.display = 'block';
        return; 
    }
    
    let html = `<div class="tree-root-layout" id="pdf-area">`;
    html += `<div class="summary-box"><div class="summary-title">👑 Common Root</div><div class="summary-content">
        <div class="summary-item"><div class="summary-label">Root</div><div class="summary-value">${properCase(displayName(meeting.name))} (${meeting.gen})</div></div>
        <div class="summary-item"><div class="summary-label">Father</div><div class="summary-value">${properCase(displayName(meeting.father)) || '—'}</div></div>
        <div class="summary-item"><div class="summary-label">Gen To 1st</div><div class="summary-value">${c1.findIndex(p => p.name.toLowerCase() === meeting.name.toLowerCase()) + 1}</div></div>
        <div class="summary-item"><div class="summary-label">Gen To 2nd</div><div class="summary-value">${c2.findIndex(p => p.name.toLowerCase() === meeting.name.toLowerCase()) + 1}</div></div>
    </div></div>`;
    
    html += `<div class="tables-container">`;
    html += makeLineageTable(rootSearchFirst, c1, meeting, 'Search Member');
    html += makeLineageTable(rootSearchSecond, c2, meeting, 'Search Member');
    html += `</div><div class="pdf-signature">${ARCHITECT_INFO}</div></div>`;
    
    document.getElementById('canvas').innerHTML = html;
    document.getElementById('canvas-header').style.display = 'block';
}

function makeLineageTable(member, chain, meeting, label) {
    let tbl = `<div class="lineage-table-container"><div class="table-title">${properCase(displayName(member.name))}</div><table class="lineage-table"><thead><tr><th>#</th><th>Name</th><th>Gen</th><th>Relation</th></tr></thead><tbody>`;
    chain.forEach((p,i) => {
        const isRoot = p.name.toLowerCase() === meeting.name.toLowerCase();
        const isMember = i === 0;
        const isF = p.gender?.startsWith('F');
        tbl += `<tr class="${isRoot?'common-root':''} ${isMember?'member-row':''} ${isF?'female-row':''}"><td>${chain.length-i}</td><td><strong>${properCase(displayName(p.name))}</strong></td><td>${p.gen}</td><td>${isRoot?'👑 Common Root':(isMember?`🔍 ${label}`:'⬆️ Ancestor')}</td></tr>`;
    });
    tbl += `</tbody></table></div>`;
    return tbl;
}

function renderBothRoots() {
    if (!selectedFrom || !selectedTo) return;
    
    const c1 = getAncestryChain(selectedFrom);
    const c2 = getAncestryChain(selectedTo);
    
    let meeting = null;
    for (let p of c1) {
        if (c2.some(x => x.name.toLowerCase() === p.name.toLowerCase())) { 
            meeting = p; 
            break; 
        }
    }
    
    if (!meeting) { 
        document.getElementById('canvas').innerHTML = '<div class="summary-box">❌ No common ancestor found</div>'; 
        document.getElementById('canvas-header').style.display = 'block';
        return; 
    }
    
    const rootName = meeting.name.toLowerCase();
    const col1 = buildTreeColumn(c1, rootName, 'Member 1');
    const col2 = buildTreeColumn(c2, rootName, 'Member 2');
    
    document.getElementById('canvas').innerHTML = `<div class="tree-root-layout" id="pdf-area"><div style="display:flex; gap:60px; align-items:flex-start; justify-content:center;">${col1}${col2}</div><div class="pdf-signature">${ARCHITECT_INFO}</div></div>`;
    document.getElementById('canvas-header').style.display = 'block';
}

function buildTreeColumn(chain, rootName, label) {
    let col = `<div style="display:flex; flex-direction:column; align-items:center; gap:15px;"><div style="font-weight:800; color:var(--dark-blue); border-bottom:2px solid var(--gold); padding-bottom:6px; margin-bottom:10px;">${label}</div>`;
    const idx = chain.findIndex(p => p.name.toLowerCase() === rootName);
    const path = chain.slice(0, idx+1);
    path.forEach((p,i) => {
        const isRoot = p.name.toLowerCase() === rootName;
        col += renderBox(p, isRoot ? 'Common Root' : (i===0 ? 'Search Member' : 'Ancestor'), i===0 || isRoot, isRoot, true);
        if (i < path.length-1) col += '<div class="v-line"></div>';
    });
    col += '</div>';
    return col;
}

function jumpTo(name, gen) {
    const p = db.find(x => x.name === name && x.gen === gen);
    if (p) { 
        selectedFrom = p; 
        document.getElementById('si-from').value = `${displayName(p.name)} (${p.gen})`; 
        initRender(); 
    }
}

// 4.8 PDF EXPORT LOGIC
async function exportPDF() {
    const el = document.getElementById('pdf-area'); 
    if (!el) return alert('Generate tree/table first');
    
    let sub = '';
    if (rootSearchFirst && rootSearchSecond) {
        sub = `${properCase(displayName(rootSearchFirst.name))} & ${properCase(displayName(rootSearchSecond.name))}`;
    } else if (selectedFrom) {
        sub = properCase(displayName(selectedFrom.name));
    }
    
    const head = document.createElement('div');
    head.innerHTML = `<h1 style="color:#D4AF37; text-align:center; font-size:36px; margin:0 0 10px 0;">Rizvi Family Tree</h1><h2 style="color:#991B1B; text-align:center; font-size:24px; margin:0 0 20px 0;">${sub}</h2>`;
    el.insertBefore(head, el.firstChild);
    
    const foot = document.createElement('div');
    foot.style = 'border:2px solid #D4AF37; padding:10px; margin-top:30px; display:flex; justify-content:space-between; background:#0F172A; color:#D4AF37;';
    foot.innerHTML = `<span>${LOAD_STAMP}</span><span>${formatCurrentTime()}</span>`;
    el.appendChild(foot);
    
    const canvas = await html2canvas(el, { scale:2, backgroundColor:'white' });
    el.removeChild(head); 
    el.removeChild(foot);
    
    const img = canvas.toDataURL('image/png');
    const w = canvas.width/2 * 0.264583, h = canvas.height/2 * 0.264583;
    const pdf = new jspdf.jsPDF({ orientation: w>h ? 'l' : 'p', unit: 'mm', format: [w+40, h+40] });
    pdf.addImage(img, 'PNG', 20, 20, w, h);
    pdf.save('Rizvi_Family_Tree.pdf');
}

function formatCurrentTime() { 
    const d = new Date(); 
    return `${d.toLocaleString('en-GB', { day:'2-digit', month:'short', year:'numeric' })} - ${d.getHours()%12||12}:${String(d.getMinutes()).padStart(2,'0')}${d.getHours()>=12?'pm':'am'}`; 
}

// 4.9 INITIALIZATION (ON WINDOW LOAD)
window.onload = () => {
    initMenu();
    clearViewRadios();
    toggleCheckboxesVisibility();
    clearAllSearchAndCanvas();

    const searchTab = document.querySelector('.menu-item[data-panel="search-panel"]');
    if (searchTab) searchTab.click();

    autoLoadExcel();
};



// Add mobile detection and expose functions for mobile.js
window.renderTreeBlock = renderTreeBlock;
window.renderBothRoots = renderBothRoots;
window.exportPDF = exportPDF;

// Ensure mobile optimizations are applied after render
const originalInitRender = initRender;
initRender = function() {
    originalInitRender();
    if (window.innerWidth <= 768 && typeof optimizeRenderedTreeForMobile !== 'undefined') {
        setTimeout(optimizeRenderedTreeForMobile, 100);
    }
};