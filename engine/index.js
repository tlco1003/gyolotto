// src/engine/index.js
// ─────────────────────────────────────────────
// YOONGYOYA 로또엔진 vGYO — Pure Engine Module
// 14-Signal Hybrid (Vote 24% + Weight 76%)
// 완전 분리된 재사용 가능 모듈
// ─────────────────────────────────────────────

/* ═══ 내부 유틸 ═══ */
function clamp(x, lo, hi) { return Math.max(lo, Math.min(hi, x)); }
function mean(a) { if (!a.length) return 0; return a.reduce(function(s,v){return s+v},0)/a.length; }
function topK(a, k) { return a.slice().sort(function(x,y){return y-x}).slice(0,k); }
function comb(n, r) {
  if (r<0||r>n) return 0; if (r===0||r===n) return 1;
  r=Math.min(r,n-r); var v=1;
  for(var i=0;i<r;i++) v=(v*(n-i))/(i+1);
  return v;
}
function isP(n) {
  if(n<2) return false; if(n%2===0) return n===2;
  for(var i=3;i*i<=n;i+=2) if(n%i===0) return false;
  return true;
}
function acV(nums) {
  var a=nums.slice().sort(function(x,y){return x-y}); var d=new Set();
  for(var i=0;i<a.length;i++) for(var j=i+1;j<a.length;j++) d.add(a[j]-a[i]);
  return d.size;
}
function prC(nums) { return nums.filter(isP).length; }
function dBin(n) { return Math.floor((n-1)/10); }
function dSig(nums) {
  var b=[0,0,0,0,0];
  for(var i=0;i<nums.length;i++) b[dBin(nums[i])]++;
  return b.join("-");
}
function sPick(items, T) {
  var t=Math.max(0.001,T);
  var ex=items.map(function(it){return Math.exp(it.w/t)});
  var sm=ex.reduce(function(a,b){return a+b},0);
  var r=Math.random()*sm;
  for(var i=0;i<items.length;i++){r-=ex[i];if(r<=0)return items[i].n;}
  return items[items.length-1].n;
}
function mRL(sorted) {
  var b=1,c=1;
  for(var i=1;i<sorted.length;i++){
    if(sorted[i]===sorted[i-1]+1){c++;if(c>b)b=c;}else c=1;
  }
  return b;
}
function dRoot(n) {
  while(n>9){var s=0;while(n>0){s+=n%10;n=Math.floor(n/10);}n=s;}
  return n;
}

/* ═══ 리스크 룰 ═══ */
var RR = {
  stable:   {sn:90, sx:190, on:2, ox:4, mr:2, mo:1, dn:3, dx:3, an:7,  ax:10, pn:1, px:3},
  balanced: {sn:80, sx:200, on:1, ox:5, mr:3, mo:2, dn:2, dx:4, an:6,  ax:11, pn:0, px:4},
  risky:    {sn:60, sx:220, on:0, ox:6, mr:4, mo:3, dn:1, dx:6, an:4,  ax:13, pn:0, px:5}
};

/* ═══ 상수 ═══ */
var PP = comb(43,4)/comb(45,6);
var PRIMES = [2,3,5,7,11,13,17,19,23,29,31,37,41,43];
var PHI = 1.618033988;

/* ═══ 통계 캐시 ═══ */
var stCache = {};

/* ─── buildStats: 14개 신호 계산 ─── */
function bSt(draws, cfg, cKey) {
  if (cKey && stCache[cKey]) return stCache[cKey];
  var N=draws.length, freq=new Array(46).fill(0), ls2=new Array(46).fill(-1);
  for(var i=0;i<N;i++) for(var j=0;j<draws[i].nums.length;j++){var n=draws[i].nums[j];freq[n]++;ls2[n]=i;}

  // 1차 마르코프
  var td=new Array(46).fill(0), tn=[];
  for(var ii=0;ii<46;ii++) tn.push(new Array(46).fill(0));
  var tS=Math.max(0,N-1-(cfg.transW||300));
  for(var i2=tS;i2<N-1;i2++) for(var a2=0;a2<draws[i2].nums.length;a2++){
    var s2=draws[i2].nums[a2]; td[s2]++;
    for(var b2=0;b2<draws[i2+1].nums.length;b2++) tn[s2][draws[i2+1].nums[b2]]++;
  }

  // 2차 마르코프
  var td2=new Array(46).fill(0), tn2=[];
  for(var ii2=0;ii2<46;ii2++) tn2.push(new Array(46).fill(0));
  var tS2=Math.max(0,N-2-(cfg.transW||300));
  for(var i2b=tS2;i2b<N-2;i2b++) for(var a2b=0;a2b<draws[i2b].nums.length;a2b++){
    var s2b=draws[i2b].nums[a2b]; td2[s2b]++;
    for(var b2b=0;b2b<draws[i2b+2].nums.length;b2b++) tn2[s2b][draws[i2b+2].nums[b2b]]++;
  }

  // decade 조건부
  var dd={}, dm={}, dS=Math.max(0,N-1-(cfg.decW||600));
  for(var i3=dS;i3<N-1;i3++){
    var sig=dSig(draws[i3].nums); dd[sig]=(dd[sig]||0)+1;
    if(!dm[sig]) dm[sig]=new Array(46).fill(0);
    for(var c2=0;c2<draws[i3+1].nums.length;c2++) dm[sig][draws[i3+1].nums[c2]]++;
  }

  // pair 공출현
  var pS=Math.max(0,N-(cfg.pairW||120)), pco=[];
  for(var p2=0;p2<46;p2++) pco.push(new Array(46).fill(0));
  var pW=0;
  for(var i4=pS;i4<N;i4++){
    pW++;
    var ns=draws[i4].nums;
    for(var aa=0;aa<ns.length;aa++) for(var bb=aa+1;bb<ns.length;bb++){pco[ns[aa]][ns[bb]]++;pco[ns[bb]][ns[aa]]++;}
  }

  // streak
  var streak=new Array(46).fill(0);
  for(var sn=1;sn<=45;sn++){
    var cnt=0;
    for(var si=N-1;si>=0;si--){if(draws[si].nums.indexOf(sn)>=0)cnt++;else break;}
    streak[sn]=cnt;
  }

  // sumZone
  var szd={}, szm={}, szS=Math.max(0,N-1-(cfg.transW||300));
  for(var i5=szS;i5<N-1;i5++){
    var sm5=draws[i5].nums.reduce(function(a,b){return a+b},0);
    var sk=String(Math.floor(sm5/20)*20); szd[sk]=(szd[sk]||0)+1;
    if(!szm[sk]) szm[sk]=new Array(46).fill(0);
    for(var c5=0;c5<draws[i5+1].nums.length;c5++) szm[sk][draws[i5+1].nums[c5]]++;
  }

  // oddEven
  var opd={}, opm={}, opS=Math.max(0,N-1-(cfg.transW||300));
  for(var i6=opS;i6<N-1;i6++){
    var ok6=String(draws[i6].nums.filter(function(n){return n%2===1}).length);
    opd[ok6]=(opd[ok6]||0)+1;
    if(!opm[ok6]) opm[ok6]=new Array(46).fill(0);
    for(var c6=0;c6<draws[i6+1].nums.length;c6++) opm[ok6][draws[i6+1].nums[c6]]++;
  }

  // 냉각복귀
  var coldRatio=new Array(46).fill(0);
  for(var nc=1;nc<=45;nc++){
    var expectedGap=freq[nc]>0?N/freq[nc]:99;
    var actualGap=ls2[nc]<0?N:(N-1-ls2[nc]);
    coldRatio[nc]=freq[nc]>=3?actualGap/expectedGap:0;
  }

  // 끝수
  var edd={}, edm={}, edS=Math.max(0,N-1-(cfg.transW||300));
  for(var i7=edS;i7<N-1;i7++){
    var eds=draws[i7].nums.map(function(n){return n%10}).sort().join("");
    edd[eds]=(edd[eds]||0)+1;
    if(!edm[eds]) edm[eds]=new Array(46).fill(0);
    for(var c7=0;c7<draws[i7+1].nums.length;c7++) edm[eds][draws[i7+1].nums[c7]]++;
  }

  // 구간균형
  var zoneRecent=new Array(5).fill(0), zW=Math.max(0,N-10);
  for(var i8=zW;i8<N;i8++) for(var j8=0;j8<draws[i8].nums.length;j8++) zoneRecent[dBin(draws[i8].nums[j8])]++;
  var zoneTot=zoneRecent.reduce(function(a,b){return a+b},1);
  var zoneDeficit=new Array(5);
  for(var z=0;z<5;z++) zoneDeficit[z]=Math.max(0,1/5-zoneRecent[z]/zoneTot);

  // 합방향
  var sumArr=[];
  for(var i9=Math.max(0,N-30);i9<N;i9++) sumArr.push(draws[i9].nums.reduce(function(a,b){return a+b},0));
  var sumAvg=sumArr.length>0?sumArr.reduce(function(a,b){return a+b},0)/sumArr.length:135;
  var lastSum=N>0?draws[N-1].nums.reduce(function(a,b){return a+b},0):135;
  var sumDir=(sumAvg-lastSum)/Math.max(1,sumAvg)*2;

  var res={N,freq,ls2,td,tn,td2,tn2,dd,dm,pco,pW,
    pE:pW*PP, pSd:Math.sqrt(Math.max(1e-9,pW*PP*(1-PP))),
    streak,szd,szm,opd,opm,coldRatio,edd,edm,zoneDeficit,sumDir};

  if(cKey){
    stCache[cKey]=res;
    var keys=Object.keys(stCache);
    if(keys.length>200){for(var ki=0;ki<50;ki++) delete stCache[keys[ki]];}
  }
  return res;
}

/* ─── 14개 신호 함수 ─── */
function gSc(n,st){var g=st.ls2[n]<0?st.N:(st.N-1-st.ls2[n]);return 1-Math.exp(-g/25);}
function mSc(n,draws,mW){var s=Math.max(0,draws.length-(mW||80)),c=0;for(var i=s;i<draws.length;i++)if(draws[i].nums.indexOf(n)>=0)c++;return c/Math.max(1,mW||80);}
function tSc(n,prev,st){var ps=[];for(var i=0;i<prev.length;i++){var s=prev[i];if(st.td[s]>0)ps.push(st.tn[s][n]/st.td[s]);}return ps.length>0?mean(ps):0;}
function t2Sc(n,prev2,st){var ps=[];for(var i=0;i<prev2.length;i++){var s=prev2[i];if(st.td2[s]>0)ps.push(st.tn2[s][n]/st.td2[s]);}return ps.length>0?mean(ps):0;}
function deSc(n,prev,st){var sig=dSig(prev),den=st.dd[sig]||0;if(den<=0)return 0;var ar=st.dm[sig];return ar?ar[n]/den:0;}
function strkSc(n,st){return Math.min(st.streak[n]/3,1);}
function szSc(n,prev,st){var sm=prev.reduce(function(a,b){return a+b},0);var sk=String(Math.floor(sm/20)*20);var den=st.szd[sk]||0;if(den<=0)return 0;return(st.szm[sk]?st.szm[sk][n]:0)/den;}
function opSc(n,prev,st){var ok=String(prev.filter(function(x){return x%2===1}).length);var den=st.opd[ok]||0;if(den<=0)return 0;return(st.opm[ok]?st.opm[ok][n]:0)/den;}
function coldSc(n,st){var r=st.coldRatio[n];return r>1?Math.min((r-1)/2,1):0;}
function edSc(n,prev,st){var eds=prev.map(function(x){return x%10}).sort().join("");var den=st.edd[eds]||0;if(den<=0)return 0;return(st.edm[eds]?st.edm[eds][n]:0)/den;}
function znSc(n,st){return st.zoneDeficit[dBin(n)]*5;}
function sdSc(n,st){return st.sumDir>0?clamp((23-n)/22,-0.5,0.5)+0.5:clamp((n-23)/22,-0.5,0.5)+0.5;}

function cSc(n,draws,st,cfg){
  var prev=draws[draws.length-1].nums;
  var prev2=draws.length>=2?draws[draws.length-2].nums:prev;
  var g=gSc(n,st),m=mSc(n,draws,cfg.momW),t=tSc(n,prev,st),t2=t2Sc(n,prev2,st);
  var d=deSc(n,prev,st),sk=strkSc(n,st),sz=szSc(n,prev,st),op=opSc(n,prev,st);
  var co=coldSc(n,st),ed=edSc(n,prev,st),zn=znSc(n,st),sd=sdSc(n,st);
  var w=cfg.weights;
  return {
    gap:g, momentum:m, transition:t, lag2:t2, decade:d,
    streak:sk, sumZone:sz, oddEven:op, coldRecovery:co,
    endDigit:ed, zoneBalance:zn, sumTrend:sd, base:0.5,
    composite:(w.gap||0)*g+(w.momentum||0)*m+(w.transition||0)*t+(w.lag2||0)*t2
      +(w.decade||0)*d+(w.streak||0)*sk+(w.sumZone||0)*sz+(w.oddEven||0)*op
      +(w.coldRecovery||0)*co+(w.endDigit||0)*ed+(w.zoneBalance||0)*zn
      +(w.sumTrend||0)*sd+(w.pair||0)*0+(w.base||0)*0.5
  };
}

function pBst(cand,picked,st,cfg){
  if(!picked.length) return 0;
  var zs=picked.map(function(p){return(st.pco[cand][p]-st.pE)/st.pSd;});
  var z;
  if(cfg.pairMode==="mean") z=mean(zs);
  else if(cfg.pairMode==="max") z=Math.max.apply(null,zs);
  else z=mean(topK(zs,2));
  return Math.tanh(z/2)*(cfg.pairClamp||0.35);
}

function scAll(draws,st,cfg){
  var m=new Map();
  for(var n=1;n<=45;n++) m.set(n,cSc(n,draws,st,cfg));
  return m;
}

/* ─── 투표+가중합 하이브리드 정규화 (Vote 24% + Weight 76%) ─── */
function nrm(sm){
  var lo=Infinity, hi=-Infinity;
  sm.forEach(function(s){lo=Math.min(lo,s.composite);hi=Math.max(hi,s.composite);});
  var sp=Math.max(1e-9,hi-lo);

  var sigKeys=["gap","momentum","transition","lag2","decade","streak","sumZone","oddEven","coldRecovery","endDigit","zoneBalance","sumTrend"];
  var voteScore=new Array(46).fill(0);
  sigKeys.forEach(function(sk){
    var arr=[];sm.forEach(function(s,n){arr.push({n:n,v:s[sk]||0});});
    arr.sort(function(a,b){return b.v-a.v;});
    for(var k=0;k<10;k++) voteScore[arr[k].n]+=(1+(10-k)/10);
  });

  var vLo=Infinity, vHi=-Infinity;
  for(var n=1;n<=45;n++){vLo=Math.min(vLo,voteScore[n]);vHi=Math.max(vHi,voteScore[n]);}
  var vSp=Math.max(1e-9,vHi-vLo);

  var out=new Map();
  sm.forEach(function(s,n){
    var wNorm=(s.composite-lo)/sp;
    var vNorm=(voteScore[n]-vLo)/vSp;
    out.set(n, vNorm*0.24+wNorm*0.76);
  });
  return out;
}

/* ─── 검증 ─── */
function vld(game,prevNums,cfg){
  var r=RR[cfg.risk]||RR.balanced;
  var s=game.slice().sort(function(a,b){return a-b;});
  var sum=s.reduce(function(a,b){return a+b;},0);
  if(sum<r.sn||sum>r.sx) return false;
  var odd=s.filter(function(n){return n%2===1;}).length;
  if(odd<r.on||odd>r.ox||mRL(s)>r.mr) return false;
  if(s.filter(function(n){return prevNums.indexOf(n)>=0;}).length>r.mo) return false;
  var dc=[0,0,0,0,0];
  for(var i=0;i<s.length;i++) dc[dBin(s[i])]++;
  if(dc.filter(function(x){return x>0;}).length<r.dn||Math.max.apply(null,dc)>r.dx) return false;
  var ac=acV(s); if(ac<r.an||ac>r.ax) return false;
  var pc2=prC(s); if(pc2<r.pn||pc2>r.px) return false;
  var lk=cfg.locked||[];
  for(var j=0;j<lk.length;j++) if(s.indexOf(lk[j])<0) return false;
  return true;
}

/* ─── 희귀도 ─── */
function bRar(draws,win){
  var ds2=draws.slice(Math.max(0,draws.length-win));
  var di={sum:{},odd:{},ac:{},prime:{},dec:{}};
  for(var i=0;i<ds2.length;i++){
    var d=ds2[i], s=d.nums.reduce(function(a,b){return a+b;},0);
    di.sum[String(Math.floor(s/10)*10)]=(di.sum[String(Math.floor(s/10)*10)]||0)+1;
    di.odd[String(d.nums.filter(function(n){return n%2===1;}).length)]=(di.odd[String(d.nums.filter(function(n){return n%2===1;}).length)]||0)+1;
    di.ac[String(acV(d.nums))]=(di.ac[String(acV(d.nums))]||0)+1;
    di.prime[String(prC(d.nums))]=(di.prime[String(prC(d.nums))]||0)+1;
    di.dec[dSig(d.nums)]=(di.dec[dSig(d.nums)]||0)+1;
  }
  return {total:ds2.length,di};
}
function rCal(nums,mod){
  var t=Math.max(1,mod.total);
  function p(dist,key){var ks=Object.keys(dist).length;return((dist[key]||0)+1)/(t+ks);}
  var s=nums.reduce(function(a,b){return a+b;},0);
  return clamp(-Math.log(
    p(mod.di.sum,String(Math.floor(s/10)*10))*
    p(mod.di.odd,String(nums.filter(function(n){return n%2===1;}).length))*
    p(mod.di.ac,String(acV(nums)))*
    p(mod.di.prime,String(prC(nums)))*
    p(mod.di.dec,dSig(nums))
  )/8,0,1);
}

function pk1(avail,b01,picked,st,cfg){
  return sPick(avail.map(function(n){return{n,w:(b01.get(n)||0)+pBst(n,picked,st,cfg)};}),cfg.temperature);
}

/* ═══ PUBLIC API ═══ */

/**
 * genTask — 랜덤 샘플링 예측
 */
export function genTask(draws,cfg,onP,onDone){
  var st=bSt(draws,cfg,"g"+draws.length);
  var sm=scAll(draws,st,cfg); var b01=nrm(sm);
  var prev=draws[draws.length-1];
  var locked=(cfg.locked||[]).filter(function(n){return n>=1&&n<=45;});
  var rar=bRar(draws,cfg.rarityW||600);
  var games=[],rars=[],seen={},total=cfg.attempts||250000,chunk=10000,done=0;
  function step(){
    var end=Math.min(done+chunk,total);
    for(var t=done;t<end;t++){
      if(games.length>=(cfg.games||5)) break;
      var pk=locked.slice(),av=[];
      for(var i=1;i<=45;i++) if(pk.indexOf(i)<0) av.push(i);
      while(pk.length<6){var c=pk1(av,b01,pk,st,cfg);pk.push(c);var idx=av.indexOf(c);if(idx>=0)av.splice(idx,1);}
      pk.sort(function(a,b){return a-b;});
      if(new Set(pk).size!==6||!vld(pk,prev.nums,cfg)) continue;
      var key=pk.join(","); if(seen[key]) continue;
      var ok=true;
      for(var g=0;g<games.length;g++){if(games[g].filter(function(n){return pk.indexOf(n)>=0;}).length>(cfg.divMax!=null?cfg.divMax:2)){ok=false;break;}}
      if(!ok) continue;
      seen[key]=true; games.push(pk); rars.push(rCal(pk,rar));
    }
    done=end; onP(done/total);
    if(done>=total||games.length>=(cfg.games||5)) onDone({games,rars});
    else setTimeout(step,0);
  }
  setTimeout(step,0);
}

/**
 * detGenTask — 핵심번호 고정 확정형 예측
 */
export function detGenTask(draws,cfg,onP,onDone){
  var st=bSt(draws,cfg,"g"+draws.length);
  var sm=scAll(draws,st,cfg); var b01=nrm(sm);
  var prev=draws[draws.length-1];
  var locked=(cfg.locked||[]).filter(function(n){return n>=1&&n<=45;});
  var rar=bRar(draws,cfg.rarityW||600);
  onP(0.1);
  var ranked=[]; b01.forEach(function(v,n){ranked.push({n,sc:v});});
  ranked.sort(function(a,b){return b.sc-a.sc;});
  var coreSize=4, core=locked.slice();
  for(var ri=0;ri<ranked.length&&core.length<coreSize;ri++) if(core.indexOf(ranked[ri].n)<0) core.push(ranked[ri].n);
  var extPool=[];
  for(var ri2=0;ri2<ranked.length&&extPool.length<15;ri2++) if(core.indexOf(ranked[ri2].n)<0) extPool.push(ranked[ri2].n);
  onP(0.3);
  var combos=[];
  for(var a=0;a<extPool.length;a++) for(var b=a+1;b<extPool.length;b++){
    var c=core.concat([extPool[a],extPool[b]]).sort(function(x,y){return x-y;});
    if(vld(c,prev.nums,cfg)) combos.push(c);
  }
  for(var ci=0;ci<core.length;ci++){
    var core3=core.filter(function(_,i){return i!==ci;});
    for(var a2=0;a2<extPool.length;a2++) for(var b2=a2+1;b2<extPool.length;b2++) for(var c2=b2+1;c2<extPool.length;c2++){
      var combo=core3.concat([extPool[a2],extPool[b2],extPool[c2]]).sort(function(x,y){return x-y;});
      if(vld(combo,prev.nums,cfg)) combos.push(combo);
      if(combos.length>80000) break;
    }
  }
  onP(0.6);
  var scored=combos.map(function(c){
    var total=0;
    for(var i=0;i<c.length;i++){total+=(b01.get(c[i])||0);for(var j=0;j<i;j++){var pz=(st.pco[c[i]][c[j]]-st.pE)/st.pSd;total+=Math.tanh(pz/3)*0.1;}}
    var coreCount=c.filter(function(n){return core.indexOf(n)>=0;}).length;
    total+=coreCount*0.3;
    return{nums:c,sc:total,coreCount};
  });
  scored.sort(function(a,b){return b.sc-a.sc;});
  var games=[],rars=[],maxG=cfg.games||5;
  for(var si=0;si<scored.length&&games.length<maxG;si++){
    if(scored[si].coreCount<coreSize) continue;
    var c=scored[si].nums; var ok=true;
    for(var g=0;g<games.length;g++){var nonCoreOverlap=c.filter(function(n){return core.indexOf(n)<0&&games[g].indexOf(n)>=0;}).length;if(nonCoreOverlap>=(6-coreSize)){ok=false;break;}}
    if(!ok) continue; games.push(c); rars.push(rCal(c,rar));
  }
  for(var si2=0;si2<scored.length&&games.length<maxG;si2++){
    if(scored[si2].coreCount>=coreSize||scored[si2].coreCount<coreSize-1) continue;
    var c2=scored[si2].nums; var ok2=true;
    for(var g2=0;g2<games.length;g2++){var nonCoreOv=c2.filter(function(n){return core.indexOf(n)<0&&games[g2].indexOf(n)>=0;}).length;if(nonCoreOv>1){ok2=false;break;}}
    if(!ok2) continue; games.push(c2); rars.push(rCal(c2,rar));
  }
  onP(1); onDone({games,rars,mode:"det",core});
}

/**
 * destinyTask — 황금비+거울수+소수나선+좌표격자+음양+DR 운명형 예측
 */
export function destinyTask(draws,cfg,onP,onDone){
  var N=draws.length, last=draws[N-1].nums;
  var scores=new Array(46).fill(0);
  onP(0.1);
  // ① 황금비
  for(var n=1;n<=45;n++){
    var apps=[];for(var i=0;i<N;i++)if(draws[i].nums.indexOf(n)>=0)apps.push(i);
    if(apps.length<2) continue;
    var gaps=[];for(var i=1;i<apps.length;i++)gaps.push(apps[i]-apps[i-1]);
    var avg=gaps.reduce(function(a,b){return a+b;},0)/gaps.length;
    var lastG=N-1-apps[apps.length-1];
    scores[n]+=Math.exp(-Math.abs(avg*PHI-lastG)/Math.max(1,avg))*3;
  }
  onP(0.3);
  // ② 거울수
  last.forEach(function(n){var m=46-n;if(m>=1&&m<=45)scores[m]+=1.2;});
  // ③ 소수 나선
  var spiral=[];
  for(var i=0;i<last.length;i++) for(var p=0;p<PRIMES.length;p++){var c=(last[i]+PRIMES[p])%45+1;if(spiral.indexOf(c)<0)spiral.push(c);}
  spiral.slice(0,15).forEach(function(n){scores[n]+=1.5;});
  onP(0.5);
  // ④ 좌표 격자
  var last5=draws.slice(-5);
  for(var i=0;i<last5.length;i++) for(var j=0;j<last5[i].nums.length;j++){
    var nn=last5[i].nums[j],row=Math.floor((nn-1)/9),col=(nn-1)%9;
    for(var c=1;c<=45;c++) if(Math.floor((c-1)/9)===row||(c-1)%9===col) scores[c]+=0.1;
  }
  // ⑤ 음양
  var yy=[0,0,0,0,0,0]; var last3=draws.slice(-3);
  for(var i=0;i<last3.length;i++) for(var j=0;j<6;j++) yy[j]+=(last3[i].nums[j]%2===1)?1:-1;
  var needOdd=yy.filter(function(v){return v>0;}).length;
  for(var n=1;n<=45;n++) if((n%2===1&&needOdd<3)||(n%2===0&&needOdd>=3)) scores[n]+=0.5;
  // ⑥ 디지털 루트
  var lastSum=last.reduce(function(a,b){return a+b;},0);
  var nextDR=(dRoot(lastSum)%9)+1;
  for(var n=1;n<=45;n++) if(dRoot(n)===nextDR) scores[n]+=0.8;
  onP(0.7);
  var ranked=[];for(var n=1;n<=45;n++)ranked.push({n,sc:scores[n]});
  ranked.sort(function(a,b){return b.sc-a.sc;});
  var pool=ranked.slice(0,20).map(function(r){return r.n;}).sort(function(a,b){return a-b;});
  var combos=[];
  function gen6(start,cur){if(cur.length===6){combos.push(cur.slice());return;}for(var i=start;i<pool.length;i++){cur.push(pool[i]);gen6(i+1,cur);cur.pop();if(combos.length>50000)return;}}
  gen6(0,[]);
  onP(0.85);
  combos=combos.filter(function(c){return vld(c,last,cfg);});
  var sc2=combos.map(function(c){var t=0;for(var i=0;i<c.length;i++)t+=scores[c[i]];return{nums:c,sc:t};});
  sc2.sort(function(a,b){return b.sc-a.sc;});
  var rar=bRar(draws,cfg.rarityW||600);
  var games=[],rars=[],maxG=cfg.games||5;
  for(var si=0;si<sc2.length&&games.length<maxG;si++){
    var c=sc2[si].nums,ok=true;
    for(var g=0;g<games.length;g++) if(games[g].filter(function(n){return c.indexOf(n)>=0;}).length>3){ok=false;break;}
    if(!ok) continue; games.push(c); rars.push(rCal(c,rar));
  }
  onP(1); onDone({games,rars,mode:"destiny"});
}

/**
 * sigTask — 14개 신호 점수 반환
 */
export function sigTask(draws,cfg){
  var st=bSt(draws,cfg,"s"+draws.length);
  var sm=scAll(draws,st,cfg);
  var arr=[];
  for(var n=1;n<=45;n++){
    var sc=sm.get(n);
    arr.push({n,gap:sc.gap,momentum:sc.momentum,transition:sc.transition,lag2:sc.lag2,
      decade:sc.decade,streak:sc.streak,sumZone:sc.sumZone,oddEven:sc.oddEven,
      base:sc.base,composite:sc.composite});
  }
  arr.sort(function(a,b){return b.composite-a.composite;});
  return arr;
}

/**
 * btTask — 워크포워드 백테스트
 */
export function btTask(allD,cfg,onP,onDone){
  var startIdx=Math.max(2,allD.length-45);
  var pts=[],hist={},total=allD.length-startIdx,cur=0;
  function step(){
    var bEnd=Math.min(cur+2,total);
    while(cur<bEnd){
      var i=startIdx+cur,train=allD.slice(0,i),target=allD[i];
      if(train.length<2){cur++;continue;}
      var st=bSt(train,cfg,"b"+i); var nn=nrm(scAll(train,st,cfg));
      var entries=[];nn.forEach(function(v,k){entries.push([k,v]);});
      entries.sort(function(a,b){return b[1]-a[1];});
      var top15=entries.slice(0,15).map(function(e){return e[0];});
      var topHit=target.nums.filter(function(n){return top15.indexOf(n)>=0;}).length;
      var matches=[];
      for(var g=0;g<6;g++){
        var pk=[],av=[];for(var ii=1;ii<=45;ii++)av.push(ii);
        while(pk.length<6){var c=pk1(av,nn,pk,st,cfg);pk.push(c);var idx=av.indexOf(c);if(idx>=0)av.splice(idx,1);}
        pk.sort(function(a,b){return a-b;});
        if(new Set(pk).size===6) matches.push(target.nums.filter(function(n){return pk.indexOf(n)>=0;}).length);
      }
      var avgM=matches.length>0?mean(matches):0;
      for(var m=0;m<matches.length;m++){var mk=String(matches[m]);hist[mk]=(hist[mk]||0)+1;}
      pts.push({drwNo:target.no,actual:target.nums,top15,topHit,avgMatch:avgM});
      cur++;
    }
    onP(cur/total);
    if(cur>=total){
      onDone({pts,
        t15r:pts.reduce(function(a,p){return a+p.topHit;},0)/(pts.length*6),
        avgM:pts.reduce(function(a,p){return a+p.avgMatch;},0)/Math.max(1,pts.length),
        hist,from:allD[startIdx].no,to:allD[allD.length-1].no
      });
    } else setTimeout(step,0);
  }
  setTimeout(step,0);
}

/**
 * saTask — SA 300회 자동 가중치 최적화
 */
export function saTask(draws,cfg,onP,onDone){
  stCache={};
  var iters=300, evS=Math.max(2,draws.length-40);
  function qBT(w){
    var pts=[]; var tcfg=JSON.parse(JSON.stringify(cfg)); tcfg.weights=w;
    for(var i=evS;i<draws.length;i++){
      var train=draws.slice(0,i); if(train.length<2) continue;
      var target=draws[i];
      var st=bSt(train,tcfg,"sa"+i); var nn=nrm(scAll(train,st,tcfg));
      var entries=[];nn.forEach(function(v,k){entries.push([k,v]);});
      entries.sort(function(a,b){return b[1]-a[1];});
      var top15=entries.slice(0,15).map(function(e){return e[0];});
      pts.push({topHit:target.nums.filter(function(n){return top15.indexOf(n)>=0;}).length});
    }
    return{t15r:pts.reduce(function(a,p){return a+p.topHit;},0)/(pts.length*6)};
  }
  var keys=Object.keys(cfg.weights), nK=keys.length;
  var bestW=JSON.parse(JSON.stringify(cfg.weights)), bestS=qBT(bestW).t15r;
  var curW=JSON.parse(JSON.stringify(bestW)), curS=bestS, TT=0.25, iter=0;
  var restarts=0,maxRestarts=3,itersPerRestart=Math.floor(iters/(maxRestarts+1));
  function step(){
    if(iter>=iters){onDone({bestWeights:bestW,bestScore:bestS});return;}
    iter++;
    var cand=JSON.parse(JSON.stringify(curW)); var phase=iter%15;
    if(phase===0){for(var k=0;k<nK;k++)cand[keys[k]]=Math.random()*0.6;}
    else if(phase<5){var nMut=2+Math.floor(Math.random()*2);for(var mm=0;mm<nMut;mm++){var ki=Math.floor(Math.random()*nK);var ss=0.15*(0.3+0.7*(1-iter/iters));cand[keys[ki]]=clamp(cand[keys[ki]]+(Math.random()*2-1)*ss,0,0.6);}}
    else{var ss2=0.08*(0.2+0.8*(1-iter/iters));for(var k2=0;k2<nK;k2++)cand[keys[k2]]=clamp(cand[keys[k2]]+(Math.random()*2-1)*ss2,0,0.6);}
    if(restarts<maxRestarts&&iter>0&&iter%itersPerRestart===0){restarts++;curW=JSON.parse(JSON.stringify(bestW));curS=bestS;TT=0.20*(1-restarts/(maxRestarts+1));}
    var sc=qBT(cand).t15r, delta=sc-curS;
    if(delta>=0||Math.exp(delta/Math.max(1e-6,TT))>Math.random()){curW=cand;curS=sc;if(sc>bestS){bestS=sc;bestW=JSON.parse(JSON.stringify(cand));}}
    TT*=0.99; onP(iter/iters,bestS); setTimeout(step,0);
  }
  setTimeout(step,0);
}

/** 캐시 초기화 */
export function clearCache(){ stCache={}; }

/** 기본 가중치 */
export var DEFAULT_WEIGHTS = {
  gap:0.20, momentum:0.15, transition:0.18, lag2:0.12, decade:0.08,
  streak:0.05, sumZone:0.06, oddEven:0.06, coldRecovery:0.15,
  endDigit:0.08, zoneBalance:0.10, sumTrend:0.08, pair:0.10, base:0.00
};

/** 기본 설정 생성 */
export function makeCfg(){
  return {
    weights:Object.assign({},DEFAULT_WEIGHTS),
    momW:80, pairW:120, transW:300, decW:600, rarityW:600,
    pairMode:"top2", pairClamp:0.35, temperature:1.25,
    attempts:250000, games:5, divMax:2, locked:[], risk:"balanced"
  };
}

/** 리스크 룰 UI용 노출 */
export var RISK_RULES = RRUI_export();
function RRUI_export(){
  return {
    stable:   {sn:90, sx:190, on:2, ox:4, mr:2, mo:1, an:7,  ax:10, pn:1, px:3},
    balanced: {sn:80, sx:200, on:1, ox:5, mr:3, mo:2, an:6,  ax:11, pn:0, px:4},
    risky:    {sn:60, sx:220, on:0, ox:6, mr:4, mo:3, an:4,  ax:13, pn:0, px:5}
  };
}

/** PP 상수 노출 */
export { PP };
