function yt(q){ return 'https://www.youtube.com/results?search_query=' + encodeURIComponent(q); }
function db(cx,cy,a){ a=a||0; return '<g class="wt" transform="rotate('+a+' '+cx+' '+cy+')">'
  +'<rect x="'+(cx-9)+'" y="'+(cy-1.6)+'" width="18" height="3.2" rx="1.6"/>'
  +'<rect x="'+(cx-9.5)+'" y="'+(cy-5)+'" width="5" height="10" rx="1.9"/>'
  +'<rect x="'+(cx+4.5)+'" y="'+(cy-5)+'" width="5" height="10" rx="1.9"/></g>'; }
function fig(strokes, weights, groundY){
  var g = (groundY!=null) ? '<line x1="12" y1="'+groundY+'" x2="88" y2="'+groundY+'" class="grd"/>' : '';
  return '<svg viewBox="0 0 100 100" class="ex-svg" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">'
    + g + '<g class="fig" stroke-linecap="round" stroke-linejoin="round">' + strokes + '</g>' + (weights||'') + '</svg>';
}
var PLAY = '<svg width="12" height="12" viewBox="0 0 24 24"><polygon points="6,4 20,12 6,20" fill="currentColor"/></svg>';
var CHK  = '<svg width="10" height="10" viewBox="0 0 24 24"><path d="M5 12l5 5 9-11" stroke="#fff" stroke-width="3" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>';
var RIBBON = '<svg width="14" height="14" viewBox="0 0 24 24"><path d="M5 12l5 5 9-11" stroke="#fff" stroke-width="2.6" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>';
var GEAR = '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" aria-hidden="true"><rect x="2" y="9.4" width="2.6" height="5.2" rx="1" fill="currentColor"/><rect x="19.4" y="9.4" width="2.6" height="5.2" rx="1" fill="currentColor"/><rect x="5.2" y="7.6" width="2.6" height="8.8" rx="1" fill="currentColor"/><rect x="16.2" y="7.6" width="2.6" height="8.8" rx="1" fill="currentColor"/><rect x="7.8" y="11" width="8.4" height="2" rx="1" fill="currentColor"/></svg>';

/* ---------- saved progress (works when the file is opened normally) ---------- */
var STORE_KEY='liverplan_v1';
function loadStore(){ try{ return JSON.parse(localStorage.getItem(STORE_KEY))||{}; }catch(e){ return {}; } }
function saveStore(s){ try{ localStorage.setItem(STORE_KEY, JSON.stringify(s)); }catch(e){} }
var store = loadStore();
var equipBW = (store.equipBW===undefined) ? true : !!store.equipBW;
function effItem(it){ return (equipBW && it.bw) ? Object.assign({}, it, it.bw, {start:undefined}) : it; }
function stripWt(svg){ return svg.replace(/<g class="wt"[^>]*>[\s\S]*?<\/g>/g, ''); }
function setEquip(bw){
  equipBW = bw; store.equipBW = bw; saveStore(store);
  var db=document.getElementById('eq-db'), b=document.getElementById('eq-bw');
  if(db) db.classList.toggle('on', !bw); if(b) b.classList.toggle('on', bw);
  renderMode('walked'); renderMode('strength'); renderMode('indoor');
  restoreAll();
  setMode(current);
}
function today(){ var d=new Date(); return d.getFullYear()+'-'+(d.getMonth()+1)+'-'+d.getDate(); }
function yesterday(){ var d=new Date(); d.setDate(d.getDate()-1); return d.getFullYear()+'-'+(d.getMonth()+1)+'-'+d.getDate(); }
function ensureToday(){ var t=today(); if(!store.done || store.done.date!==t){ store.done={date:t, walked:{}, strength:{}, indoor:{}}; saveStore(store); } }
function persistDone(mode,id,on){ ensureToday(); if(!store.done[mode]) store.done[mode]={}; if(on) store.done[mode][id]=1; else delete store.done[mode][id]; saveStore(store); }
function restoreAll(){ ensureToday(); ['walked','strength','indoor'].forEach(function(m){ var map=store.done[m]||{}; Object.keys(map).forEach(function(id){ var c=document.getElementById(id); if(c){ c.classList.add('is-done'); var b=c.querySelector('.done'); if(b) b.setAttribute('aria-pressed','true'); } }); }); }
function markSessionComplete(){ store.stats=store.stats||{last:'',streak:0,total:0,doneDates:{}}; var t=today(); if(store.stats.doneDates[t]){ renderProgress(); return; } store.stats.doneDates[t]=1; store.stats.total=(store.stats.total||0)+1; store.stats.streak=(store.stats.last===yesterday())?(store.stats.streak||0)+1:1; store.stats.last=t; saveStore(store); renderProgress(); }
var START_KG=92, M5=87.4, M7=85.6, M10=82.8;
function curWeight(){ var w=store.weights||[]; return w.length? w[w.length-1].kg : START_KG; }
function logWeight(){
  var inp=document.getElementById('wInput'); if(!inp) return;
  var v=parseFloat(inp.value);
  if(isNaN(v)||v<30||v>300){ inp.focus(); return; }
  store.weights=store.weights||[];
  var t=today(), last=store.weights[store.weights.length-1];
  if(last && last.date===t){ last.kg=v; } else { store.weights.push({date:t, kg:v}); }
  saveStore(store); inp.value=''; renderProgress();
}
function renderProgress(){
  if(!document.getElementById('tkLost')) return;
  var cur=curWeight(), lost=START_KG-cur;
  document.getElementById('tkLost').textContent=(lost>=0?lost.toFixed(1):('+'+(-lost).toFixed(1)))+' kg';
  var next, label;
  if(cur>M5){ next=cur-M5; label='to the 5% mark'; }
  else if(cur>M7){ next=cur-M7; label='to the 7% mark'; }
  else if(cur>M10){ next=cur-M10; label='to the 10% mark'; }
  else { next=0; label='10% reached, well done'; }
  document.getElementById('tkNext').textContent = next>0? next.toFixed(1)+' kg' : 'done';
  document.getElementById('tkNextL').textContent = label;
  var st=store.stats||{};
  document.getElementById('tkStreak').textContent = (st.streak||0);
  var inp=document.getElementById('wInput'); if(inp && !inp.value) inp.placeholder=cur.toFixed(1);
  drawSpark(store.weights||[]);
}
function drawSpark(w){
  var svg=document.getElementById('spark'); if(!svg) return;
  if(!w || w.length<2){ svg.innerHTML=''; svg.style.display='none'; return; }
  svg.style.display='block';
  var ys=w.map(function(p){return p.kg;});
  var min=Math.min.apply(null,ys), max=Math.max.apply(null,ys); if(max-min<0.6){ min-=0.6; max+=0.6; }
  var W=300,H=56,pad=7;
  var pts=w.map(function(p,i){ var x=pad+(i/(w.length-1))*(W-2*pad); var y=H-pad-((p.kg-min)/(max-min))*(H-2*pad); return x.toFixed(1)+','+y.toFixed(1); });
  var lp=pts[pts.length-1].split(',');
  svg.innerHTML='<polyline points="'+pts.join(' ')+'" fill="none" stroke="var(--green)" stroke-width="2.2" stroke-linejoin="round" stroke-linecap="round"/><circle cx="'+lp[0]+'" cy="'+lp[1]+'" r="3.2" fill="var(--green)"/>';
}
ensureToday();

var SV = {
  march: fig('<circle cx="50" cy="20" r="6.5"/><line x1="50" y1="27" x2="50" y2="54"/><line x1="50" y1="32" x2="41" y2="46"/><line x1="50" y1="32" x2="58" y2="45"/><line x1="50" y1="54" x2="47" y2="82"/><line x1="50" y1="54" x2="61" y2="57"/><line x1="61" y1="57" x2="59" y2="72"/>', '', 84),
  goblet: fig('<circle cx="50" cy="20" r="6.5"/><line x1="50" y1="27" x2="50" y2="50"/><line x1="50" y1="34" x2="45" y2="43"/><line x1="50" y1="34" x2="55" y2="43"/><line x1="50" y1="50" x2="39" y2="60"/><line x1="50" y1="50" x2="61" y2="60"/><line x1="39" y1="60" x2="41" y2="82"/><line x1="61" y1="60" x2="59" y2="82"/>', db(50,45,90), 84),
  rdl: fig('<circle cx="24" cy="40" r="6.5"/><line x1="28" y1="43" x2="32" y2="46"/><line x1="32" y1="46" x2="58" y2="55"/><line x1="58" y1="55" x2="60" y2="70"/><line x1="60" y1="70" x2="58" y2="84"/><line x1="58" y1="55" x2="54" y2="71"/><line x1="54" y1="71" x2="52" y2="84"/><line x1="34" y1="47" x2="35" y2="67"/>', db(35,68), 84),
  floorpress: fig('<circle cx="22" cy="66" r="6"/><line x1="26" y1="66" x2="28" y2="68"/><line x1="28" y1="68" x2="54" y2="68"/><line x1="54" y1="68" x2="63" y2="58"/><line x1="63" y1="58" x2="68" y2="68"/><line x1="32" y1="67" x2="32" y2="51"/><line x1="42" y1="67" x2="42" y2="51"/>', db(32,49)+db(42,49), 72),
  row: fig('<circle cx="24" cy="40" r="6.5"/><line x1="28" y1="43" x2="32" y2="46"/><line x1="32" y1="46" x2="58" y2="55"/><line x1="58" y1="55" x2="60" y2="70"/><line x1="60" y1="70" x2="58" y2="84"/><line x1="58" y1="55" x2="54" y2="71"/><line x1="54" y1="71" x2="52" y2="84"/><line x1="34" y1="48" x2="34" y2="60"/><line x1="40" y1="49" x2="50" y2="51"/><line x1="50" y1="51" x2="46" y2="56"/>', db(34,61)+db(47,56), 84),
  ohp: fig('<circle cx="50" cy="30" r="6.5"/><line x1="50" y1="37" x2="50" y2="62"/><line x1="47" y1="40" x2="41" y2="26"/><line x1="53" y1="40" x2="59" y2="26"/><line x1="50" y1="62" x2="44" y2="84"/><line x1="50" y1="62" x2="56" y2="84"/>', db(41,24)+db(59,24), 84),
  lunge: fig('<circle cx="46" cy="24" r="6.5"/><line x1="46" y1="31" x2="46" y2="54"/><line x1="46" y1="54" x2="38" y2="66"/><line x1="38" y1="66" x2="36" y2="82"/><line x1="46" y1="54" x2="60" y2="72"/><line x1="60" y1="72" x2="68" y2="82"/><line x1="46" y1="37" x2="41" y2="53"/><line x1="46" y1="37" x2="52" y2="53"/>', db(41,54)+db(52,54), 84),
  bridge: fig('<circle cx="22" cy="70" r="6"/><line x1="26" y1="70" x2="27" y2="72"/><line x1="27" y1="72" x2="50" y2="58"/><line x1="50" y1="58" x2="61" y2="58"/><line x1="61" y1="58" x2="63" y2="72"/><line x1="27" y1="72" x2="18" y2="72"/>', db(48,54), 74),
  carry: fig('<circle cx="50" cy="20" r="6.5"/><line x1="50" y1="27" x2="50" y2="58"/><line x1="50" y1="32" x2="42" y2="52"/><line x1="50" y1="32" x2="58" y2="52"/><line x1="50" y1="58" x2="46" y2="84"/><line x1="50" y1="58" x2="54" y2="84"/>', db(42,54)+db(58,54), 86),
  plank: fig('<circle cx="70" cy="54" r="6"/><line x1="67" y1="55" x2="64" y2="56"/><line x1="64" y1="56" x2="40" y2="66"/><line x1="40" y1="66" x2="22" y2="72"/><line x1="64" y1="56" x2="62" y2="72"/><line x1="62" y1="72" x2="72" y2="72"/>', '', 73),
  sideplank: fig('<circle cx="28" cy="50" r="6"/><line x1="34" y1="55" x2="30" y2="74"/><line x1="30" y1="74" x2="40" y2="74"/><line x1="34" y1="55" x2="56" y2="66"/><line x1="56" y1="66" x2="72" y2="76"/><line x1="34" y1="55" x2="34" y2="40"/>', '', 78),
  deadbug: fig('<circle cx="26" cy="58" r="6"/><line x1="30" y1="59" x2="32" y2="60"/><line x1="32" y1="60" x2="52" y2="60"/><line x1="32" y1="60" x2="20" y2="55"/><line x1="46" y1="60" x2="46" y2="46"/><line x1="52" y1="60" x2="68" y2="66"/><line x1="52" y1="60" x2="56" y2="48"/><line x1="56" y1="48" x2="64" y2="48"/>', '', 66),
  birddog: fig('<circle cx="30" cy="52" r="6"/><line x1="33" y1="54" x2="36" y2="55"/><line x1="36" y1="55" x2="60" y2="58"/><line x1="36" y1="55" x2="34" y2="74"/><line x1="36" y1="55" x2="20" y2="50"/><line x1="60" y1="58" x2="62" y2="74"/><line x1="60" y1="58" x2="78" y2="54"/>', '', 76),
  catcow: fig('<circle cx="28" cy="60" r="6"/><line x1="31" y1="58" x2="34" y2="56"/><path d="M34 56 Q50 45 64 56"/><line x1="34" y1="56" x2="32" y2="74"/><line x1="64" y1="56" x2="66" y2="74"/>', '', 76),
  hipflex: fig('<circle cx="48" cy="24" r="6.5"/><line x1="48" y1="31" x2="48" y2="54"/><line x1="48" y1="54" x2="38" y2="66"/><line x1="38" y1="66" x2="36" y2="80"/><line x1="48" y1="54" x2="61" y2="73"/><line x1="61" y1="73" x2="73" y2="80"/><line x1="48" y1="38" x2="42" y2="53"/><line x1="48" y1="38" x2="53" y2="50"/>', '', 82),
  thoracic: fig('<circle cx="30" cy="58" r="6"/><line x1="33" y1="57" x2="36" y2="56"/><line x1="36" y1="56" x2="60" y2="60"/><line x1="36" y1="56" x2="34" y2="74"/><line x1="60" y1="60" x2="62" y2="74"/><line x1="40" y1="55" x2="50" y2="40"/>', '', 76),
  child: fig('<circle cx="28" cy="70" r="6"/><line x1="60" y1="58" x2="34" y2="70"/><line x1="34" y1="70" x2="18" y2="74"/><line x1="60" y1="58" x2="66" y2="76"/><line x1="60" y1="58" x2="64" y2="76"/>', '', 78),
  pushup: fig('<circle cx="68" cy="44" r="6"/><line x1="62" y1="48" x2="42" y2="60"/><line x1="42" y1="60" x2="28" y2="68"/><line x1="28" y1="68" x2="20" y2="60"/><line x1="62" y1="48" x2="62" y2="58"/><line x1="62" y1="58" x2="62" y2="72"/>', '', 74)
};

/* second pose (the other end of each movement) so the player can animate */
var SV2 = {
  march: fig('<circle cx="50" cy="20" r="6.5"/><line x1="50" y1="27" x2="50" y2="54"/><line x1="50" y1="32" x2="59" y2="46"/><line x1="50" y1="32" x2="42" y2="45"/><line x1="50" y1="54" x2="53" y2="82"/><line x1="50" y1="54" x2="39" y2="57"/><line x1="39" y1="57" x2="41" y2="72"/>', '', 84),
  goblet: fig('<circle cx="50" cy="18" r="6.5"/><line x1="50" y1="25" x2="50" y2="56"/><line x1="50" y1="33" x2="45" y2="42"/><line x1="50" y1="33" x2="55" y2="42"/><line x1="50" y1="56" x2="47" y2="84"/><line x1="50" y1="56" x2="53" y2="84"/>', db(50,44,90), 86),
  rdl: fig('<circle cx="50" cy="18" r="6.5"/><line x1="50" y1="25" x2="50" y2="56"/><line x1="50" y1="30" x2="43" y2="50"/><line x1="50" y1="30" x2="57" y2="50"/><line x1="50" y1="56" x2="47" y2="84"/><line x1="50" y1="56" x2="53" y2="84"/>', db(43,52)+db(57,52), 86),
  floorpress: fig('<circle cx="22" cy="66" r="6"/><line x1="26" y1="66" x2="28" y2="68"/><line x1="28" y1="68" x2="54" y2="68"/><line x1="54" y1="68" x2="63" y2="58"/><line x1="63" y1="58" x2="68" y2="68"/><line x1="32" y1="67" x2="28" y2="60"/><line x1="42" y1="67" x2="38" y2="60"/>', db(28,58)+db(38,58), 72),
  row: fig('<circle cx="24" cy="40" r="6.5"/><line x1="28" y1="43" x2="32" y2="46"/><line x1="32" y1="46" x2="58" y2="55"/><line x1="58" y1="55" x2="60" y2="70"/><line x1="60" y1="70" x2="58" y2="84"/><line x1="58" y1="55" x2="54" y2="71"/><line x1="54" y1="71" x2="52" y2="84"/><line x1="34" y1="48" x2="35" y2="64"/><line x1="41" y1="50" x2="42" y2="64"/>', db(35,65)+db(42,65), 84),
  ohp: fig('<circle cx="50" cy="24" r="6.5"/><line x1="50" y1="31" x2="50" y2="56"/><line x1="47" y1="35" x2="41" y2="40"/><line x1="53" y1="35" x2="59" y2="40"/><line x1="50" y1="56" x2="44" y2="84"/><line x1="50" y1="56" x2="56" y2="84"/>', db(41,38)+db(59,38), 86),
  lunge: fig('<circle cx="48" cy="18" r="6.5"/><line x1="48" y1="25" x2="48" y2="56"/><line x1="48" y1="30" x2="42" y2="50"/><line x1="48" y1="30" x2="54" y2="50"/><line x1="48" y1="56" x2="45" y2="84"/><line x1="48" y1="56" x2="51" y2="84"/>', db(42,52)+db(54,52), 86),
  bridge: fig('<circle cx="22" cy="70" r="6"/><line x1="26" y1="70" x2="27" y2="72"/><line x1="27" y1="72" x2="50" y2="72"/><line x1="50" y1="72" x2="59" y2="61"/><line x1="59" y1="61" x2="62" y2="72"/><line x1="27" y1="72" x2="18" y2="72"/>', db(46,68), 74),
  carry: fig('<circle cx="50" cy="20" r="6.5"/><line x1="50" y1="27" x2="50" y2="58"/><line x1="50" y1="32" x2="42" y2="52"/><line x1="50" y1="32" x2="58" y2="52"/><line x1="50" y1="58" x2="44" y2="84"/><line x1="50" y1="58" x2="56" y2="82"/>', db(42,54)+db(58,54), 86),
  plank: SV.plank,
  sideplank: SV.sideplank,
  deadbug: fig('<circle cx="26" cy="58" r="6"/><line x1="30" y1="59" x2="32" y2="60"/><line x1="32" y1="60" x2="52" y2="60"/><line x1="36" y1="60" x2="34" y2="46"/><line x1="42" y1="60" x2="44" y2="46"/><line x1="52" y1="60" x2="57" y2="50"/><line x1="57" y1="50" x2="63" y2="50"/><line x1="52" y1="60" x2="59" y2="52"/><line x1="59" y1="52" x2="66" y2="52"/>', '', 66),
  birddog: fig('<circle cx="30" cy="52" r="6"/><line x1="33" y1="54" x2="36" y2="55"/><line x1="36" y1="55" x2="60" y2="58"/><line x1="38" y1="55" x2="36" y2="74"/><line x1="60" y1="58" x2="62" y2="74"/><line x1="56" y1="58" x2="54" y2="74"/>', '', 76),
  catcow: fig('<circle cx="26" cy="52" r="6"/><line x1="29" y1="54" x2="34" y2="56"/><path d="M34 56 Q50 66 64 56"/><line x1="34" y1="56" x2="32" y2="74"/><line x1="64" y1="56" x2="66" y2="74"/>', '', 76),
  hipflex: SV.hipflex,
  thoracic: fig('<circle cx="30" cy="58" r="6"/><line x1="33" y1="57" x2="36" y2="56"/><line x1="36" y1="56" x2="60" y2="60"/><line x1="36" y1="56" x2="34" y2="74"/><line x1="60" y1="60" x2="62" y2="74"/><line x1="40" y1="56" x2="28" y2="64"/>', '', 76),
  child: SV.child,
  pushup: fig('<circle cx="68" cy="56" r="6"/><line x1="62" y1="60" x2="42" y2="66"/><line x1="42" y1="66" x2="28" y2="68"/><line x1="28" y1="68" x2="20" y2="60"/><line x1="62" y1="60" x2="70" y2="66"/><line x1="70" y1="66" x2="62" y2="72"/>', '', 74)
};
function pose2For(a){ var k=Object.keys(SV); for(var i=0;i<k.length;i++){ if(SV[k[i]]===a) return SV2[k[i]]||a; } return a; }

/* ---------- movement keyframes (joint positions for the two ends of each rep) ---------- */
var KF = {
  march:{ground:84, head:{j:'head',r:6.5}, bones:[['sh','hip'],['sh','handF'],['sh','handB'],['hip','footP'],['hip','kneeU'],['kneeU','footU']],
    a:{head:[50,20],sh:[50,30],hip:[50,54],handF:[41,46],handB:[58,45],footP:[47,82],kneeU:[61,57],footU:[59,72]},
    b:{head:[50,20],sh:[50,30],hip:[50,54],handF:[59,46],handB:[42,45],footP:[53,82],kneeU:[39,57],footU:[41,72]}},
  goblet:{ground:84, head:{j:'head',r:6.5}, dumbbells:[{mid:['handL','handR'],rot:90}], bones:[['sh','hip'],['sh','handL'],['sh','handR'],['hip','kneeL'],['kneeL','footL'],['hip','kneeR'],['kneeR','footR']],
    a:{head:[50,20],sh:[50,30],hip:[50,50],handL:[45,43],handR:[55,43],kneeL:[39,60],footL:[41,82],kneeR:[61,60],footR:[59,82]},
    b:{head:[50,18],sh:[50,28],hip:[50,56],handL:[45,41],handR:[55,41],kneeL:[48,70],footL:[47,84],kneeR:[52,70],footR:[53,84]}},
  rdl:{ground:84, head:{j:'head',r:6.5}, dumbbells:[{j:'hand',rot:0}], bones:[['sh','hip'],['sh','hand'],['hip','kneeL'],['kneeL','footL'],['hip','kneeR'],['kneeR','footR']],
    a:{head:[24,40],sh:[33,45],hip:[58,55],hand:[35,67],kneeL:[60,70],footL:[58,84],kneeR:[55,71],footR:[53,84]},
    b:{head:[50,18],sh:[50,28],hip:[50,56],hand:[46,52],kneeL:[48,70],footL:[47,84],kneeR:[52,70],footR:[53,84]}},
  floorpress:{ground:72, head:{j:'head',r:6}, dumbbells:[{j:'handL',rot:0},{j:'handR',rot:0}], bones:[['sh','hip'],['hip','knee'],['knee','foot'],['sh','handL'],['sh','handR']],
    a:{head:[22,66],sh:[30,67],hip:[54,68],knee:[63,58],foot:[68,68],handL:[32,51],handR:[42,51]},
    b:{head:[22,66],sh:[30,67],hip:[54,68],knee:[63,58],foot:[68,68],handL:[28,60],handR:[38,60]}},
  row:{ground:84, head:{j:'head',r:6.5}, dumbbells:[{j:'hand',rot:0},{j:'handHang',rot:0}], bones:[['sh','hip'],['sh','elbow'],['elbow','hand'],['sh','handHang'],['hip','kneeL'],['kneeL','footL'],['hip','kneeR'],['kneeR','footR']],
    a:{head:[24,40],sh:[35,46],hip:[58,55],elbow:[47,50],hand:[45,57],handHang:[35,64],kneeL:[60,70],footL:[58,84],kneeR:[55,71],footR:[53,84]},
    b:{head:[24,40],sh:[35,46],hip:[58,55],elbow:[38,58],hand:[38,65],handHang:[35,64],kneeL:[60,70],footL:[58,84],kneeR:[55,71],footR:[53,84]}},
  ohp:{ground:84, head:{j:'head',r:6.5}, dumbbells:[{j:'handL',rot:0},{j:'handR',rot:0}], bones:[['sh','hip'],['sh','elbowL'],['elbowL','handL'],['sh','elbowR'],['elbowR','handR'],['hip','footL'],['hip','footR']],
    a:{head:[50,27],sh:[50,37],hip:[50,62],elbowL:[45,33],handL:[41,24],elbowR:[55,33],handR:[59,24],footL:[44,84],footR:[56,84]},
    b:{head:[50,27],sh:[50,37],hip:[50,62],elbowL:[45,42],handL:[41,40],elbowR:[55,42],handR:[59,40],footL:[44,84],footR:[56,84]}},
  lunge:{ground:84, head:{j:'head',r:6.5}, dumbbells:[{j:'handL',rot:0},{j:'handR',rot:0}], bones:[['sh','hip'],['sh','handL'],['sh','handR'],['hip','kneeF'],['kneeF','footF'],['hip','kneeB'],['kneeB','footB']],
    a:{head:[46,24],sh:[46,34],hip:[46,54],handL:[41,53],handR:[52,53],kneeF:[38,66],footF:[36,82],kneeB:[60,72],footB:[68,82]},
    b:{head:[48,18],sh:[48,28],hip:[48,54],handL:[43,52],handR:[54,52],kneeF:[46,70],footF:[45,84],kneeB:[50,70],footB:[51,84]}},
  bridge:{ground:74, head:{j:'head',r:6}, dumbbells:[{j:'dbpt',rot:0}], bones:[['sh','hip'],['hip','knee'],['knee','foot'],['sh','hand']],
    a:{head:[22,70],sh:[30,72],hip:[50,58],knee:[61,58],foot:[63,72],hand:[18,72],dbpt:[48,54]},
    b:{head:[22,70],sh:[27,72],hip:[50,72],knee:[59,61],foot:[62,72],hand:[18,72],dbpt:[48,68]}},
  carry:{ground:86, head:{j:'head',r:6.5}, dumbbells:[{j:'handL',rot:0},{j:'handR',rot:0}], bones:[['sh','hip'],['sh','handL'],['sh','handR'],['hip','footL'],['hip','footR']],
    a:{head:[50,20],sh:[50,30],hip:[50,58],handL:[42,52],handR:[58,52],footL:[46,84],footR:[54,82]},
    b:{head:[50,21],sh:[50,31],hip:[50,58],handL:[42,53],handR:[58,53],footL:[47,82],footR:[53,84]}},
  plank:{ground:73, head:{j:'head',r:6}, bones:[['sh','hip'],['hip','foot'],['sh','elbow'],['elbow','handF']],
    a:{head:[70,54],sh:[64,56],hip:[40,66],foot:[22,72],elbow:[62,72],handF:[72,72]},
    b:{head:[70,53],sh:[64,55],hip:[40,65],foot:[22,71],elbow:[62,72],handF:[72,72]}},
  sideplank:{ground:78, head:{j:'head',r:6}, bones:[['sh','hip'],['hip','foot'],['sh','elbow'],['elbow','handF'],['sh','handTop']],
    a:{head:[28,50],sh:[34,55],hip:[56,66],foot:[72,76],elbow:[30,74],handF:[40,74],handTop:[34,40]},
    b:{head:[28,49],sh:[34,54],hip:[56,65],foot:[72,75],elbow:[30,74],handF:[40,74],handTop:[34,39]}},
  deadbug:{ground:66, head:{j:'head',r:6}, bones:[['sh','hip'],['sh','handUp'],['sh','handExt'],['hip','kneeTuck'],['kneeTuck','footTuck'],['hip','footExt']],
    a:{head:[26,58],sh:[34,60],hip:[52,60],handUp:[42,46],handExt:[20,55],kneeTuck:[58,50],footTuck:[64,50],footExt:[70,64]},
    b:{head:[26,58],sh:[34,60],hip:[52,60],handUp:[42,46],handExt:[34,46],kneeTuck:[58,50],footTuck:[64,50],footExt:[66,54]}},
  birddog:{ground:76, head:{j:'head',r:6}, bones:[['sh','hip'],['sh','handSup'],['sh','handExt'],['hip','kneeSup'],['hip','footBack']],
    a:{head:[30,52],sh:[36,55],hip:[60,58],handSup:[34,74],handExt:[20,50],kneeSup:[62,74],footBack:[78,54]},
    b:{head:[30,53],sh:[36,56],hip:[60,59],handSup:[35,74],handExt:[36,74],kneeSup:[58,74],footBack:[62,74]}},
  catcow:{ground:76, head:{j:'head',r:6}, paths:[{s:'sS',c:'sC',e:'sE'}], bones:[['sS','hand'],['sE','knee']],
    a:{sS:[34,56],sC:[50,45],sE:[64,56],head:[28,60],hand:[32,74],knee:[66,74]},
    b:{sS:[34,56],sC:[50,66],sE:[64,56],head:[26,52],hand:[32,74],knee:[66,74]}},
  hipflex:{ground:82, head:{j:'head',r:6.5}, bones:[['sh','hip'],['sh','handL'],['sh','handR'],['hip','kneeF'],['kneeF','footF'],['hip','kneeB'],['kneeB','footB']],
    a:{head:[48,24],sh:[48,31],hip:[48,54],handL:[42,52],handR:[53,50],kneeF:[38,66],footF:[36,80],kneeB:[61,73],footB:[73,80]},
    b:{head:[48,25],sh:[48,32],hip:[48,56],handL:[42,53],handR:[53,51],kneeF:[37,66],footF:[35,80],kneeB:[62,74],footB:[74,80]}},
  thoracic:{ground:76, head:{j:'head',r:6}, bones:[['sh','hip'],['sh','handSup'],['sh','handRot'],['hip','kneeSup']],
    a:{head:[30,58],sh:[36,56],hip:[60,60],handSup:[34,74],handRot:[50,40],kneeSup:[62,74]},
    b:{head:[30,58],sh:[36,56],hip:[60,60],handSup:[34,74],handRot:[28,64],kneeSup:[62,74]}},
  child:{ground:78, head:{j:'head',r:6}, bones:[['hipTop','mid'],['mid','hand'],['hipTop','kneeL'],['hipTop','kneeR']],
    a:{hipTop:[60,58],mid:[34,70],head:[28,70],hand:[18,74],kneeL:[66,76],kneeR:[64,76]},
    b:{hipTop:[60,57],mid:[34,69],head:[28,69],hand:[18,73],kneeL:[66,76],kneeR:[64,76]}},
  pushup:{ground:74, head:{j:'head',r:6}, bones:[['sh','hip'],['hip','knee'],['knee','foot'],['sh','elbow'],['elbow','hand']],
    a:{head:[68,44],sh:[62,48],hip:[42,60],knee:[28,68],foot:[20,60],elbow:[62,58],hand:[62,72]},
    b:{head:[68,56],sh:[62,60],hip:[42,66],knee:[28,68],foot:[20,60],elbow:[70,66],hand:[62,72]}}
};

/* ---------- animation engine (interpolates joints so limbs actually move) ---------- */
var SVGNS='http://www.w3.org/2000/svg';
function mkel(t){ return document.createElementNS(SVGNS,t); }
function keyOf(svg){ var k=Object.keys(SV); for(var i=0;i<k.length;i++){ if(SV[k[i]]===svg) return k[i]; } return null; }
function lerp(a,b,t){ return a+(b-a)*t; }
function easeIO(x){ return x<0.5 ? 2*x*x : 1-Math.pow(-2*x+2,2)/2; }
function pingT(now,period,phase){ var p=((now/period)+phase)%1; if(p<0)p+=1; var tri=p<0.5?p*2:(1-p)*2; return easeIO(tri); }
function buildAnim(container,key,hideWt){
  var kf=KF[key]; if(!kf||!container) return null;
  container.innerHTML='';
  var svg=mkel('svg'); svg.setAttribute('viewBox','0 0 100 100'); svg.setAttribute('class','ex-svg'); svg.setAttribute('aria-hidden','true');
  if(kf.ground!=null){ var gl=mkel('line'); gl.setAttribute('class','grd'); gl.setAttribute('x1',12); gl.setAttribute('y1',kf.ground); gl.setAttribute('x2',88); gl.setAttribute('y2',kf.ground); svg.appendChild(gl); }
  var fig=mkel('g'); fig.setAttribute('class','fig'); fig.setAttribute('stroke-linecap','round'); fig.setAttribute('stroke-linejoin','round'); svg.appendChild(fig);
  var refs={paths:[],bones:[],head:null,dbs:[]};
  (kf.paths||[]).forEach(function(p){ var el=mkel('path'); fig.appendChild(el); refs.paths.push({el:el,p:p}); });
  (kf.bones||[]).forEach(function(bn){ var el=mkel('line'); fig.appendChild(el); refs.bones.push({el:el,b:bn}); });
  if(kf.head){ var hc=mkel('circle'); hc.setAttribute('r',kf.head.r); fig.appendChild(hc); refs.head={el:hc,j:kf.head.j}; }
  if(!hideWt) (kf.dumbbells||[]).forEach(function(d){ var g=mkel('g'); g.setAttribute('class','wt');
    var r1=mkel('rect'); r1.setAttribute('x',-9); r1.setAttribute('y',-1.6); r1.setAttribute('width',18); r1.setAttribute('height',3.2); r1.setAttribute('rx',1.6);
    var r2=mkel('rect'); r2.setAttribute('x',-9.5); r2.setAttribute('y',-5); r2.setAttribute('width',5); r2.setAttribute('height',10); r2.setAttribute('rx',1.9);
    var r3=mkel('rect'); r3.setAttribute('x',4.5); r3.setAttribute('y',-5); r3.setAttribute('width',5); r3.setAttribute('height',10); r3.setAttribute('rx',1.9);
    g.appendChild(r1); g.appendChild(r2); g.appendChild(r3); svg.appendChild(g); refs.dbs.push({el:g,d:d}); });
  container.appendChild(svg);
  return {kf:kf,refs:refs};
}
function updateAnim(rec,t){
  var kf=rec.kf, a=kf.a, b=kf.b, J={}, n;
  for(n in a){ J[n]=[lerp(a[n][0],b[n][0],t), lerp(a[n][1],b[n][1],t)]; }
  rec.refs.paths.forEach(function(pp){ var s=J[pp.p.s],c=J[pp.p.c],e=J[pp.p.e]; pp.el.setAttribute('d','M'+s[0].toFixed(1)+' '+s[1].toFixed(1)+' Q'+c[0].toFixed(1)+' '+c[1].toFixed(1)+' '+e[0].toFixed(1)+' '+e[1].toFixed(1)); });
  rec.refs.bones.forEach(function(bb){ var p1=J[bb.b[0]],p2=J[bb.b[1]]; bb.el.setAttribute('x1',p1[0].toFixed(1)); bb.el.setAttribute('y1',p1[1].toFixed(1)); bb.el.setAttribute('x2',p2[0].toFixed(1)); bb.el.setAttribute('y2',p2[1].toFixed(1)); });
  if(rec.refs.head){ var h=J[rec.refs.head.j]; rec.refs.head.el.setAttribute('cx',h[0].toFixed(1)); rec.refs.head.el.setAttribute('cy',h[1].toFixed(1)); }
  rec.refs.dbs.forEach(function(dd){ var pt; if(dd.d.mid){ var x=J[dd.d.mid[0]],y=J[dd.d.mid[1]]; pt=[(x[0]+y[0])/2,(x[1]+y[1])/2]; } else { pt=J[dd.d.j]; } dd.el.setAttribute('transform','translate('+pt[0].toFixed(1)+' '+pt[1].toFixed(1)+') rotate('+(dd.d.rot||0)+')'); });
}
var animList=[], animRAF=null, animReduced=(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
function animFrame(now){ if(!animList.length){ animRAF=null; return; } for(var i=0;i<animList.length;i++){ updateAnim(animList[i].rec, pingT(now, animList[i].period, animList[i].phase)); } animRAF=requestAnimationFrame(animFrame); }
function initCards(mode){
  animList = animList.filter(function(x){ return x.src!=='card'; });
  var arts=document.querySelectorAll('#'+mode+' .art[data-key]');
  Array.prototype.forEach.call(arts, function(art,i){ var key=art.getAttribute('data-key'); if(!key) return; var hideWt=art.getAttribute('data-nowt')==='1'; var wrap=art.querySelector('.figwrap'); var rec=buildAnim(wrap,key,hideWt); if(!rec) return; if(animReduced){ updateAnim(rec,0); } else { animList.push({rec:rec,phase:(i*0.17)%1,period:2100,src:'card'}); } });
  if(!animRAF && !animReduced && animList.length){ animRAF=requestAnimationFrame(animFrame); }
}

var DATA = {
  walked: {
    follow: null,
    sections: [
      { title:'Warm up and mobility', mins:'about 5 minutes', note:'Loosen what a day of sitting tightened.', items:[
        {name:'Cat and Cow', gear:'Carpet or mat', reps:'8 to 10 slow reps', rest:'', cue:'On hands and knees, arch up then dip down. Frees a stiff spine.', ch:'search', q:'cat cow stretch how to', svg:SV.catcow},
        {name:'Kneeling Hip Flexor Stretch', gear:'Carpet or mat', reps:'30 sec each side', rest:'', cue:'Half kneel and ease my hips forward. Undoes tight hip flexors from sitting.', ch:'search', q:'kneeling hip flexor stretch how to', svg:SV.hipflex},
        {name:'Open Book Rotation', gear:'Carpet or mat', reps:'8 each side', rest:'', cue:'Rotate my upper back so the low back does not take the strain.', ch:'search', q:'open book thoracic rotation stretch', svg:SV.thoracic}
      ]},
      { title:'Core and posture', mins:'about 15 minutes', note:'Two or three easy rounds. These steady and protect my spine. No crunching, all quiet.', items:[
        {name:'Dead Bug', gear:'Carpet or mat', reps:'3 x 8 each side', rest:'30 sec', cue:'On my back, reach opposite arm and leg. Deep core control, easy on the back.', ch:'search', q:'dead bug exercise how to beginner', svg:SV.deadbug},
        {name:'Bird Dog', gear:'Carpet or mat', reps:'3 x 8 each side', rest:'30 sec', cue:'On all fours, extend opposite arm and leg. Builds anti twist stability.', ch:'search', q:'bird dog exercise how to', svg:SV.birddog},
        {name:'Glute Bridge', gear:'Carpet or mat', nowt:true, reps:'3 x 12 to 15', rest:'30 sec', cue:'Drive through my heels and squeeze. Wakes up glutes that sitting switches off.', ch:'search', q:'glute bridge how to beginner', svg:SV.bridge, bw:{name:'Single-Leg Glute Bridge', reps:'3 x 10 each side', ch:'search', q:'single leg glute bridge how to', cue:'One foot planted, the other leg straight, drive up through the heel. A little extra for a no-equipment week.'}},
        {name:'Forearm Plank', gear:'Carpet or mat', reps:'3 x 20 to 40 sec', rest:'40 sec', cue:'Straight line from head to heels, ribs down. Stop if my low back sags.', ch:'search', q:'how to plank correctly beginner', svg:SV.plank},
        {name:'Side Plank', gear:'Carpet or mat', reps:'2 x 15 to 30 sec each side', rest:'30 sec', cue:'On one forearm, hips lifted. Part of the physio McGill Big 3.', ch:'search', q:'side plank how to beginner', svg:SV.sideplank}
      ]},
      { title:'Cool down', mins:'about 10 minutes', note:'Wind down so it does not disturb sleep or digestion.', items:[
        {name:"Child's Pose", gear:'Carpet or mat', reps:'hold 60 to 90 sec', rest:'', cue:'Kneel and fold forward, arms long. Eases a tight low back.', ch:'search', q:'childs pose yoga how to', svg:SV.child},
        {name:'Slow Cat and Cow', gear:'Carpet or mat', reps:'6 to 8 reps', rest:'', cue:'Finish with easy spinal waves and slow breathing.', ch:'search', q:'cat cow stretch slow gentle', svg:SV.catcow}
      ]}
    ]
  },
  strength: {
    follow: { lbl:'Rather press play and follow along? Use one of these full sessions instead:', btns:[
      {label:'Apartment full body, MadFit', q:'MadFit full body dumbbell workout apartment friendly no jumping'},
      {label:'Beginner 30 min, Juice and Toya', q:'Juice and Toya 30 minute full body dumbbell workout for beginners'},
      {label:'Beginner full body, Caroline Girvan', q:'Caroline Girvan beginner full body dumbbell workout'}
    ]},
    sections: [
      { title:'Warm up', mins:'about 8 to 10 minutes', note:'Lift my heart rate and prepare the joints I am about to load.', items:[
        {name:'March in Place', gear:'No equipment', reps:'2 to 3 min', rest:'', cue:'Knees up, arms swinging, add big arm circles. Quiet cardio to start.', ch:'search', q:'marching in place warm up beginner', svg:SV.march},
        {name:'Bodyweight Squat', gear:'No equipment', nowt:true, reps:'2 x 10', rest:'30 sec', cue:'No weight yet. Grooves the squat and warms the legs.', ch:'search', q:'bodyweight squat how to beginner', svg:SV.goblet},
        {name:'Cat and Cow', gear:'Carpet or mat', reps:'8 reps', rest:'', cue:'Prime the spine before I load it.', ch:'search', q:'cat cow stretch how to', svg:SV.catcow}
      ]},
      { title:'Full body dumbbell workout', mins:'about 30 to 40 minutes', note:'Do the first set of each lift at about half weight to groove the movement, then my working sets. Rest 60 to 90 sec between sets. My smallest jump is 1 kg. Never drop the weights, lower them slowly.', items:[
        {name:'Goblet Squat', gear:'1 dumbbell', start:'Start 8 kg', reps:'3 x 10 to 12', rest:'60 to 90 sec', cue:'Hold one dumbbell at my chest, sit back and down, brace my core.', ch:'Jeremy Ethier', q:'Jeremy Ethier how to goblet squat', svg:SV.goblet, bw:{name:'Bodyweight Squat', gear:'No equipment', nowt:true, ch:'search', q:'bodyweight squat how to beginner', cue:'Sit back and down like into a chair, chest up, drive through my heels. Slow the lower to 3 counts to make it harder.'}},
        {name:'Romanian Deadlift', gear:'2 dumbbells', start:'Start 6 kg / hand', reps:'3 x 10 to 12', rest:'60 to 90 sec', cue:'Push my hips back with a flat back. Start light and watch my form.', ch:'Jeff Nippard', q:'Jeff Nippard dumbbell romanian deadlift how to', svg:SV.rdl, bw:{name:'Good Morning', gear:'No equipment', nowt:true, ch:'search', q:'bodyweight good morning exercise how to', cue:'Hands behind my head, push my hips back with a flat back, feel the hamstrings, then stand tall. Progress to single leg later.'}},
        {name:'Dumbbell Floor Press', gear:'2 dumbbells, carpet', start:'Start 5 kg / hand', reps:'3 x 10 to 12', rest:'60 to 90 sec', cue:'Lie on the carpet and press up. Elbows stop at the floor, a built in safe range.', ch:'search', q:'dumbbell floor press form how to', svg:SV.floorpress, bw:{name:'Push-Up, wall to floor', gear:'Wall or floor', nowt:true, ch:'search', q:'push up progression wall knees full beginner', svg:SV.pushup, cue:'Start on the wall or a counter, then knees, then full as I get stronger. Chest, shoulders, triceps.'}},
        {name:'Dumbbell Row', gear:'2 dumbbells', start:'Start 7 kg / hand', reps:'3 x 10 to 12', rest:'60 to 90 sec', cue:'Hinge, pull the dumbbell to my ribs, squeeze the shoulder blade. Fixes desk slouch.', ch:'Jeremy Ethier', q:'Jeremy Ethier dumbbell row how to', svg:SV.row, bw:{name:'Towel Row (or back squeeze)', gear:'A towel + a door', nowt:true, ch:'search', q:'towel row door bodyweight back exercise how to', cue:'Loop a towel around a sturdy door handle, lean back and pull my chest to my hands, squeezing my shoulder blades. Trains the pull the row would.'}},
        {name:'Overhead Press', gear:'2 dumbbells', start:'Start 4 kg / hand', reps:'3 x 8 to 12', rest:'60 to 90 sec', cue:'Press up without leaning back. If my back complains, I do it seated on the sofa.', ch:'Jeremy Ethier', q:'Jeremy Ethier dumbbell shoulder press how to', svg:SV.ohp, bw:{name:'Wall Press or Pike Push-Up', gear:'Wall or floor', nowt:true, ch:'search', q:'pike push up wall press shoulders beginner', cue:'Press hard into a wall at an angle, or with hips piked high lower my head toward the floor. Shoulders and triceps, no weight needed.'}},
        {name:'Reverse Lunge', gear:'Bodyweight, later 2 dumbbells', start:'Start bodyweight', reps:'2 to 3 x 8 to 10 each leg', rest:'60 sec', cue:'Step backward, gentler on the knees and quieter. Hold a wall for balance early. Optional in my first month if the session runs long.', ch:'search', q:'dumbbell reverse lunge how to beginner', svg:SV.lunge, bw:{name:'Reverse Lunge', gear:'No equipment', nowt:true, cue:'Step backward, front thigh toward parallel, hold a wall for balance early. Add a pause at the bottom to make it harder.'}},
        {name:'Glute Bridge', gear:'1 dumbbell, carpet', start:'Start 8 kg', reps:'3 x 12 to 15', rest:'45 sec', cue:'Dumbbell on my hips, drive through heels, pause at the top.', ch:'search', q:'weighted glute bridge how to', svg:SV.bridge, bw:{name:'Single-Leg Glute Bridge', gear:'Carpet or mat', nowt:true, reps:'3 x 10 each side', ch:'search', q:'single leg glute bridge how to', cue:'One foot planted, the other leg straight out, drive up through the heel. Much harder than it looks, no weight needed.'}},
        {name:"Farmer's Carry", gear:'2 dumbbells', start:'Start 8 kg / hand', reps:'3 x 30 to 40 sec', rest:'60 sec', cue:'Heavy dumbbells, stand tall, march on the spot. Grip, core, posture, silent. Optional in my first month.', ch:'search', q:'farmers carry how to form', svg:SV.carry, bw:{name:'Long Forearm Plank', gear:'Carpet or mat', nowt:true, reps:'3 x 30 to 45 sec', ch:'search', q:'forearm plank hold longer how to', svg:SV.plank, cue:'Straight line, brace hard, breathe. Trains the core and posture the carry would.'}},
        {name:'Forearm Plank', gear:'Carpet or mat', reps:'3 x 20 to 40 sec', rest:'40 sec', cue:'Finish the core. Straight line, ribs down.', ch:'search', q:'how to plank correctly beginner', svg:SV.plank}
      ]},
      { title:'Cool down', mins:'about 5 to 10 minutes', note:'Optional easy cardio if I skipped the walk today, then stretch out.', items:[
        {name:'Low Impact Cardio', gear:'No equipment', reps:'optional 5 to 10 min', rest:'', cue:'Only if I did not walk today. Step touch or marching, no jumping.', ch:'MadFit', q:'MadFit low impact cardio no jumping apartment friendly', svg:SV.march},
        {name:"Child's Pose", gear:'Carpet or mat', reps:'hold 60 sec', rest:'', cue:'Decompress the spine and bring my heart rate down.', ch:'search', q:'childs pose yoga how to', svg:SV.child}
      ]}
    ]
  },
  indoor: {
    follow: { lbl:'Rather press play? These follow alongs cover the cardio block:', btns:[
      {label:'30 min low impact, MadFit', q:'MadFit 30 min low impact cardio no jumping apartment friendly'},
      {label:'Indoor walk, GrowWithJo', q:'GrowWithJo easy walk at home indoor workout'}
    ]},
    sections: [
      { title:'Warm up', mins:'about 5 minutes', note:'Ease in, this replaces my missed walk.', items:[
        {name:'March in Place', gear:'No equipment', reps:'2 to 3 min easy', rest:'', cue:'Gentle pace, arms swinging. Just get the blood moving.', ch:'search', q:'marching in place warm up beginner', svg:SV.march},
        {name:'Cat and Cow', gear:'Carpet or mat', reps:'8 reps', rest:'', cue:'Loosen the spine before the cardio block.', ch:'search', q:'cat cow stretch how to', svg:SV.catcow}
      ]},
      { title:'Quiet indoor cardio', mins:'about 20 to 25 minutes', note:'This stands in for the walk. Work at a pace where talking gets slightly breathy but I never gasp. No jumping, nothing the neighbours can hear.', items:[
        {name:'Brisk March Intervals', gear:'No equipment', reps:'4 x 4 min brisk', rest:'60 sec easy', cue:'March hard, knees high, arms driving. The 60 sec between rounds is slow marching, not stopping.', ch:'search', q:'marching in place cardio workout low impact', svg:SV.march},
        {name:'Standing Knee Drives', gear:'No equipment', reps:'3 x 20 each side', rest:'45 sec', cue:'Pull one knee up toward my hands with a little crunch. Quiet, and works the core while the heart rate stays up.', ch:'search', q:'standing knee drive exercise low impact', svg:SV.march},
        {name:'Step Touch with Arms', gear:'No equipment', reps:'3 x 2 min', rest:'45 sec', cue:'Step side to side, reach the arms wide or overhead. Easy on the knees and completely silent on the floor.', ch:'MadFit', q:'MadFit step touch low impact cardio no jumping', svg:SV.march}
      ]},
      { title:'Core circuit', mins:'about 12 minutes', note:'Two easy rounds, the same spine friendly work as walk days.', items:[
        {name:'Dead Bug', gear:'Carpet or mat', reps:'2 x 8 each side', rest:'30 sec', cue:'On my back, reach opposite arm and leg. Deep core control.', ch:'search', q:'dead bug exercise how to beginner', svg:SV.deadbug},
        {name:'Bird Dog', gear:'Carpet or mat', reps:'2 x 8 each side', rest:'30 sec', cue:'On all fours, extend opposite arm and leg. Steady, no wobble.', ch:'search', q:'bird dog exercise how to', svg:SV.birddog},
        {name:'Glute Bridge', gear:'Carpet or mat', nowt:true, reps:'2 x 12 to 15', rest:'30 sec', cue:'Drive through heels, squeeze at the top.', ch:'search', q:'glute bridge how to beginner', svg:SV.bridge, bw:{name:'Single-Leg Glute Bridge', reps:'2 x 10 each side', ch:'search', q:'single leg glute bridge how to', cue:'One foot planted, other leg straight, drive up through the heel. A little extra for a no-equipment week.'}},
        {name:'Forearm Plank', gear:'Carpet or mat', reps:'2 x 20 to 40 sec', rest:'40 sec', cue:'Straight line, ribs down. Stop if the low back sags.', ch:'search', q:'how to plank correctly beginner', svg:SV.plank}
      ]},
      { title:'Cool down', mins:'about 5 minutes', note:'Wind down before the evening.', items:[
        {name:"Child's Pose", gear:'Carpet or mat', reps:'hold 60 sec', rest:'', cue:'Kneel and fold forward. Let the heart rate settle.', ch:'search', q:'childs pose yoga how to', svg:SV.child}
      ]}
    ]
  }
};

function card(e, mode, idx){
  var restHtml = e.rest ? '<span class="rest">rest '+e.rest+'</span>' : '';
  var hide = equipBW || e.nowt;
  var fig = hide ? stripWt(e.svg) : e.svg;
  return '<div class="card" id="'+mode+'-'+idx+'">'
    + '<div class="art" data-key="'+(keyOf(e.svg)||'')+'" data-nowt="'+(hide?1:0)+'"><div class="figwrap">'+fig+'</div><div class="ribbon">'+RIBBON+'</div></div>'
    + '<div class="body">'
    +   '<div class="name">'+e.name+'</div>'
    +   '<div class="meta"><span class="badge">'+e.reps+'</span>'+(e.start?'<span class="start">'+e.start+'</span>':'')+restHtml+'</div>'
    +   (e.gear?'<div class="gear">'+GEAR+e.gear+'</div>':'')
    +   '<div class="cue">'+e.cue+'</div>'
    +   '<div class="actions">'
    +     '<a class="watch" href="'+yt(e.q)+'" target="_blank" rel="noopener">'+PLAY+' '+(e.ch==='search'?'Watch how':e.ch)+'</a>'
    +     '<button class="done" aria-pressed="false" onclick="toggleDone(\''+mode+'-'+idx+'\',\''+mode+'\')"><span class="box">'+CHK+'</span>Done</button>'
    +   '</div>'
    + '</div></div>';
}
function renderMode(mode){
  var d = DATA[mode], html = '', n = 0;
  if(d.follow){
    html += '<div class="followrow"><p class="lbl">'+d.follow.lbl+'</p><div class="pills">'
      + d.follow.btns.map(function(b){ return '<a class="pill" href="'+yt(b.q)+'" target="_blank" rel="noopener">'+PLAY+' '+b.label+'</a>'; }).join('')
      + '</div></div>';
  }
  d.sections.forEach(function(s){
    html += '<div class="sec"><div class="sechead"><h3>'+s.title+'</h3><span class="mins">'+s.mins+'</span></div>'
      + '<p class="secnote">'+s.note+'</p><div class="grid">'
      + s.items.map(function(it){ return card(effItem(it), mode, n++); }).join('')
      + '</div></div>';
  });
  document.getElementById(mode).innerHTML = html;
}
renderMode('walked'); renderMode('strength'); renderMode('indoor');
restoreAll(); renderProgress();
(function(){ var db=document.getElementById('eq-db'), b=document.getElementById('eq-bw'); if(db) db.classList.toggle('on', !equipBW); if(b) b.classList.toggle('on', equipBW); })();

var current = 'walked';
function toggleDone(cardId, mode){
  var c = document.getElementById(cardId);
  var on = c.classList.toggle('is-done');
  c.querySelector('.done').setAttribute('aria-pressed', on ? 'true' : 'false');
  persistDone(mode, cardId, on);
  if(mode===current) refresh();
}
function refresh(){
  var panel = document.getElementById(current);
  var total = panel.querySelectorAll('.card').length;
  var done = panel.querySelectorAll('.card.is-done').length;
  document.getElementById('progfill').style.width = (total ? Math.round(done/total*100) : 0) + '%';
  document.getElementById('progcount').textContent = (done===total && total>0) ? ('All '+total+' done. Nice work.') : (done+' of '+total+' done');
  if(done===total && total>0) markSessionComplete();
}
function resetMode(){
  document.getElementById(current).querySelectorAll('.card.is-done').forEach(function(c){
    c.classList.remove('is-done');
    var b = c.querySelector('.done'); if(b) b.setAttribute('aria-pressed','false');
  });
  refresh();
}
var MODE_META = {
  walked:  {accent:'var(--green)',  time:'about 30 min'},
  strength:{accent:'var(--indigo)', time:'about 45 to 60 min'},
  indoor:  {accent:'var(--amber)',  time:'about 40 to 50 min'}
};
function setMode(mode){
  current = mode;
  document.querySelectorAll('.mode').forEach(function(b){
    var on = b.dataset.mode===mode; b.classList.toggle('on', on); b.setAttribute('aria-pressed', on?'true':'false');
  });
  ['walked','strength','indoor'].forEach(function(m){
    document.getElementById('sw-'+m).classList.toggle('on', mode===m);
    document.getElementById(m).classList.toggle('show', mode===m);
  });
  document.documentElement.style.setProperty('--accent', MODE_META[mode].accent);
  var sb=document.getElementById('startBtn');
  if(sb){ sb.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24"><polygon points="6,4 20,12 6,20" fill="#fff"/></svg><span class="lbl2"><span class="l1">Start guided session</span><span class="sub2">'+itemCount(mode)+' moves, '+MODE_META[mode].time+'</span></span>'; }
  initCards(mode);
  refresh();
}

var WEEK = [
  {d:'Mon', t:'Walk', k:'walk', s:'70 min walk plus light core and mobility'},
  {d:'Tue', t:'Strength', k:'lift', s:'Full body dumbbell, 45 to 60 min'},
  {d:'Wed', t:'Walk', k:'walk', s:'70 min walk plus back care and mobility'},
  {d:'Thu', t:'Strength', k:'lift', s:'Full body dumbbell, 45 to 60 min'},
  {d:'Fri', t:'Walk', k:'walk', s:'70 min walk plus light core and mobility'},
  {d:'Sat', t:'Strength', k:'lift', s:'Dumbbells, or a long walk plus light core'},
  {d:'Sun', t:'Rest', k:'rest', s:'Gentle walk and stretching only'}
];
document.getElementById('week').innerHTML = WEEK.map(function(w){
  return '<div class="day k-'+w.k+'"><div class="dn">'+w.d+'</div><span class="ty"><i class="dot"></i>'+w.t+'</span><div class="ds">'+w.s+'</div></div>';
}).join('');
document.getElementById('weekrule').innerHTML =
  '<b>How the days work.</b> Strength days are fixed, Tuesday, Thursday, and Saturday, and they happen in any weather. That keeps at least 48 hours between lifts and guarantees the muscle work my liver needs, rain or shine. Weather only ever changes the walk: if rain or heat cancels it on a walk day, run the Couldn\u2019t walk session instead of the light one. Never lift heavy two days in a row.';

var APPS = [
  {n:'Apple Workout and Activity Rings', free:'Built in, free', paid:false, d:'My backbone. I log walks as Outdoor Walk and dumbbell days as Functional Strength Training. I treat each Stand hour as a nudge to get up and stretch for 20 seconds.'},
  {n:'Hevy', free:'Free tier, generous', paid:false, d:'Log every set, rep, and weight with a rest timer and progress charts. Watch app plus Apple Health. The clearest way to track my lifts.'},
  {n:'Nike Training Club', free:'Fully free', paid:false, d:'A big library of guided beginner strength, core, and mobility workouts with video. Syncs to Apple Health.'},
  {n:'MyFitnessPal', free:'Free tier', paid:false, d:'Track calories and protein. I aim for about 120 to 140 g a day to keep muscle while losing fat. Syncs weight and steps with Apple Health.'},
  {n:'Apple Fitness Plus', free:'Paid, optional', paid:true, d:'Trainer led strength, yoga, and Time to Walk with metrics on my Watch. Nice to have, but the free apps above are enough.'}
];
document.getElementById('apps').innerHTML = APPS.map(function(a){
  return '<div class="info"><h4>'+a.n+'</h4><span class="free'+(a.paid?' paid':'')+'">'+a.free+'</span><p>'+a.d+'</p></div>';
}).join('');

document.getElementById('safety').innerHTML =
  '<h4>Pace and food</h4>'
  + '<p>Aim for <b>half a kilo to one kilo a week</b>. Faster loss risks muscle, and with fatty liver it is discouraged. Eat about <b>1.6 to 2.2 g of protein per kilo, roughly 120 to 140 g a day</b>, to hold and build muscle while the fat comes off. I load it into my salad dinners with chicken, fish, eggs, tofu, Greek yogurt, or legumes. Drink water before, during, and after. Given NAFLD, keep alcohol at or near zero, since it feeds liver fat directly.</p>'
  + '<h4>My desk day habit</h4>'
  + '<p>I use my Watch\'s hourly Stand nudge: stand up, five glute squeezes, and a 20 second doorway chest or standing hip flexor stretch. That alone eases the afternoon back tightness from nine hours of sitting.</p>'
  + '<div class="flags"><div class="ft"><svg width="17" height="17" viewBox="0 0 24 24" fill="none"><path d="M12 3l9 16H3L12 3z" stroke="#a5241f" stroke-width="1.7" stroke-linejoin="round"/><path d="M12 9.5v4M12 16.5h.01" stroke="#a5241f" stroke-width="1.9" stroke-linecap="round"/></svg>Stop and get medical help if I feel</div>'
  + '<ul>'
  + '<li>Chest pain or pressure, or breathing that is harder than it should be</li>'
  + '<li>Fainting, dizziness, or a racing or irregular heartbeat</li>'
  + '<li>Severe or worsening pain in the upper right belly, over my liver</li>'
  + '<li>New swelling in my legs or belly, or yellowing of my skin or eyes</li>'
  + '<li>Sharp or radiating back or joint pain while lifting, different from normal muscle fatigue</li>'
  + '</ul></div>';

document.getElementById('foot').innerHTML =
  'Each Watch how button opens a hand picked YouTube search that lands on the recommended channel\'s tutorial, so the link keeps working even if a video is uploaded again.<br>'
  + 'This is general guidance for education, not personal medical advice. My doctor\'s instructions always come first.';

/* ---------- guided full-screen player ---------- */
function itemCount(mode){ var n=0; DATA[mode].sections.forEach(function(s){ n+=s.items.length; }); return n; }
function buildList(mode){ var list=[], n=0; DATA[mode].sections.forEach(function(s){ s.items.forEach(function(it){ list.push({id:mode+'-'+n, it:it}); n++; }); }); return list; }
var fxList=[], fxIdx=0, flipTimer=null;
function startFlip(){
  stopFlip();
  if(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  var art=document.getElementById('fxArt');
  flipTimer=setInterval(function(){ art.classList.toggle('flip'); }, 800);
}
function stopFlip(){ if(flipTimer){ clearInterval(flipTimer); flipTimer=null; } var art=document.getElementById('fxArt'); if(art) art.classList.remove('flip'); }
function fxRender(){
  document.getElementById('fxRest').style.display='none';
  document.getElementById('fxEnd').style.display='none';
  document.getElementById('fxMain').style.display='flex';
  var e=effItem(fxList[fxIdx].it);
  var hide=equipBW||e.nowt;
  document.getElementById('fxPoseA').innerHTML=hide?stripWt(e.svg):e.svg;
  document.getElementById('fxPoseB').innerHTML=hide?stripWt(pose2For(e.svg)):pose2For(e.svg);
  document.getElementById('fxName').textContent=e.name;
  document.getElementById('fxMeta').innerHTML='<span>'+e.reps+'</span>'+(e.start?'<span>'+e.start+'</span>':'')+(e.gear?'<span class="gr">'+GEAR+' '+e.gear+'</span>':'')+(e.rest?'<span class="rst">rest '+e.rest+(parseRest(e.rest)>0?' between sets':'')+'</span>':'');
  document.getElementById('fxCue').textContent=e.cue;
  document.getElementById('fxWatch').href=yt(e.q);
  document.getElementById('fxStep').textContent=(fxIdx+1)+' / '+fxList.length;
  document.getElementById('fxFill').style.width=(fxIdx/fxList.length*100)+'%';
  document.getElementById('fxPrev').disabled=(fxIdx===0);
  var art=document.getElementById('fxArt'); if(art) art.classList.remove('flip');
  document.querySelector('.focus-body').scrollTop=0;
}
function fxGo(d){ var ni=fxIdx+d; if(ni<0)ni=0; if(ni>fxList.length-1)ni=fxList.length-1; fxIdx=ni; fxRender(); }
function fxMarkDone(){
  var cur=fxList[fxIdx], c=document.getElementById(cur.id);
  if(c && !c.classList.contains('is-done')){ c.classList.add('is-done'); var b=c.querySelector('.done'); if(b) b.setAttribute('aria-pressed','true'); }
  persistDone(current, cur.id, true);
  refresh(); ensureAudio();
  if(fxIdx>=fxList.length-1){ fxComplete(); return; }
  var rs=parseRest(effItem(cur.it).rest);
  if(rs>0){ showRest(rs); } else { fxIdx++; fxRender(); }
}
function fxComplete(){
  document.getElementById('fxFill').style.width='100%';
  document.getElementById('fxStep').textContent=fxList.length+' / '+fxList.length;
  document.getElementById('fxMain').style.display='none';
  document.getElementById('fxEnd').style.display='flex';
  document.getElementById('fxPrev').style.visibility='hidden';
  document.getElementById('fxEndSub').textContent='All '+fxList.length+' moves finished. Well done.';
  stopFlip();
  markSessionComplete();
}
function fxOpen(){
  fxList=buildList(current); fxIdx=0;
  clearInterval(restTimer); restTimer=null;
  document.getElementById('fxRest').style.display='none';
  var f=document.getElementById('focus');
  var AC={walked:['--green','--green-deep','--green-tint'],strength:['--indigo','--indigo-deep','--indigo-tint'],indoor:['--amber','--amber-deep','--amber-tint']}[current];
  f.style.setProperty('--accent','var('+AC[0]+')');
  f.style.setProperty('--accent-deep','var('+AC[1]+')');
  f.style.setProperty('--accent-tint','var('+AC[2]+')');
  document.getElementById('fxMain').style.display='flex';
  document.getElementById('fxEnd').style.display='none';
  document.getElementById('fxPrev').style.visibility='visible';
  f.classList.add('open'); f.setAttribute('aria-hidden','false');
  document.body.style.overflow='hidden';
  fxRender(); startFlip();
}
function fxClose(){
  var f=document.getElementById('focus');
  f.classList.remove('open'); f.setAttribute('aria-hidden','true');
  document.body.style.overflow=''; stopFlip();
  clearInterval(restTimer); restTimer=null;
}
var restTimer=null, actx=null;
function ensureAudio(){ try{ if(!actx) actx=new (window.AudioContext||window.webkitAudioContext)(); if(actx && actx.state==='suspended') actx.resume(); }catch(e){} }
function beep(){ try{ ensureAudio(); if(!actx) return; var o=actx.createOscillator(), g=actx.createGain(); o.type='sine'; o.frequency.value=880; o.connect(g); g.connect(actx.destination); var t=actx.currentTime; g.gain.setValueAtTime(0.0001,t); g.gain.exponentialRampToValueAtTime(0.25,t+0.01); g.gain.exponentialRampToValueAtTime(0.0001,t+0.28); o.start(t); o.stop(t+0.3); }catch(e){} }
function parseRest(str){ if(!str) return 0; var m=String(str).match(/\d+/); return m? parseInt(m[0],10) : 0; }
function showRest(sec){
  document.getElementById('fxMain').style.display='none';
  document.getElementById('fxEnd').style.display='none';
  document.getElementById('fxRest').style.display='flex';
  var nextName=(fxIdx+1<fxList.length)? fxList[fxIdx+1].it.name : '';
  document.getElementById('fxRestNext').textContent = nextName ? ('Next: '+nextName) : '';
  var left=sec, cd=document.getElementById('fxRestCount'); cd.textContent=left;
  clearInterval(restTimer);
  restTimer=setInterval(function(){ left--; if(left<=0){ clearInterval(restTimer); restTimer=null; beep(); advanceFromRest(); } else { cd.textContent=left; } }, 1000);
}
function skipRest(){ clearInterval(restTimer); restTimer=null; advanceFromRest(); }
function advanceFromRest(){ document.getElementById('fxRest').style.display='none'; document.getElementById('fxMain').style.display='flex'; fxIdx++; fxRender(); }
document.addEventListener('keydown', function(ev){
  var f=document.getElementById('focus'); if(!f || !f.classList.contains('open')) return;
  var restVisible=document.getElementById('fxRest').style.display!=='none';
  var endVisible=document.getElementById('fxEnd').style.display!=='none';
  if(ev.key==='Escape'){ fxClose(); }
  else if(ev.key==='ArrowLeft' && !restVisible && !endVisible){ fxGo(-1); }
  else if(ev.key==='ArrowRight' && !restVisible && !endVisible){ fxGo(1); }
  else if(ev.key==='Enter'){ ev.preventDefault(); if(restVisible) skipRest(); else if(endVisible) fxClose(); else fxMarkDone(); }
});

setMode('walked');