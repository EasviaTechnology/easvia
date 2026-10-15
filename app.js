(function(){
  'use strict';
  const D=window.EASVIA_CONFIG,F=window.EasviaFinance;
  const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
  const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const money=F.formatMoney, plain=F.moneyPlain;
  const iconPaths={
    'user':'<path d="M20 21a8 8 0 0 0-16 0"/><circle cx="12" cy="8" r="4"/>',
    'lock':'<rect x="4" y="11" width="16" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/>',
    'eye':'<path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12Z"/><circle cx="12" cy="12" r="3"/>',
    'eye-off':'<path d="m3 3 18 18M10.4 5.1A12 12 0 0 1 12 5c6.4 0 10 7 10 7a15 15 0 0 1-3.6 4.4M6.6 6.7C3.6 8.5 2 12 2 12s3.6 7 10 7c1.1 0 2.2-.2 3.1-.5"/>',
    'shield':'<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z"/><path d="m9 12 2 2 4-4"/>',
    'layout-dashboard':'<rect x="3" y="3" width="7" height="9" rx="1"/><rect x="14" y="3" width="7" height="5" rx="1"/><rect x="14" y="12" width="7" height="9" rx="1"/><rect x="3" y="16" width="7" height="5" rx="1"/>',
    'list':'<path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01"/>',
    'file-text':'<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6M8 13h8M8 17h8"/>',
    'calculator':'<rect x="4" y="2" width="16" height="20" rx="2"/><path d="M8 6h8M8 11h2m4 0h2M8 15h2m4 0h2M8 19h2m4 0h2"/>',
    'calendar':'<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M16 3v4M8 3v4M3 10h18"/>',
    'log-out':'<path d="M10 17l5-5-5-5M15 12H3M13 3h5a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-5"/>',
    'menu':'<path d="M4 6h16M4 12h16M4 18h16"/>',
    'trending-up':'<path d="m3 17 6-6 4 4 8-8M15 7h6v6"/>',
    'wallet':'<rect x="2" y="5" width="20" height="16" rx="3"/><path d="M2 9h20M17 15h1M5 5V3h12"/>',
    'receipt':'<path d="M4 2h16v20l-4-2-4 2-4-2-4 2zM8 7h8M8 12h8M8 17h4"/>',
    'clock':'<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
    'download':'<path d="M12 3v12m-5-5 5 5 5-5M4 17v4h16v-4"/>',
    'arrow-right':'<path d="M5 12h14m-6-6 6 6-6 6"/>',
    'chevron-right':'<path d="m9 18 6-6-6-6"/>',
    'music':'<path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/>',
    'shirt':'<path d="m16 3 5 3-3 5-3-2v12H9V9l-3 2-3-5 5-3a4 4 0 0 0 8 0Z"/>',
    'sparkles':'<path d="m12 3 2.2 6.8L21 12l-6.8 2.2L12 21l-2.2-6.8L3 12l6.8-2.2L12 3ZM19 3v4m-2-2h4"/>',
    'info':'<circle cx="12" cy="12" r="10"/><path d="M12 11v6M12 7h.01"/>',
    'check':'<path d="m4 12 5 5L20 6"/>',
    'credit-card':'<rect x="2" y="4" width="20" height="16" rx="3"/><path d="M2 10h20M6 16h4"/>',
    'chart':'<path d="M3 3v18h18M7 16l4-5 4 2 5-8"/>',
    'arrow-up-right':'<path d="M7 17 17 7M7 7h10v10"/>',
    'layers':'<path d="m12 2 9 5-9 5-9-5 9-5Zm-9 10 9 5 9-5M3 17l9 5 9-5"/>',
  };
  const icon=(name,cls='')=>`<svg class="${cls}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${iconPaths[name]||iconPaths.info}</svg>`;
  $$('[data-icon]').forEach(node=>node.innerHTML=icon(node.dataset.icon));
  let lastDate=F.today();
  function latestPublishedStatementMonth(){return F.latestPublishedMonth(F.today(),D.schedule.statementDay);}
  const state={page:'overview',loginMode:'pin',chartRange:'all',statementMonth:latestPublishedStatementMonth(),
    archiveCount:12, paymentAmount:'0',paymentDate:lastDate,targetDate:F.monthEnd(F.addMonths(lastDate,6))};
  let toastTimer;
  let inMemorySession=false;
  const session = {
    get(){try{return sessionStorage.getItem('easvia_session')==='active';}catch{return inMemorySession;}},
    set(value){inMemorySession=value;try{if(value)sessionStorage.setItem('easvia_session','active');else sessionStorage.removeItem('easvia_session');}catch{}}
  };
  const notify=text=>{ const node=$('#toast');node.textContent=text;node.classList.add('visible');clearTimeout(toastTimer);toastTimer=setTimeout(()=>node.classList.remove('visible'),3000);};
  function pageHead(eyebrow,title,desc,extra='') {
    return `<div class="page-header"><div><div class="page-eyebrow">${esc(eyebrow)}</div><h1>${esc(title)}</h1><p class="page-description">${esc(desc)}</p></div>${extra}</div>`;
  }
  const dateChip=()=>`<div class="date-chip">${icon('calendar')} ${esc(F.prettyDate(F.today(),{weekday:'short',month:'short',day:'numeric',year:'numeric'}))}</div>`;
  const todayBalance=()=>F.actualBalanceOn(F.today(),D);
  const endBalance=()=>F.statementFor(latestPublishedStatementMonth(),D);
  function overview(){
    const current=todayBalance(),stmt=endBalance();
    const prior=F.actualBalanceOn(F.addMonths(F.today(),-1),D);
    const diff=current.balanceCents-prior.balanceCents;
    const totalPrincipal=D.purchases.reduce((s,p)=>s+p.principalCents,0);
    const ratio=current.principalCents+current.lateFeesCents>0?Math.round(current.principalCents/(current.principalCents+current.lateFeesCents)*100):100;
    return `${pageHead('ACCOUNT OVERVIEW','Your balance, at a glance.','A complete picture of charges, fees, and published billing activity.',dateChip())}
    <section class="stat-grid">
      <div class="card stat-card highlight"><div class="stat-top"><span>OUTSTANDING TODAY</span>${icon('wallet')}</div><div class="stat-value">${money(current.balanceCents)}</div><div class="stat-desc">As of ${esc(F.prettyDate(F.today(),{month:'short',day:'numeric',year:'numeric'}))} · Canadian dollars</div></div>
      <div class="card stat-card"><div class="stat-top"><span>LATEST STATEMENT AMOUNT DUE</span>${icon('calendar')}</div><div class="stat-value">${money(stmt.balanceCents)}</div><div class="stat-desc">Due ${esc(F.prettyDate(stmt.due,{month:'short',day:'numeric'}))} · As calculated through the due date</div></div>
      <div class="card stat-card"><div class="stat-top"><span>ORIGINAL PURCHASES</span>${icon('receipt')}</div><div class="stat-value">${money(totalPrincipal)}</div><div class="stat-desc">${D.purchases.length} purchase entries on record</div></div>
      <div class="card stat-card"><div class="stat-top"><span>LATE FEES TO DATE</span>${icon('trending-up')}</div><div class="stat-value">${money(current.lateFeesCents)}</div><div class="stat-desc"><span class="trend-pill">${icon('trending-up')} ${diff>=0?'+':''}${money(diff)}</span> vs. same day last month</div></div>
    </section>
    <div class="dash-grid"><section class="card chart-card"><div class="card-heading"><div><h2 class="card-title">Balance over time</h2><p class="card-subtitle">Month-end history from January 2025 · Projections for the next 12 months</p></div><div class="chart-control-group"><div class="pill-tabs" role="group" aria-label="Chart range">${[['6m','6M'],['12m','1Y'],['all','All + 1Y'],['future','Next 12M']].map(([id,label])=>`<button data-chart-range="${id}" class="${state.chartRange===id?'selected':''}" aria-pressed="${state.chartRange===id}">${label}</button>`).join('')}</div></div></div><div class="chart-legend"><span><i class="legend-marker legend-total"></i>Total balance</span><span><i class="legend-marker legend-fee"></i>Late fees</span><span><i class="legend-marker legend-projected"></i>Projected balance (dashed)</span></div><div id="balanceChart" class="chart-stage"></div><div class="chart-anchors"><span><small>JAN 1, 2025 · OPENING</small><strong>${money(F.actualBalanceOn('2025-01-01',D).balanceCents)}</strong></span><span><small>JAN 31, 2025</small><strong>${money(F.actualBalanceOn('2025-01-31',D).balanceCents)}</strong></span><span><small>${esc(F.prettyDate(F.monthEnd(F.addMonths(F.today(),12)),{month:'short',day:'numeric',year:'numeric'}))} · ESTIMATE</small><strong>${money(F.actualBalanceOn(F.monthEnd(F.addMonths(F.today(),12)),D).balanceCents)}</strong></span></div><div class="chart-note">Actual history runs from January 1, 2025 to today; dashed lines project month-end values 12 months ahead. Estimates assume no additional charges or payments. No future statements are generated.</div></section>
    <div class="right-stack"><section class="card breakdown-card"><div class="card-heading"><div><h2 class="card-title">Balance breakdown</h2><p class="card-subtitle">Of the total charges to date</p></div>${icon('layers')}</div><div class="donut-layout"><div class="donut" style="background:conic-gradient(#7771ed 0% ${ratio}%,#12b6a2 ${ratio}% 100%)"><div class="donut-inner"><strong>${ratio}%</strong><small>Purchases</small></div></div><div class="breakdown-list"><div class="breakdown-row"><span><i class="legend-marker legend-total"></i>Purchases</span><strong>${money(current.principalCents)}</strong></div><div class="breakdown-row"><span><i class="legend-marker legend-fee"></i>Late fees</span><strong>${money(current.lateFeesCents)}</strong></div><div class="breakdown-row"><span>Payments</span><strong>${current.paymentsCents?'−':''}${money(current.paymentsCents)}</strong></div></div></div></section>
    <section class="card billing-card"><div class="card-heading"><div><h2 class="card-title">Next billing milestone</h2><p class="card-subtitle">Automatic calendar-based schedule</p></div>${icon('calendar')}</div><div class="billing-row"><div class="billing-icon">${icon('file-text')}</div><div><strong>${esc(F.prettyDate(F.statementDate((Number(F.today().slice(8))<14?F.today():F.addMonths(F.today(),1)).slice(0,7))))}</strong><small>Next monthly statement issuance</small></div></div><div class="billing-separator"></div><div class="billing-mini"><span>Latest statement due date</span><strong>${esc(F.prettyDate(stmt.due,{month:'short',day:'numeric',year:'numeric'}))}</strong></div><div class="billing-mini" style="margin-top:12px"><span>Monthly fee rate</span><strong>${money(F.monthlyRate(D.feeGroups))} / mo.</strong></div></section></div></div>
    <div class="section-heading"><div><h2>Charge details</h2><p>Four separately priced items · three non-compounding late-fee schedules.</p></div><button class="text-link" data-page="activity">View all activity →</button></div><section class="purchase-grid">${D.purchases.map(item=>purchaseCard(item,current)).join('')}</section>
    <div class="fine-print">Corrected from the October 2026 source statement using the item-by-item prices, original due dates, and later late-fee start dates provided by the account owner. The January 5 purchases share one CAD 1.50 monthly late fee; no payments are recorded.</div>`;
  }
  function purchaseCard(item,snapshot){
    const row=snapshot.rows.find(r=>r.id===item.id);
    const group=D.feeGroups.find(g=>g.id===item.feeGroupId);
    const feeRow=snapshot.feeRows.find(r=>r.id===item.feeGroupId);
    const shared=group.purchaseIds.length>1;
    const lateText=shared?`${money(group.monthlyLateFeeCents)} / mo. shared`:`${money(group.monthlyLateFeeCents)} / mo.`;
    return `<article class="card purchase-card"><div class="purchase-head"><div class="purchase-icon">${icon(item.icon)}</div><div><div class="purchase-category">${esc(item.category)}</div><div class="purchase-name">${esc(item.shortName)}</div></div></div><div class="purchase-divider"></div>
    <div class="purchase-meta"><span>Purchased</span><strong>${esc(F.prettyDate(item.purchaseDate,{month:'short',day:'numeric',year:'numeric'}))}</strong></div>
    <div class="purchase-meta"><span>Purchase price</span><strong>${money(item.principalCents)}</strong></div>
    <div class="purchase-meta"><span>Original payment due</span><strong>${esc(F.prettyDate(item.dueDate,{month:'short',day:'numeric',year:'numeric'}))}</strong></div>
    <div class="purchase-meta"><span>Late fees started</span><strong>${esc(F.prettyDate(group.lateFeeStart,{month:'short',day:'numeric',year:'numeric'}))}</strong></div>
    <div class="purchase-meta"><span>Monthly late fee</span><strong>${lateText}</strong></div>
    <div class="purchase-meta"><span>Accrued late fees</span><strong>${shared?'In shared fee below':money(feeRow.feeCents)}</strong></div>
    <div class="purchase-total"><span>${shared?'Purchase amount (fee shown separately)':'Total charges to date'}</span><strong>${money(row.principalChargedCents+row.feeCents)}</strong></div></article>`;
  }
  function chartPoints(){
    const t=F.today(),start=F.firstPurchase(D).slice(0,7)+'-01',currentMonth=t.slice(0,7);
    let from=start.slice(0,7),end=F.addMonths(t,12).slice(0,7),includeProjected=true;
    if(state.chartRange==='6m') {from=F.addMonths(t,-5).slice(0,7);end=currentMonth;includeProjected=false;}
    if(state.chartRange==='12m') {from=F.addMonths(t,-11).slice(0,7);end=currentMonth;includeProjected=false;}
    if(state.chartRange==='future') {from=F.addMonths(t,-11).slice(0,7);}
    let series=F.monthSeries(from,end,D,true);
    if(!includeProjected) series=series.filter(p=>p.date<=t);
    if(from<=start.slice(0,7)) {
      // Original January 2025 start is zero, NOT the first Jan 5 transaction.
      series.unshift({...F.actualBalanceOn(start,D),month:start.slice(0,7),label:'Jan 1 · Opening balance',isProjected:false});
    }
    if(series.length<2) series.unshift({...F.actualBalanceOn(F.addMonths(t,-1),D),label:F.prettyMonth(F.addMonths(t,-1)),isProjected:false});
    return series;
  }
  function renderChart(){
    const stage=$('#balanceChart'); if(!stage)return;
    const points=chartPoints(),small=stage.clientWidth<480,W=small?470:890,H=282,left=small?53:55,right=small?12:16,top=15,bottom=42,w=W-left-right,h=H-top-bottom;
    let max=Math.max(50,...points.map(p=>p.balanceCents),...points.map(p=>p.lateFeesCents));
    const ceilDollars=Math.ceil(max/100/25)*25; max=ceilDollars*100;
    const minD=F.fromYMD(points[0].date).getTime(),maxD=F.fromYMD(points.at(-1).date).getTime();
    const x=p=>left+(F.fromYMD(p.date).getTime()-minD)/Math.max(1,maxD-minD)*w;
    const y=c=>top+h-(c/max)*h;
    const historical=points.filter(p=>!p.isProjected);
    const future=points.filter(p=>p.isProjected);
    const line=(arr,prop)=>arr.map((p,i)=>`${i?'L':'M'}${x(p).toFixed(2)},${y(p[prop]).toFixed(2)}`).join(' ');
    const totalLine=line(historical,'balanceCents');
    const feesLine=line(historical,'lateFeesCents');
    const area=historical.length?`${totalLine} L${x(historical.at(-1))},${top+h} L${x(historical[0])},${top+h} Z`:'';
    const forecastLine=future.length?line([historical.at(-1),...future].filter(Boolean),'balanceCents'):'';
    const forecastFees=future.length?line([historical.at(-1),...future].filter(Boolean),'lateFeesCents'):'';
    const tickIndex=[0,1,2,3,4];
    let svg=`<svg viewBox="0 0 ${W} ${H}" preserveAspectRatio="none" role="img" aria-label="Interactive balance chart from ${F.prettyDate(points[0].date)} through ${F.prettyDate(points.at(-1).date)}, including projected amounts after today"><defs><linearGradient id="purpleArea" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#8480ed" stop-opacity=".19"/><stop offset="100%" stop-color="#8480ed" stop-opacity="0"/></linearGradient></defs>`;
    tickIndex.forEach(i=>{const yy=top+h-i*h/4;svg+=`<line x1="${left}" y1="${yy}" x2="${W-right}" y2="${yy}" stroke="#eff0f6" stroke-width="1"/><text x="${left-10}" y="${yy+4}" text-anchor="end" font-family="DM Sans,Arial,sans-serif" font-size="${small?18:11}" fill="#9ba4b6">$${Math.round(ceilDollars*i/4)}</text>`;});
    const desired=small?3:6;
    for(let i=0;i<=desired;i++){
      const idx=Math.round(i*(points.length-1)/desired),p=points[idx];
      svg+=`<text x="${x(p)}" y="${H-11}" text-anchor="middle" font-family="DM Sans,Arial,sans-serif" font-size="${small?18:11}" fill="#9ba4b6">${esc(F.prettyDate(p.date,{month:'short',year:'2-digit'}))}</text>`;
    }
    if(future.length) {const begin=x(future[0]);svg+=`<rect x="${begin}" y="${top}" width="${W-right-begin}" height="${h}" fill="#f7f6ff" opacity=".75"/><line x1="${begin}" x2="${begin}" y1="${top}" y2="${top+h}" stroke="#c6bffa" stroke-width="1.3" stroke-dasharray="3 5"/>`;}
    svg+=`<path d="${area}" fill="url(#purpleArea)"/><path d="${totalLine}" stroke="#7771e8" fill="none" stroke-width="3.4" stroke-linecap="round" stroke-linejoin="round"/><path d="${feesLine}" stroke="#12b6a2" fill="none" stroke-width="2.7" stroke-linecap="round" stroke-linejoin="round"/>`;
    if(future.length) svg+=`<path d="${forecastLine}" stroke="#7771e8" fill="none" stroke-width="3" stroke-dasharray="7 6"/><path d="${forecastFees}" stroke="#12b6a2" fill="none" stroke-width="2.6" stroke-dasharray="6 5"/>`;
    const last=historical.at(-1);
    if(last) svg+=`<circle cx="${x(last)}" cy="${y(last.balanceCents)}" r="5" fill="#fff" stroke="#7771e8" stroke-width="3"/>`;
    if(points[0]?.date==='2025-01-01'){
      for(const p of points.slice(0,2)) svg+=`<circle cx="${x(p)}" cy="${y(p.balanceCents)}" r="4" fill="#7771e8" stroke="#fff" stroke-width="1.5"/>`;
    }
    if(future.length){const p=future.at(-1);svg+=`<circle cx="${x(p)}" cy="${y(p.balanceCents)}" r="5" fill="#fff" stroke="#7771e8" stroke-width="2"/>`;}

    svg+=`<g id="chartCrosshair" visibility="hidden"><line id="crosshairLine" x1="0" x2="0" y1="${top}" y2="${top+h}" stroke="#8991a7" stroke-width="1" stroke-dasharray="3 4"/><circle id="crosshairDot" cx="0" cy="0" r="5" fill="#fff" stroke="#7771e8" stroke-width="2"/></g></svg><div class="chart-tip" id="chartTip" hidden></div>`;
    stage.innerHTML=svg;
    const svgEl=stage.querySelector('svg'),tip=stage.querySelector('#chartTip'),cross=stage.querySelector('#chartCrosshair');
    function updateTooltip(e){
      const bounds=svgEl.getBoundingClientRect();if(!bounds.width)return;
      const mx=(e.clientX-bounds.left)/bounds.width*W;
      let nearest=points[0],idx=0,best=Infinity;
      points.forEach((p,i)=>{const delta=Math.abs(mx-x(p));if(delta<best){best=delta;idx=i;nearest=p;}});
      const p=nearest,cx=x(p),cy=y(p.balanceCents);
      cross.setAttribute('visibility','visible');
      const l=stage.querySelector('#crosshairLine'),dot=stage.querySelector('#crosshairDot');
      l.setAttribute('x1',cx);l.setAttribute('x2',cx);dot.setAttribute('cx',cx);dot.setAttribute('cy',cy);
      tip.hidden=false;
      tip.innerHTML=`<small>${esc(F.prettyDate(p.date))}${p.isProjected?' · Projected':''}</small><strong>${money(p.balanceCents)}</strong><span>Late fees: ${money(p.lateFeesCents)}</span>`;
      const xp=cx/W*bounds.width;
      tip.style.left=`${Math.max(80,Math.min(bounds.width-80,xp))}px`;
      tip.style.top=`${Math.max(68,cy/H*bounds.height)}px`;
      tip.style.transform=cy/H*bounds.height<75?'translate(-50%,12px)':'translate(-50%,-110%)';
    }
    stage.addEventListener('pointermove',updateTooltip);
    stage.addEventListener('pointerdown',updateTooltip);
    stage.addEventListener('pointerleave',()=>{tip.hidden=true;cross.setAttribute('visibility','hidden');});
  }
  function activity(){
    const current=todayBalance(),payments=D.payments;
    const feeFor=p=>D.feeGroups.find(g=>g.id===p.feeGroupId);
    const rowFor=p=>current.rows.find(r=>r.id===p.id);
    const timeline=[
      ...D.purchases.map(p=>({date:p.purchaseDate,title:`${p.shortName} purchased`,text:`Original charge ${money(p.principalCents)}.`})),
      ...D.feeGroups.map(g=>({date:g.dueDate,title:`${g.name}: original payment due`,text:`The original payment deadline for this purchase group.`})),
      ...D.feeGroups.map(g=>({date:g.lateFeeStart,title:`${g.name}: late fees began`,text:`${money(g.monthlyLateFeeCents)} charged each month on the ${Number(g.lateFeeStart.slice(8))}${ordinal(Number(g.lateFeeStart.slice(8)))}.`}))
    ].sort((a,b)=>a.date.localeCompare(b.date));
    return `${pageHead('TRANSACTION HISTORY','Transactions & activity.','Four individual purchases with original due dates and correctly grouped late fees.',dateChip())}
    <section class="stat-grid activity-stats" style="grid-template-columns:repeat(3,minmax(0,1fr))"><div class="card stat-card"><div class="stat-top">PURCHASE ENTRIES ${icon('receipt')}</div><div class="stat-value">${D.purchases.length}</div><div class="stat-desc">Two separate items purchased on January 5</div></div><div class="card stat-card"><div class="stat-top">COMBINED MONTHLY FEE ${icon('clock')}</div><div class="stat-value">${money(F.monthlyRate(D.feeGroups))}</div><div class="stat-desc">Three fee groups · Non-compounding</div></div><div class="card stat-card"><div class="stat-top">PAYMENTS RECEIVED ${icon('credit-card')}</div><div class="stat-value">${money(current.paymentsCents)}</div><div class="stat-desc">${payments.length?'Recorded in the site’s data file':'None recorded'}</div></div></section>
    <div class="section-heading"><div><h2>Itemized purchase ledger</h2><p>Four separately priced items, as of ${esc(F.prettyDate(F.today()))}.</p></div></div>
    <div class="card table-card"><table class="data-table"><thead><tr><th>Purchased item</th><th>Purchase date</th><th>Original</th><th>Original due</th><th>Fee begins</th><th>Fee arrangement</th><th>Item charges*</th></tr></thead><tbody>${D.purchases.map(p=>{const g=feeFor(p),r=rowFor(p),shared=g.purchaseIds.length>1;return `<tr><td><div class="row-name"><div class="mini-icon">${icon(p.icon)}</div><div><strong>${esc(p.name)}</strong><span>${esc(p.category)}</span></div></div></td><td>${esc(F.prettyDate(p.purchaseDate,{month:'short',day:'numeric',year:'numeric'}))}</td><td>${money(p.principalCents)}</td><td>${esc(F.prettyDate(p.dueDate,{month:'short',day:'numeric',year:'numeric'}))}</td><td>${esc(F.prettyDate(g.lateFeeStart,{month:'short',day:'numeric',year:'numeric'}))}</td><td>${money(g.monthlyLateFeeCents)} / mo.${shared?'<br/><small>Shared between 2 items</small>':''}</td><td class="amount-cell">${money(r.principalChargedCents+r.feeCents)}</td></tr>`;}).join('')}</tbody></table></div>
    <p class="fine-print">*The two January 5 items share one monthly late fee. Their shared fees appear separately in the fee schedule below and are counted once in the account total.</p>
    <div class="section-heading"><div><h2>Late-fee schedule</h2><p>Monthly, non-compounding charges applied to each group.</p></div></div>
    <div class="card table-card"><table class="data-table"><thead><tr><th>Fee group</th><th>Original due</th><th>Accrual begins</th><th>Per month</th><th>Months accrued</th><th>Fees accrued</th></tr></thead><tbody>${current.feeRows.map(g=>`<tr><td><strong>${esc(g.name)}</strong></td><td>${esc(F.prettyDate(g.dueDate))}</td><td>${esc(F.prettyDate(g.lateFeeStart))}</td><td>${money(g.monthlyLateFeeCents)}</td><td>${g.feeCount}</td><td class="amount-cell">${money(g.feeCents)}</td></tr>`).join('')}<tr><td><strong>Total fees</strong></td><td></td><td></td><td>${money(F.monthlyRate(D.feeGroups))}</td><td></td><td class="amount-cell"><strong>${money(current.lateFeesCents)}</strong></td></tr></tbody></table></div>
    <div class="section-heading"><div><h2>Account timeline</h2><p>Purchase dates, original deadlines, and late-fee start dates.</p></div></div>
    <div class="content-grid"><section class="card explain-card"><div class="timeline">${timeline.map(e=>`<div class="timeline-item"><strong>${esc(F.prettyDate(e.date))} · ${esc(e.title)}</strong><p>${esc(e.text)}</p></div>`).join('')}</div></section>
    <section class="card explain-card"><h3>Payments on record</h3>${payments.length?payments.map(p=>`<div class="milestone-row"><span>${esc(F.prettyDate(p.date))} · ${esc(p.note||'Payment')}</span><strong>${money(p.amountCents)}</strong></div>`).join(''):'<div class="empty-message">No payments have been recorded.<br/><br/>This website does not collect payments. To add a payment, the site owner must update <code>data.js</code> and republish.</div>'}
    <div class="planner-assumption">${icon('info')}<div>The purchase prices and due dates were corrected after the original October 14, 2026 PDF. The fee schedules now begin one month after the original payment deadlines. Partial-payment allocation remains an illustrative account-level assumption.</div></div></section></div>`;
  }
  function ordinal(day){return [11,12,13].includes(day)?'th':{1:'st',2:'nd',3:'rd'}[day%10]||'th';}
  function stmtStatus(month){
    if(month==='2026-10') return '<span class="status-badge original">Revised calculation</span>';
    if(month===latestPublishedStatementMonth()) return '<span class="status-badge">Published</span>';
    return '<span class="status-badge">Archived</span>';
  }
  function renderStatementSheet(month){
    const stmt=F.statementFor(month,D),status=stmt.balanceCents===0?'PAID':'UNPAID';
    const generatedNote=`<div class="statement-small-print">Recalculated using corrected purchase prices, original deadlines, and late-fee start dates supplied October 15, 2026. Earlier monthly documents are historical reconstructions and are not evidence of delivery or prior issuance.</div>`;
    const intro=`This revised statement itemizes four purchase entries and non-compounding late fees through ${F.prettyDate(stmt.due)}. ${stmt.paymentsCents===0?'No payments have been recorded.':'Recorded payments have been deducted from the balance summary.'}`;
    const groupFor=item=>D.feeGroups.find(g=>g.id===item.feeGroupId);
    const perRow=r=>{
      const group=groupFor(r),shared=group.purchaseIds.length>1;
      return `<tr><td><strong>${esc(r.name)}</strong><span class="subline">Purchased ${esc(F.prettyDate(r.purchaseDate))}</span><span class="subline">Original due ${esc(F.prettyDate(r.dueDate))}</span></td><td>${plain(r.principalChargedCents)}</td><td>${esc(F.prettyDate(group.lateFeeStart))}</td><td>${shared?'Shared fee below':`${plain(group.monthlyLateFeeCents)} / month`}</td><td>${shared?'Included in shared row':`${plain(r.feeCents)}<span class="subline">${r.feeCount} months</span>`}</td><td><strong>${plain(r.principalChargedCents+r.feeCents)}</strong></td></tr>`;
    };
    const sharedRows=stmt.feeRows.filter(g=>g.purchaseIds.length>1).map(g=>`<tr class="statement-shared-fee"><td><strong>${esc(g.name)}</strong><span class="subline">One combined monthly fee for Orchid and Blueberry Faygo; charged only once.</span><span class="subline">Original due ${esc(F.prettyDate(g.dueDate))}</span></td><td>—</td><td>${esc(F.prettyDate(g.lateFeeStart))}</td><td>${plain(g.monthlyLateFeeCents)} / month</td><td>${plain(g.feeCents)}<span class="subline">${g.feeCount} months</span></td><td><strong>${plain(g.feeCents)}</strong></td></tr>`).join('');
    return `<article class="statement-sheet"><div class="statement-sheet-header"><h1>PAYMENT DUE<br/>STATEMENT<span class="statement-brand">Easvia Technology · Revised ledger</span></h1><div class="statement-meta"><span class="meta-label">Statement date</span><span>${esc(F.prettyDate(stmt.issued))}</span><span class="meta-label">Balance through</span><span>${esc(F.prettyDate(stmt.due))}</span><span class="meta-label">Currency</span><span>Canadian Dollars<br/>(CAD)</span></div></div>
    <div class="statement-divider"></div><div class="statement-to-label">BILL TO</div><div class="statement-person">${esc(D.accountHolder)}</div><div class="statement-notice">${esc(intro)}</div>
    <div class="statement-kpi"><div><small>TOTAL AMOUNT DUE</small><strong>${plain(stmt.balanceCents)}</strong></div><div><small>PAYMENT DUE DATE</small><strong style="font-size:17px">${esc(F.prettyDate(stmt.due))}</strong></div><div><small>PAYMENT STATUS</small><strong class="${status.toLowerCase()}">${status}</strong></div></div>
    <h2 class="statement-section-title">Itemized balance detail</h2><table class="statement-table"><colgroup><col style="width:31%"/><col style="width:11%"/><col style="width:15%"/><col style="width:16%"/><col style="width:14%"/><col style="width:13%"/></colgroup><thead><tr><th>Description</th><th>Purchase amount</th><th>Late fees began</th><th>Monthly late fee</th><th>Late fees through ${esc(F.prettyDate(stmt.due,{month:'short',day:'numeric',year:'numeric'}))}</th><th>Row balance</th></tr></thead><tbody>${stmt.rows.map(perRow).join('')}${sharedRows}<tr class="summary-row"><td>Totals</td><td>${plain(stmt.principalCents)}</td><td></td><td></td><td>${plain(stmt.lateFeesCents)}</td><td>${plain(stmt.principalCents+stmt.lateFeesCents)}</td></tr></tbody></table>
    <div class="statement-bottom"><section><h3>Payment terms</h3><p>Account statement amount due by <strong>${esc(F.prettyDate(stmt.due))}</strong>; individual purchase deadlines appear above.</p><p>Monthly late fees accrue on the listed start dates without compounding. The two January 5 purchases share one CAD 1.50 late fee per month.</p><p>Amounts in Canadian Dollars (CAD).</p></section><section><h3>Balance summary</h3><table class="statement-balance-table"><tbody><tr><td>Purchase amounts</td><td>${plain(stmt.principalCents)}</td></tr><tr><td>Late fees accrued</td><td>${plain(stmt.lateFeesCents)}</td></tr><tr><td>Payments received</td><td>${plain(stmt.paymentsCents)}</td></tr><tr><td>Total amount due</td><td>${plain(stmt.balanceCents)}</td></tr></tbody></table></section></div>${generatedNote}
    <div class="statement-page-footer"><span>Easvia Technology · Payment Due Statement</span><span>Page 1 of 1</span></div></article>`;
  }
  function statements(){
    const published=latestPublishedStatementMonth(),m=state.statementMonth>published?published:state.statementMonth;
    state.statementMonth=m;
    const currentStmt=F.statementFor(m,D);
    return `${pageHead('BILLING CENTER','Published monthly statements.','Review published statements issued on the 14th of each month and due at month end.',`<div class="actions"><button class="outline-button" data-action="print">${icon('download')} Save as PDF</button></div>`)}
    <div class="statement-hero"><div><h2>Published monthly statements.</h2><p>Statement date: the 14th of each month · Amount due: the last calendar day of that month.<br/>Only eligible billing months are available. Older months have been recalculated using corrected fee terms.</p></div><button class="primary-button" data-action="print">${icon('download')} Export statement</button></div>
    <div class="statement-filter-bar"><div class="select-wrap"><label for="statementMonth">View billing month</label><input id="statementMonth" class="control" type="month" min="2025-01" max="${esc(published)}" value="${esc(m)}"/></div><div class="actions">${stmtStatus(m)} <span class="stat-note">${icon('calendar')} ${esc(F.prettyDate(currentStmt.issued))} · ${money(currentStmt.balanceCents)}</span></div></div>
    <div class="card" style="padding:clamp(17px,3.8vw,48px);overflow-x:auto"><div style="min-width:600px;max-width:930px;margin:auto" id="statementPreview">${renderStatementSheet(m)}</div></div>
    <p class="fine-print">Use “Save as PDF” and choose your browser’s “Save as PDF” print destination. All months shown are recalculated from the corrected records; previous months are reconstructions, not proof that documents were sent. The original October 2026 PDF was CAD 126.00, but the corrected due dates and fee starts now produce CAD 121.00 for that month.</p>
    <div class="section-heading"><div><h2>Statement archive</h2><p>Select a published month to view and export the matching statement.</p></div></div>
    <section class="statement-archive">${archiveCards()}</section><div style="text-align:center;margin-top:22px"><button class="outline-button" id="moreStatements">${icon('layers')} Load older statements</button></div>`;
  }
  function archiveCards(){
    const upper=latestPublishedStatementMonth(),a=[];
    // Newest published months in the archive; paging adds older months.
    const maxMonths=F.monthsBetween('2025-01',upper);
    const show=Math.min(state.archiveCount,maxMonths+1);
    for(let offset=0;offset<show;offset++){
      const month=F.addMonths(upper+'-01',-offset).slice(0,7);
      const stmt=F.statementFor(month,D);
      a.push(`<article class="card statement-item"><div class="statement-item-top"><div class="statement-icon">${icon('file-text')}</div>${stmtStatus(month)}</div><h3>${esc(F.prettyMonth(month+'-01'))}</h3><small>Published ${esc(F.prettyDate(stmt.issued,{month:'short',day:'numeric'}))} · Due ${esc(F.prettyDate(stmt.due,{month:'short',day:'numeric'}))}</small><div class="statement-item-bottom"><strong>${money(stmt.balanceCents)}</strong><button data-statement="${month}">View ↗</button></div></article>`);
    }
    return a.join('');
  }
  function forecast(){
    const amount=F.parseCents(state.paymentAmount),isValid=Number.isFinite(amount) && amount>=0;
    const target=state.targetDate,payDate=state.paymentDate;
    const targetValid=Boolean(target&&/^\d{4}-\d\d-\d\d$/.test(target));
    const validPaymentDate=Boolean(payDate&&/^\d{4}-\d\d-\d\d$/.test(payDate));
    const base=targetValid?F.actualBalanceOn(target,D):null;
    const planned=isValid&&targetValid&&validPaymentDate?F.forecastBalance(target,D,payDate,amount):null;
    const lower=base&&planned?base.balanceCents-planned.balanceCents:0;
    const feesAvoided=base&&planned?Math.max(0,base.lateFeesCents-planned.lateFeesCents):0;
    const current=todayBalance();
    return `${pageHead('PLANNING TOOLS','Plan your next move.','Estimate future balances, payment scenarios, and how fees change over time.',dateChip())}
    <div class="planner-grid"><section class="card planner-card"><div class="card-heading"><div><h2 class="card-title">Payment simulator</h2><p class="card-subtitle">Experiment without recording a payment</p></div>${icon('calculator')}</div><div class="planner-form-grid"><div class="planner-field full"><label for="paymentAmount">Hypothetical payment (CAD)</label><input id="paymentAmount" class="control" type="number" step="0.01" min="0" value="${esc(state.paymentAmount)}" placeholder="Enter payment amount"/></div><div class="planner-field"><label for="paymentDate">Payment date</label><input id="paymentDate" class="control" type="date" min="${esc(F.today())}" value="${esc(payDate)}"/></div><div class="planner-field"><label for="targetDate">Calculate balance on</label><input id="targetDate" class="control" type="date" min="${esc(F.today())}" value="${esc(target)}"/></div></div><div class="actions"><button class="soft-button" data-fill="0">No payment</button><button class="soft-button" data-fill="half">Pay half today</button><button class="soft-button" data-fill="full">Pay in full today</button></div><p class="planner-help">Current outstanding balance: <strong>${money(current.balanceCents)}</strong> as of ${esc(F.prettyDate(F.today()))}.</p>${!isValid?'<p class="login-error">Enter a valid amount with at most two decimal places.</p>':''}
    <div class="planner-assumption">${icon('info')}<div><strong>How this estimate works:</strong> A partial payment reduces the account balance, but all listed monthly late fees continue until the entire account is paid. A full payment stops future fees. The supplied statement does not specify how partial payments are allocated to individual items; this is a planning assumption, not an agreed payment-allocation rule. No payment is saved by this calculator.</div></div></section>
    <div><section class="planner-result"><div class="planner-result-label">PROJECTED AMOUNT OWED</div><div class="planner-result-number" id="forecastAmount">${planned?money(planned.balanceCents):'—'}</div><div class="planner-result-date">On ${targetValid?esc(F.prettyDate(target)):'your selected date'} · ${amount>0?'after hypothetical payment':'assuming no new payments'}</div></section><div class="planner-comparison"><div><small>Without this payment</small><strong id="forecastBaseline">${base?money(base.balanceCents):'—'}</strong></div><div><small>Reduction in future balance</small><strong class="planner-savings" id="forecastSavings">${money(lower)}</strong></div></div><section class="card" style="padding:23px;margin-top:17px"><div class="card-heading"><div><h2 class="card-title">Projection details</h2><p class="card-subtitle">Transparent breakdown</p></div>${icon('chart')}</div><div class="milestone-list"><div class="milestone-row"><span>Original purchases included</span><strong>${planned?money(planned.principalCents):'—'}</strong></div><div class="milestone-row"><span>Late fees charged through target</span><strong>${planned?money(planned.lateFeesCents):'—'}</strong></div><div class="milestone-row"><span>Payments credited by target date</span><strong>${planned?money(planned.paymentsCents):'—'}</strong></div><div class="milestone-row"><span>Future fees avoided by early payoff</span><strong class="planner-savings">${money(feesAvoided)}</strong></div><div class="milestone-row"><span>Net projected balance</span><strong>${planned?money(planned.balanceCents):'—'}</strong></div></div></section></div></div>
    <div class="section-heading"><div><h2>Quick future checkpoints</h2><p>Illustrative checkpoints if the actual payment ledger remains unchanged.</p></div></div><section class="stat-grid forecast-checkpoints" style="grid-template-columns:repeat(4,minmax(0,1fr))">${[1,3,6,12].map(n=>{const date=F.monthEnd(F.addMonths(F.today(),n));return `<div class="card stat-card"><div class="stat-top"><span>IN ${n} MONTH${n>1?'S':''}</span>${icon('calendar')}</div><div class="stat-value">${money(F.actualBalanceOn(date,D).balanceCents)}</div><div class="stat-desc">${esc(F.prettyDate(date,{month:'short',day:'numeric',year:'numeric'}))}</div></div>`;}).join('')}</section><p class="fine-print">All future figures are illustrative. No payments or charges are imported from external services or a payment processor. Actual receipts must be entered into <code>data.js</code> by the site owner and republished.</p>`;
  }
  const pages={overview,activity,statements,forecast};
  function render(){
    if($('#appScreen').hidden)return;
    const navLabels={overview:'Overview',activity:'Transactions & activity',statements:'Statements',forecast:'Payment planner'};
    $('#pageContent').innerHTML=pages[state.page]();
    $('#breadcrumbPage').textContent=navLabels[state.page];
    $('#currentDateHeader').textContent=F.prettyDate(F.today(),{month:'short',day:'numeric',year:'numeric'});
    $$('.nav-link').forEach(btn=>{btn.classList.toggle('active',btn.dataset.page===state.page);btn.setAttribute('aria-current',btn.dataset.page===state.page?'page':'false');});
    if(state.page==='overview')renderChart();
    if(state.page==='statements')$('#moreStatements').hidden=state.archiveCount>=F.monthsBetween('2025-01',latestPublishedStatementMonth())+1;
  }
  function navigate(page){if(!pages[page])return;state.page=page;$('#sidebar').classList.remove('menu-open');render();window.scrollTo({top:0,behavior:'instant'});}
  function printStatement(){
    $('#printRoot').innerHTML=renderStatementSheet(state.statementMonth);
    $('#printRoot').setAttribute('aria-hidden','false');
    window.print();
    $('#printRoot').setAttribute('aria-hidden','true');
  }
  window.addEventListener('afterprint',()=>$('#printRoot').setAttribute('aria-hidden','true'));
  $('#loginForm').addEventListener('submit',e=>{
    e.preventDefault();
    const user=$('#loginUser').value.trim().toLowerCase(), secret=$('#loginSecret').value;
    const configured=state.loginMode==='pin'?D.login.pin:D.login.password;
    if(configured&&user===D.login.userId.toLowerCase()&&secret===configured){
      session.set(true);$('#authScreen').hidden=true;$('#appScreen').hidden=false;$('#loginError').textContent='';render();
    }else if(!configured){$('#loginError').textContent='Password access is not configured. Sign in with the provided PIN.';}
    else{$('#loginError').textContent='Incorrect User ID or credential. Please try again.';}
  });
  $('#switchLoginMode').addEventListener('click',()=>{
    state.loginMode=state.loginMode==='pin'?'password':'pin';
    $('#secretLabel').textContent=state.loginMode==='pin'?'4-digit PIN':'Password';
    $('#loginSecret').value='';$('#loginSecret').type='password';
    $('#loginSecret').inputMode=state.loginMode==='pin'?'numeric':'text';
    $('#loginSecret').placeholder=state.loginMode==='pin'?'••••':'Enter password';
    $('#switchLoginMode').textContent=state.loginMode==='pin'?'Use password instead':'Use PIN instead';
    $('#loginError').textContent='';
  });
  $('#toggleSecret').addEventListener('click',()=>{$('#loginSecret').type=$('#loginSecret').type==='password'?'text':'password';});
  $('#signOut').addEventListener('click',()=>{session.set(false);$('#appScreen').hidden=true;$('#authScreen').hidden=false;$('#loginSecret').value='';$('#sidebar').classList.remove('menu-open');});
  $('#mobileMenu').addEventListener('click',()=>$('#sidebar').classList.toggle('menu-open'));
  document.addEventListener('click',e=>{
    const link=e.target.closest('[data-page]');if(link){navigate(link.dataset.page);return;}
    const chart=e.target.closest('[data-chart-range]');if(chart){state.chartRange=chart.dataset.chartRange;render();return;}
    const statement=e.target.closest('[data-statement]');if(statement){state.statementMonth=statement.dataset.statement;state.page='statements';render();window.scrollTo({top:0,behavior:'smooth'});return;}
    if(e.target.closest('[data-action="print"]')){printStatement();return;}
    if(e.target.closest('#moreStatements')){state.archiveCount+=12;render();return;}
    const fill=e.target.closest('[data-fill]');if(fill){
      const balance=todayBalance().balanceCents;
      state.paymentAmount=fill.dataset.fill==='full'?(balance/100).toFixed(2):fill.dataset.fill==='half'?(Math.ceil(balance/2)/100).toFixed(2):'0';
      state.paymentDate=F.today();render();return;
    }
  });
  document.addEventListener('change',e=>{
    if(e.target.id==='statementMonth'){
      const m=e.target.value;
      if(m && m>='2025-01' && m<=latestPublishedStatementMonth() && /^\d{4}-\d\d$/.test(m)){state.statementMonth=m;render();}
    }
    if(e.target.id==='paymentDate'){state.paymentDate=e.target.value;render();}
    if(e.target.id==='targetDate'){state.targetDate=e.target.value;render();}
  });
  document.addEventListener('input',e=>{
    if(e.target.id==='paymentAmount'){
      state.paymentAmount=e.target.value;
      // Avoid replacing the focused input as the user types. Recalculate results
      // in the existing nodes, then fully re-render when focus leaves.
      const amount=F.parseCents(state.paymentAmount),valid=Number.isFinite(amount),base=F.actualBalanceOn(state.targetDate,D);
      const planned=valid?F.forecastBalance(state.targetDate,D,state.paymentDate,amount):null;
      const result=$('#forecastAmount'),comparison=$('#forecastSavings');
      if(result)result.textContent=planned?money(planned.balanceCents):'—';
      if(comparison)comparison.textContent=planned?money(Math.max(0,base.balanceCents-planned.balanceCents)):'—';
    }
  });
  document.addEventListener('focusout',e=>{if(e.target.id==='paymentAmount' && !$('#appScreen').hidden && state.page==='forecast') render();});
  // Date-based amounts refresh automatically after a local date rollover while
  // the page remains open; on every new visit they compute directly from date.
  setInterval(()=>{const d=F.today();if(d!==lastDate){const oldLatest=F.latestPublishedMonth(lastDate,D.schedule.statementDay);lastDate=d;if(state.statementMonth===oldLatest)state.statementMonth=latestPublishedStatementMonth();render();notify('Balance refreshed for the new day.');}},60_000);
  if(session.get()){$('#authScreen').hidden=true;$('#appScreen').hidden=false;render();}
})();
