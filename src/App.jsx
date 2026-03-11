import { useState, useEffect, useRef, useCallback } from "react";

/* ─────────────────────────────────────────────────────────────────────────────
   YATICORP EXACT COLOR MAP (sampled from screenshots)
   Navbar bg:      #0C1022
   Page bg:        #0E1529
   Card bg:        #131E38
   Card border:    rgba(255,255,255,0.07)
   Hero gradient:  #2a5298 → #7ab8e8 (left-dark to right-light blue)
   Primary blue:   #1E90FF
   Teal accent:    #0EE6D1  (used in chatbot trigger ring)
   "FREE" badge:   #0EE6D1
   Price text:     white
   Section title:  #FFFFFF
   Body text:      #CBD5E1
   Muted text:     #8892B0
   Count badge:    rgba(255,255,255,0.08)
   Nav border:     rgba(255,255,255,0.06)
───────────────────────────────────────────────────────────────────────────── */

const FONTS = "https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Barlow:wght@500;600;700;800&display=swap";

const CSS = `
  @import url('${FONTS}');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  body {
    font-family: 'DM Sans', sans-serif;
    background: #0E1529;
    color: #CBD5E1;
    min-height: 100vh;
  }

  /* ── scrollbar ── */
  ::-webkit-scrollbar { width: 5px; height: 5px; }
  ::-webkit-scrollbar-track { background: rgba(255,255,255,0.03); }
  ::-webkit-scrollbar-thumb { background: rgba(30,144,255,0.35); border-radius: 99px; }

  /* ── Robot keyframes ── */
  @keyframes robo-float   { 0%,100%{transform:translateY(0)rotate(-1deg);}50%{transform:translateY(-8px)rotate(1deg);} }
  @keyframes eye-blink    { 0%,88%,100%{transform:scaleY(1);}93%{transform:scaleY(0.07);} }
  @keyframes ear-l        { 0%,100%{transform:rotate(0);}35%{transform:rotate(-10deg);}70%{transform:rotate(5deg);} }
  @keyframes ear-r        { 0%,100%{transform:rotate(0);}35%{transform:rotate(10deg);}70%{transform:rotate(-5deg);} }
  @keyframes scan         { 0%{transform:translateY(-40px);opacity:0;}10%{opacity:.5;}90%{opacity:.5;}100%{transform:translateY(40px);opacity:0;} }
  @keyframes chest        { 0%,100%{opacity:1;}50%{opacity:.18;} }
  @keyframes aura         { 0%,100%{opacity:.35;transform:scale(1);}50%{opacity:.8;transform:scale(1.12);} }
  @keyframes ant          { 0%,100%{transform:translateY(0)scale(1);}50%{transform:translateY(-5px)scale(1.2);} }
  @keyframes eq-bar       { 0%,100%{transform:scaleY(1);}50%{transform:scaleY(.25);} }
  @keyframes status-glow  { 0%,100%{box-shadow:0 0 0 0 rgba(14,230,209,.5);}50%{box-shadow:0 0 0 5px rgba(14,230,209,0);} }

  /* ── UI keyframes ── */
  @keyframes float        { 0%,100%{transform:translateY(0);}50%{transform:translateY(-6px);} }
  @keyframes spin         { to{transform:rotate(360deg);} }
  @keyframes pulse-ring   { 0%{transform:scale(.9);opacity:.8;}100%{transform:scale(2);opacity:0;} }
  @keyframes tdot         { 0%,80%,100%{transform:scale(.5)translateY(0);opacity:.3;}40%{transform:scale(1)translateY(-4px);opacity:1;} }
  @keyframes msg-in       { from{opacity:0;transform:translateY(10px)scale(.95);}to{opacity:1;transform:translateY(0)scale(1);} }
  @keyframes cursor-blink { 0%,100%{opacity:1;}50%{opacity:0;} }
  @keyframes win-open     { from{opacity:0;transform:scale(.72)translateY(-14px);}to{opacity:1;transform:scale(1)translateY(0);} }
  @keyframes win-close    { from{opacity:1;transform:scale(1)translateY(0);}to{opacity:0;transform:scale(.72)translateY(-14px);} }
  @keyframes drift        { 0%{transform:translateY(0)translateX(0);}50%{transform:translateY(-10px)translateX(5px);}100%{transform:translateY(0)translateX(0);} }

  /* ── Applied ── */
  .robo-float  { animation: robo-float 3.5s ease-in-out infinite; }
  .robo-aura   { animation: aura 3s ease-in-out infinite; }
  .robo-ear-l  { animation: ear-l 5s .4s ease-in-out infinite; transform-origin: 9px 38px; }
  .robo-ear-r  { animation: ear-r 5s 1.2s ease-in-out infinite; transform-origin: 79px 38px; }
  .robo-eye-l  { animation: eye-blink 4.5s 0s ease-in-out infinite; transform-origin: 33px 43px; }
  .robo-eye-r  { animation: eye-blink 4.5s 0s ease-in-out infinite; transform-origin: 57px 43px; }
  .robo-scan   { animation: scan 3.5s 1s ease-in-out infinite; }
  .robo-c1     { animation: chest 1.1s .00s ease-in-out infinite; }
  .robo-c2     { animation: chest 1.1s .37s ease-in-out infinite; }
  .robo-c3     { animation: chest 1.1s .74s ease-in-out infinite; }
  .robo-ant    { animation: ant 2s ease-in-out infinite; }
  .robo-status { animation: status-glow 2s ease-in-out infinite; }

  .trigger     { animation: float 4s ease-in-out infinite; }
  .ring        { animation: spin 3s linear infinite; }
  .pulse       { animation: pulse-ring 2.5s ease-out infinite; }
  .win-enter   { animation: win-open .38s cubic-bezier(.34,1.56,.64,1) forwards; }
  .win-exit    { animation: win-close .22s ease-in forwards; }
  .yati-msg    { animation: msg-in .3s cubic-bezier(.34,1.3,.64,1) both; }
  .dot1        { animation: tdot 1.3s .0s infinite ease-in-out; }
  .dot2        { animation: tdot 1.3s .2s infinite ease-in-out; }
  .dot3        { animation: tdot 1.3s .4s infinite ease-in-out; }
  .typing::after { content:'▋'; animation: cursor-blink .65s infinite; font-size:11px; color:#1E90FF; margin-left:1px; }

  /* ── Chat scrollbar ── */
  .chat-msgs::-webkit-scrollbar { width: 4px; }
  .chat-msgs::-webkit-scrollbar-track { background: transparent; }
  .chat-msgs::-webkit-scrollbar-thumb { background: linear-gradient(180deg,#1E90FF,#0EE6D1); border-radius: 4px; }

  /* ── Hover states ── */
  .nav-link:hover       { color: #0EE6D1 !important; }
  .cat-chip:hover       { background: rgba(30,144,255,.14) !important; border-color: rgba(30,144,255,.4) !important; }
  .course-card:hover    { transform: translateY(-4px); border-color: rgba(30,144,255,.45) !important; box-shadow: 0 16px 40px rgba(0,0,0,.5) !important; }
  .test-row:hover       { background: rgba(25,32,60,.95) !important; border-color: rgba(30,144,255,.3) !important; }
  .send-btn:hover       { transform: scale(1.07) !important; box-shadow: 0 6px 22px rgba(14,230,209,.45) !important; }
  .send-btn:active      { transform: scale(.93) !important; }
  .close-btn:hover      { background: rgba(239,68,68,.15) !important; color: #F87171 !important; }
  .input-row:focus-within { border-color: rgba(14,230,209,.5) !important; box-shadow: 0 0 0 3px rgba(14,230,209,.08) !important; }
  .signin-btn:hover     { background: rgba(255,255,255,.08) !important; }
  .signup-btn:hover     { background: linear-gradient(135deg,#1E90FF,#0EE6D1) !important; box-shadow: 0 4px 16px rgba(30,144,255,.4) !important; }
  .view-all:hover       { color: #0EE6D1 !important; }

  @media(max-width:520px) { 
  .chat-win { 
    width: calc(100vw - 16px) !important; 
    right: 8px !important; 
  } 
}

/* Fix right side spacing on large screens */
@media (min-width: 1600px) {
  .content-wrapper {
    max-width: 95% !important;
  }
}

@media (max-width: 1200px) {
  .content-wrapper {
    padding: 30px 20px 100px !important;
  }
}

`;

const SYSTEM = `You are YUKTHI AI, the intelligent assistant for YATICORP SkillX — a professional AI-powered LMS platform.

You help learners with:
- Course navigation and recommendations across AI, Data Analytics, Cyber Security, HR, Hospitality, Civil Engineering and more
- Understanding course content, concept explanations, and doubt solving
- Test preparation: Numerical Exercises, Assessments, Practice Tests
- Bundle recommendations and pricing guidance
- Career and internship pathways
- Progress tracking and personalized roadmaps

Personality: Professional, warm, and knowledgeable. Use occasional emojis. Keep answers structured and concise. Be genuinely helpful.`;

const uid = () => Math.random().toString(36).slice(2,8);

/* ─── SVG Robot ──────────────────────────────────────────────────────────── */
function RoboYati() {
  const pts = [
    {top:8, left:10, c:"#1E90FF", s:5, d:"0s",   dur:"2.4s"},
    {top:12,right:12,c:"#0EE6D1", s:4, d:"0.7s", dur:"2.8s"},
    {top:56,left:5,  c:"#8B5CF6", s:4, d:"1.1s", dur:"2.6s"},
    {top:60,right:6, c:"#F59E0B", s:4, d:"0.3s", dur:"3s"  },
  ];
  return (
    <div style={{display:"flex",flexDirection:"column",alignItems:"center",paddingTop:20,paddingBottom:10,position:"relative"}}>
      {/* aura */}
      <div className="robo-aura" style={{position:"absolute",top:8,left:"50%",transform:"translateX(-50%)",
        width:110,height:110,borderRadius:"50%",pointerEvents:"none",zIndex:0,
        background:"radial-gradient(circle,rgba(30,144,255,.2) 0%,rgba(14,230,209,.1) 50%,transparent 70%)"}}/>
      {/* particles */}
      {pts.map((p,i)=>(
        <div key={i} style={{position:"absolute",top:p.top,left:p.left,right:p.right,
          width:p.s,height:p.s,borderRadius:"50%",background:p.c,
          boxShadow:`0 0 ${p.s*2.5}px ${p.c}99`,zIndex:2,pointerEvents:"none",
          animation:`drift ${p.dur} ${p.d} ease-in-out infinite`}}/>
      ))}

      {/* Robot SVG */}
      <div className="robo-float" style={{position:"relative",zIndex:1}}>
        <svg width="90" height="108" viewBox="0 0 90 108" fill="none">
          <defs>
            <linearGradient id="rB" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#192040"/><stop offset="100%" stopColor="#131D38"/>
            </linearGradient>
            <linearGradient id="rH" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#1E2B50"/><stop offset="100%" stopColor="#17203E"/>
            </linearGradient>
            <linearGradient id="rF" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#07101F"/><stop offset="100%" stopColor="#0B1428"/>
            </linearGradient>
            <linearGradient id="rEL" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#1E90FF"/><stop offset="100%" stopColor="#00BFFF"/>
            </linearGradient>
            <linearGradient id="rER" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#0EE6D1"/><stop offset="100%" stopColor="#06B6D4"/>
            </linearGradient>
            <linearGradient id="rAc" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#1E90FF"/>
              <stop offset="50%" stopColor="#0EE6D1"/>
              <stop offset="100%" stopColor="#8B5CF6"/>
            </linearGradient>
            <linearGradient id="rCh" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#080E20"/><stop offset="100%" stopColor="#0D1530"/>
            </linearGradient>
            <filter id="glow"><feGaussianBlur stdDeviation="2.5" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
            <filter id="sglow"><feGaussianBlur stdDeviation="1.5" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
            <clipPath id="fc"><rect x="23" y="28" width="44" height="33" rx="8"/></clipPath>
          </defs>

          {/* Antenna */}
          <g className="robo-ant">
            <line x1="45" y1="26" x2="45" y2="10" stroke="url(#rAc)" strokeWidth="2.5" strokeLinecap="round"/>
            <circle cx="45" cy="7" r="5" fill="#0EE6D1" filter="url(#glow)">
              <animate attributeName="fill" values="#0EE6D1;#1E90FF;#8B5CF6;#0EE6D1" dur="4s" repeatCount="indefinite"/>
              <animate attributeName="r" values="4.5;6.2;4.5" dur="2s" repeatCount="indefinite"/>
            </circle>
            <circle cx="45" cy="7" r="10" fill="none" stroke="#0EE6D1" strokeWidth="1" opacity="0.2">
              <animate attributeName="r" values="6;14;6" dur="2s" repeatCount="indefinite"/>
              <animate attributeName="opacity" values="0.3;0;0.3" dur="2s" repeatCount="indefinite"/>
            </circle>
          </g>

          {/* Left ear */}
          <g className="robo-ear-l">
            <rect x="9" y="31" width="13" height="18" rx="5" fill="url(#rB)" stroke="rgba(30,144,255,.4)" strokeWidth="1.5"/>
            <rect x="11" y="36" width="9" height="4.5" rx="2.5" fill="#1E90FF" opacity="0.45"/>
            <circle cx="15.5" cy="45" r="2" fill="#1E90FF" opacity="0.6">
              <animate attributeName="opacity" values=".6;.1;.6" dur="1.8s" repeatCount="indefinite"/>
            </circle>
          </g>

          {/* Right ear */}
          <g className="robo-ear-r">
            <rect x="68" y="31" width="13" height="18" rx="5" fill="url(#rB)" stroke="rgba(14,230,209,.4)" strokeWidth="1.5"/>
            <rect x="70" y="36" width="9" height="4.5" rx="2.5" fill="#0EE6D1" opacity="0.45"/>
            <circle cx="74.5" cy="45" r="2" fill="#0EE6D1" opacity="0.6">
              <animate attributeName="opacity" values=".6;.1;.6" dur="1.8s" begin="0.6s" repeatCount="indefinite"/>
            </circle>
          </g>

          {/* Head */}
          <rect x="22" y="26" width="46" height="41" rx="13" fill="url(#rH)" stroke="rgba(30,144,255,.28)" strokeWidth="1.5"/>
          <rect x="22" y="26" width="46" height="5" rx="3" fill="url(#rAc)" opacity="0.7"/>
          <ellipse cx="37" cy="34" rx="13" ry="4.5" fill="rgba(255,255,255,.05)"/>

          {/* Face screen */}
          <rect x="26" y="32" width="38" height="30" rx="8" fill="url(#rF)" stroke="rgba(30,144,255,.25)" strokeWidth="1"/>
          <g clipPath="url(#fc)">
            <rect className="robo-scan" x="26" y="32" width="38" height="5" fill="rgba(30,144,255,.2)"/>
          </g>

          {/* Left eye */}
          <g className="robo-eye-l">
            <ellipse cx="33" cy="43" rx="6.5" ry="6" fill="url(#rEL)" filter="url(#glow)" opacity=".95"/>
            <ellipse cx="33" cy="43" rx="3.8" ry="3.5" fill="#030C1C"/>
            <circle cx="34.8" cy="41.2" r="1.4" fill="white" opacity=".95"/>
            <ellipse cx="33" cy="43" rx="6.5" ry="6" fill="none" stroke="#1E90FF" strokeWidth="1" opacity="0.3">
              <animate attributeName="rx" values="6.5;9.5;6.5" dur="2.2s" repeatCount="indefinite"/>
              <animate attributeName="ry" values="6;9;6" dur="2.2s" repeatCount="indefinite"/>
              <animate attributeName="opacity" values=".3;0;.3" dur="2.2s" repeatCount="indefinite"/>
            </ellipse>
          </g>

          {/* Right eye */}
          <g className="robo-eye-r">
            <ellipse cx="57" cy="43" rx="6.5" ry="6" fill="url(#rER)" filter="url(#glow)" opacity=".95"/>
            <ellipse cx="57" cy="43" rx="3.8" ry="3.5" fill="#030C1C"/>
            <circle cx="58.8" cy="41.2" r="1.4" fill="white" opacity=".95"/>
            <ellipse cx="57" cy="43" rx="6.5" ry="6" fill="none" stroke="#0EE6D1" strokeWidth="1" opacity="0.3">
              <animate attributeName="rx" values="6.5;9.5;6.5" dur="2.5s" repeatCount="indefinite"/>
              <animate attributeName="ry" values="6;9;6" dur="2.5s" repeatCount="indefinite"/>
              <animate attributeName="opacity" values=".3;0;.3" dur="2.5s" repeatCount="indefinite"/>
            </ellipse>
          </g>

          {/* Mouth */}
          <path d="M34 54 Q45 60.5 56 54" stroke="url(#rAc)" strokeWidth="2" strokeLinecap="round" fill="none" filter="url(#sglow)">
            <animate attributeName="d" values="M34 54 Q45 60.5 56 54;M34 54 Q45 57 56 54;M34 54 Q45 60.5 56 54" dur="4s" repeatCount="indefinite"/>
          </path>
          <ellipse cx="27.5" cy="54" rx="3.8" ry="2.5" fill="#1E90FF" opacity="0.1"/>
          <ellipse cx="62.5" cy="54" rx="3.8" ry="2.5" fill="#0EE6D1" opacity="0.1"/>

          {/* Neck */}
          <rect x="38" y="67" width="14" height="9" rx="3.5" fill="url(#rB)" stroke="rgba(30,144,255,.18)" strokeWidth="1"/>
          {[41,45,49].map(x=>(
            <line key={x} x1={x} y1="68.5" x2={x} y2="74.5" stroke="rgba(30,144,255,.3)" strokeWidth="1.5"/>
          ))}

          {/* Body */}
          <rect x="17" y="76" width="56" height="29" rx="13" fill="url(#rB)" stroke="rgba(30,144,255,.2)" strokeWidth="1.5"/>
          <rect x="17" y="76" width="56" height="4.5" rx="2.5" fill="url(#rAc)" opacity="0.55"/>
          <ellipse cx="39" cy="83" rx="16" ry="4" fill="rgba(255,255,255,.04)"/>

          {/* Chest panel */}
          <rect x="27" y="80" width="36" height="19" rx="7" fill="url(#rCh)" stroke="rgba(30,144,255,.2)" strokeWidth="1"/>
          {/* EQ bars */}
          {[31,36,41,46,51,56].map((x,i)=>{
            const h=[8,5,10,6,9,5][i];
            const c=["#1E90FF","#0EE6D1","#8B5CF6","#1E90FF","#F59E0B","#0EE6D1"][i];
            return (
              <rect key={i} x={x} y={92-h} width="3.2" height={h} rx="1.5" fill={c} opacity="0.85" filter="url(#sglow)">
                <animate attributeName="height" values={`${h};${h+6};${h}`} dur={`${.75+i*.14}s`} repeatCount="indefinite"/>
                <animate attributeName="y" values={`${92-h};${92-h-6};${92-h}`} dur={`${.75+i*.14}s`} repeatCount="indefinite"/>
              </rect>
            );
          })}

          {/* Side studs */}
          <circle cx="21" cy="84" r="3" fill="#1E90FF" opacity="0.55" filter="url(#sglow)"/>
          <circle cx="69" cy="84" r="3" fill="#0EE6D1" opacity="0.55" filter="url(#sglow)"/>
          <circle cx="21" cy="94" r="2.5" fill="#8B5CF6" opacity="0.5"/>
          <circle cx="69" cy="94" r="2.5" fill="#F59E0B" opacity="0.5"/>
        </svg>
      </div>

      {/* Name badge */}
      <div style={{display:"flex",alignItems:"center",gap:8,marginTop:5}}>
        <span style={{fontFamily:"'Barlow',sans-serif",fontWeight:700,fontSize:15,
          background:"linear-gradient(135deg,#1E90FF,#0EE6D1)",
          WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",letterSpacing:"0.06em"}}>
          YUKTHI AI
        </span>
        <div className="robo-status" style={{display:"flex",alignItems:"center",gap:4,
          padding:"3px 10px",borderRadius:99,
          background:"rgba(14,230,209,.08)",border:"1px solid rgba(14,230,209,.3)"}}>
          <div style={{width:6,height:6,borderRadius:"50%",background:"#22C55E",boxShadow:"0 0 6px rgba(34,197,94,.8)"}}/>
          <span style={{fontSize:9,color:"#0EE6D1",fontWeight:700,letterSpacing:"0.07em"}}>ONLINE</span>
        </div>
      </div>
      <p style={{fontSize:11,color:"#8892B0",marginTop:3,fontWeight:500}}>YATICORP SkillX Assistant</p>
    </div>
  );
}

/* ─── Mini avatar ──────────────────────────────────────────────────────────── */
function BotAvatar({size=20}){
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <defs>
        <linearGradient id="avG" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#1E90FF"/><stop offset="100%" stopColor="#0EE6D1"/>
        </linearGradient>
      </defs>
      <rect x="5" y="8" width="14" height="11" rx="3.5" fill="url(#avG)"/>
      <rect x="9" y="4" width="6" height="5" rx="2.5" fill="url(#avG)" opacity="0.75"/>
      <line x1="12" y1="4" x2="12" y2="2" stroke="#0EE6D1" strokeWidth="1.6" strokeLinecap="round"/>
      <circle cx="12" cy="1.5" r="1.3" fill="#0EE6D1"/>
      <circle cx="9.5" cy="13" r="1.6" fill="#030C1C"/>
      <circle cx="14.5" cy="13" r="1.6" fill="#030C1C"/>
      <circle cx="10" cy="12.6" r="0.6" fill="white"/>
      <circle cx="15" cy="12.6" r="0.6" fill="white"/>
      <path d="M9.5 17.5 Q12 19.2 14.5 17.5" stroke="white" strokeWidth="1.3" strokeLinecap="round" fill="none"/>
    </svg>
  );
}

/* ─── Typing dots ──────────────────────────────────────────────────────────── */
function Dots(){
  return (
    <div style={{display:"flex",alignItems:"center",gap:5,padding:"11px 15px",
      background:"rgba(25,32,60,.95)",border:"1px solid rgba(30,144,255,.2)",
      borderRadius:18,borderBottomLeftRadius:5,boxShadow:"0 4px 16px rgba(0,0,0,.3)"}}>
      {[["#1E90FF","dot1"],["#0EE6D1","dot2"],["#8B5CF6","dot3"]].map(([c,cl])=>(
        <div key={c} className={cl} style={{width:7,height:7,borderRadius:"50%",background:c,boxShadow:`0 0 6px ${c}88`}}/>
      ))}
    </div>
  );
}

/* ─── Bubble ───────────────────────────────────────────────────────────────── */
function Bubble({msg}){
  const u = msg.role==="user";
  return (
    <div className="yati-msg" style={{display:"flex",gap:8,alignItems:"flex-end",
      flexDirection:u?"row-reverse":"row"}}>
      {!u&&(
        <div style={{width:28,height:28,borderRadius:"50%",flexShrink:0,
          background:"linear-gradient(135deg,#192040,#1E2B50)",
          border:"1.5px solid rgba(30,144,255,.4)",
          display:"flex",alignItems:"center",justifyContent:"center",
          boxShadow:"0 0 12px rgba(30,144,255,.2)"}}>
          <BotAvatar size={15}/>
        </div>
      )}
      <div className={msg.typing?"typing":""} style={{
        maxWidth:"78%",padding:"11px 14px",
        borderRadius:18,
        borderBottomLeftRadius:u?18:5,
        borderBottomRightRadius:u?5:18,
        fontSize:13.5,lineHeight:1.65,fontWeight:500,
        whiteSpace:"pre-wrap",wordBreak:"break-word",
        ...(u?{
          background:"linear-gradient(135deg,#1E5FCC,#1A4BA8)",
          color:"#fff",border:"1px solid rgba(30,144,255,.3)",
          boxShadow:"0 4px 16px rgba(30,144,255,.22)",
        }:{
          background:"rgba(25,32,60,.95)",color:"#CBD5E1",
          border:"1px solid rgba(30,144,255,.13)",
          boxShadow:"0 4px 16px rgba(0,0,0,.28)",
        }),
      }}>{msg.content}</div>
    </div>
  );
}

/* ─── Page UI helpers ──────────────────────────────────────────────────────── */
function SectionHead({title,count,viewAll=true}){
  return (
    <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:18}}>
      <div style={{display:"flex",alignItems:"center",gap:10}}>
        <h2 style={{fontFamily:"'Barlow',sans-serif",fontSize:19,fontWeight:700,color:"#E8EEF8",letterSpacing:".01em"}}>{title}</h2>
        {count&&<span style={{fontSize:11,fontWeight:700,color:"#8892B0",background:"rgba(255,255,255,.07)",
          padding:"2px 9px",borderRadius:99}}>{String(count).padStart(2,"0")}</span>}
      </div>
      {viewAll&&(
        <div style={{display:"flex",alignItems:"center",gap:8}}>
          <span className="view-all" style={{fontSize:13,color:"#CBD5E1",fontWeight:600,cursor:"pointer",transition:"color .2s"}}>View All</span>
          {["‹","›"].map((ch,i)=>(
            <button key={i} style={{width:28,height:28,borderRadius:8,border:"1px solid rgba(255,255,255,.1)",
              background:"rgba(255,255,255,.05)",color:"#8892B0",cursor:"pointer",fontSize:15,
              display:"flex",alignItems:"center",justifyContent:"center",transition:"background .2s"}}>{ch}</button>
          ))}
        </div>
      )}
    </div>
  );
}

/* ─── MAIN ─────────────────────────────────────────────────────────────────── */
export default function YatiChatbot(){
  const [open,setOpen]=useState(false);
  const [animState,setAnimState]=useState("closed");
  const [messages,setMessages]=useState([]);
  const [input,setInput]=useState("");
  const [loading,setLoading]=useState(false);
  const [greeted,setGreeted]=useState(false);
  const endRef=useRef(null);
  const inputRef=useRef(null);
  const taRef=useRef(null);

  useEffect(()=>{
    const s=document.createElement("style");
    s.textContent=CSS;
    document.head.appendChild(s);
    return ()=>document.head.removeChild(s);
  },[]);

  useEffect(()=>{ endRef.current?.scrollIntoView({behavior:"smooth"}); },[messages,loading]);

  const typeGreeting=useCallback(async()=>{
    const g="Hey there! 👋 I'm YUKTHI AI  I can help you find the right course, understand AI concepts What can I help you with today? 🚀";
    const id=uid();
    setMessages([{id,role:"assistant",content:"",typing:true}]);
    let cur="";
    for(let i=0;i<g.length;i++){
      cur+=g[i];
      const s=cur;
      setMessages([{id,role:"assistant",content:s,typing:true}]);
      await new Promise(r=>setTimeout(r,15+Math.random()*12));
    }
    setMessages([{id,role:"assistant",content:g,typing:false}]);
  },[]);

  const openChat=()=>{
    setOpen(true); setAnimState("opening");
    setTimeout(()=>{
      setAnimState("open");
      if(!greeted){setGreeted(true);typeGreeting();}
      setTimeout(()=>inputRef.current?.focus(),100);
    },400);
  };
  const closeChat=()=>{
    setAnimState("closing");
    setTimeout(()=>{setOpen(false);setAnimState("closed");},220);
  };
  const toggleChat=()=>{ if(animState==="open")closeChat(); else if(animState==="closed")openChat(); };

  ////changed cause env file has been created
const BACKEND_URL = import.meta.env.VITE_API_URL;

const sendMessage = async () => {
  const text = input.trim();
  if (!text || loading) return;

  setInput("");
  if (taRef.current) { taRef.current.style.height = "auto"; }

  const userMsg = { id: uid(), role: "user", content: text };
  setMessages(prev => [...prev, userMsg]);
  setLoading(true);


  try {
    const response = await fetch(`${BACKEND_URL}/api/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ question: text }), // ✅ fixed
    });

    if (!response.ok) throw new Error(`Server error: ${response.status}`);

    const data = await response.json();

    setMessages(prev => [...prev, {
      id: uid(),
      role: "assistant",
      content: data.answer || "No response received.", // ✅ fixed
    }]);

  } catch (err) {
    console.error("Chat error:", err);
    setMessages(prev => [...prev, {
      id: uid(),
      role: "assistant",
      content: "⚠️ Cannot reach the server. Make sure:\n• Backend is running\n• IP address is correct\n• Both laptops are on the same WiFi",
    }]);
  } finally {
    setLoading(false);
  }
};


  const handleKey=(e)=>{ if(e.key==="Enter"&&!e.shiftKey){e.preventDefault();sendMessage();} };
  const handleChange=(e)=>{
    setInput(e.target.value);
    const el=e.target; el.style.height="auto";
    el.style.height=Math.min(el.scrollHeight,80)+"px";
  };

  /* ── Page sections data ── */
  const categories=[
    {icon:"🏠",label:"Housewife AI\nCourses"},
    {icon:"🏨",label:"Hospitality AI\nCourses"},
    {icon:"👥",label:"Human Resources\nAI Courses"},
    {icon:"🏗️",label:"Civil AI\nCourse"},
    {icon:"🔐",label:"Cyber Security\nAI Course"},
    {icon:"📱",label:"Social Media\nCourses"},
  ];
  const courses=[
    {label:"Foundations of Artificial Intelligence",img:true},
    {label:"D5 — Data Science Essentials",code:"D5"},
    {label:"D4 — Data Analytics Pro",code:"D4"},
    {label:"D3 — Data Visualization",code:"D3"},
    {label:"Cyber Security Fundamentals",code:"CS"},
  ];
  const tests=[
    {icon:"📐",title:"Numerical Exercises",status:"Live",price:"FREE"},
    {icon:"📋",title:"Assessments",status:"Live",price:"FREE"},
    {icon:"📝",title:"Practice Test",status:"Live",price:"FREE"},
  ];
  const bundles=[
    {title:"AI-Driven Data Analytics (Kannada)",products:"1 Product",price:"₹ 50,000"},
    {title:"AI-Driven Data Analytics",products:"5 Products",price:"₹ 50,000"},
    {title:"AI-Powered Data Analyst Program",products:"2 Products",price:"₹ 7,000"},
    {title:"AI Professional and Data Visualization",products:"5 Products",price:"₹ 3,500"},
    {title:"AI Pro Bundle",products:"2 Products",price:"₹ 1,800"},
  ];
  const testSeries=[
    {icon:"🔢",title:"Quantitative Problems",meta:"1 Test",price:"FREE"},
    {icon:"🤖",title:"AI Reasoning Test",meta:"2 Tests",price:"FREE"},
    {icon:"📊",title:"Data Interpretation Series",meta:"3 Tests",price:"FREE"},
  ];

  return (
    <>
      {/* ════════════ FULL PAGE ════════════ */}
      <div style={{
  minHeight:"100vh",
  background:"#0E1529",
  position:"relative",
  width:"100%",
  overflowX:"hidden"
}}>

        {/* subtle radial glows matching screenshot */}
        <div style={{position:"fixed",top:0,right:0,width:700,height:500,pointerEvents:"none",zIndex:0,
          background:"radial-gradient(ellipse at top right,rgba(30,90,180,.18) 0%,transparent 60%)"}}/>
        <div style={{position:"fixed",bottom:0,left:0,width:600,height:400,pointerEvents:"none",zIndex:0,
          background:"radial-gradient(ellipse at bottom left,rgba(14,100,150,.1) 0%,transparent 60%)"}}/>

        {/* ════ NAVBAR ════ */}
        <nav style={{position:"fixed",top:0,left:0,right:0,zIndex:100,height:60,
          background:"#0C1022",borderBottom:"1px solid rgba(255,255,255,.06)",
          display:"flex",alignItems:"center",justifyContent:"space-between",padding:"0 24px",
          boxShadow:"0 1px 12px rgba(0,0,0,.4)"}}>

          {/* Logo — white box matching screenshot */}
          <div style={{display:"flex",alignItems:"center",gap:0}}>
            <div style={{width:46,height:38,background:"#fff",borderRadius:4,
              display:"flex",alignItems:"center",justifyContent:"center",
              boxShadow:"0 2px 8px rgba(0,0,0,.35)"}}>
              <span style={{fontFamily:"'Barlow',sans-serif",fontWeight:800,fontSize:9,
                color:"#0C1022",letterSpacing:".01em",lineHeight:1.15,textAlign:"center"}}>
                YATI<br/>CORP
              </span>
            </div>
          </div>

          {/* Search — exactly as screenshot */}
          <div style={{flex:1,maxWidth:340,margin:"0 28px"}}>
            <div style={{display:"flex",alignItems:"center",gap:10,
              background:"rgba(255,255,255,.07)",border:"1px solid rgba(255,255,255,.09)",
              borderRadius:24,padding:"7px 18px",cursor:"text"}}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                <circle cx="11" cy="11" r="7" stroke="#8892B0" strokeWidth="2"/>
                <path d="M20 20L16.65 16.65" stroke="#8892B0" strokeWidth="2" strokeLinecap="round"/>
              </svg>
              <span style={{fontSize:13.5,color:"#8892B0",fontWeight:500}}>Search</span>
            </div>
          </div>

          {/* Right nav */}
          <div style={{display:"flex",alignItems:"center",gap:22}}>
            {["Get App","Communities","Newsfeed"].map(l=>(
              <a key={l} className="nav-link" href="#"
                style={{fontSize:13,color:"#CBD5E1",textDecoration:"none",fontWeight:600,transition:"color .2s"}}>{l}</a>
            ))}
            <button className="signin-btn" style={{padding:"6px 18px",borderRadius:20,
              border:"1.5px solid rgba(255,255,255,.45)",background:"transparent",
              color:"#CBD5E1",fontSize:13,fontWeight:700,cursor:"pointer",transition:"background .2s"}}>
              SIGN IN
            </button>
            <button className="signup-btn" style={{padding:"6px 20px",borderRadius:20,
              background:"linear-gradient(135deg,#1E5FCC,#1E90FF)",
              border:"none",color:"#fff",fontSize:13,fontWeight:700,cursor:"pointer",
              boxShadow:"0 4px 14px rgba(30,144,255,.35)",transition:"all .2s"}}>
              SIGN UP
            </button>
            <div style={{width:52}}/>
          </div>
        </nav>

        {/* ════ HERO BANNER — exact gradient from screenshot ════ */}
        <div style={{marginTop:60,padding:"46px 44px 42px",position:"relative",overflow:"hidden",
          background:"linear-gradient(120deg, #2a4e96 0%, #3b70c4 35%, #6aa9dd 70%, #a8cbec 100%)"}}>
          <div style={{position:"absolute",inset:0,
            background:"radial-gradient(ellipse at 75% 50%,rgba(255,255,255,.12) 0%,transparent 55%)"}}/>
          <div style={{position:"absolute",bottom:0,right:0,width:280,height:120,
            background:"radial-gradient(ellipse at bottom right,rgba(255,255,255,.08) 0%,transparent 70%)"}}/>
          <h1 style={{fontFamily:"'Barlow',sans-serif",fontSize:"clamp(22px,3vw,36px)",fontWeight:700,
            color:"#fff",position:"relative",zIndex:1,textShadow:"0 2px 12px rgba(0,0,0,.25)",
            letterSpacing:"-.01em"}}>
            Welcome to YATICORP
          </h1>
        </div>

        {/* ════ CONTENT AREA ════ */}
       <div 
  className="content-wrapper"
  style={{
    position:"relative",
    zIndex:1,
    padding:"36px 44px 120px",
    width:"100%"
  }}
>

          {/* ── CATEGORIES ── */}
          <section style={{marginBottom:44}}>
            <SectionHead title="Categories" viewAll={false}/>
            <div style={{display:"flex",gap:12,flexWrap:"wrap"}}>
              {categories.map(({icon,label})=>(
                <div key={label} className="cat-chip" style={{display:"flex",alignItems:"center",gap:11,
                  padding:"10px 16px",background:"rgba(255,255,255,.04)",
                  border:"1px solid rgba(255,255,255,.07)",borderRadius:10,cursor:"pointer",
                  transition:"background .2s,border-color .2s",minWidth:170}}>
                  <div style={{width:38,height:38,borderRadius:8,background:"rgba(30,144,255,.12)",
                    border:"1px solid rgba(30,144,255,.18)",flexShrink:0,
                    display:"flex",alignItems:"center",justifyContent:"center",fontSize:18}}>
                    {icon}
                  </div>
                  <span style={{fontSize:12.5,color:"#CBD5E1",fontWeight:600,lineHeight:1.35,whiteSpace:"pre-line"}}>{label}</span>
                </div>
              ))}
            </div>
          </section>

          {/* ── COURSES ── */}
          <section style={{marginBottom:44}}>
            <SectionHead title="Courses" count={16}/>
            <div style={{display:"flex",gap:14,overflowX:"auto",paddingBottom:6}}>
              {courses.map((c,i)=>(
                <div key={i} className="course-card" style={{background:"#131E38",
                  border:"1px solid rgba(255,255,255,.07)",borderRadius:12,overflow:"hidden",
                  flex:"0 0 200px",cursor:"pointer",transition:"transform .25s,border-color .25s,box-shadow .25s",
                  boxShadow:"0 4px 20px rgba(0,0,0,.35)"}}>
                  <div style={{height:116,background:c.img
                    ? "linear-gradient(135deg,#0e2a5a,#1a4fa0)"
                    : "linear-gradient(135deg,#192040,#1E2B50)",
                    display:"flex",alignItems:"center",justifyContent:"center",position:"relative",overflow:"hidden"}}>
                    {c.img ? (
                      <>
                        <div style={{position:"absolute",inset:0,background:"linear-gradient(135deg,rgba(30,90,160,.6),rgba(14,230,209,.2))"}}/>
                        <span style={{fontFamily:"'Barlow',sans-serif",fontWeight:800,fontSize:13,
                          color:"rgba(255,255,255,.7)",zIndex:1,textAlign:"center",padding:"0 12px",lineHeight:1.3}}>
                          Foundations of Artificial Intelligence
                        </span>
                      </>
                    ):(
                      <span style={{fontFamily:"'Barlow',sans-serif",fontSize:32,fontWeight:800,
                        color:"rgba(255,255,255,.12)",letterSpacing:".02em"}}>{c.code}</span>
                    )}
                  </div>
                  <div style={{padding:"10px 12px"}}>
                    <p style={{fontSize:12,color:"#CBD5E1",fontWeight:600,lineHeight:1.4}}>{c.label}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* ── TESTS ── (matches screenshot 2 exactly) */}
          <section style={{marginBottom:44}}>
            <SectionHead title="Tests" count={3} viewAll={false}/>
            <div style={{display:"flex",flexDirection:"column",gap:0,
              background:"#131E38",border:"1px solid rgba(255,255,255,.07)",
              borderRadius:12,overflow:"hidden",maxWidth:1100}}>
              {tests.map((t,i)=>(
                <div key={i} className="test-row" style={{display:"flex",alignItems:"center",gap:0,
                  borderBottom:i<tests.length-1?"1px solid rgba(255,255,255,.06)":"none",
                  cursor:"pointer",transition:"background .2s,border-color .2s"}}>
                  {/* thumbnail area — matches the AI image thumbnails in screenshot 2 */}
                  <div style={{width:180,height:90,background:"linear-gradient(135deg,#0e1e40,#1a3a7a)",
                    flexShrink:0,display:"flex",alignItems:"center",justifyContent:"center",
                    borderRight:"1px solid rgba(255,255,255,.06)",position:"relative",overflow:"hidden"}}>
                    <div style={{position:"absolute",inset:0,background:"radial-gradient(circle at 30% 50%,rgba(30,144,255,.25),transparent 60%)"}}/>
                    <div style={{display:"flex",alignItems:"center",gap:8,zIndex:1}}>
                      <div style={{width:40,height:40,borderRadius:8,background:"rgba(30,144,255,.2)",
                        border:"2px solid rgba(30,144,255,.5)",display:"flex",alignItems:"center",
                        justifyContent:"center",fontFamily:"'Barlow',sans-serif",fontWeight:800,
                        fontSize:12,color:"#1E90FF",letterSpacing:".02em"}}>AI</div>
                      <span style={{fontSize:18}}>{t.icon}</span>
                    </div>
                  </div>
                  <div style={{flex:1,padding:"20px 24px"}}>
                    <p style={{fontSize:15,color:"#E8EEF8",fontWeight:700,marginBottom:5}}>{t.title}</p>
                    <p style={{fontSize:13,color:"#1E90FF",fontWeight:600}}>{t.status}</p>
                  </div>
                  <div style={{padding:"0 32px"}}>
                    <span style={{fontSize:14,fontWeight:800,color:"#0EE6D1",letterSpacing:".04em"}}>{t.price}</span>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* ── BUNDLES ── (matches screenshot 3) */}
          <section style={{marginBottom:44}}>
            <SectionHead title="Bundles" count={6}/>
            <div style={{display:"flex",gap:14,overflowX:"auto",paddingBottom:6}}>
              {bundles.map((b,i)=>(
                <div key={i} className="course-card" style={{background:"#131E38",
                  border:"1px solid rgba(255,255,255,.07)",borderRadius:12,overflow:"hidden",
                  flex:"0 0 215px",cursor:"pointer",transition:"transform .25s,border-color .25s,box-shadow .25s",
                  boxShadow:"0 4px 20px rgba(0,0,0,.35)"}}>
                  {/* thumbnail */}
                  <div style={{height:120,background:"linear-gradient(135deg,#fff 0%,#e8f4fd 100%)",
                    display:"flex",alignItems:"center",justifyContent:"center",
                    borderBottom:"1px solid rgba(255,255,255,.08)"}}>
                    <div style={{textAlign:"center",padding:"0 14px"}}>
                      <p style={{fontFamily:"'Barlow',sans-serif",fontWeight:800,fontSize:10,
                        color:"#1E90FF",letterSpacing:".08em",textTransform:"uppercase",marginBottom:2}}>AI &amp;</p>
                      <p style={{fontFamily:"'Barlow',sans-serif",fontWeight:800,fontSize:14,color:"#0D1228"}}>Data Analytics</p>
                    </div>
                  </div>
                  <div style={{padding:"12px 14px"}}>
                    <p style={{fontSize:12.5,color:"#CBD5E1",fontWeight:700,lineHeight:1.4,marginBottom:6}}>{b.title}</p>
                    <p style={{fontSize:11.5,color:"#8892B0",marginBottom:6}}>{b.products}</p>
                    <p style={{fontSize:14,fontWeight:800,color:"#E8EEF8"}}>{b.price}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* ── TEST SERIES ── */}
          <section>
            <SectionHead title="Test Series" count={3} viewAll={false}/>
            <div style={{display:"flex",flexDirection:"column",gap:0,
              background:"#131E38",border:"1px solid rgba(255,255,255,.07)",
              borderRadius:12,overflow:"hidden",maxWidth:1100}}>
              {testSeries.map((t,i)=>(
                <div key={i} className="test-row" style={{display:"flex",alignItems:"center",gap:0,
                  borderBottom:i<testSeries.length-1?"1px solid rgba(255,255,255,.06)":"none",
                  cursor:"pointer",transition:"background .2s"}}>
                  <div style={{width:180,height:90,background:"linear-gradient(135deg,#0e1e40,#1a3a7a)",
                    flexShrink:0,display:"flex",alignItems:"center",justifyContent:"center",
                    borderRight:"1px solid rgba(255,255,255,.06)",position:"relative",overflow:"hidden"}}>
                    <div style={{position:"absolute",inset:0,background:"radial-gradient(circle at 30% 50%,rgba(30,144,255,.22),transparent 60%)"}}/>
                    <div style={{display:"flex",alignItems:"center",gap:8,zIndex:1}}>
                      <div style={{width:40,height:40,borderRadius:8,background:"rgba(30,144,255,.2)",
                        border:"2px solid rgba(30,144,255,.5)",display:"flex",alignItems:"center",
                        justifyContent:"center",fontFamily:"'Barlow',sans-serif",fontWeight:800,
                        fontSize:12,color:"#1E90FF"}}>AI</div>
                      <span style={{fontSize:18}}>{t.icon}</span>
                    </div>
                  </div>
                  <div style={{flex:1,padding:"20px 24px"}}>
                    <p style={{fontSize:15,color:"#E8EEF8",fontWeight:700,marginBottom:5}}>{t.title}</p>
                    <p style={{fontSize:13,color:"#8892B0"}}>{t.meta}</p>
                  </div>
                  <div style={{padding:"0 32px"}}>
                    <span style={{fontSize:14,fontWeight:800,color:"#0EE6D1",letterSpacing:".04em"}}>{t.price}</span>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>

      {/* ════════════ CHATBOT TRIGGER ════════════ */}
      <div className="trigger" onClick={toggleChat} title="Chat with YATI AI"
        style={{position:"fixed",top:11,right:16,zIndex:200,cursor:"pointer",width:44,height:44}}>
        {/* glow pulse */}
        <div className="pulse" style={{position:"absolute",inset:-10,borderRadius:"50%",
          background:"radial-gradient(circle,rgba(14,230,209,.28),transparent 65%)"}}/>
        {/* spinning gradient ring — teal/blue matching YATICORP colors */}
        <div className="ring" style={{position:"absolute",inset:-4,borderRadius:"50%",
          background:"conic-gradient(from 0deg,#1E90FF,#0EE6D1,#8B5CF6,#1E90FF)",zIndex:0}}>
          <div style={{position:"absolute",inset:3,borderRadius:"50%",background:"#0C1022"}}/>
        </div>
        <div style={{position:"relative",zIndex:1,width:44,height:44,borderRadius:"50%",
          background:"linear-gradient(135deg,#131E38,#192040)",
          display:"flex",alignItems:"center",justifyContent:"center",
          boxShadow:"0 0 20px rgba(14,230,209,.38),inset 0 1px 0 rgba(255,255,255,.05)"}}>
          <BotAvatar size={21}/>
        </div>
        {/* green online dot */}
        <div style={{position:"absolute",top:0,right:0,zIndex:3,width:11,height:11,
          borderRadius:"50%",background:"#22C55E",border:"2.5px solid #0C1022",
          boxShadow:"0 0 8px rgba(34,197,94,.85)"}}/>
      </div>

      {/* ════════════ CHAT WINDOW ════════════ */}
      {open&&(
        <div className={`chat-win ${animState==="opening"||animState==="open"?"win-enter":"win-exit"}`}
          style={{position:"fixed",top:68,right:16,zIndex:190,
            width:392,maxHeight:"calc(100vh - 82px)",
            borderRadius:20,
            background:"rgba(12,16,34,.97)",
            backdropFilter:"blur(32px) saturate(1.4)",
            border:"1px solid rgba(30,144,255,.22)",
            boxShadow:`0 0 0 1px rgba(14,230,209,.06),
                       0 24px 80px rgba(0,0,0,.75),
                       0 0 50px rgba(30,144,255,.1),
                       inset 0 1px 0 rgba(255,255,255,.04)`,
            display:"flex",flexDirection:"column",overflow:"hidden",
            transformOrigin:"top right"}}>

          {/* ── Header with robot ── */}
          <div style={{position:"relative",overflow:"hidden",
            background:"linear-gradient(180deg,#07101F 0%,#0C1530 100%)",
            borderBottom:"1px solid rgba(30,144,255,.15)"}}>
            {/* dot-grid */}
            <div style={{position:"absolute",inset:0,pointerEvents:"none",
              backgroundImage:"radial-gradient(circle,rgba(30,144,255,.09) 1px,transparent 1px)",
              backgroundSize:"16px 16px"}}/>
            {/* corner glows */}
            <div style={{position:"absolute",top:0,left:0,width:80,height:80,pointerEvents:"none",
              background:"radial-gradient(circle at top left,rgba(30,144,255,.14),transparent 70%)"}}/>
            <div style={{position:"absolute",top:0,right:0,width:80,height:80,pointerEvents:"none",
              background:"radial-gradient(circle at top right,rgba(14,230,209,.14),transparent 70%)"}}/>
            <div style={{position:"absolute",bottom:0,left:"50%",transform:"translateX(-50%)",
              width:160,height:30,pointerEvents:"none",
              background:"radial-gradient(ellipse at bottom,rgba(30,144,255,.12),transparent 70%)"}}/>

            {/* Close button */}
            <button className="close-btn" onClick={closeChat} style={{position:"absolute",top:12,right:12,
              width:28,height:28,borderRadius:8,border:"1px solid rgba(255,255,255,.1)",
              background:"rgba(255,255,255,.05)",color:"#8892B0",cursor:"pointer",
              display:"flex",alignItems:"center",justifyContent:"center",
              fontSize:13,fontWeight:700,transition:"background .2s,color .2s",zIndex:2}}>✕</button>

            <RoboYati/>

            {/* accent line */}
            <div style={{height:2,background:"linear-gradient(90deg,transparent,#1E90FF,#0EE6D1,#8B5CF6,transparent)"}}/>
          </div>

          {/* ── Messages ── */}
          <div className="chat-msgs" style={{flex:1,overflowY:"auto",padding:"14px",
            display:"flex",flexDirection:"column",gap:12,maxHeight:305,
            background:"rgba(9,13,28,.65)"}}>
            {messages.map(msg=><Bubble key={msg.id} msg={msg}/>)}
            {loading&&(
              <div className="yati-msg" style={{display:"flex",gap:8,alignItems:"flex-end"}}>
                <div style={{width:28,height:28,borderRadius:"50%",flexShrink:0,
                  background:"linear-gradient(135deg,#192040,#1E2B50)",
                  border:"1.5px solid rgba(30,144,255,.4)",
                  display:"flex",alignItems:"center",justifyContent:"center",
                  boxShadow:"0 0 12px rgba(30,144,255,.2)"}}>
                  <BotAvatar size={15}/>
                </div>
                <Dots/>
              </div>
            )}
            <div ref={endRef}/>
          </div>

          {/* ── Input ── */}
          <div style={{padding:"12px 14px 14px",
            borderTop:"1px solid rgba(30,144,255,.1)",
            background:"rgba(11,16,34,.95)"}}>
            <div className="input-row" style={{display:"flex",gap:8,alignItems:"flex-end",
              background:"rgba(25,32,60,.9)",border:"1px solid rgba(30,144,255,.18)",
              borderRadius:14,padding:"8px 8px 8px 14px",
              transition:"border-color .2s,box-shadow .2s"}}>
              <textarea
                ref={el=>{inputRef.current=el;taRef.current=el;}}
                value={input} onChange={handleChange} onKeyDown={handleKey}
                placeholder="Ask about courses, tests, bundles…" rows={1}
                style={{flex:1,background:"none",border:"none",outline:"none",color:"#CBD5E1",
                  fontFamily:"'DM Sans',sans-serif",fontSize:13.5,fontWeight:500,
                  resize:"none",lineHeight:1.55,maxHeight:80,scrollbarWidth:"none"}}/>
              <button className="send-btn" onClick={sendMessage} disabled={!input.trim()||loading}
                style={{width:34,height:34,borderRadius:10,flexShrink:0,
                  background:input.trim()&&!loading?"linear-gradient(135deg,#1E90FF,#0EE6D1)":"rgba(30,144,255,.1)",
                  border:"none",cursor:input.trim()&&!loading?"pointer":"default",
                  display:"flex",alignItems:"center",justifyContent:"center",
                  boxShadow:input.trim()&&!loading?"0 4px 14px rgba(14,230,209,.3)":"none",
                  transition:"background .2s,box-shadow .2s,transform .15s"}}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
                  <path d="M22 2L11 13" stroke={input.trim()&&!loading?"#0C1022":"#8892B0"} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M22 2L15 22L11 13L2 9L22 2Z" stroke={input.trim()&&!loading?"#0C1022":"#8892B0"} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
            </div>
            <p style={{textAlign:"center",fontSize:10,color:"rgba(136,146,176,.35)",
              marginTop:8,fontWeight:600,letterSpacing:".04em"}}>
              YUKTHI AI · SkillX LMS
            </p>
          </div>
        </div>
      )}
    </>
  );
}