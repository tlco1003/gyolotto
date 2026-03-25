// src/main.jsx
// ── Vite + React 18 + Capacitor AdMob 보상형 광고 통합 완성본 ──
import React, { useState, useCallback, useEffect, useRef } from 'react';
import { createRoot } from 'react-dom/client';
import './style.css';
import { initAdMob, showRewardedAd } from './admob';
import {
  genTask, detGenTask, destinyTask,
  sigTask, btTask, saTask,
  clearCache, DEFAULT_WEIGHTS, RISK_RULES, PP
} from './engine/index.js';

// ── Engine 네임스페이스 래퍼 (기존 코드 호환)
var Engine = {
  genTask, detGenTask, destinyTask,
  sigTask, btTask, saTask,
  clearCache,
  PP
};

/* ═══ EMBEDDED DATA (1014-1214) ═══ */
var ED=[
[1014,2,6,12,19,22,43],[1015,3,8,16,29,38,43],[1016,10,18,20,23,27,44],[1017,3,5,7,11,25,45],
[1018,3,7,15,25,39,45],[1019,2,3,14,17,41,45],[1020,2,10,16,28,34,43],[1021,9,11,17,20,38,44],
[1022,4,10,11,14,28,34],[1023,2,5,15,18,25,38],[1024,5,6,12,30,33,38],[1025,3,6,13,34,39,43],
[1026,8,16,17,22,37,42],[1027,3,11,14,21,24,30],[1028,5,10,16,25,27,44],[1029,5,7,16,27,36,43],
[1030,6,7,12,14,22,44],[1031,3,17,19,28,34,44],[1032,10,16,18,22,26,45],[1033,3,4,12,18,36,43],
[1034,3,4,6,7,30,40],[1035,9,11,17,24,30,45],[1036,5,14,33,37,39,40],[1037,9,12,15,22,25,33],
[1038,2,3,6,15,21,39],[1039,5,9,22,25,32,33],[1040,7,11,24,26,28,36],[1041,3,12,13,17,36,41],
[1042,2,3,5,7,16,43],[1043,2,15,19,23,27,31],[1044,4,15,25,30,33,39],[1045,3,5,18,21,31,38],
[1046,1,2,4,8,21,44],[1047,3,5,21,24,26,29],[1048,1,8,11,18,19,43],[1049,9,15,16,21,24,38],
[1050,10,14,17,20,21,28],[1051,14,18,24,26,31,43],[1052,8,12,19,33,38,43],[1053,14,22,31,34,38,41],
[1054,2,7,12,14,22,45],[1055,14,20,23,27,29,43],[1056,5,12,16,33,36,45],[1057,14,20,23,25,30,41],
[1058,5,7,8,18,20,35],[1059,2,7,8,16,35,40],[1060,1,5,8,23,26,28],[1061,5,9,13,23,25,28],
[1062,3,4,6,11,16,30],[1063,7,14,18,22,23,34],[1064,3,5,10,17,32,43],[1065,5,8,22,24,36,44],
[1066,3,5,11,14,28,40],[1067,6,9,12,18,23,27],[1068,1,6,10,17,28,30],[1069,2,5,7,18,25,26],
[1070,4,7,9,12,35,45],[1071,5,7,14,25,33,39],[1072,2,6,14,18,20,28],[1073,9,13,17,19,22,26],
[1074,10,21,31,38,42,43],[1075,3,4,6,12,20,27],[1076,3,15,16,17,30,32],[1077,5,6,16,24,28,31],
[1078,2,15,16,18,23,28],[1079,1,10,12,13,29,38],[1080,9,15,20,28,30,42],[1081,1,5,7,9,29,44],
[1082,5,16,18,29,34,39],[1083,3,15,19,22,38,44],[1084,3,12,16,25,31,42],[1085,2,4,18,21,28,44],
[1086,10,15,25,29,33,45],[1087,1,3,10,15,17,45],[1088,8,14,16,19,29,45],[1089,1,3,4,22,25,39],
[1090,9,11,14,17,31,45],[1091,7,14,21,24,29,41],[1092,7,13,14,31,36,37],[1093,4,5,17,25,33,44],
[1094,5,10,15,19,26,45],[1095,2,6,9,28,33,43],[1096,7,12,14,18,35,45],[1097,1,5,7,15,28,42],
[1098,2,16,19,23,30,38],[1099,9,18,25,27,28,45],[1100,2,3,14,27,39,43],[1101,7,15,21,26,27,45],
[1102,2,4,5,21,36,43],[1103,3,6,12,16,35,45],[1104,9,15,30,37,39,44],[1105,1,3,5,22,32,40],
[1106,5,7,10,22,28,43],[1107,1,2,13,15,28,37],[1108,3,10,19,32,36,38],[1109,6,9,11,28,40,44],
[1110,2,3,7,19,25,45],[1111,11,15,24,25,30,44],[1112,3,14,18,29,35,37],[1113,2,3,9,13,20,35],
[1114,3,7,15,23,26,28],[1115,2,4,9,15,18,36],[1116,3,6,10,15,24,33],[1117,6,14,16,21,22,40],
[1118,3,8,20,25,31,42],[1119,8,16,18,26,28,43],[1120,7,12,16,22,41,43],[1121,7,10,15,21,23,28],
[1122,7,16,27,28,31,42],[1123,2,17,22,26,34,37],[1124,3,10,14,27,35,42],[1125,3,5,14,18,35,41],
[1126,1,6,11,13,33,36],[1127,8,13,22,31,39,40],[1128,3,8,11,15,23,34],[1129,3,4,14,17,22,45],
[1130,3,5,18,19,28,42],[1131,5,12,17,18,28,32],[1132,2,7,16,19,27,37],[1133,3,13,22,27,30,33],
[1134,1,2,6,14,40,45],[1135,2,13,16,19,35,38],[1136,2,8,13,28,33,45],[1137,3,7,12,19,24,38],
[1138,2,8,13,14,23,39],[1139,11,16,19,23,28,45],[1140,11,13,14,17,18,38],[1141,9,14,15,16,28,44],
[1142,3,12,20,27,32,44],[1143,12,15,17,26,34,45],[1144,3,10,23,29,35,45],[1145,7,11,20,26,35,44],
[1146,3,10,22,26,38,45],[1147,10,12,17,22,34,37],[1148,5,7,9,12,18,45],[1149,4,5,6,12,14,27],
[1150,12,14,27,29,30,45],[1151,5,8,18,23,24,44],[1152,5,17,18,22,33,34],[1153,1,2,7,30,37,43],
[1154,2,7,15,18,24,38],[1155,3,15,16,20,28,40],[1156,6,8,16,28,37,38],[1157,8,14,20,25,34,45],
[1158,3,5,17,19,27,45],[1159,3,4,7,22,28,33],[1160,7,18,20,22,35,41],[1161,3,4,7,14,30,33],
[1162,2,3,4,14,26,44],[1163,5,7,13,14,29,36],[1164,3,4,9,17,19,37],[1165,5,6,8,15,28,45],
[1166,3,8,16,30,31,37],[1167,5,6,9,11,30,38],[1168,4,8,14,23,30,44],[1169,11,15,19,20,38,44],
[1170,4,7,13,18,20,44],[1171,6,17,20,30,36,38],[1172,5,6,11,33,34,42],[1173,1,13,22,25,34,44],
[1174,7,15,16,25,30,37],[1175,2,3,4,16,28,42],[1176,3,14,15,20,22,45],[1177,8,10,17,26,27,34],
[1178,3,4,7,12,27,42],[1179,5,10,11,23,31,34],[1180,3,10,16,21,36,42],[1181,2,16,17,19,39,43],
[1182,1,6,11,12,20,34],[1183,3,11,13,18,28,38],[1184,2,9,11,16,44,45],[1185,3,11,21,25,28,44],
[1186,3,4,6,11,14,27],[1187,7,10,17,18,21,35],[1188,1,2,15,27,37,45],[1189,2,4,10,17,30,45],
[1190,4,7,8,14,31,33],[1191,2,4,8,14,21,45],[1192,2,7,11,24,30,44],[1193,3,5,6,18,34,39],
[1194,2,4,9,22,26,45],[1195,3,6,15,26,33,42],[1196,1,5,18,27,33,44],[1197,6,12,21,30,38,45],
[1198,2,14,16,21,34,44],[1199,7,10,18,25,38,39],[1200,3,11,22,36,37,44],[1201,3,12,16,18,33,38],
[1202,9,13,17,27,36,45],[1203,1,7,36,37,38,39],[1204,8,15,17,19,43,45],[1205,1,5,16,33,34,44],
[1206,11,16,19,21,27,31],[1207,5,10,11,19,44,45],[1208,6,12,33,38,39,45],[1209,1,12,18,40,41,45],
[1210,12,14,21,29,35,45],[1211,23,26,27,35,38,40],[1212,5,8,25,31,41,44],[1213,5,11,25,27,36,38],
[1214,10,15,19,27,30,33]
];
var INIT_DRAWS=ED.map(function(d){return{no:d[0],nums:d.slice(1,7).sort(function(a,b){return a-b}),bonus:d[7]||0}});

/* ═══ localStorage WRAPPER ═══ */
var ST={
  get:function(key){try{var v=localStorage.getItem("gyo_"+key);return v?Promise.resolve(JSON.parse(v)):Promise.resolve(null)}catch(e){return Promise.resolve(null)}},
  set:function(key,val){try{localStorage.setItem("gyo_"+key,JSON.stringify(val));return Promise.resolve(true)}catch(e){return Promise.resolve(null)}},
  del:function(key){try{localStorage.removeItem("gyo_"+key);return Promise.resolve(true)}catch(e){return Promise.resolve(null)}}
};

/* ═══ AUTO-UPDATE via API ═══ */
function fetchLatestViaAPI(currentMax){ return Promise.resolve([]); }

/* ═══ FALLBACK: dhlottery ═══ */
function fetchDHLottery(currentMax){
  var results=[];var no=currentMax+1;
  function fetchOne(){
    return fetch("https://www.dhlottery.co.kr/common.do?method=getLottoNumber&drwNo="+no)
      .then(function(r){return r.json()})
      .then(function(d){
        if(d.returnValue==="success"){
          results.push({no:d.drwNo,nums:[d.drwtNo1,d.drwtNo2,d.drwtNo3,d.drwtNo4,d.drwtNo5,d.drwtNo6].sort(function(a,b){return a-b}),bonus:d.bnusNo||0});
          no++;return fetchOne();
        }
        return results;
      }).catch(function(){return results});
  }
  return fetchOne();
}


/* ═══ UI HELPERS ═══ */
function clamp(x,lo,hi){return Math.max(lo,Math.min(hi,x))}
function comb(n,r){if(r<0||r>n)return 0;if(r===0||r===n)return 1;r=Math.min(r,n-r);var v=1;for(var i=0;i<r;i++)v=(v*(n-i))/(i+1);return v}
function acV(nums){var a=nums.slice().sort(function(x,y){return x-y});var d=new Set();for(var i=0;i<a.length;i++)for(var j=i+1;j<a.length;j++)d.add(a[j]-a[i]);return d.size}
function prC(nums){return nums.filter(function(n){if(n<2)return false;if(n%2===0)return n===2;for(var i=3;i*i<=n;i+=2)if(n%i===0)return false;return true}).length}
// DW moved to engine --> var DEFAULT_WEIGHTS={gap:0.20,momentum:0.15,transition:0.18,lag2:0.12,decade:0.08,streak:0.05,sumZone:0.06,oddEven:0.06,coldRecovery:0.15,endDigit:0.08,zoneBalance:0.10,sumTrend:0.08,pair:0.10,base:0.00};
// RRUI → engine/index.js의 RISK_RULES 사용
function makeCfg(){return{weights:Object.assign({},DEFAULT_WEIGHTS),momW:80,pairW:120,transW:300,decW:600,rarityW:600,pairMode:"top2",pairClamp:0.35,temperature:1.25,attempts:250000,games:5,divMax:2,locked:[],risk:"balanced"}}
function bCol(n){if(n<=10)return"#FBC400";if(n<=20)return"#69C8F2";if(n<=30)return"#FF7272";if(n<=40)return"#AAAAAA";return"#B0D840"}
function Bl(props){var n=props.n,sz=props.size||38,dl=props.delay||0,isLk=props.isLocked,anim=props.animate,onClick=props.onClick;var stt=useState(!anim),show=stt[0],setShow=stt[1];useEffect(function(){if(anim){var t=setTimeout(function(){setShow(true)},dl);return function(){clearTimeout(t)}}},[anim,dl]);return(<div onClick={onClick} style={{width:sz,height:sz,borderRadius:"50%",background:"radial-gradient(circle at 35% 30%,rgba(255,255,255,0.5),"+bCol(n)+" 55%,rgba(0,0,0,0.18))",display:"inline-flex",alignItems:"center",justifyContent:"center",fontWeight:800,fontSize:sz*0.36,color:"#fff",textShadow:"0 1px 2px rgba(0,0,0,0.5)",boxShadow:isLk?"0 0 0 3px #f5d76e,0 3px 8px rgba(212,175,55,0.5)":"0 2px 6px rgba(0,0,0,0.25),inset 0 -2px 4px rgba(0,0,0,0.15)",transform:show?"scale(1)":"scale(0)",opacity:show?1:0,transition:"transform 0.4s cubic-bezier(0.34,1.56,0.64,1) "+dl+"ms, opacity 0.3s ease "+dl+"ms",flexShrink:0,cursor:onClick?"pointer":"default"}}>{n}</div>);}
function SB(props){var pct=clamp((props.value||0)*100,0,100);return(<div style={{display:"flex",alignItems:"center",gap:5,marginBottom:2}}><div style={{width:52,fontSize:9,color:"#8b85a0",textAlign:"right"}}>{props.label}</div><div style={{flex:1,height:4,background:"rgba(255,255,255,0.06)",borderRadius:2,overflow:"hidden"}}><div style={{width:pct+"%",height:"100%",background:props.color,borderRadius:2,transition:"width 0.4s"}}/></div><div style={{width:24,fontSize:8,color:props.color,textAlign:"right"}}>{pct.toFixed(0)}</div></div>);}
function PBR(props){return(<div style={{margin:"8px 12px"}}><div style={{display:"flex",justifyContent:"space-between",fontSize:10,color:"#8b85a0",marginBottom:2}}><span>{props.text}{props.extra?" · "+props.extra:""}</span><span>{(props.value*100).toFixed(0)}%</span></div><div style={{height:5,background:"rgba(255,255,255,0.06)",borderRadius:3,overflow:"hidden"}}><div style={{width:(props.value*100)+"%",height:"100%",background:"linear-gradient(90deg,#d4af37,#f5d76e)",borderRadius:3,transition:"width 0.15s"}}/></div></div>);}

/* ═══ LOGIN ═══ */
function LoginScreen(props){
  var ns=useState(""),name=ns[0],setName=ns[1];var ls=useState(true),loading=ls[0],setLoading=ls[1];var es=useState(""),err=es[0],setErr=es[1];
  useEffect(function(){ST.get("user").then(function(u){if(u&&u.name){props.onLogin(u)}else{setLoading(false)}}).catch(function(){setLoading(false)})},[]);
  function doLogin(){var n=name.trim();if(!n){setErr("이름을 입력해주세요");return}var user={name:n,created:new Date().toISOString()};ST.set("user",user).then(function(){props.onLogin(user)})}
  if(loading)return(<div style={{minHeight:"100vh",background:"linear-gradient(170deg,#070b1e,#0f1635 40%,#1a1040)",display:"flex",alignItems:"center",justifyContent:"center"}}><div style={{textAlign:"center",color:"#8b85a0"}}><div style={{fontSize:40,marginBottom:8}}>🔮</div><div style={{fontSize:12}}>로딩중...</div></div></div>);
  return(<div style={{minHeight:"100vh",background:"linear-gradient(170deg,#070b1e,#0f1635 40%,#1a1040)",display:"flex",alignItems:"center",justifyContent:"center",padding:20}}><div style={{width:"100%",maxWidth:360,textAlign:"center"}}><div style={{fontSize:60,marginBottom:12}}>🔮</div><h1 style={{fontSize:22,fontWeight:900,margin:"0 0 4px",background:"linear-gradient(135deg,#d4af37,#f5d76e,#d4af37)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent"}}>로또엔진 vGYO</h1><p style={{fontSize:11,color:"#6b6580",margin:"0 0 28px"}}>나만의 실험실을 만들어보세요</p><div style={{background:"rgba(255,255,255,0.04)",borderRadius:16,border:"1px solid rgba(255,255,255,0.08)",padding:24}}><div style={{fontSize:12,color:"#c0b8d4",fontWeight:700,marginBottom:12,textAlign:"left"}}>닉네임 등록</div><input value={name} onChange={function(e){setName(e.target.value);setErr("")}} onKeyDown={function(e){if(e.key==="Enter")doLogin()}} placeholder="닉네임을 입력하세요" style={{width:"100%",padding:"12px 14px",borderRadius:10,border:"1px solid rgba(212,175,55,0.3)",background:"rgba(255,255,255,0.06)",color:"#e8e4f0",fontSize:14,outline:"none",boxSizing:"border-box",marginBottom:8}}/>{err&&<div style={{fontSize:11,color:"#FF7272",marginBottom:8}}>{err}</div>}<button onClick={doLogin} style={{width:"100%",padding:14,borderRadius:12,border:"none",fontSize:15,fontWeight:800,cursor:"pointer",background:"linear-gradient(135deg,#d4af37,#b8941f)",color:"#0a0e27",boxShadow:"0 4px 16px rgba(212,175,55,0.3)",marginTop:4}}>시작하기</button></div><p style={{fontSize:9,color:"#4a4560",marginTop:16}}>모든 설정과 실험 결과가 브라우저에 자동 저장됩니다</p></div></div>);
}

/* ═══ MAIN APP ═══ */
function MainApp(props){
  function buildPremiumStatusOneMonth(){
  var now = new Date();
  var expires = new Date(now);
  expires.setMonth(expires.getMonth() + 1);

  return {
    active: true,
    startedAt: now.toISOString(),
    expiresAt: expires.toISOString()
  };
}

function isPremiumActive(status){
  if(!status) return false;
  if(!status.active) return false;
  if(!status.expiresAt) return false;

  var expiresAtMs = new Date(status.expiresAt).getTime();
  if(!Number.isFinite(expiresAtMs)) return false;

  return Date.now() < expiresAtMs;
}

function getPremiumRemainingText(status){
  if(!status || !status.expiresAt) return "";
  var diff = new Date(status.expiresAt).getTime() - Date.now();
  if(diff <= 0) return "만료됨";

  var days = Math.ceil(diff / (1000 * 60 * 60 * 24));
  return days + "일 남음";
}
  var user=props.user;
  var dst=useState(INIT_DRAWS),allDraws=dst[0],setAllDraws=dst[1];
  var fst=useState("loading"),dataSrc=fst[0],setDataSrc=fst[1];
  var tst=useState("predict"),tab=tst[0],setTab=tst[1];
  var cst=useState(makeCfg()),cfg=cst[0],setCfg=cst[1];
  var rst=useState(null),results=rst[0],setResults=rst[1];
  var sst2=useState(null),signals=sst2[0],setSignals=sst2[1];
  var bst2=useState(null),bt=bst2[0],setBt=bst2[1];
  var ost=useState(null),optResult=ost[0],setOptResult=ost[1];
  var pst=useState(0),progress=pst[0],setProgress=pst[1];
  var cpst=useState(""),computing=cpst[0],setComputing=cpst[1];
  var obst=useState(null),optBest=obst[0],setOptBest=obst[1];
  var akst=useState(0),animKey=akst[0],setAnimKey=akst[1];
  var hst=useState([]),history=hst[0],setHistory=hst[1];
  // ── 변경 2: 초기 크레딧 5로 설정
  var adst=useState(5),adCredits=adst[0],setAdCredits=adst[1];
  var rcst=useState([]),realChecks=rcst[0],setRealChecks=rcst[1];
  var rgst=useState([""]),riGames=rgst[0],setRiGames=rgst[1];
  var rdst=useState(""),riDraw=rdst[0],setRiDraw=rdst[1];
  var gmst=useState("random"),genMode=gmst[0],setGenMode=gmst[1];
  var mdst=useState(false),showManual=mdst[0],setShowManual=mdst[1];
  var mist=useState(""),manualInput=mist[0],setManualInput=mist[1];
  // ── 프리미엄 상태
  // ── 프리미엄 상태
var prst=useState(null),premiumStatus=prst[0],setPremiumStatus=prst[1];
var isPremium = isPremiumActive(premiumStatus);
var premiumRemainingText = getPremiumRemainingText(premiumStatus);

function buildPremiumStatusOneMonth(){
  var now = new Date();
  var expires = new Date(now);
  expires.setMonth(expires.getMonth() + 1);

  return {
    active: true,
      startedAt: "2026-03-25T00:00:00.000Z",
     expiresAt: "2026-04-25T00:00:00.000Z"
  };
}

function isPremiumActive(status){
  if(!status) return false;
  if(!status.active) return false;
  if(!status.expiresAt) return false;

  var expiresAtMs = new Date(status.expiresAt).getTime();
  if(!Number.isFinite(expiresAtMs)) return false;

  return Date.now() < expiresAtMs;
}

function getPremiumRemainingText(status){
  if(!status || !status.expiresAt) return "";
  var diff = new Date(status.expiresAt).getTime() - Date.now();
  if(diff <= 0) return "만료됨";

  var days = Math.ceil(diff / (1000 * 60 * 60 * 24));
  return days + "일 남음";
}

var isPremium = isPremiumActive(premiumStatus);
var premiumRemainingText = getPremiumRemainingText(premiumStatus);

  var drawsRef=useRef(INIT_DRAWS);var initDone=useRef(false);
  useEffect(function(){drawsRef.current=allDraws},[allDraws]);

  // ── 변경 3: AdMob 초기화
  useEffect(function(){
    initAdMob().catch(function(err){console.error('[AdMob] init error:',err)});
  },[]);

 useEffect(function(){
  Promise.all([
    ST.get("cfg"),
    ST.get("history"),
    ST.get("bt"),
    ST.get("adCredits"),
    ST.get("realChecks"),
    ST.get("manualDraws"),
    ST.get("premiumStatus")
  ]).then(function(arr){
    if(arr[0]){
      arr[0].weights = Object.assign({}, DEFAULT_WEIGHTS, arr[0].weights || {});
      setCfg(arr[0]);
    }

    if(arr[1]) setHistory(arr[1]);
    if(arr[2]) setBt(arr[2]);
    if(typeof arr[3] === "number") setAdCredits(arr[3]);
    if(arr[4]) setRealChecks(arr[4]);

    if(arr[5] && arr[5].length > 0){
      var merged = INIT_DRAWS.concat(arr[5]);
      merged.sort(function(a,b){ return a.no - b.no; });
      setAllDraws(merged);
      setDataSrc(merged[merged.length-1].no + "회 ✅ (저장됨)");
    }

    if(arr[6] && isPremiumActive(arr[6])){
      setPremiumStatus(arr[6]);
    } else {
      setPremiumStatus(null);
      ST.del("premiumStatus");
    }

    initDone.current = true;
  });
},[]);
  useEffect(function(){if(initDone.current)ST.set("cfg",cfg)},[cfg]);
  useEffect(function(){if(history.length>0)ST.set("history",history)},[history]);
  useEffect(function(){if(initDone.current)ST.set("adCredits",adCredits)},[adCredits]);
  useEffect(function(){if(initDone.current)ST.set("realChecks",realChecks)},[realChecks]);
  useEffect(function(){var ok=true;var maxNo=INIT_DRAWS[INIT_DRAWS.length-1].no;setDataSrc(maxNo+"회 (업데이트 중...)");
    fetchLatestViaAPI(maxNo).then(function(newD){if(!ok)return;if(newD.length>0){var merged=INIT_DRAWS.concat(newD);merged.sort(function(a,b){return a.no-b.no});setAllDraws(merged);Engine.clearCache();setDataSrc(merged[merged.length-1].no+"회 ✅ +"+newD.length)}else{return fetchDHLottery(maxNo).then(function(newD2){if(!ok)return;if(newD2.length>0){var merged2=INIT_DRAWS.concat(newD2);merged2.sort(function(a,b){return a.no-b.no});setAllDraws(merged2);Engine.clearCache();setDataSrc(merged2[merged2.length-1].no+"회 ✅ +"+newD2.length)}else{setDataSrc(maxNo+"회 (최신)")}})}}).catch(function(){fetchDHLottery(maxNo).then(function(newD2){if(!ok)return;if(newD2.length>0){var merged2=INIT_DRAWS.concat(newD2);merged2.sort(function(a,b){return a.no-b.no});setAllDraws(merged2);Engine.clearCache();setDataSrc(merged2[merged2.length-1].no+"회 ✅ +"+newD2.length)}else{setDataSrc(maxNo+"회 (최신)")}}).catch(function(){setDataSrc(maxNo+"회 (오프라인)")})});
    return function(){ok=false}},[]);

  var addManualDraw=useCallback(function(){
    var parts=manualInput.replace(/[^0-9,+\s]/g,"").split(/[,\s+]+/).map(function(s){return parseInt(s.trim())}).filter(function(n){return n>=1&&n<=45});
    if(parts.length<6){alert("번호 6개를 입력해주세요");return}
    var nums=parts.slice(0,6).sort(function(a,b){return a-b});var bonus=parts[6]||0;
    var lastNo=allDraws[allDraws.length-1].no;var newDraw={no:lastNo+1,nums:nums,bonus:bonus};
    var merged=allDraws.concat([newDraw]);setAllDraws(merged);Engine.clearCache();
    setDataSrc(newDraw.no+"회 ✅ (수동)");setManualInput("");setShowManual(false);
    ST.set("manualDraws",merged.slice(INIT_DRAWS.length));
  },[manualInput,allDraws]);

  // ── 변경 4: watchAd — Capacitor AdMob 보상형 광고
  var watchAd=useCallback(function(){
    showRewardedAd({
      onReward: function(){
        // Google 정책: OnUserEarnedRewardListener 시점에 보상 지급
        setAdCredits(function(c){ return c + 1; });
        alert("광고 시청 완료! 크레딧 1회 충전되었습니다 🎟️");
      },
      onError: function(message){
        alert("광고를 불러오지 못했습니다: " + message);
      }
    });
  },[]);

  var handleGen=useCallback(function(){
    if(computing)return;
    // ── 프리미엄 잠금: destiny 모드
    if(!isPremium && genMode === "destiny"){
  alert("🔮 운명 예측은 프리미엄 기능입니다.\n월 4,900원으로 무제한 이용하세요!");
  return;
}

if(!isPremium && cfg.games > 5){
  setCfg(function(p){
    return Object.assign({}, p, { games: 5 });
  });
}
    if(adCredits<=0){alert("크레딧이 부족합니다! 광고를 시청해주세요.");return}
    setAdCredits(function(c){return c-1});setComputing("gen");setProgress(0);setResults(null);
    var fn=genMode==="det"?Engine.detGenTask:genMode==="destiny"?Engine.destinyTask:Engine.genTask;
    fn(drawsRef.current,cfg,function(p){setProgress(p)},function(res){setResults(res);setAnimKey(function(k){return k+1});setComputing("");var entry={date:new Date().toISOString(),games:res.games,rars:res.rars,risk:cfg.risk,temp:cfg.temperature,mode:genMode,forDraw:drawsRef.current[drawsRef.current.length-1].no+1};setHistory(function(prev){return[entry].concat(prev).slice(0,50)})})},[computing,cfg,adCredits,genMode,isPremium]);
  var handleSig=useCallback(function(){setSignals(Engine.sigTask(drawsRef.current,cfg))},[cfg]);
  useEffect(function(){if(tab==="signals")handleSig()},[tab,allDraws]);
  var handleBT=useCallback(function(){if(computing)return;setComputing("bt");setProgress(0);setBt(null);Engine.btTask(drawsRef.current,cfg,function(p){setProgress(p)},function(res){setBt(res);setComputing("");ST.set("bt",res)})},[computing,cfg]);
  var handleOpt=useCallback(function(){
    if(computing)return;
    if(!isPremium){alert("🤖 Auto-Tune은 프리미엄 기능입니다.\n월 4,900원으로 무제한 이용하세요!");return;}
    setComputing("sa");setProgress(0);setOptResult(null);setOptBest(null);Engine.saTask(drawsRef.current,cfg,function(p,best){setProgress(p);setOptBest(best)},function(res){setOptResult(res);setComputing("")})},[computing,cfg,isPremium]);
  var applyOpt=useCallback(function(){if(!optResult)return;setCfg(function(p){return Object.assign({},p,{weights:Object.assign({},optResult.bestWeights)})})},[optResult]);
  var toggleLock=useCallback(function(n){setCfg(function(prev){var l=prev.locked||[];if(l.indexOf(n)>=0)return Object.assign({},prev,{locked:l.filter(function(x){return x!==n})});if(l.length>=5)return prev;return Object.assign({},prev,{locked:l.concat([n])})})},[]);
  var doAddCheck=useCallback(function(){
    var drawNo=parseInt(riDraw);if(!drawNo){alert("회차 번호를 입력해주세요");return}
    var draw=allDraws.find(function(d){return d.no===drawNo});
    if(!draw){alert(drawNo+"회 당첨번호가 데이터에 없습니다.\n현재 보유: "+allDraws[0].no+"~"+allDraws[allDraws.length-1].no+"회");return}
    var validGames=[];
    for(var i=0;i<riGames.length;i++){var txt=riGames[i].trim();if(!txt)continue;var parsed=txt.replace(/[,\s]+/g," ").trim().split(" ").map(Number).filter(function(n){return n>=1&&n<=45});if(parsed.length!==6){alert("게임 "+(i+1)+": 6개 번호를 정확히 입력해주세요");return}if(new Set(parsed).size!==6){alert("게임 "+(i+1)+": 중복 번호가 있습니다");return}parsed.sort(function(a,b){return a-b});validGames.push(parsed);}
    if(validGames.length===0){alert("최소 1게임을 입력해주세요");return}
    var entries=validGames.map(function(g){var matched=g.filter(function(n){return draw.nums.indexOf(n)>=0}).length;var bonusHit=draw.bonus>0&&g.indexOf(draw.bonus)>=0;var prize=matched>=6?1:matched===5&&bonusHit?2:matched===5?3:matched===4?4:matched===3?5:0;return{drawNo:drawNo,myNums:g,actual:draw.nums,bonus:draw.bonus||0,matched:matched,bonusHit:bonusHit,prize:prize,date:new Date().toISOString()}});
    setRealChecks(function(prev){return prev.concat(entries)});setRiGames([""]);setRiDraw("");
  },[riGames,riDraw,allDraws]);
  
  var doLogout = useCallback(function(){
  if(!confirm("로그아웃합니다. 프리미엄 권한은 유지됩니다. 진행할까요?")) return;

  Promise.all([
    ST.del("user"),
    ST.del("cfg"),
    ST.del("history"),
    ST.del("bt"),
    ST.del("adCredits"),
    ST.del("realChecks"),
    ST.del("manualDraws")
    // premiumStatus는 삭제하지 않음
  ]).then(function(){
    props.onLogout();
  });
},[]);
  var C={margin:"8px 12px",background:"rgba(255,255,255,0.04)",borderRadius:14,border:"1px solid rgba(255,255,255,0.06)",padding:12};
  var LL={fontSize:10,fontWeight:700,color:"#d4af37",textTransform:"uppercase",letterSpacing:1,marginBottom:6};
  function tBtn(t2){return{flex:1,padding:"7px 0",borderRadius:10,border:"none",fontSize:10,fontWeight:700,cursor:"pointer",background:tab===t2?"rgba(212,175,55,0.2)":"transparent",color:tab===t2?"#f5d76e":"#6b6580"}}
  function mBtn(dis){return{display:"block",width:"calc(100% - 24px)",margin:"8px auto",padding:12,borderRadius:12,border:"none",fontSize:14,fontWeight:800,cursor:dis?"wait":"pointer",background:dis?"#333":"linear-gradient(135deg,#d4af37,#b8941f)",color:dis?"#888":"#0a0e27",boxShadow:dis?"none":"0 4px 16px rgba(212,175,55,0.3)"}}
  var rr=RISK_RULES[cfg.risk]||RISK_RULES.balanced;
  var lastDraw=allDraws[allDraws.length-1];var prevDraw=allDraws[allDraws.length-2];

  return(
    <div style={{minHeight:"100vh",background:"linear-gradient(170deg,#070b1e,#0f1635 40%,#1a1040)",color:"#e8e4f0",fontFamily:"system-ui,sans-serif",paddingBottom:40,maxWidth:480,margin:"0 auto"}}>
      <div style={{textAlign:"center",padding:"18px 14px 4px",background:"linear-gradient(180deg,rgba(212,175,55,0.12),transparent)"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"0 4px",marginBottom:4}}><span style={{fontSize:10,color:"#d4af37",fontWeight:700}}>👤 {user.name}</span><button onClick={doLogout} style={{fontSize:9,padding:"3px 10px",borderRadius:8,border:"1px solid rgba(255,114,114,0.2)",background:"transparent",color:"#FF7272",cursor:"pointer"}}>로그아웃</button></div>
        <h1 style={{fontSize:18,fontWeight:900,margin:0,background:"linear-gradient(135deg,#d4af37,#f5d76e,#d4af37)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent"}}>로또엔진 vGYO</h1>
        <p style={{fontSize:9,color:"#8b85a0",marginTop:2}}>14-Signal Hybrid Engine · Vote+Weight · Auto-Update</p>
        <div style={{display:"flex",gap:6,justifyContent:"center",marginTop:4,flexWrap:"wrap"}}>
          <span style={{fontSize:9,padding:"2px 8px",borderRadius:6,background:dataSrc.indexOf("✅")>=0?"rgba(74,222,128,0.15)":dataSrc.indexOf("중")>=0?"rgba(245,215,110,0.15)":"rgba(255,255,255,0.08)",color:dataSrc.indexOf("✅")>=0?"#4ade80":dataSrc.indexOf("중")>=0?"#f5d76e":"#8b85a0"}}>{dataSrc.indexOf("중")>=0&&<span style={{display:"inline-block",width:8,height:8,border:"2px solid #f5d76e",borderTop:"2px solid transparent",borderRadius:"50%",animation:"spin 1s linear infinite",marginRight:4,verticalAlign:"middle"}}/>}{dataSrc}</span>
          {history.length>0&&<span style={{fontSize:9,padding:"2px 8px",borderRadius:6,background:"rgba(74,222,128,0.1)",color:"#4ade80"}}>📊 {history.length}회 기록</span>}
       {isPremium
  ? <span style={{fontSize:9,padding:"2px 8px",borderRadius:6,background:"rgba(212,175,55,0.2)",color:"#f5d76e"}}>
      ∞ 무제한 · {premiumRemainingText}
    </span>
  : <span style={{fontSize:9,padding:"2px 8px",borderRadius:6,background:adCredits>0?"rgba(74,222,128,0.1)":"rgba(255,114,114,0.1)",color:adCredits>0?"#4ade80":"#FF7272"}}>
      🎟️ {adCredits}
    </span>
}
{isPremium
  ?<span style={{fontSize:9,padding:"2px 8px",borderRadius:6,background:"rgba(212,175,55,0.2)",color:"#f5d76e"}}>
      👑 프리미엄
    </span>   
    
    :<span
  onClick={function(){
    if(confirm("👑 프리미엄 (월 4,900원)\n\n✅ 🔮 운명 예측 무제한\n✅ 🤖 Auto-Tune 무제한\n✅ 광고 없이 예측\n\n(현재는 테스트 활성화)")){
      var nextPremium = buildPremiumStatusOneMonth();
      setPremiumStatus(nextPremium);
      ST.set("premiumStatus", nextPremium);
      alert("👑 프리미엄 활성화! (" + getPremiumRemainingText(nextPremium) + ")");
    }
  }}
  style={{
    fontSize:9,
    padding:"2px 8px",
    borderRadius:6,
    background:"rgba(212,175,55,0.08)",
    color:"#d4af37",
    cursor:"pointer",
    border:"1px solid rgba(212,175,55,0.3)"
  }}
>
  👑 프리미엄
</span>
;ST.set("isPremium",{
  active: true,
  startedAt: "...",
  expiresAt: "..."
})}}}} style={{fontSize:9,padding:"2px 8px",borderRadius:6,background:"rgba(212,175,55,0.08)",color:"#d4af37",cursor:"pointer",border:"1px solid rgba(212,175,55,0.3)"}}>👑 프리미엄</span>
          }
        </div>
      </div>

      {lastDraw&&<div style={C}><div style={{display:"flex",justifyContent:"space-between",marginBottom:5}}><div style={{fontSize:12,fontWeight:800,color:"#c0b8d4"}}>제 {lastDraw.no}회</div><div style={{display:"flex",gap:6,alignItems:"center"}}><div style={{fontSize:9,color:"#4ade80"}}>{dataSrc.indexOf("수동")>=0||dataSrc.indexOf("저장")>=0?"수동":"최신"}</div><button onClick={function(){setShowManual(function(v){return!v})}} style={{fontSize:9,padding:"2px 8px",borderRadius:6,border:"1px solid rgba(212,175,55,0.3)",background:showManual?"rgba(212,175,55,0.15)":"transparent",color:"#d4af37",cursor:"pointer"}}>{showManual?"닫기":"+ 회차 추가"}</button></div></div><div style={{display:"flex",gap:4,justifyContent:"center",flexWrap:"wrap",alignItems:"center"}}>{lastDraw.nums.map(function(n){return <Bl key={n} n={n} size={34}/>})}{lastDraw.bonus>0&&<span style={{fontSize:11,color:"#6b6580",margin:"0 2px"}}>+</span>}{lastDraw.bonus>0&&<div style={{width:34,height:34,borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center",fontSize:13,fontWeight:800,background:"transparent",color:bCol(lastDraw.bonus),border:"2px dashed "+bCol(lastDraw.bonus)}}>{lastDraw.bonus}</div>}</div>{showManual&&<div style={{marginTop:8,padding:8,borderRadius:8,background:"rgba(212,175,55,0.06)",border:"1px solid rgba(212,175,55,0.15)"}}><div style={{fontSize:9,color:"#d4af37",marginBottom:4}}>다음 회차 ({lastDraw.no+1}회) 당첨번호 입력</div><input value={manualInput} onChange={function(e){setManualInput(e.target.value)}} placeholder="예: 10,15,19,27,30,33+14 (보너스)" onKeyDown={function(e){if(e.key==="Enter")addManualDraw()}} style={{width:"100%",padding:"8px 10px",borderRadius:6,border:"1px solid rgba(212,175,55,0.3)",background:"rgba(255,255,255,0.06)",color:"#e8e4f0",fontSize:13,outline:"none",boxSizing:"border-box",marginBottom:6}}/><div style={{display:"flex",gap:6}}><button onClick={addManualDraw} style={{flex:1,padding:"7px 0",borderRadius:6,border:"none",fontSize:10,fontWeight:700,cursor:"pointer",background:"rgba(74,222,128,0.15)",color:"#4ade80"}}>✅ 추가</button><button onClick={function(){if(confirm("수동 추가한 회차를 모두 삭제할까요?")){setAllDraws(INIT_DRAWS.slice());Engine.clearCache();ST.del("manualDraws");setDataSrc(INIT_DRAWS[INIT_DRAWS.length-1].no+"회 (초기화)");setShowManual(false)}}} style={{padding:"7px 12px",borderRadius:6,border:"none",fontSize:10,cursor:"pointer",background:"rgba(255,114,114,0.1)",color:"#FF7272"}}>초기화</button></div><div style={{fontSize:8,color:"#6b6580",marginTop:4}}>번호 6개 + 보너스 (쉼표/공백/+ 구분)</div></div>}{prevDraw&&!showManual&&<div style={{textAlign:"center",marginTop:6,fontSize:9,color:"#6b6580"}}>이전: {prevDraw.no}회 [{prevDraw.nums.join(",")}]{prevDraw.bonus>0?" +"+prevDraw.bonus:""}</div>}</div>}

      <div style={{display:"flex",gap:2,margin:"6px 12px 0",background:"rgba(255,255,255,0.05)",borderRadius:12,padding:3}}>{[["predict","🎯 예측"],["signals","📡 시그널"],["backtest","🔬 검증"],["real","✅ 실전"],["history","📋 기록"],["lab","⚗️ 실험"],["guide","📖"]].map(function(pair){return <button key={pair[0]} style={tBtn(pair[0])} onClick={function(){setTab(pair[0])}}>{pair[1]}</button>})}</div>
      {computing&&<PBR value={progress} text={computing==="sa"?"AI Auto-Tune...":computing==="bt"?"워크포워드...":"패턴 매칭..."} extra={computing==="sa"&&optBest!=null?"best="+optBest.toFixed(4):null}/>}

      {tab==="predict"&&<div>
        <div style={C}><div style={LL}>🔒 번호 잠금</div><div style={{display:"flex",flexWrap:"wrap",gap:3,justifyContent:"center"}}>{Array.from({length:45},function(_,i){return i+1}).map(function(n){var isL=(cfg.locked||[]).indexOf(n)>=0;return <div key={n} onClick={function(){toggleLock(n)}} style={{width:26,height:26,borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center",fontSize:9,fontWeight:700,cursor:"pointer",background:isL?bCol(n):"rgba(255,255,255,0.05)",color:isL?"#fff":"#6b6580",border:isL?"2px solid #f5d76e":"1px solid rgba(255,255,255,0.07)"}}>{n}</div>})}</div></div>
        <div style={Object.assign({},C,{display:"flex",gap:8,flexWrap:"wrap"})}>
          <div style={{flex:1,minWidth:80}}><div style={{fontSize:10,color:"#c0b8d4"}}>게임: <strong style={{color:"#f5d76e"}}>{cfg.games}</strong>{!isPremium&&<span style={{fontSize:8,color:"#d4af37"}}> (무료 최대5)</span>}</div><input type="range" min={1} max={isPremium?15:5}
          value={cfg.games} onChange={function(e){setCfg(function(p){return Object.assign({},p,{games:+e.target.value})})}} style={{width:"100%",accentColor:"#d4af37"}}/></div>
          <div style={{flex:1,minWidth:80}}><div style={{fontSize:10,color:"#c0b8d4"}}>다양성: <strong style={{color:"#f5d76e"}}>{cfg.divMax}</strong></div><input type="range" min={0} max={5} value={cfg.divMax} onChange={function(e){setCfg(function(p){return Object.assign({},p,{divMax:+e.target.value})})}} style={{width:"100%",accentColor:"#d4af37"}}/></div>
          <div style={{flex:1,minWidth:80}}><div style={{fontSize:10,color:"#c0b8d4"}}>온도: <strong style={{color:"#f5d76e"}}>{cfg.temperature.toFixed(2)}</strong></div><input type="range" min={0.5} max={3} step={0.05} value={cfg.temperature} onChange={function(e){setCfg(function(p){return Object.assign({},p,{temperature:+e.target.value})})}} style={{width:"100%",accentColor:"#d4af37"}}/></div>
        </div>
        <div style={{display:"flex",gap:4,margin:"0 12px 6px"}}>{[["stable","🛡️ 안정"],["balanced","⚖️ 기본"],["risky","🔥 공격"]].map(function(pair){var m=pair[0],l=pair[1],isA=cfg.risk===m;return <button key={m} onClick={function(){setCfg(function(p){return Object.assign({},p,{risk:m})})}} style={{flex:1,padding:"7px 0",borderRadius:8,border:"none",fontSize:10,fontWeight:700,cursor:"pointer",background:isA?(m==="stable"?"rgba(74,222,128,0.15)":m==="risky"?"rgba(255,114,114,0.15)":"rgba(212,175,55,0.15)"):"rgba(255,255,255,0.04)",color:isA?(m==="stable"?"#4ade80":m==="risky"?"#FF7272":"#f5d76e"):"#6b6580"}}>{l}</button>})}</div>
        <div style={{display:"flex",gap:4,margin:"0 12px 8px"}}>
          {[["det","🔒 확정형","점수 순위 확정"],["random","🎲 랜덤형","확률 샘플링"],["destiny","🔮 운명",isPremium?"황금비+거울+나선":"👑 프리미엄"]].map(function(pair){var m=pair[0],l=pair[1],isA=genMode===m;var cols={det:"rgba(212,175,55,",random:"rgba(105,200,242,",destiny:"rgba(168,85,247,"};var tcols={det:"#f5d76e",random:"#69C8F2",destiny:"#A855F7"};return <button key={m} onClick={function(){setGenMode(m)}} style={{flex:1,padding:"8px 0",borderRadius:8,border:isA?"1.5px solid "+cols[m]+"0.5)":"1px solid rgba(255,255,255,0.06)",fontSize:10,fontWeight:800,cursor:"pointer",background:isA?cols[m]+"0.12)":"rgba(255,255,255,0.03)",color:isA?tcols[m]:"#6b6580",opacity:m==="destiny"&&!isPremium?0.6:1}}><div>{l}</div><div style={{fontSize:8,fontWeight:400,marginTop:2,opacity:0.7}}>{pair[2]}</div></button>})}
        </div>
       <div style={{margin:"8px 12px",padding:10,borderRadius:12,background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.08)"}}>
  {isPremium
    ?<div style={{textAlign:"center",fontSize:11,color:"#f5d76e",fontWeight:800,padding:"6px 0"}}>👑 프리미엄 — {premiumRemainingText}
    </div>
    :<div>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
        <div><div style={{fontSize:11,fontWeight:800,color:adCredits>0?"#4ade80":"#FF7272"}}>🎟️ 크레딧: {adCredits}회</div><div style={{fontSize:9,color:"#6b6580"}}>예측 1회당 1크레딧 소모</div></div>
        <button onClick={watchAd} style={{padding:"8px 14px",borderRadius:10,border:"none",fontSize:11,fontWeight:800,cursor:"pointer",background:"linear-gradient(135deg,#FF7272,#ff5252)",color:"#fff"}}>📺 광고로 충전</button>
      </div>
      <button onClick={function(){if(confirm("👑 프리미엄 (월 4,900원)\n\n✅ 광고 없이 무제한 예측\n✅ 🔮 운명 예측\n✅ 🤖 Auto-Tune\n\n구독하시겠습니까?")){setIsPremium(true);ST.set("isPremium",true);alert("👑 프리미엄 활성화!")}}} style={{width:"100%",padding:"10px 0",borderRadius:10,border:"1.5px solid rgba(212,175,55,0.5)",fontSize:12,fontWeight:800,cursor:"pointer",background:"rgba(212,175,55,0.1)",color:"#f5d76e"}}>👑 프리미엄 구독 — 월 4,900원</button>
    </div>
  }
</div>
        <button onClick={handleGen} disabled={!isPremium && adCredits <= 0} 
        disabled={!!computing || (!isPremium && adCredits <= 0)}
        style={mBtn(!isPremium && adCredits <= 0)}>
          {computing==="gen"
  ? "⏳ " + (progress*100).toFixed(0) + "%"
  : isPremium
    ? (
        genMode==="det"
          ? "🔒 확정 예측"
          : genMode==="destiny"
            ? "🔮 운명 예측"
            : "🎲 랜덤 예측"
      )
    : adCredits<=0
      ? "🔒 크레딧 부족 (광고 시청 필요)"
      : genMode==="det"
        ? "🔒 확정 예측 (크레딧 1)"
        : genMode==="destiny"
          ? "🔮 운명 예측 (크레딧 1)"
          : "🎲 랜덤 예측 (크레딧 1)"
}
          </button>
        {results&&<div style={{margin:"4px 12px 0",padding:"4px 8px",borderRadius:6,background:results.mode==="det"?"rgba(212,175,55,0.08)":results.mode==="destiny"?"rgba(168,85,247,0.08)":"rgba(105,200,242,0.08)",textAlign:"center",fontSize:9,color:results.mode==="det"?"#d4af37":results.mode==="destiny"?"#A855F7":"#69C8F2",fontWeight:700}}>{results.mode==="det"?"🔒 확정형: 핵심 "+(results.core?results.core.length:4)+"번호 고정 → ["+((results.core||[]).join(", "))+"]":results.mode==="destiny"?"🔮 운명: φ황금비 × 거울수 × 소수나선 × 좌표격자 × 음양균형 × DR순환":"🎲 랜덤형: 매번 다른 조합 생성"}</div>}
        {results&&results.games.map(function(g,i){var coreNums=results.core||[];return <div key={animKey+"-"+i} style={C}><div style={{display:"flex",justifyContent:"space-between",marginBottom:5}}><span style={{fontSize:11,fontWeight:800,color:"#d4af37"}}>게임 {String(i+1).padStart(2,"0")}</span><div style={{textAlign:"right"}}><span style={{fontSize:9,color:"#6b6580"}}>합{g.reduce(function(a,b){return a+b},0)} 홀{g.filter(function(n){return n%2===1}).length} AC{acV(g)} 소수{prC(g)}</span><div style={{fontSize:10,fontWeight:800,color:results.rars[i]>0.6?"#FF7272":results.rars[i]>0.3?"#f5d76e":"#4ade80"}}>레어리티 {(results.rars[i]*100).toFixed(0)}</div></div></div><div style={{display:"flex",gap:6,justifyContent:"center",flexWrap:"wrap"}}>{g.map(function(n,j){var isCore=coreNums.indexOf(n)>=0;var isLocked=(cfg.locked||[]).indexOf(n)>=0;return <div key={n} style={{position:"relative"}}><Bl key={n} n={n} size={42} delay={j*80+i*30} animate isLocked={isLocked}/>{isCore&&<div style={{position:"absolute",top:-2,right:-2,width:14,height:14,borderRadius:"50%",background:"#d4af37",display:"flex",alignItems:"center",justifyContent:"center",fontSize:7,fontWeight:900,color:"#0a0e27",boxShadow:"0 1px 4px rgba(212,175,55,0.5)"}}>★</div>}</div>})}</div></div>})}
        {!results&&!computing&&<div style={{textAlign:"center",padding:"28px 20px",color:"#6b6580"}}><div style={{fontSize:40,marginBottom:8}}>🔮</div><div style={{fontSize:12,fontWeight:600}}>엔진 준비 완료</div></div>}
      </div>}

      {tab==="signals"&&<div><div style={C}><div style={LL}>상위 20 ({allDraws.length}회 · 14-Signal)</div>{signals&&signals.slice(0,20).map(function(s){return <div key={s.n} style={{marginBottom:6,paddingBottom:4,borderBottom:"1px solid rgba(255,255,255,0.03)"}}><div style={{display:"flex",alignItems:"center",gap:5,marginBottom:2}}><Bl n={s.n} size={22}/><span style={{fontSize:10,fontWeight:700}}>{s.n}번</span><span style={{fontSize:8,color:"#d4af37",marginLeft:"auto"}}>{(s.composite*1000).toFixed(1)}</span></div><SB label="주기" value={s.gap} color="#f5d76e"/><SB label="모멘텀" value={s.momentum*8} color="#69C8F2"/><SB label="전이" value={s.transition*8} color="#4ade80"/><SB label="2차전이" value={s.lag2*8} color="#36d399"/><SB label="대역" value={s.decade*8} color="#B0D840"/><SB label="연속" value={s.streak} color="#FF9F43"/><SB label="합구간" value={s.sumZone*8} color="#A78BFA"/><SB label="홀짝" value={s.oddEven*8} color="#F472B6"/><SB label="냉각복귀" value={s.coldRecovery} color="#00D2FF"/><SB label="끝수" value={s.endDigit*8} color="#FF6B9D"/><SB label="구간균형" value={s.zoneBalance} color="#7FFF00"/><SB label="합방향" value={s.sumTrend} color="#FFD700"/></div>})}</div></div>}

      {tab==="backtest"&&<div><div style={C}><div style={LL}>워크포워드 (최근 45회, 6-Game)</div><button onClick={handleBT} disabled={!!computing} style={mBtn(!!computing)}>{computing==="bt"?"⏳ "+(progress*100).toFixed(0)+"%":"🔬 실행"}</button></div>
        {bt&&<div><div style={C}><div style={LL}>#{bt.from}~#{bt.to}</div><div style={{fontSize:11}}>Top15: <strong style={{color:"#4ade80"}}>{(bt.t15r*100).toFixed(2)}%</strong> 평균: <strong style={{color:"#f5d76e"}}>{bt.avgM.toFixed(3)}/6</strong></div></div>
        <div style={C}><div style={LL}>매치</div>{[6,5,4,3,2,1,0].map(function(m){var cnt=bt.hist[String(m)]||0;var tot=Object.values(bt.hist).reduce(function(a,b){return a+b},0)||1;if(!cnt)return null;return <div key={m} style={{display:"flex",alignItems:"center",gap:6,marginBottom:3}}><div style={{width:30,fontSize:10,fontWeight:700,color:m>=4?"#4ade80":"#8b85a0"}}>{m}개</div><div style={{flex:1,height:6,background:"rgba(255,255,255,0.06)",borderRadius:3,overflow:"hidden"}}><div style={{width:(cnt/tot*100)+"%",height:"100%",background:m>=4?"#4ade80":"#6b6580",borderRadius:3}}/></div><div style={{width:50,fontSize:9,color:"#8b85a0"}}>{cnt}</div></div>})}</div>
        <div style={C}><div style={LL}>회차별 상세</div>{bt.pts.slice().reverse().map(function(p){return <div key={p.drwNo} style={{marginBottom:6,paddingBottom:5,borderBottom:"1px solid rgba(255,255,255,0.04)"}}><div style={{display:"flex",justifyContent:"space-between",fontSize:10,marginBottom:3}}><span style={{fontWeight:700,color:"#c0b8d4"}}>{p.drwNo}회</span><span style={{color:p.topHit>=4?"#4ade80":p.topHit>=3?"#f5d76e":"#6b6580",fontWeight:700}}>Top15:{p.topHit}/6 생성:{p.avgMatch.toFixed(1)}</span></div><div style={{display:"flex",gap:3,flexWrap:"wrap"}}>{p.actual.map(function(n){var hit=p.top15.indexOf(n)>=0;return <div key={n} style={{width:28,height:28,borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center",fontSize:9,fontWeight:800,background:hit?bCol(n):"rgba(255,255,255,0.06)",color:hit?"#fff":"#6b6580",border:hit?"none":"1px solid rgba(255,255,255,0.08)",boxShadow:hit?"0 1px 4px rgba(0,0,0,0.3)":"none"}}>{n}</div>})}</div><div style={{marginTop:3,fontSize:8,color:"#4a4560"}}>Top15: [{p.top15.join(",")}]</div></div>})}</div></div>}
      </div>}

      {tab==="real"&&<div>
        <div style={C}><div style={LL}>✅ 실전 번호 체크</div><div style={{fontSize:10,color:"#8b85a0",marginBottom:10}}>구매한 번호를 모두 입력하고 한 번에 비교하세요 (최대 10장)</div>
          <div style={{marginBottom:8}}><div style={{fontSize:10,color:"#c0b8d4",marginBottom:4}}>회차 번호</div><input value={riDraw} onChange={function(e){setRiDraw(e.target.value)}} placeholder={"예: "+lastDraw.no} style={{width:"100%",padding:"10px 12px",borderRadius:8,border:"1px solid rgba(212,175,55,0.3)",background:"rgba(255,255,255,0.06)",color:"#e8e4f0",fontSize:14,outline:"none",boxSizing:"border-box"}}/></div>
          <div style={{fontSize:10,color:"#c0b8d4",marginBottom:6}}>내가 산 번호 ({riGames.length}장)</div>
          {riGames.map(function(g,idx){return <div key={idx} style={{display:"flex",gap:6,alignItems:"center",marginBottom:6}}><div style={{width:24,height:24,borderRadius:"50%",background:"rgba(212,175,55,0.15)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:10,fontWeight:800,color:"#f5d76e",flexShrink:0}}>{idx+1}</div><input value={g} onChange={function(e){var v=e.target.value;var i=idx;setRiGames(function(prev){var n=prev.slice();n[i]=v;return n})}} placeholder="예: 3, 11, 22, 27, 36, 44" onKeyDown={function(e){if(e.key==="Enter"){if(idx===riGames.length-1&&riGames.length<10)setRiGames(function(p){return p.concat([""])});else doAddCheck()}}} style={{flex:1,padding:"9px 10px",borderRadius:8,border:"1px solid rgba(255,255,255,0.1)",background:"rgba(255,255,255,0.06)",color:"#e8e4f0",fontSize:13,outline:"none",boxSizing:"border-box"}}/>{riGames.length>1&&<button onClick={function(){var i=idx;setRiGames(function(p){return p.filter(function(_,j){return j!==i})})}} style={{width:24,height:24,borderRadius:"50%",border:"none",background:"rgba(255,114,114,0.15)",color:"#FF7272",fontSize:14,cursor:"pointer",flexShrink:0,display:"flex",alignItems:"center",justifyContent:"center"}}>×</button>}</div>})}
          <div style={{display:"flex",gap:6,marginBottom:10}}>{riGames.length<10&&<button onClick={function(){setRiGames(function(p){return p.concat([""])})}} style={{flex:1,padding:"8px 0",borderRadius:8,border:"1px dashed rgba(212,175,55,0.3)",background:"transparent",color:"#d4af37",fontSize:11,fontWeight:700,cursor:"pointer"}}>+ 게임 추가 ({riGames.length}/10)</button>}{riGames.length>1&&<button onClick={function(){setRiGames([""])}} style={{padding:"8px 14px",borderRadius:8,border:"1px solid rgba(255,255,255,0.08)",background:"transparent",color:"#6b6580",fontSize:10,cursor:"pointer"}}>초기화</button>}</div>
          <button onClick={doAddCheck} style={{width:"100%",padding:12,borderRadius:12,border:"none",fontSize:14,fontWeight:800,cursor:"pointer",background:"linear-gradient(135deg,#4ade80,#22c55e)",color:"#0a0e27",boxShadow:"0 4px 16px rgba(74,222,128,0.3)"}}>✅ {riGames.filter(function(g){return g.trim()}).length}장 한번에 비교</button>
        </div>
        {realChecks.length>0&&<div style={C}><div style={LL}>📊 누적 통계 ({realChecks.length}게임)</div>{(function(){var total=realChecks.length;var prizes={1:0,2:0,3:0,4:0,5:0};for(var i=0;i<realChecks.length;i++){var p=realChecks[i].prize||0;if(p>=1&&p<=5)prizes[p]++}var prize5=prizes[5]*5000,prize4=prizes[4]*50000,prize3=prizes[3]*1400000,prize2=prizes[2]*50000000;var cost=total*1000;var income=prize5+prize4+prize3+prize2;return(<div><div style={{display:"flex",justifyContent:"space-around",marginBottom:10}}><div style={{textAlign:"center"}}><div style={{fontSize:20,fontWeight:900,color:"#f5d76e"}}>{total}</div><div style={{fontSize:9,color:"#6b6580"}}>총 게임</div></div><div style={{textAlign:"center"}}><div style={{fontSize:20,fontWeight:900,color:prizes[5]+prizes[4]+prizes[3]+prizes[2]+prizes[1]>0?"#4ade80":"#6b6580"}}>{prizes[5]+prizes[4]+prizes[3]+prizes[2]+prizes[1]}</div><div style={{fontSize:9,color:"#6b6580"}}>5등 이상</div></div><div style={{textAlign:"center"}}><div style={{fontSize:20,fontWeight:900,color:"#4ade80"}}>{total>0?((prizes[5]+prizes[4]+prizes[3]+prizes[2]+prizes[1])/total*100).toFixed(1)+"%":"0%"}</div><div style={{fontSize:9,color:"#6b6580"}}>적중률</div></div><div style={{textAlign:"center"}}><div style={{fontSize:20,fontWeight:900,color:income>=cost?"#4ade80":"#FF7272"}}>{income>=1000000?(income/10000).toFixed(0)+"만":income.toLocaleString()}</div><div style={{fontSize:9,color:"#6b6580"}}>당첨금</div></div></div><div style={{fontSize:10,color:"#8b85a0",textAlign:"center"}}>투자: {cost.toLocaleString()}원 → 회수: {income.toLocaleString()}원</div></div>)})()}</div>}
        {realChecks.length>0&&<div style={C}>
          <div style={LL}>📋 전체 기록</div>
          {(function(){var groups={},order=[];for(var i=realChecks.length-1;i>=0;i--){var rc=realChecks[i];var k=String(rc.drawNo);if(!groups[k]){groups[k]={drawNo:rc.drawNo,actual:rc.actual,bonus:rc.bonus||0,games:[],date:rc.date};order.push(k)}groups[k].games.push(rc)}return order.map(function(k){var gr=groups[k];var bestPrize=Math.min.apply(null,gr.games.map(function(g){return g.prize||99}).filter(function(p){return p>0}));if(bestPrize===Infinity||bestPrize===99)bestPrize=0;var bestLabel=bestPrize===1?"1등 🏆":bestPrize===2?"2등 🎉":bestPrize===3?"3등 🥈":bestPrize===4?"4등 💰":bestPrize===5?"5등 ✅":"미당첨";var bestColor=bestPrize<=2?"#FF7272":bestPrize===3?"#f5d76e":bestPrize===4?"#4ade80":bestPrize===5?"#69C8F2":"#6b6580";return(<div key={k} style={{marginBottom:12,paddingBottom:10,borderBottom:"1px solid rgba(255,255,255,0.06)"}}><div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6}}><div><span style={{fontSize:12,fontWeight:800,color:"#c0b8d4"}}>{gr.drawNo}회</span><span style={{fontSize:9,color:"#6b6580",marginLeft:6}}>{gr.games.length}장</span></div><span style={{fontSize:13,fontWeight:900,color:bestColor}}>{bestLabel}</span></div><div style={{display:"flex",gap:3,marginBottom:6,alignItems:"center",flexWrap:"wrap"}}><span style={{fontSize:9,color:"#d4af37"}}>당첨:</span>{gr.actual.map(function(n){return <div key={n} style={{width:24,height:24,borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center",fontSize:9,fontWeight:700,background:bCol(n),color:"#fff"}}>{n}</div>})}{gr.bonus>0&&<span style={{fontSize:9,color:"#6b6580"}}>+</span>}{gr.bonus>0&&<div style={{width:24,height:24,borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center",fontSize:9,fontWeight:700,background:"transparent",color:bCol(gr.bonus),border:"2px dashed "+bCol(gr.bonus)}}>{gr.bonus}</div>}</div>{gr.games.map(function(rc,gi){var pLabel=rc.prize===1?"1등🏆":rc.prize===2?"2등🎉":rc.prize===3?"3등🥈":rc.prize===4?"4등💰":rc.prize===5?"5등✅":rc.matched+"개";var pColor=rc.prize<=2?"#FF7272":rc.prize===3?"#f5d76e":rc.prize===4?"#4ade80":rc.prize===5?"#69C8F2":"#6b6580";return(<div key={gi} style={{display:"flex",gap:3,marginBottom:4,alignItems:"center",flexWrap:"wrap"}}><div style={{width:18,fontSize:9,color:"#6b6580",fontWeight:700,flexShrink:0}}>{gi+1}</div>{rc.myNums.map(function(n){var hit=rc.actual.indexOf(n)>=0;var isBonus=!hit&&rc.bonus>0&&n===rc.bonus;return <div key={n} style={{width:30,height:30,borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center",fontSize:10,fontWeight:800,background:hit?bCol(n):isBonus?"transparent":"rgba(255,255,255,0.06)",color:hit?"#fff":isBonus?bCol(n):"#555",border:hit?"2px solid #f5d76e":isBonus?"2px dashed #FF9F43":"1px solid rgba(255,255,255,0.08)",boxShadow:hit?"0 0 8px rgba(212,175,55,0.4)":isBonus?"0 0 6px rgba(255,159,67,0.3)":"none"}}>{n}</div>})}<span style={{fontSize:9,fontWeight:700,color:pColor,marginLeft:4}}>{pLabel}</span></div>)})}<div style={{fontSize:8,color:"#4a4560",marginTop:2}}>{gr.date.split("T")[0]}</div></div>)})}()}
          <button onClick={function(){if(confirm("실전 기록을 모두 삭제할까요?")){setRealChecks([]);ST.del("realChecks")}}} style={{display:"block",margin:"8px auto 0",padding:"6px 16px",borderRadius:8,border:"1px solid rgba(255,114,114,0.2)",fontSize:10,cursor:"pointer",background:"transparent",color:"#FF7272"}}>기록 초기화</button>
        </div>}

      {tab==="history"&&<div><div style={C}><div style={LL}>📋 {user.name}님의 예측기록</div>
        {history.length===0&&<div style={{textAlign:"center",padding:20,color:"#6b6580",fontSize:11}}>아직 예측 기록이 없습니다.</div>}
        {history.map(function(h,idx){var d=new Date(h.date);var ds=d.getFullYear()+"."+(d.getMonth()+1)+"."+d.getDate()+" "+String(d.getHours()).padStart(2,"0")+":"+String(d.getMinutes()).padStart(2,"0");return <div key={idx} style={{marginBottom:10,paddingBottom:8,borderBottom:"1px solid rgba(255,255,255,0.04)"}}><div style={{display:"flex",justifyContent:"space-between",fontSize:10,marginBottom:4}}><span style={{color:"#d4af37",fontWeight:700}}>{h.forDraw}회 대상</span><span style={{color:"#6b6580"}}>{ds}</span></div>{h.games.map(function(g,gi){return <div key={gi} style={{display:"flex",gap:3,marginBottom:3,flexWrap:"wrap"}}>{g.map(function(n){return <div key={n} style={{width:26,height:26,borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center",fontSize:9,fontWeight:800,background:bCol(n),color:"#fff"}}>{n}</div>})}<span style={{fontSize:8,color:"#6b6580",alignSelf:"center",marginLeft:4}}>R{(h.rars&&h.rars[gi]!=null)?(h.rars[gi]*100).toFixed(0):"-"}</span></div>})}
        </div>})}
        {history.length>0&&<button onClick={function(){if(confirm("모든 예측 기록을 삭제할까요?")){setHistory([]);ST.del("history")}}} style={{display:"block",margin:"8px auto 0",padding:"6px 16px",borderRadius:8,border:"1px solid rgba(255,114,114,0.2)",fontSize:10,cursor:"pointer",background:"transparent",color:"#FF7272"}}>기록 초기화</button>}
      </div></div>}

      {tab==="lab"&&<div>
        <div style={Object.assign({},C,{background:"rgba(212,175,55,0.06)",border:"1px solid rgba(212,175,55,0.15)"})}><div style={LL}>🤖 Auto-Tune (SA 300it · 14-Signal)</div><button onClick={handleOpt} disabled={!!computing} style={mBtn(!!computing)}>{computing==="sa"?"⏳ "+(progress*100).toFixed(0)+"%":"🤖 실행"}</button>{optResult&&<div style={{marginTop:8}}><div style={{fontSize:11,color:"#4ade80",fontWeight:700}}>Best: {optResult.bestScore.toFixed(4)}</div><div style={{marginTop:4,fontSize:9,color:"#8b85a0"}}>{Object.keys(optResult.bestWeights).map(function(k){return k+":"+optResult.bestWeights[k].toFixed(3)}).join(" ")}</div><button onClick={applyOpt} style={{marginTop:6,padding:"8px 16px",borderRadius:10,border:"1px solid rgba(212,175,55,0.3)",fontSize:11,fontWeight:800,cursor:"pointer",background:"rgba(212,175,55,0.15)",color:"#f5d76e"}}>✅ 적용</button></div>}</div>
        <div style={C}><div style={LL}>⚖️ 가중치 (14-Signal)</div>{[["gap","주기","#f5d76e"],["momentum","모멘텀","#69C8F2"],["transition","전이","#4ade80"],["lag2","2차전이","#36d399"],["decade","대역","#B0D840"],["streak","연속","#FF9F43"],["sumZone","합구간","#A78BFA"],["oddEven","홀짝","#F472B6"],["coldRecovery","냉각복귀","#00D2FF"],["endDigit","끝수","#FF6B9D"],["zoneBalance","구간균형","#7FFF00"],["sumTrend","합방향","#FFD700"],["pair","페어","#FF7272"],["base","기본","#AAAAAA"]].map(function(row){var k=row[0],label=row[1],col=row[2],v=cfg.weights[k]||0;return <div key={k} style={{display:"flex",alignItems:"center",gap:4,marginBottom:5}}><div style={{width:52,fontSize:9,color:col,fontWeight:700}}>{label}</div><input type="range" min={0} max={0.6} step={0.01} value={v} onChange={function(e){var val=+e.target.value;var key=k;setCfg(function(p){var nw=Object.assign({},p.weights);nw[key]=val;return Object.assign({},p,{weights:nw})})}} style={{flex:1,accentColor:col,height:3}}/><input type="number" min={0} max={0.6} step={0.01} value={v} onChange={function(e){var val=Math.min(0.6,Math.max(0,+e.target.value||0));var key=k;setCfg(function(p){var nw=Object.assign({},p.weights);nw[key]=val;return Object.assign({},p,{weights:nw})})}} style={{width:48,padding:"3px 4px",borderRadius:4,border:"1px solid rgba(255,255,255,0.15)",background:"rgba(255,255,255,0.06)",color:"#f5d76e",fontSize:11,fontWeight:700,textAlign:"center",outline:"none"}}/></div>})}<div style={{display:"flex",gap:6,marginTop:6}}>
          <button onClick={function(){if(!isPremium){alert("👑 최적값 적용은 프리미엄 기능입니다.\n월 4,900원으로 이용하세요!");return;}setCfg(function(p){return Object.assign({},p,{weights:{gap:0.44,momentum:0.45,transition:0.16,lag2:0.56,decade:0.40,streak:0.03,sumZone:0.54,oddEven:0.04,coldRecovery:0.00,endDigit:0.37,zoneBalance:0.01,sumTrend:0.01,pair:0.05,base:0.44},momW:15,transW:30,pairW:15,decW:200,rarityW:600,pairMode:"top2",pairClamp:0.35})})}} style={{flex:1,padding:"7px 0",borderRadius:8,border:"1px solid rgba(212,175,55,0.3)",fontSize:10,fontWeight:800,cursor:"pointer",background:"rgba(212,175,55,0.1)",color:isPremium?"#f5d76e":"#8b85a0"}}>⭐ 최적값 적용 {!isPremium&&"👑"}</button>
          <button onClick={function(){setCfg(function(p){return Object.assign({},p,{weights:Object.assign({},DEFAULT_WEIGHTS)})})}} style={{flex:1,padding:"7px 0",borderRadius:8,border:"1px solid rgba(255,255,255,0.1)",fontSize:10,cursor:"pointer",background:"transparent",color:"#6b6580"}}>기본값</button></div></div>
        <div style={C}><div style={LL}>📊 윈도우</div>{[["모멘텀","momW",cfg.momW,10,3000],["페어","pairW",cfg.pairW,10,1000],["전이","transW",cfg.transW,10,2000],["대역","decW",cfg.decW,10,3000],["레어리티","rarityW",cfg.rarityW,50,3000]].map(function(row){return <div key={row[1]} style={{display:"flex",alignItems:"center",gap:4,marginBottom:5}}><div style={{width:48,fontSize:10,color:"#c0b8d4"}}>{row[0]}</div><input type="range" min={row[3]} max={row[4]} value={row[2]} onChange={function(e){var v=+e.target.value;var k=row[1];setCfg(function(p){var u={};u[k]=v;return Object.assign({},p,u)})}} style={{flex:1,accentColor:"#d4af37"}}/><input type="number" min={row[3]} max={row[4]} value={row[2]} onChange={function(e){var v=Math.min(row[4],Math.max(row[3],+e.target.value||row[3]));var k=row[1];setCfg(function(p){var u={};u[k]=v;return Object.assign({},p,u)})}} style={{width:48,padding:"3px 4px",borderRadius:4,border:"1px solid rgba(255,255,255,0.15)",background:"rgba(255,255,255,0.06)",color:"#f5d76e",fontSize:11,fontWeight:700,textAlign:"center",outline:"none"}}/></div>})}</div>
        <div style={C}><div style={LL}>🤝 페어 설정</div><div style={{display:"flex",gap:4,marginBottom:8}}>{[["mean","평균"],["max","최대"],["top2","상위2"]].map(function(pair){return <button key={pair[0]} onClick={function(){setCfg(function(p){return Object.assign({},p,{pairMode:pair[0]})})}} style={{flex:1,padding:"7px 0",borderRadius:8,border:"none",fontSize:10,fontWeight:700,cursor:"pointer",background:cfg.pairMode===pair[0]?"rgba(255,114,114,0.15)":"rgba(255,255,255,0.04)",color:cfg.pairMode===pair[0]?"#FF7272":"#6b6580"}}>{pair[1]}</button>})}</div><div style={{display:"flex",alignItems:"center",gap:4}}><div style={{width:48,fontSize:10,color:"#c0b8d4"}}>클램프</div><input type="range" min={0.1} max={0.8} step={0.05} value={cfg.pairClamp} onChange={function(e){setCfg(function(p){return Object.assign({},p,{pairClamp:+e.target.value})})}} style={{flex:1,accentColor:"#FF7272"}}/><input type="number" min={0.1} max={0.8} step={0.05} value={cfg.pairClamp} onChange={function(e){setCfg(function(p){return Object.assign({},p,{pairClamp:Math.min(0.8,Math.max(0.1,+e.target.value||0.35))})})}} style={{width:48,padding:"3px 4px",borderRadius:4,border:"1px solid rgba(255,255,255,0.15)",background:"rgba(255,255,255,0.06)",color:"#f5d76e",fontSize:11,fontWeight:700,textAlign:"center",outline:"none"}}/></div></div>
        <div style={C}><div style={LL}>🎚️ 생성기</div>{[["시도","attempts",cfg.attempts,50000,500000,10000],["게임","games",cfg.games,1,15,1],["다양성","divMax",cfg.divMax,0,6,1]].map(function(row){return <div key={row[1]} style={{display:"flex",alignItems:"center",gap:6,marginBottom:5}}><div style={{width:50,fontSize:10,color:"#c0b8d4"}}>{row[0]}</div><input type="range" min={row[3]} max={row[4]} step={row[5]} value={row[2]} onChange={function(e){var v=+e.target.value;var k=row[1];setCfg(function(p){var u={};u[k]=v;return Object.assign({},p,u)})}} style={{flex:1,accentColor:"#d4af37"}}/><div style={{width:40,fontSize:10,color:"#f5d76e",textAlign:"right",fontWeight:700}}>{row[1]==="attempts"?(row[2]/1000).toFixed(0)+"K":row[2]}</div></div>})}</div>
        <div style={C}><div style={LL}>📏 리스크 ({cfg.risk==="stable"?"안정":cfg.risk==="balanced"?"기본":"공격"})</div>{[["합계",rr.sn+"~"+rr.sx],["홀수",rr.on+"~"+rr.ox],["연번","≤"+rr.mr],["중복","≤"+rr.mo],["AC",rr.an+"~"+rr.ax],["소수",rr.pn+"~"+rr.px]].map(function(pair){return <div key={pair[0]} style={{display:"flex",justifyContent:"space-between",fontSize:10,color:"#8b85a0",marginBottom:3}}><span>{pair[0]}</span><span style={{color:"#f5d76e",fontWeight:700}}>{pair[1]}</span></div>})}</div>
      </div>}     
      <div style={C}><div style={LL}>⚖️ 가중치</div>{[["gap","주기","#f5d76e"],["momentum","모멘텀","#69C8F2"],["transition","전이","#4ade80"],["lag2","2차전이","#36d399"],["decade","대역","#B0D840"],["streak","연속","#FF9F43"],["sumZone","합구간","#A78BFA"],["oddEven","홀짝","#F472B6"],["coldRecovery","냉각복귀","#00D2FF"],["endDigit","끝수","#FF6B9D"],["zoneBalance","구간균형","#7FFF00"],["sumTrend","합방향","#FFD700"],["pair","페어","#FF7272"],["base","기본","#AAAAAA"]].map(function(row){var k=row[0],label=row[1],col=row[2],v=cfg.weights[k]||0;return <div key={k} style={{display:"flex",alignItems:"center",gap:4,marginBottom:5}}><div style={{width:52,fontSize:9,color:col,fontWeight:700}}>{label}</div><input type="range" min={0} max={0.6} step={0.01} value={v} onChange={function(e){var val=+e.target.value;var key=k;setCfg(function(p){var nw=Object.assign({},p.weights);nw[key]=val;return Object.assign({},p,{weights:nw})})}} style={{flex:1,accentColor:col,height:3}}/><input type="number" min={0} max={0.6} step={0.01} value={v} onChange={function(e){var val=Math.min(0.6,Math.max(0,+e.target.value||0));var key=k;setCfg(function(p){var nw=Object.assign({},p.weights);nw[key]=val;return Object.assign({},p,{weights:nw})})}} style={{width:48,padding:"3px 4px",borderRadius:4,border:"1px solid rgba(255,255,255,0.15)",background:"rgba(255,255,255,0.06)",color:"#f5d76e",fontSize:11,fontWeight:700,textAlign:"center",outline:"none"}}/></div>})}</div>
        <div style={C}><div style={LL}>📏 리스크</div>{[["합계",rr.sn+"~"+rr.sx],["홀수",rr.on+"~"+rr.ox],["연번","≤"+rr.mr],["AC",rr.an+"~"+rr.ax]].map(function(pair){return <div key={pair[0]} style={{display:"flex",justifyContent:"space-between",fontSize:10,color:"#8b85a0",marginBottom:3}}><span>{pair[0]}</span><span style={{color:"#f5d76e",fontWeight:700}}>{pair[1]}</span></div>})}</div>
      </div>}

      {tab==="guide"&&<div>
        <div style={C}><div style={{fontSize:16,fontWeight:900,color:"#d4af37",marginBottom:4}}>📖 로또엔진 vGYO</div></div>
        <div style={C}><div style={LL}>🔮 개요</div><div style={{fontSize:11,color:"#c0b8d4",lineHeight:1.8}}>vGYO는 과거 당첨번호의 통계적 패턴을 14개 신호 차원으로 분석하여, 출현 가능성이 높은 번호 조합을 생성하는 연구용 엔진입니다.<br/><br/><span style={{color:"#FF7272",fontSize:10}}>⚠️ 로또는 독립시행 확률 게임입니다. 당첨을 보장하지 않습니다.</span></div></div>
        <div style={C}><div style={LL}>💡 광고 크레딧</div><div style={{fontSize:11,color:"#c0b8d4",lineHeight:1.8}}>예측 1회 = 크레딧 1개 소모<br/>광고 시청 완료 시 크레딧 1개 충전<br/>초기 크레딧 5개 제공</div></div>
      </div>}
    </div>
  );
}

/* ═══ ROOT ═══ */
function App(){
  var us=useState(null),user=us[0],setUser=us[1];
  return user
    ? <MainApp user={user} onLogout={function(){setUser(null)}}/>
    : <LoginScreen onLogin={function(u){setUser(u)}}/>;
}

// ── 변경 5: createRoot로 교체 (React 18 표준)
createRoot(document.getElementById('root')).render(<App />);
