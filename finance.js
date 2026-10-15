/* Pure, testable accounting/date utilities. No packages or API keys needed. */
(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  root.EasviaFinance = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';
  const pad = n => String(n).padStart(2, '0');
  const fromYMD = s => {
    const [y,m,d] = s.split('-').map(Number);
    return new Date(y, m-1, d, 12); // local noon avoids DST-midnight edge cases
  };
  const toYMD = d => `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`;
  const today = () => toYMD(new Date());
  const addMonths = (ymd, n) => {
    const d = fromYMD(ymd);
    const day = d.getDate();
    const target = new Date(d.getFullYear(), d.getMonth()+n+1, 0, 12);
    return toYMD(new Date(target.getFullYear(), target.getMonth(), Math.min(day, target.getDate()), 12));
  };
  const monthStart = (ymd) => ymd.slice(0,7)+'-01';
  const monthEnd = (ymd) => {
    const d = fromYMD(ymd);
    return toYMD(new Date(d.getFullYear(), d.getMonth()+1, 0, 12));
  };
  const statementDate = yyyymm => `${yyyymm}-14`;
  const latestPublishedMonth = (date, day=14) => Number(date.slice(8))>=day ? date.slice(0,7) : addMonths(date,-1).slice(0,7);
  const addDays = (s, n) => { const d=fromYMD(s); d.setDate(d.getDate()+n); return toYMD(d); };
  const formatMoney = cents => new Intl.NumberFormat('en-CA',{style:'currency',currency:'CAD'}).format((cents||0)/100);
  const moneyPlain = cents => `CAD ${((cents||0)/100).toFixed(2)}`;
  const prettyDate = (s, opts) => fromYMD(s).toLocaleDateString('en-US',opts||{month:'long',day:'numeric',year:'numeric'});
  const prettyMonth = s => fromYMD(s).toLocaleDateString('en-US',{month:'long', year:'numeric'});
  const parseCents = s => {
    const cleaned=String(s??'').replace(/[,\s$]/g,'');
    if(!/^(\d+)(\.\d{0,2})?$/.test(cleaned)) return NaN;
    const [major,minor=''] = cleaned.split('.');
    const result = Number(major)*100+Number(minor.padEnd(2,'0'));
    return Number.isSafeInteger(result) ? result : NaN;
  };
  function feeDates(group, until) {
    if(until < group.lateFeeStart) return [];
    const dates=[];
    for(let n=0;n<2400;n++) {
      const date=addMonths(group.lateFeeStart,n);
      if(date>until) break;
      dates.push(date);
    }
    return dates;
  }
  function monthlyRate(groups) { return groups.reduce((sum,g)=>sum+g.monthlyLateFeeCents,0); }
  function balanceOn(target, options={}) {
    const items=options.items||[];
    const feeGroups=options.feeGroups||[];
    const payments=options.payments||[];
    const events=[];
    const rows=Object.fromEntries(items.map(item=>[item.id,{...item,principalChargedCents:0,feeCents:0,feeCount:0}]));
    const groupRows=Object.fromEntries(feeGroups.map(g=>[g.id,{...g,feeCents:0,feeCount:0}]));
    for(const item of items) if(item.purchaseDate<=target) events.push({date:item.purchaseDate,kind:'purchase',item});
    for(const group of feeGroups) for(const date of feeDates(group,target))
      events.push({date,kind:'fee',group});
    for(const payment of payments) if(payment.date<=target && Number.isSafeInteger(payment.amountCents) && payment.amountCents>0)
      events.push({date:payment.date,kind:'payment',payment});
    const priority={purchase:0,fee:1,payment:2};
    events.sort((a,b)=>a.date.localeCompare(b.date)||priority[a.kind]-priority[b.kind]);
    let principalCents=0,lateFeesCents=0,paymentsCents=0,balanceCents=0,fullySettled=false;
    for(const event of events){
      if(event.kind==='purchase') {
        const amount=event.item.principalCents;
        principalCents+=amount; balanceCents+=amount;
        rows[event.item.id].principalChargedCents+=amount;
        fullySettled=false;
      } else if(event.kind==='fee') {
        // Account-level credit convention. A shared group charges once;
        // a single-purchase group is also attached to its item row.
        // The owner has not specified an allocation rule for partial payments.
        if(balanceCents>0 && !fullySettled) {
          const amount=event.group.monthlyLateFeeCents;
          lateFeesCents+=amount; balanceCents+=amount;
          const gr=groupRows[event.group.id];
          gr.feeCents+=amount; gr.feeCount++;
          if(event.group.purchaseIds.length===1){
            const r=rows[event.group.purchaseIds[0]];
            if(r){r.feeCents+=amount;r.feeCount++;}
          }
        }
      } else {
        const applied=Math.min(balanceCents,event.payment.amountCents);
        balanceCents-=applied; paymentsCents+=applied;
        if(balanceCents===0 && applied>0) fullySettled=true;
      }
    }
    return {date:target,balanceCents,principalCents,lateFeesCents,paymentsCents,
      rows:items.map(item=>rows[item.id]),
      feeRows:feeGroups.map(group=>groupRows[group.id])};
  }
  function statementFor(month, config) {
    const issued=statementDate(month),due=monthEnd(issued);
    // Reconstructed historical statements only show purchases existing on
    // their issue date. Fees are forecast through that month's due date.
    const knownItems=config.purchases.filter(item=>item.purchaseDate<=issued);
    const ids=new Set(knownItems.map(item=>item.id));
    const knownGroups=config.feeGroups.filter(g=>g.purchaseIds.every(id=>ids.has(id)));
    const knownPayments=config.payments.filter(p=>p.date<=issued);
    return {month,issued,due,...balanceOn(due,{items:knownItems,feeGroups:knownGroups,payments:knownPayments})};
  }
  function actualBalanceOn(target, config) {
    return balanceOn(target,{items:config.purchases,feeGroups:config.feeGroups,payments:config.payments});
  }
  function forecastBalance(target, config, paymentDate, paymentCents) {
    const hypothetical=Number.isFinite(paymentCents) && paymentCents>0
      ? [{date:paymentDate,amountCents:paymentCents,note:'Hypothetical payment'}] : [];
    return balanceOn(target,{items:config.purchases,feeGroups:config.feeGroups,
      payments:[...config.payments,...hypothetical]});
  }
  function groupedTransactions(snapshot, config) {
    // Display one row per purchase/late-fee group. The underlying purchases
    // remain individually priced and the shared fee is never duplicated.
    const groups=config.feeGroups||[];
    return groups.map(group=>{
      const feeRow=snapshot.feeRows.find(row=>row.id===group.id);
      if(!feeRow) return null; // A group is not yet in the historical statement.
      const items=group.purchaseIds.map(id=>snapshot.rows.find(row=>row.id===id)).filter(Boolean);
      if(items.length!==group.purchaseIds.length) return null;
      const principalCents=items.reduce((sum,row)=>sum+row.principalChargedCents,0);
      return {...feeRow,items,principalCents,totalCents:principalCents+feeRow.feeCents,
        purchaseDate:items[0].purchaseDate};
    }).filter(Boolean);
  }
  function firstPurchase(config) { return config.purchases.map(p=>p.purchaseDate).sort()[0]; }
  function monthsBetween(fromMonth,toMonth){
    const a=fromYMD(fromMonth+'-01'),b=fromYMD(toMonth+'-01');
    return (b.getFullYear()-a.getFullYear())*12+b.getMonth()-a.getMonth();
  }
  function monthSeries(startMonth,endMonth,config,includeCurrentDay) {
    const result=[]; const count=Math.max(0,Math.min(240,monthsBetween(startMonth,endMonth)));
    for(let m=0;m<=count;m++){
      const month=addMonths(startMonth+'-01',m).slice(0,7);
      const date=monthEnd(month+'-01');
      result.push({...actualBalanceOn(date,config),month,label:prettyMonth(date),isProjected:date>today()});
    }
    if(includeCurrentDay && today()>=startMonth+'-01' && today()<=monthEnd(endMonth+'-01')){
      const now=actualBalanceOn(today(),config);
      result.push({...now,month:today().slice(0,7),label:'Today · '+prettyDate(today(),{month:'short',day:'numeric'}),isToday:true,isProjected:false});
    }
    return result.sort((a,b)=>a.date.localeCompare(b.date));
  }
  return {fromYMD,toYMD,today,addMonths,monthStart,monthEnd,statementDate,addDays,
    formatMoney,moneyPlain,prettyDate,prettyMonth,parseCents,feeDates,monthlyRate,latestPublishedMonth,
    balanceOn,statementFor,actualBalanceOn,forecastBalance,groupedTransactions,firstPurchase,monthSeries,monthsBetween};
});
