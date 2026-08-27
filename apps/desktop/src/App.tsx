"use client";
import { useEffect, useMemo, useState } from "react";
import {LanguageToggle} from "./i18n";
import {refreshBootstrap,request,session} from "./client";
type Status="done"|"notDone"|"na"|null; type Item={id:string;label:string}; type Section={title:string;instruction:string;items:Item[]}; type Checklist={id:string;name:string;shortName:string;schedule:string;icon:string;team:string;areaLabel:string;sections:Section[];weekly?:boolean};
type ChecklistPhoto={name:string;mime:string;data:string;preview:string};
const prepareChecklistPhoto=(file:File)=>new Promise<ChecklistPhoto>((resolve,reject)=>{const reader=new FileReader();reader.onerror=()=>reject(new Error("Could not read photo"));reader.onload=()=>{const image=new Image();image.onerror=()=>reject(new Error("The selected file is not a readable image"));image.onload=()=>{const max=1600,scale=Math.min(1,max/Math.max(image.width,image.height)),canvas=document.createElement("canvas");canvas.width=Math.max(1,Math.round(image.width*scale));canvas.height=Math.max(1,Math.round(image.height*scale));canvas.getContext("2d")?.drawImage(image,0,0,canvas.width,canvas.height);const preview=canvas.toDataURL("image/jpeg",.82),data=preview.split(",")[1];resolve({name:file.name.replace(/\.[^.]+$/,"")+".jpg",mime:"image/jpeg",data,preview})};image.src=String(reader.result)};reader.readAsDataURL(file)});
const items=(p:string,labels:string[]):Item[]=>labels.map((label,i)=>({id:`${p}${i+1}`,label}));
const checklists:Checklist[]=[
{id:"dusting",name:"Dusting & Cleaning",shortName:"Dusting",schedule:"Daily",icon:"dust",team:"Dusting Team",areaLabel:"Assigned portion of the org",sections:[{title:"DUSTING",instruction:"Inspect and remove dust, cobwebs and dirt",items:items("du",["Ceilings","Walls","Tops of desks and tables","Desk items","Lamps","Shelves","Cabinets","Bookcases","Windowsills","Signage","Thresholds","Kick plates","Baseboards"])},{title:"CLEANING",instruction:"Inspect and spot clean using Multi-Surface Cleaner",items:items("dc",["Ceilings","Walls","Shelves","Cabinets","Bookcases","Windowsills","Thresholds","Signage","Kick plates","Baseboards","All desks and table tops"])}]},
{id:"glass",name:"Glass Cleaning",shortName:"Glass",schedule:"Daily",icon:"▱",team:"Glass Cleaning Team",areaLabel:"Assigned portion of the org",sections:[{title:"GLASS SURFACES",instruction:"Clean interior glass and remove dirt and D7 residue",items:items("gl",["Glass walls","Glass partitions","Glass doors","Glass tables","Pictures and poster frames","TV screens using a microfiber suede cloth","Mirrors"])},{title:"DETAIL CLEANING",instruction:"Use additional treatment where needed",items:items("gd",["If dirt remains, use ammonia solution","Remove water spots or mineral deposits with distilled white vinegar"])}]},
{id:"floor",name:"Hard Floor Cleaning",shortName:"Hard Floor",schedule:"Daily",icon:"▦",team:"Hard Floor Team",areaLabel:"Assigned portion of the org",sections:[{title:"HARD FLOORS",instruction:"Clean all assigned hard-floor spaces",items:items("hf",["Move furniture or rugs out of the way as necessary","Remove debris from the floor","Scrub the floor","Use a microfiber mop for tight spaces","Remove spots or heavy soil using Multi-Surface Cleaner"])}]},
{id:"restroom",name:"Restroom Deep Cleaning & Sanitization",shortName:"Restrooms",schedule:"Daily",icon:"WC",team:"Restroom Team",areaLabel:"Assigned restroom",sections:[{title:"TOILETS & URINALS",instruction:"Deep clean and sanitize fixtures",items:items("rt",["Spray Multi-Surface Cleaner on toilets","Spray Multi-Surface Cleaner on urinals","Scrub toilet bowls with a toilet brush","Scrub urinals with a toilet brush","Remove stains with Bar Keepers Friend","Sanitize the brush head","Dry toilets and urinals with disposable wipes","Discard used gloves, sanitize hands and put on new gloves"])},{title:"DUSTING",instruction:"Dust restroom surfaces",items:items("rd",["Stall partitions","Toilet-paper dispenser","Paper-towel dispenser","Counters","Baseboards","A/C vents (weekly)","Ceilings (weekly)","Walls (weekly)"])},{title:"SURFACES",instruction:"Clean, sanitize and restock",items:items("rs",["Spray Multi-Surface Cleaner on all surfaces","Starting with sinks, clean all surfaces","Spray undiluted D7 on all surfaces, including toilets and urinals","Let D7 sit for 10 minutes","Restock all restroom supplies while D7 sits","Remove D7 residue from toilets and urinals after 10 minutes","Discard used gloves, sanitize hands and put on new gloves","Remove D7 residue from all surfaces; use microfiber suede cloth on chrome","Clean mirrors with microfiber glass cloths and distilled water","Empty trash"])},{title:"FLOOR",instruction:"Clean and sanitize the restroom floor",items:items("rf",["Remove floor debris with a clean, dry microfiber mop","Clean floor with Multi-Surface Cleaner and a floor scrubber","Clean areas not reached with a microfiber mop","Remove mop pad","Clean floor with D7 and a microfiber mop","Remove mop pad","Return cleaning supplies and tools"])}]},
{id:"shredding",name:"Shredding Removal",shortName:"Shredding",schedule:"Daily",icon:"▥",team:"Shredding Team",areaLabel:"Assigned route or floors",sections:[{title:"SHREDDING",instruction:"Securely collect and process shredding",items:items("sh",["Collect shredding from predetermined central locations on each floor","Turn on the machine","Shred all shredding particles","Turn off the machine"])},{title:"SHREDDING ROOM",instruction:"Clean and reset the shredding room",items:items("sr",["Remove full shred bag","Replace shred bag","Dust shredding machine","Sweep shredding room"])}]},
{id:"trash",name:"Trash Removal",shortName:"Trash",schedule:"Daily",icon:"▰",team:"Trash Removal Team",areaLabel:"Assigned route or floors",sections:[{title:"TRASH REMOVAL",instruction:"Collect, dispose, clean and return receptacles",items:items("tr",["Collect filled mobile trash receptacles from predetermined central locations","Dispose of all trash in an outside receptacle or dumpster","Clean and sanitize mobile trash receptacles","Replace liners","Return mobile trash receptacles to their proper locations"])}]},
{id:"upholstery",name:"Upholstery Cleaning",shortName:"Upholstery",schedule:"Weekly route",icon:"▰▰",team:"Upholstery Team",areaLabel:"Assigned portion of the org for this day",weekly:true,sections:[{title:"TODAY'S UPHOLSTERY ROUTE",instruction:"Vacuum all upholstery and fabrics in each assigned space",items:items("up",["Chairs","Couches, sofas and lounge chairs","Curtains"])}]},
{id:"vacuum",name:"Vacuum Cleaning",shortName:"Vacuuming",schedule:"Daily",icon:"◒",team:"Carpet Vacuuming Team",areaLabel:"Assigned portion of the org",sections:[{title:"PREPARATION",instruction:"Prepare each assigned carpeted space",items:items("vp",["Move furniture or chairs out of the way as necessary","Remove debris from the floor","Remove large particles from the floor"])},{title:"VACUUMING",instruction:"Vacuum and finish the assigned spaces",items:items("vv",["Vacuum carpets","Use a crevice tool on corners and carpet edges as necessary","Handle spots or stains with the spot extractor","Put moved furniture or chairs back in place"])}]}
,{id:"dustingWeekly",name:"Dusting & Cleaning Weekly",shortName:"Dusting Weekly",schedule:"Weekly route",icon:"dust",team:"Dusting Weekly Team",areaLabel:"Assigned portion of the org for this day",weekly:true,sections:[{title:"HARD-TO-REACH DUSTING",instruction:"Dust each hard-to-reach area in the assigned spaces",items:items("dw",["Light fixtures","Ceiling vents","Ceilings, as needed","Walls, as needed","High ledges","Blinds","Inside drawers","Behind furniture","Sides of furniture","Undersides of furniture","Doors and frames","Books"])},{title:"HARD-TO-REACH CLEANING",instruction:"Spot clean each applicable area",items:items("dwc",["Light fixtures","Ceilings","Walls","Sides of furniture"])}]}
,{id:"cafeDaily",name:"Café Cleaning Daily",shortName:"Café Daily",schedule:"Daily · split shifts",icon:"cafe",team:"Café Crew",areaLabel:"Café area or station",sections:[{title:"MORNING SHIFT · UPKEEP",instruction:"Maintain the café throughout the day",items:items("cdm",["Remove debris and trash from tables","Clean and sanitize tables","Clean and sanitize chairs","Clean and sanitize counters","Clean and sanitize food-service equipment","Clean and sanitize work surfaces","Clean espresso steam wand after every use","Clean dishes and utensils after each use","Spot clean refrigerator and freezer interiors","Clean glass with distilled water and microfiber glass cloth","Sweep floor as necessary","Spot clean floor with Multi-Surface Cleaner and microfiber mop"])},{title:"EVENING SHIFT · END OF DAY",instruction:"Deep clean and sanitize the café at closing",items:items("cde",["Remove food items from areas being cleaned","Remove debris and trash from tables","Fully clean food-preparation areas with Multi-Surface Cleaner","Apply diluted D7 and allow 10 minutes dwell time","Empty and sanitize trash receptacles and replace liners","Change gloves and wash hands","Rinse surfaces with water","Wipe surfaces dry","Cover or store fresh food-display items","Dispose of unused coffee or beverages and clean containers","Wash and sanitize serving tools and utensils","Clean and polish sinks and remove water spots","Clean floor with Multi-Surface Cleaner and i-mop"])}]}
,{id:"cafeWeekly",name:"Café Cleaning Weekly",shortName:"Café Weekly",schedule:"Weekly · split shifts",icon:"cafe",team:"Café Crew",areaLabel:"Café weekly assignment",weekly:true,sections:[{title:"MORNING PERSON · WEEKLY PART",instruction:"Complete the assigned front-of-house and cold-storage work",items:items("cwm",["Dust and clean ceiling","Dust and clean vents","Dust and clean high ledges","Dust and clean hanging lights","Dust and clean furniture","Dust and clean shelving","Dust and clean baseboards","Dust and clean walls","Clean table and chair surfaces and undersides","Clean refrigerator interiors, shelves and seals; replace contents","Clean refrigerator exteriors","Empty, clean and reset pastry displays","Clean and polish stainless-steel surfaces"])},{title:"EVENING PERSON · WEEKLY PART",instruction:"Complete the assigned equipment, drain and floor work",items:items("cwe",["Clean cold ovens, microwaves and similar appliances per manufacturer instructions","Clean dishwashing machine interior per manufacturer instructions","Clear dishwasher, sink and ice-machine drains","Clean all sinks and drying racks","Clean public and food-preparation floors, including under fridges and counters","Degrease, dwell, scrub and rinse floor behind café work area"])},{title:"MONTHLY ADD-ON · WHEN DUE",instruction:"Complete these items during the scheduled monthly week",items:items("cwx",["Empty, defrost and clean freezer; clean seals, air out, restart and replace food","Clean ice-machine interior per manufacturer manual"])}]}
,{id:"operationsMonitor",name:"Cleaning Operations Monitor",shortName:"Ops Monitor",schedule:"Daily · oversight",icon:"monitor",team:"Cleaning Operations Monitor",areaLabel:"Cleaning period, building, or assigned inspection route",sections:[{title:"PRE-CLEANING MEETING",instruction:"Verify that every team is ready and accounted for",items:items("omr",["Attend the pre-cleaning meeting","Ask each Team Leader whether every assigned member is present","Confirm every missing member is accounted for or marked unexcused","Follow up with missing members and direct them to their assigned team","Confirm every Team Leader knows the team’s assigned duties"])},{title:"CHECKLIST & UNIFORM READINESS",instruction:"Confirm teams have the tools and clothing required to begin",items:items("ome",["Verify every team has its correct checklist in hardcopy or digital form","Confirm Team Leaders are actively using the checklist to direct and record work","Verify all team members are wearing the required cleaning coveralls","Direct any person without the required checklist or coveralls to correct the issue"])},{title:"ACTIVE PARTICIPATION",instruction:"Observe teams while cleaning is underway",items:items("omp",["Make rounds through all active team areas","Confirm each member is performing an assigned duty","Identify goofing off, slacking, or unproductive behavior","Prompt non-participating members to return to work","Notify the responsible Team Leader of repeated participation problems"])},{title:"QUALITY INSPECTION",instruction:"Inspect completed spaces and route corrections to the Team Leader",items:items("omq",["Inspect the areas reported as completed","Confirm visible surfaces and assigned spaces were cleaned properly","Compare completed work against the team’s checklist requirements","Tell the responsible Team Leader about any missed or poorly cleaned areas","Verify the Team Leader assigns and completes the needed correction","Record any unresolved quality issue for Master Administrator review"])}]}
];
const days=["Mon","Tue","Wed","Thu","Fri","Sat","Sun"];
type MemberStatus="participated"|"absent"|"noParticipation"|"excused"|null;
const iconPhotos:Record<string,string>={glass:"glass.jfif",floor:"floor.jfif",restroom:"restroom.jfif",shredding:"shredding.jfif",trash:"trash.jfif",upholstery:"upholstery.jfif",vacuum:"vacuum.jfif"};
const emptyWeekData=days.map(day=>({day,score:0,done:0,missed:[]}));
const isoToday=()=>{const now=new Date(),offset=now.getTimezoneOffset();return new Date(now.getTime()-offset*60000).toISOString().slice(0,10)};
const displayDate=(value:string)=>new Date(`${value}T12:00:00`).toLocaleDateString(undefined,{weekday:'long',year:'numeric',month:'long',day:'numeric'});
const weekBounds=(value:string)=>{const chosen=new Date(`${value}T12:00:00`),day=(chosen.getDay()+6)%7,monday=new Date(chosen);monday.setDate(chosen.getDate()-day);const sunday=new Date(monday);sunday.setDate(monday.getDate()+6);const iso=(date:Date)=>date.toISOString().slice(0,10);return{start:iso(monday),end:iso(sunday),label:`${monday.toLocaleDateString(undefined,{month:'short',day:'numeric'})}–${sunday.toLocaleDateString(undefined,{month:'short',day:'numeric',year:'numeric'})}`}};
function ChecklistIcon({checklist}:{checklist:Checklist}){if(checklist.icon==="dust")return <div className="cleaning-icon">
<img className="mop-photo" src="./icons/dust-mop.jfif" alt=""/>
<img className="bottle-photo" src="./icons/spray-bottle.jfif" alt=""/>
</div>;if(checklist.icon==="cafe")return <div className="category-icon cafe-icon" aria-hidden="true">☕</div>;if(checklist.icon==="monitor")return <div className="category-icon monitor-icon" aria-hidden="true">✓</div>;return <div className={`category-icon photo-icon icon-${checklist.id}`} aria-hidden="true">
<img src={`./checklist-icons/${iconPhotos[checklist.id]}`} alt=""/>
</div>}
function EstatesAlert({checklist,onBack}:{checklist:Checklist;onBack:()=>void}){
 const empty={category:"",priority:"Routine",location:"",discoveredBy:"",description:"",actionTaken:""};
 const [form,setForm]=useState(empty),[sent,setSent]=useState(false),[error,setError]=useState(false);
 const update=(field:string,value:string)=>{setError(false);setForm(f=>({...f,[field]:value}))};
 const submit=async()=>{if(!form.category||!form.location.trim()||!form.description.trim()){setError(true);return}try{const team=session.bootstrap?.teams?.find((t:any)=>t.checklist_id===session.bootstrap?.checklists?.find((c:any)=>c.name===checklist.name)?.id)||session.bootstrap?.teams?.[0];await request('/api/alerts',{method:'POST',body:JSON.stringify({team_id:team?.id,category:form.category,priority:form.priority,location:form.location,discovered_by:form.discoveredBy,description:form.description,action_taken:form.actionTaken})});await refreshBootstrap();setSent(true);window.scrollTo({top:0,behavior:"smooth"})}catch{setError(true)}};
 return <section className="alert-view">
<div className="alert-header">
<div className="alert-symbol">!</div>
<div>
<p className="eyebrow">TEAM LEADER REPORT</p>
<h1>Estates Alert</h1>
<p>Report damage, maintenance needs, or safety concerns found while your team is cleaning.</p>
</div>
<button onClick={onBack}>← Back to checklist</button>
</div>{sent?<div className="alert-success">
<span>✓</span>
<div>
<p className="eyebrow">ALERT SUBMITTED</p>
<h2>Sent to the Master Administrator</h2>
<p>Your Estates Alert <b>#EA-0812-024</b> has been recorded for review. Keep the alert number for reference.</p>
<div>
<button onClick={()=>{setSent(false);setForm(empty)}}>Create another alert</button>
<button className="secondary" onClick={onBack}>Return to checklist</button>
</div>
</div>
</div>:<>
<div className="alert-context">
<div>
<span>SUBMITTING TEAM</span>
<strong>{checklist.team}</strong>
</div>
<div>
<span>RELATED CHECKLIST</span>
<strong>{checklist.name}</strong>
</div>
<div>
<span>DATE FOUND</span>
<strong>{displayDate(isoToday())}</strong>
</div>
</div>
<form className="alert-form" onSubmit={e=>{e.preventDefault();submit()}}>
<div className="form-heading">
<div>
<h2>Tell us what your team found</h2>
<p>Required fields are marked with an asterisk.</p>
</div>
<span>Master Administrator review</span>
</div>{error&&<div className="form-error">Please select an alert type and enter both the location and a description.</div>}<div className="form-grid">
<label>What kind of alert? *<select value={form.category} onChange={e=>update("category",e.target.value)}>
<option value="">Select an alert type</option>{["Mechanical","Electrical","Plumbing or water leak","Carpet damage","Furniture damage","Wall or ceiling damage","Safety hazard","Pest issue","Other"].map(x=>
<option key={x}>{x}</option>)}</select>
</label>
<label>Priority<select value={form.priority} onChange={e=>update("priority",e.target.value)}>
<option>Routine</option>
<option>Important</option>
<option>Urgent</option>
<option>Immediate safety concern</option>
</select>
</label>
<label className="wide">Where was the issue found? *<input value={form.location} onChange={e=>update("location",e.target.value)} placeholder="Example: 2nd floor bookstore, behind the bookcase"/>
</label>
<label>Discovered by<input value={form.discoveredBy} onChange={e=>update("discoveredBy",e.target.value)} placeholder="Team member’s name"/>
</label>
<label>Team leader<input value="Team Leader · Beta User" readOnly/>
</label>
<label className="wide">Briefly describe the issue: *<textarea value={form.description} onChange={e=>update("description",e.target.value)} placeholder="Example: Sally Sue was cleaning behind the bookcase and found a large crack in the wall in the 2nd floor bookstore." rows={6}/>
<small>Include what was found, its exact location, and anything that could help the administrator understand the issue.</small>
</label>
<label className="wide">Immediate action taken <span>(optional)</span>
<textarea value={form.actionTaken} onChange={e=>update("actionTaken",e.target.value)} placeholder="Example: Moved the bookcase away from the wall and placed a caution sign nearby." rows={3}/>
</label>
</div>
<div className="alert-submit">
<p>Submitting sends this report to the Master Administrator for review.</p>
<button type="submit">Submit Estates Alert</button>
</div>
</form>
</>}</section>
}
type AdminTab="overview"|"submissions"|"alerts"|"missing"|"people"|"standings"|"recognition"|"season";
function SharedDataEditor(){
 const [data,setData]=useState<any>(session.bootstrap||{teams:[],members:[],checklists:[]}),[message,setMessage]=useState('');
 const reload=async()=>{const next=await refreshBootstrap();setData({...next});setMessage('Saved to the shared database')};
 const rename=async(kind:'teams'|'members'|'checklists',row:any)=>{const value=window.prompt(`New ${kind==='members'?'member':'name'}:`,row.name);if(!value?.trim())return;if(kind==='teams')await request(`/api/teams/${row.id}`,{method:'PUT',body:JSON.stringify({...row,name:value.trim()})});if(kind==='members')await request(`/api/members/${row.id}`,{method:'PUT',body:JSON.stringify({...row,name:value.trim()})});if(kind==='checklists')await request(`/api/checklists/${row.id}`,{method:'PUT',body:JSON.stringify({...row,name:value.trim()})});await reload()};
 const addMember=async()=>{const team=data.teams[0];const name=window.prompt('New team member name:');if(!name?.trim()||!team)return;await request('/api/members',{method:'POST',body:JSON.stringify({team_id:team.id,name:name.trim()})});await reload()};
 return <section className="admin-card shared-editor"><div className="admin-card-head"><div><p className="eyebrow">SHARED DATABASE EDITOR</p><h2>Editable staff beta information</h2><span>Use Edit to replace the sample names. Changes appear on every connected desktop.</span></div><button onClick={addMember}>+ Add member</button></div>{message&&<div className="saved-report">✓ {message}</div>}<div className="shared-editor-columns"><div><h3>Teams</h3>{data.teams.map((row:any)=><button key={row.id} onClick={()=>rename('teams',row)}><b>{row.name}</b><small>{row.division} · {row.schedule}</small><em>Edit</em></button>)}</div><div><h3>Members</h3>{data.members.map((row:any)=><button key={row.id} onClick={()=>rename('members',row)}><b>{row.name}</b><small>{data.teams.find((t:any)=>t.id===row.team_id)?.name}</small><em>Edit</em></button>)}</div><div><h3>Checklist names</h3>{data.checklists.map((row:any)=><button key={row.id} onClick={()=>rename('checklists',row)}><b>{row.name}</b><small>{row.schedule}</small><em>Edit</em></button>)}</div></div></section>
}
function SeasonEditor(){
 const initial=session.bootstrap?.season||{name:'Launch Season',theme:'The Launch of the Cleanlympics',start_date:'2026-09-01',end_date:'2026-09-30',current_week:1};
 const [form,setForm]=useState({...initial}),[message,setMessage]=useState('');
 const save=async()=>{await request('/api/settings/season',{method:'PUT',body:JSON.stringify(form)});await refreshBootstrap();setMessage('Season settings saved for every connected desktop.')};
 const totalWeeks=Math.max(1,Math.ceil((new Date(`${form.end_date}T12:00:00`).getTime()-new Date(`${form.start_date}T12:00:00`).getTime()+86400000)/604800000));
 return <section className="admin-card season-editor"><div className="admin-card-head"><div><p className="eyebrow">SEASON CONTROL</p><h2>Set the competition period and theme</h2><span>The first beta season starts as Launch Season. You can rename or extend it at any time.</span></div></div>{message&&<div className="saved-report">✓ {message}</div>}<div className="form-grid"><label>Season name<input value={form.name} onChange={e=>setForm({...form,name:e.target.value})}/></label><label>Season theme<input value={form.theme} onChange={e=>setForm({...form,theme:e.target.value})}/></label><label>Start date<input type="date" value={form.start_date} onChange={e=>setForm({...form,start_date:e.target.value})}/></label><label>End date<input type="date" value={form.end_date} min={form.start_date} onChange={e=>setForm({...form,end_date:e.target.value})}/></label><label>Current week<input type="number" min="1" max={totalWeeks} value={form.current_week} onChange={e=>setForm({...form,current_week:Number(e.target.value)})}/><small>{totalWeeks} week{totalWeeks===1?'':'s'} in the selected period</small></label></div><button className="primary-action" onClick={save}>Save season settings</button></section>
}
function PeopleAccessManager(){
 const [data,setData]=useState<any>(session.bootstrap||{teams:[],members:[],users:[],checklists:[]}),[message,setMessage]=useState('');
 const reload=async(message='Saved to the shared database')=>{const next=await refreshBootstrap();setData({...next});setMessage(message)};
 const addLeader=async()=>{const display_name=window.prompt('Team Leader full name:');if(!display_name?.trim())return;const username=window.prompt('Sign-in username:');if(!username?.trim())return;const password=window.prompt('Temporary password (at least 8 characters):','TempPass123!');if(!password)return;const teamName=window.prompt(`Assigned team (enter exactly):\n${data.teams.map((t:any)=>t.name).join('\n')}`,data.teams[0]?.name);const team=data.teams.find((t:any)=>t.name.toLowerCase()===teamName?.trim().toLowerCase());if(!team)return window.alert('Team not found.');await request('/api/users',{method:'POST',body:JSON.stringify({display_name:display_name.trim(),username:username.trim(),password,team_id:team.id})});await reload('Team Leader account created')};
 const editLeader=async(user:any)=>{const display_name=window.prompt('Team Leader full name:',user.display_name);if(!display_name?.trim())return;const username=window.prompt('Sign-in username:',user.username);if(!username?.trim())return;const teamName=window.prompt(`Assigned team (enter exactly):\n${data.teams.map((t:any)=>t.name).join('\n')}`,data.teams.find((t:any)=>t.id===user.team_id)?.name);const team=data.teams.find((t:any)=>t.name.toLowerCase()===teamName?.trim().toLowerCase());if(!team)return window.alert('Team not found.');await request(`/api/users/${user.id}`,{method:'PUT',body:JSON.stringify({display_name:display_name.trim(),username:username.trim(),team_id:team.id,active:Boolean(user.active)})});await reload()};
 const resetPassword=async(user:any)=>{const password=window.prompt(`New temporary password for ${user.display_name}:`,'TempPass123!');if(!password)return;await request(`/api/users/${user.id}/password`,{method:'PUT',body:JSON.stringify({password})});await reload('Temporary password saved')};
 const editMember=async(member:any)=>{const name=window.prompt('Member full name:',member.name);if(!name?.trim())return;const teamName=window.prompt(`Assigned team (enter exactly):\n${data.teams.map((t:any)=>t.name).join('\n')}`,data.teams.find((t:any)=>t.id===member.team_id)?.name);const team=data.teams.find((t:any)=>t.name.toLowerCase()===teamName?.trim().toLowerCase());if(!team)return window.alert('Team not found.');await request(`/api/members/${member.id}`,{method:'PUT',body:JSON.stringify({name:name.trim(),team_id:team.id})});await reload()};
 const addMember=async()=>{const name=window.prompt('New member full name:');if(!name?.trim())return;const teamName=window.prompt(`Assigned team (enter exactly):\n${data.teams.map((t:any)=>t.name).join('\n')}`,data.teams[0]?.name);const team=data.teams.find((t:any)=>t.name.toLowerCase()===teamName?.trim().toLowerCase());if(!team)return window.alert('Team not found.');await request('/api/members',{method:'POST',body:JSON.stringify({name:name.trim(),team_id:team.id})});await reload('Member added')};
 const editTeam=async(team:any)=>{const name=window.prompt('Team name:',team.name);if(!name?.trim())return;const checklistName=window.prompt(`Assigned checklist (enter exactly):\n${data.checklists.map((c:any)=>c.name).join('\n')}`,data.checklists.find((c:any)=>c.id===team.checklist_id)?.name);const checklist=data.checklists.find((c:any)=>c.name.toLowerCase()===checklistName?.trim().toLowerCase());if(!checklist)return window.alert('Checklist not found.');await request(`/api/teams/${team.id}`,{method:'PUT',body:JSON.stringify({...team,name:name.trim(),checklist_id:checklist.id})});await reload()};
 const leaders=(data.users||[]).filter((u:any)=>u.role==='leader');
 return <><section className="people-grid"><section className="admin-card people-list"><div className="admin-card-head"><div><p className="eyebrow">TEAM LEADER ACCESS</p><h2>Real sign-in accounts</h2></div><button onClick={addLeader}>+ Add Team Leader</button></div>{leaders.length?leaders.map((u:any)=><div className="person-line" key={u.id}><span><i>{u.display_name.split(' ').map((x:string)=>x[0]).join('').slice(0,2)}</i><b>{u.display_name}</b></span><span>{data.teams.find((t:any)=>t.id===u.team_id)?.name||'Unassigned'}</span><span>{u.username}</span><button className="reset-pass" onClick={()=>editLeader(u)}>Edit account</button><button className="reset-pass" onClick={()=>resetPassword(u)}>Reset password</button></div>):<div className="empty-detail"><span>—</span><h2>No Team Leaders entered</h2><p>Add the first Team Leader to grant access.</p></div>}</section><aside className="admin-card access-summary"><p className="eyebrow">ACCESS SUMMARY</p><h2>Team Leader accounts</h2><strong>{leaders.filter((u:any)=>u.active).length}</strong><span>active leader accounts</span><div><b>Security note</b><p>Each account opens only its assigned team. Master Administrator access remains separate.</p></div></aside></section>{message&&<div className="saved-report">✓ {message}</div>}<section className="admin-card shared-editor"><div className="admin-card-head"><div><p className="eyebrow">ROSTERS & ASSIGNMENTS</p><h2>All checklist teams</h2><span>Every checklist is available for assignment. Team and member names remain editable.</span></div><button onClick={addMember}>+ Add member</button></div><div className="shared-editor-columns"><div><h3>Teams & checklist</h3>{data.teams.map((row:any)=><button key={row.id} onClick={()=>editTeam(row)}><b>{row.name}</b><small>{data.checklists.find((c:any)=>c.id===row.checklist_id)?.name||'Unassigned'} · {row.division}</small><em>Edit</em></button>)}</div><div><h3>Members</h3>{data.members.length?data.members.map((row:any)=><button key={row.id} onClick={()=>editMember(row)}><b>{row.name}</b><small>{data.teams.find((t:any)=>t.id===row.team_id)?.name}</small><em>Edit</em></button>):<p>No members entered yet.</p>}</div><div><h3>All checklists</h3>{data.checklists.map((row:any)=><div key={row.id}><b>{row.name}</b><small>{row.schedule}</small></div>)}</div></div></section></>
}
function AdminPortal({onBack}:{onBack:()=>void}){
 const [tab,setTab]=useState<AdminTab>("overview"),[slot,setSlot]=useState("All teams"),[opened,setOpened]=useState<string|null>(null),[submissionDetail,setSubmissionDetail]=useState<any>(null),[reviewed,setReviewed]=useState<string[]>([]),[reports,setReports]=useState<string[]>([]),[awardApproved,setAwardApproved]=useState(false),[eveningAwardApproved,setEveningAwardApproved]=useState(false),[recognitionTeam,setRecognitionTeam]=useState(""),[recognitionFormat,setRecognitionFormat]=useState<"team"|"individual">("team"),[recognitionAward,setRecognitionAward]=useState("");
 const preStored=session.bootstrap;const season=preStored?.season||{name:'Launch Season',theme:'The Launch of the Cleanlympics',start_date:'2026-09-01',end_date:'2026-09-30',current_week:1};const seasonWeeks=Math.max(1,Math.ceil((new Date(`${season.end_date}T12:00:00`).getTime()-new Date(`${season.start_date}T12:00:00`).getTime()+86400000)/604800000));const weeksRemaining=Math.max(0,seasonWeeks-Number(season.current_week));const selectedRecognitionTeam=preStored?.teams?.find((t:any)=>String(t.id)===recognitionTeam);const recognitionMembers=selectedRecognitionTeam?preStored.members.filter((m:any)=>m.team_id===selectedRecognitionTeam.id):[];const recognitionChecklist=selectedRecognitionTeam?preStored.checklists.find((c:any)=>c.id===selectedRecognitionTeam.checklist_id):null;const recognitionDivision=selectedRecognitionTeam?`${selectedRecognitionTeam.division} Team Tournament`:'';
 const stored=session.bootstrap;const adminSubmissions=stored?.submissions?.length?stored.submissions.map((s:any)=>({id:`CL-${s.id}`,team:s.team_name,checklist:s.checklist_name,time:new Date(s.submitted_at).toLocaleString(),score:Number(s.completion_percent),leader:s.submitted_by_name||'Team Leader',rawId:s.id,status:s.status})):[];const adminAlerts=stored?.alerts?.length?stored.alerts.map((a:any)=>({id:`EA-${a.id}`,kind:a.category,priority:a.priority||'Routine',location:a.location,team:stored.teams.find((t:any)=>t.id===a.team_id)?.name||'Team',detail:a.description,age:new Date(a.created_at).toLocaleString(),rawId:a.id,status:a.status})):[];const standingRows=stored?.teams?.map((t:any)=>{const records=stored.submissions.filter((s:any)=>s.team_id===t.id&&s.status!=="rejected");const score=records.length?records.reduce((sum:number,s:any)=>sum+Number(s.completion_percent),0)/records.length:0;return{id:t.id,name:t.name,slot:t.division==="Day"?"Morning":"Evening",score:Math.round(score),points:records.reduce((sum:number,s:any)=>sum+Number(s.total_points),0),trend:records.slice(0,5).map((s:any)=>Number(s.completion_percent)),status:records.some((s:any)=>s.work_date===isoToday())?"submitted":"missing"}})||[];const adminTeams=standingRows,hasScores=adminTeams.some((t:any)=>t.points>0),dayLeader=adminTeams.filter((t:any)=>t.slot==='Morning').sort((a:any,b:any)=>b.points-a.points)[0],eveningLeader=adminTeams.filter((t:any)=>t.slot==='Evening').sort((a:any,b:any)=>b.points-a.points)[0];const todayAttendance=(stored?.attendanceRecords||[]).filter((a:any)=>a.work_date===isoToday());const attendanceRows=(stored?.teams||[]).map((team:any)=>{const rosterCount=stored.members.filter((m:any)=>m.team_id===team.id).length,records=todayAttendance.filter((a:any)=>a.team_id===team.id),missed=records.filter((a:any)=>['absent','noParticipation'].includes(a.status)).length;return{name:team.name,roster:rosterCount,participated:records.filter((a:any)=>a.status==='participated').length,missed,reported:records.length>0}});const offenderRows=(stored?.offenders||[]).map((o:any)=>({name:o.name,team:stored.teams.find((t:any)=>t.id===o.team_id)?.name||'Team',incidents:o.incidents,citations:stored.citations.filter((c:any)=>c.member_id===o.member_id).length}));
 const missingTeams=adminTeams.filter(t=>t.status==="missing");
 const teams=adminTeams.filter(t=>slot==="All teams"||t.slot===slot); const leader=[...teams].sort((a,b)=>b.points-a.points)[0];
 const overallUsage=stored.submissions.length?stored.submissions.reduce((sum:number,row:any)=>sum+Number(row.completion_percent),0)/stored.submissions.length:0;
 const openSubmission=async(s:any)=>{setOpened(s.id);setSubmissionDetail(null);if(s.rawId)try{setSubmissionDetail(await request(`/api/submissions/${s.rawId}`))}catch{setSubmissionDetail(null)}};
 const nav=(id:AdminTab,label:string,count?:number)=>
<button className={tab===id?"active":""} onClick={()=>{setTab(id);setOpened(null);setSubmissionDetail(null)}}>
<span>{id==="overview"?"⌂":id==="submissions"?"✓":id==="alerts"?"!":id==="people"?"♟":id==="standings"?"♛":id==="recognition"?"★":"×"}</span>{label}{count!==undefined&&<b>{count}</b>}</button>;
 const reportTeam=adminTeams.find(t=>t.name===opened);
 return <section className="admin-portal"><LanguageToggle/>
<aside className="admin-sidebar">
<div className="admin-title">
<div className="admin-logo"><img src="./cleanlympics-logo.png" alt="Cleanlympics mop torch"/></div>
<span>
<b>Master Administrator</b>
<small>Cleanlympics Control Center</small>
</span>
</div>
<nav>{nav("overview","Overview")}{nav("season","Season setup")}{nav("standings","Print standings")}{nav("recognition","Acknowledgements")}{nav("submissions","Checklist review",adminSubmissions.length-reviewed.filter(x=>x.startsWith("CL")).length)}{nav("alerts","Estates Alerts",adminAlerts.length-reviewed.filter(x=>x.startsWith("EA")).length)}{nav("missing","Missing reports",missingTeams.length)}{nav("people","People & Access")}</nav>
<div className="admin-user">
<span>CR</span>
<div>
<b>Christian Ramirez</b>
<small>Master Administrator</small>
</div>
</div>
<button className="exit-admin" onClick={onBack}>← Team Leader Portal</button>
</aside>
<div className="admin-main">
<header className="admin-top">
<div>
<p>{displayDate(isoToday())}</p>
<h1>{tab==="overview"?"Good morning, Christian":tab==="submissions"?"Checklist submissions":tab==="alerts"?"Estates Alert review":tab==="people"?"People & Access":tab==="season"?"Season setup":tab==="standings"?"Printable league standings":tab==="recognition"?"Printable team acknowledgements":"Missing checklist reports"}</h1>
</div>
<div className="admin-top-actions">
<button onClick={()=>setTab("alerts")}>! {adminAlerts.length} alerts</button>
<span>ADMIN</span>
</div>
</header>
 {tab==="overview"&&<>
<div className="admin-stats">
<article>
<span>AWAITING REVIEW</span>
<strong>{adminSubmissions.length-reviewed.filter(x=>x.startsWith("CL")).length}</strong>
<small>Checklist submissions</small>
</article>
<article className="warning">
<span>ESTATES ALERTS</span>
<strong>{adminAlerts.length-reviewed.filter(x=>x.startsWith("EA")).length}</strong>
<small>Require administrator review</small>
</article>
<article className="danger">
<span>MISSING TODAY</span>
<strong>{missingTeams.length}</strong>
<small>Past expected submission time</small>
</article>
<article className="good">
<span>WEEKLY USE</span>
<strong>{overallUsage.toFixed(1)}%</strong>
<small>{stored.submissions.length?`${stored.submissions.length} submitted checklists`:'No results entered'}</small>
</article>
</div>
<div className="admin-grid">
<section className="admin-card performance-card">
<div className="admin-card-head">
<div>
<p className="eyebrow">TEAM PERFORMANCE</p>
<h2>Checklist use this week</h2>
</div>
<select value={slot} onChange={e=>setSlot(e.target.value)}>
<option>All teams</option>
<option>Morning</option>
<option>Evening</option>
</select>
</div>
<div className="team-lines">
<div className="chart-axis">
<span>100%</span>
<span>90%</span>
<span>80%</span>
<span>70%</span>
</div>
<svg viewBox="0 0 560 210" role="img" aria-label="Team checklist completion line graph">
<line x1="20" y1="20" x2="540" y2="20"/>
<line className="goal" x1="20" y1="73" x2="540" y2="73"/>
<line x1="20" y1="126" x2="540" y2="126"/>
<line x1="20" y1="180" x2="540" y2="180"/>{teams.slice(0,5).map((t,ti)=>{const pts=t.trend.map((v,i)=>`${35+i*123},${180-(v-70)*5.33}`).join(" ");return <g key={t.name} className={`team-series s${ti}`}>
<polyline points={pts}/>{t.trend.map((v,i)=>
<circle key={i} cx={35+i*123} cy={180-(v-70)*5.33} r="4"/>)}</g>})}</svg>
<div className="chart-days">
<span>Mon</span>
<span>Tue</span>
<span>Wed</span>
<span>Thu</span>
<span>Fri</span>
</div>
</div>
<div className="team-legend">{teams.slice(0,5).map((t,i)=>
<span key={t.name}>
<i className={`s${i}`}/>{t.name} <b>{t.score}%</b>
</span>)}</div>
</section>
<section className="admin-card leaderboard">
<div className="admin-card-head">
<div>
<p className="eyebrow">CURRENT STANDINGS</p>
<h2>Weekly leaders</h2>
</div>
<button onClick={()=>setTab("submissions")}>View all</button>
</div>{teams.slice().sort((a,b)=>b.points-a.points).slice(0,5).map((t,i)=>
<div className="leader-row" key={t.name}>
<span className={`rank r${i+1}`}>{i+1}</span>
<div>
<b>{t.name}</b>
<small>{t.slot} · {t.score}% average</small>
</div>
<strong>{t.points.toFixed(1)}<small> pts</small>
</strong>
</div>)}{leader&&<div className="winning-note">★ {leader.name} is currently leading this week</div>}</section>
</div>
<div className="admin-grid lower">
<section className="admin-card queue">
<div className="admin-card-head">
<div>
<p className="eyebrow">REVIEW QUEUE</p>
<h2>Recent checklist submissions</h2>
</div>
<button onClick={()=>setTab("submissions")}>Review all</button>
</div>{adminSubmissions.slice(0,3).map(s=>
<button className="queue-row" key={s.id} onClick={()=>{setTab("submissions");openSubmission(s)}}>
<span className="queue-score">{s.score}%</span>
<div>
<b>{s.checklist}</b>
<small>{s.team} · {s.time}</small>
</div>
<i>Review ›</i>
</button>)}</section>
<section className="admin-card missing-box">
<div className="admin-card-head">
<div>
<p className="eyebrow red-text">ACTION REQUIRED</p>
<h2>Missing submissions</h2>
</div>
<button onClick={()=>setTab("missing")}>Manage</button>
</div>{missingTeams.map(t=>
<div className="missing-row" key={t.name}>
<span>!</span>
<div>
<b>{t.name}</b>
<small>{t.slot} checklist · 24+ hours</small>
</div>
<button onClick={()=>{setTab("missing");setOpened(t.name)}}>Write No Report</button>
</div>)}</section>
</div>
</>}
 {tab==="submissions"&&<div className="admin-list-layout">
<section className="admin-card list-card">
<div className="admin-card-head">
<div>
<p className="eyebrow">AWAITING APPROVAL</p>
<h2>Submitted checklists</h2>
</div>
<input placeholder="Search team or checklist"/>
</div>{adminSubmissions.map(s=>
<button key={s.id} className={`submission-item ${opened===s.id?"selected":""} ${reviewed.includes(s.id)?"reviewed":""}`} onClick={()=>openSubmission(s)}>
<span>{s.score}%</span>
<div>
<b>{s.checklist}</b>
<small>{s.team} · {s.leader} · {s.time}</small>
</div>
<strong>{reviewed.includes(s.id)?"Reviewed":"Open ›"}</strong>
</button>)}</section>
<section className="admin-card detail-card">{opened?.startsWith("CL")?(()=>{const s=adminSubmissions.find(x=>x.id===opened)!;return <>
<p className="eyebrow">SUBMISSION {s.id}</p>
<h2>{s.checklist}</h2>
<div className="detail-score">
<strong>{s.score}%</strong>
<span>Completion score<br/>
<b>{(s.score/10).toFixed(1)} points</b>
</span>
</div>
<dl>
<div>
<dt>Team</dt>
<dd>{s.team}</dd>
</div>
<div>
<dt>Team leader</dt>
<dd>{s.leader}</dd>
</div>
<div>
<dt>Submitted</dt>
<dd>{s.time}</dd>
</div>
<div>
<dt>Not done</dt>
<dd>{100-s.score}% of applicable items</dd>
</div>
</dl>
{submissionDetail?.photo&&<figure className="submission-photo"><img src={`data:${submissionDetail.photo.mime};base64,${submissionDetail.photo.data}`} alt={`Uploaded hardcopy for ${s.checklist}`}/><figcaption>Uploaded hardcopy · {submissionDetail.photo.name}</figcaption></figure>}
{!submissionDetail?.photo&&<p className="no-submission-photo">No hardcopy photo was attached to this submission.</p>}
<button className="primary-action" onClick={async()=>{const rawId=(s as any).rawId;if(rawId){await request(`/api/submissions/${rawId}/status`,{method:'PUT',body:JSON.stringify({status:'approved'})});await refreshBootstrap()}setReviewed(r=>r.includes(s.id)?r:[...r,s.id])}}>✓ Approve checklist</button>
<button className="print-action" onClick={()=>window.print()}>Print completed checklist</button>
</>})():<div className="empty-detail">
<span>✓</span>
<h2>Select a checklist</h2>
<p>Open a submission to see its score, missed items, and approval controls.</p>
</div>}</section>
</div>}
 {tab==="alerts"&&<div className="admin-list-layout">
<section className="admin-card list-card">
<div className="admin-card-head">
<div>
<p className="eyebrow red-text">ESTATES ALERTS</p>
<h2>Reports from team leaders</h2>
</div>
<select>
<option>All priorities</option>
<option>Urgent</option>
<option>Important</option>
<option>Routine</option>
</select>
</div>{adminAlerts.map(a=>
<button key={a.id} className={`alert-list-item ${opened===a.id?"selected":""} ${reviewed.includes(a.id)?"reviewed":""}`} onClick={()=>setOpened(a.id)}>
<span className={`priority ${a.priority.toLowerCase()}`}>!</span>
<div>
<b>{a.kind}</b>
<small>{a.location} · {a.age} ago</small>
</div>
<strong>{reviewed.includes(a.id)?"Reviewed":a.priority}</strong>
</button>)}</section>
<section className="admin-card detail-card">{opened?.startsWith("EA")?(()=>{const a=adminAlerts.find(x=>x.id===opened)!;return <>
<p className="eyebrow red-text">ALERT {a.id}</p>
<h2>{a.kind}</h2>
<span className={`priority-badge ${a.priority.toLowerCase()}`}>{a.priority}</span>
<dl>
<div>
<dt>Location</dt>
<dd>{a.location}</dd>
</div>
<div>
<dt>Reporting team</dt>
<dd>{a.team}</dd>
</div>
<div>
<dt>Submitted</dt>
<dd>{a.age} ago</dd>
</div>
</dl>
<div className="issue-copy">
<b>Issue description</b>
<p>{a.detail}</p>
</div>
<button className="primary-action" onClick={async()=>{const rawId=(a as any).rawId;if(rawId){await request(`/api/alerts/${rawId}/status`,{method:'PUT',body:JSON.stringify({status:'reviewed'})});await refreshBootstrap()}setReviewed(r=>r.includes(a.id)?r:[...r,a.id])}}>✓ Mark reviewed</button>
<button className="print-action" onClick={()=>window.print()}>Print Estates Alert</button>
</>})():<div className="empty-detail">
<span>!</span>
<h2>Select an alert</h2>
<p>Open an alert to review the location, priority, and full issue description.</p>
</div>}</section>
</div>}
 {tab==="missing"&&<div className="admin-list-layout">
<section className="admin-card list-card">
<div className="admin-card-head">
<div>
<p className="eyebrow red-text">NO SUBMISSION RECEIVED</p>
<h2>Missing checklists</h2>
</div>
<span className="late-pill">24-hour rule</span>
</div>{missingTeams.map(t=>
<button key={t.name} className={`missing-list-item ${opened===t.name?"selected":""}`} onClick={()=>setOpened(t.name)}>
<span>!</span>
<div>
<b>{t.name}</b>
<small>{t.slot} · Due yesterday at 8:00 PM</small>
</div>
<strong>{reports.includes(t.name)?"Report written":"Write report ›"}</strong>
</button>)}</section>
<section className="admin-card detail-card no-report">{reportTeam?<>
<p className="eyebrow red-text">NO REPORT, REPORT</p>
<h2>{reportTeam.name}</h2>
<p className="report-explainer">Document the team leader’s failure to submit the required checklist within 24 hours.</p>
<label>Team leader<input defaultValue={reportTeam.name==="Dusting Evening"?"James Ortiz":"Elena Morales"}/>
</label>
<label>Checklist<input defaultValue={reportTeam.name.replace(" Evening","")+" Daily Checklist"}/>
</label>
<label>Date checklist was due<input defaultValue="August 11, 2026 · 8:00 PM"/>
</label>
<label>Administrator notes<textarea rows={5} placeholder="Record follow-up, explanation given, or corrective action discussed."/>
</label>
<button className="primary-action" onClick={async()=>{const team=session.bootstrap?.teams?.find((t:any)=>t.name===reportTeam.name);if(team)await request('/api/no-reports',{method:'POST',body:JSON.stringify({team_id:team.id,work_date:new Date().toISOString().slice(0,10),reason:'Checklist not submitted within 24 hours'})});await refreshBootstrap();setReports(r=>r.includes(reportTeam.name)?r:[...r,reportTeam.name])}}>Save No Report, Report</button>
<button className="print-action" onClick={()=>window.print()}>Print report</button>{reports.includes(reportTeam.name)&&<div className="saved-report">✓ Report saved and ready to print</div>}</>:<div className="empty-detail">
<span>×</span>
<h2>Select a missing team</h2>
<p>Create a printable No Report, Report for the responsible team leader.</p>
</div>}</section>
</div>}
 {tab==="people"&&<section className="people-access">
<div className="people-intro"><div><p className="eyebrow">TEAM MANAGEMENT</p><h2>Assign members and manage Team Leader access</h2><span>Use the shared database editor below to replace sample team, member and checklist names.</span></div></div>
<PeopleAccessManager/>
</section>}
 {tab==="season"&&<SeasonEditor/>}
 {tab==="standings"&&<section className="print-standings-wrap">
<div className="print-standings-actions"><div><p className="eyebrow">HANDOUT PREVIEW</p><h2>{season.name} standings sheet</h2><span>Print-ready weekly standings, medallions and team achievements.</span></div><button onClick={()=>window.print()}>▣ Print standings sheet</button></div>
<article className="standings-sheet">
<header><div className="sheet-emblem"><img src="./cleanlympics-logo.png" alt="Cleanlympics mop torch"/></div><div><p>THE CLEANLYMPICS</p><h1>{season.name} Standings</h1><span>Official Week {season.current_week} Handout · {season.theme}</span></div><aside><b>{weeksRemaining}</b><span>WEEKS<br/>REMAINING</span></aside></header>
<section className="sheet-callout"><b>League update</b><p>{hasScores?`${dayLeader?.name||'No Day leader'} leads the Day Team Tournament, while ${eveningLeader?.name||'No Evening leader'} leads the Evening Team Tournament.`:"The season has not started yet. All teams currently have 0 points."}</p></section>
<div className="sheet-meta"><span><small>CURRENT SEASON</small><b>{season.name}</b></span><span><small>WEEK</small><b>{season.current_week} of {seasonWeeks}</b></span><span><small>DIVISIONS</small><b>Day + Evening</b></span><span><small>WEEKLY WINNERS</small><b>One per division</b></span></div>
<section className="weekly-medallions"><div className="sheet-section-title"><div><small>WEEKLY SPOTLIGHT</small><h2>Top three medallions</h2></div><p>Recognition ranking only—Day and Evening champions remain separate.</p></div>{hasScores?<div className="medallion-grid">{adminTeams.slice().sort((a,b)=>b.points-a.points).slice(0,3).map((team,index)=>{const labels=[['Gold Medallion','gold'],['Silver Medallion','silver'],['Bronze Medallion','bronze']];return <article className={`medallion-card ${labels[index][1]}`} key={team.name}><div className="medallion"><span>{index+1}</span></div><div><small>{labels[index][0]}</small><strong>{team.name}</strong><p>{team.points.toFixed(1)} points</p></div></article>})}</div>:<div className="empty-detail"><span>0</span><h2>No medallions awarded yet</h2><p>Medallions will appear after checklist results are entered.</p></div>}</section>
<section className="weekly-honors"><div className="sheet-section-title"><div><small>WEEKLY ACHIEVEMENTS</small><h2>Additional team honors</h2></div></div><div className="empty-detail"><span>—</span><h2>No honors calculated yet</h2><p>Most Improved, Comeback, On-Time and Streak awards will appear after sufficient results exist.</p></div></section>
{[{title:"DAY TEAM TOURNAMENT · MON–FRI",slot:"Morning"},{title:"EVENING TEAM TOURNAMENT · MON–SUN",slot:"Evening"}].map(d=>{const divisionTeams=adminTeams.filter(t=>t.slot===d.slot).sort((a,b)=>b.points-a.points);return <section className="sheet-division" key={d.title}><h2>{d.title}</h2><div className="sheet-ranking"><div className="sheet-row heading"><span>RANK</span><span>TEAM</span><span>CHECKLIST / SLOT</span><span>AVG.</span><span>SEASON PTS.</span><span>WEEKS AT #1</span></div>{divisionTeams.map((t,i)=>{const teamRecord=stored.teams.find((row:any)=>row.id===t.id),checklistName=stored.checklists.find((row:any)=>row.id===teamRecord?.checklist_id)?.name||"Unassigned";return <div className={`sheet-row ${i===0&&t.points>0?"top-three":""}`} key={t.name}><span><b>{i+1}</b></span><span><strong>{t.name}</strong></span><span>{checklistName} · {d.slot}</span><span>{t.score}%</span><span>{t.points.toFixed(1)}</span><span>0</span></div>})}</div></section>})}
<footer><span>Complete every applicable checklist item. Support your team. Finish the season strong.</span><b>Season ends: {displayDate(season.end_date)}</b></footer>
</article>
</section>}
 {tab==="recognition"&&<section className="recognition-wrap">
<div className="recognition-actions"><div><p className="eyebrow">WINNER RECOGNITION</p><h2>Print team acknowledgements</h2><span>This page stays blank until you select a team with entered members.</span></div><div className="recognition-controls"><label>Winning team<select value={recognitionTeam} onChange={e=>setRecognitionTeam(e.target.value)}><option value="">Select a winning team</option>{stored.teams.map((t:any)=><option value={t.id} key={t.id}>{t.name}</option>)}</select></label><label>Award<select value={recognitionAward} onChange={e=>setRecognitionAward(e.target.value)}><option value="">Select an award</option><option>Weekly Champion · Week {season.current_week}</option><option>Season Champion · {season.name}</option><option>Consecutive 100% Streak</option><option>Outstanding Team Participation</option></select></label><div className="recognition-format"><button className={recognitionFormat==="team"?"active":""} onClick={()=>setRecognitionFormat("team")}>Team sheet</button><button className={recognitionFormat==="individual"?"active":""} onClick={()=>setRecognitionFormat("individual")}>Individual certificates</button></div><button className="recognition-print" disabled={!selectedRecognitionTeam||!recognitionAward||!recognitionMembers.length} onClick={()=>window.print()}>▣ Print {recognitionFormat==="team"?"acknowledgement":"certificates"}</button></div></div>
{!selectedRecognitionTeam||!recognitionAward?<div className="empty-detail"><span>★</span><h2>No acknowledgement prepared</h2><p>Select the actual winning team and award after results are entered.</p></div>:!recognitionMembers.length?<div className="empty-detail"><span>—</span><h2>No members entered for this team</h2><p>Add the winning team’s members in People & Access before printing.</p></div>:recognitionFormat==="team"?<article className="commendation-sheet">
<header><img src="./cleanlympics-logo.png" alt="Cleanlympics mop torch"/><div><p>THE CLEANLYMPICS</p><span>OFFICIAL TEAM RECOGNITION</span></div><b>★</b></header>
<div className="commendation-body"><p className="commendation-kicker">HIGHLY COMMENDED</p><h1>{selectedRecognitionTeam.name}</h1><p className="commendation-intro">The following members of the <strong>{selectedRecognitionTeam.name}</strong> are highly commended for winning the {recognitionAward.toLowerCase()} of the Cleanlympics.</p><div className="commendation-members">{recognitionMembers.map((member:any)=><span key={member.id}>★ <b>{member.name}</b></span>)}</div><p className="commendation-message">Their teamwork, participation, and commitment to completing the {recognitionChecklist?.name||'assigned'} checklist helped their team earn first place in the {recognitionDivision}.</p></div>
<footer><div><span>Presented by</span><b>Master Administrator</b></div><div><span>Date</span><b>{displayDate(isoToday())}</b></div></footer>
</article>:<div className="certificate-stack">{recognitionMembers.map((member:any)=><article className="member-certificate" key={member.id}><header><img src="./cleanlympics-logo.png" alt=""/><div><p>THE CLEANLYMPICS</p><span>OFFICIAL MEMBER RECOGNITION</span></div></header><p className="certificate-kicker">HIGHLY COMMENDED</p><h1>{member.name}</h1><h2>{selectedRecognitionTeam.name}</h2><p>is highly commended as a member of the <strong>{selectedRecognitionTeam.name}</strong> for winning the {recognitionAward.toLowerCase()} of the Cleanlympics.</p><div className="certificate-award"><span>★</span><div><small>ACHIEVEMENT</small><b>{recognitionAward}</b><em>{recognitionDivision}</em></div></div><footer><div><span>Master Administrator</span><b>Cleanlympics Administration</b></div><div><span>Date presented</span><b>{displayDate(isoToday())}</b></div></footer></article>)}</div>}
</section>}
 {tab==="overview"&&<section className="admin-card attendance-admin">
<div className="admin-card-head">
<div>
<p className="eyebrow">ATTENDANCE & PARTICIPATION</p>
<h2>Today’s team reports</h2>
</div>
<span className="attendance-rate">92% overall attendance</span>
</div>
<div className="attendance-table">
<div className="attendance-header">
<span>TEAM</span>
<span>ROSTER</span>
<span>PARTICIPATED</span>
<span>ABSENT / NON-PARTICIPATING</span>
<span>PENALTY</span>
</div>{attendanceRows.map(a=>
<div className="attendance-line" key={a.name}>
<span>
<b>{a.name}</b>
<small>{a.reported?"Reported today":"No attendance entered"}</small>
</span>
<span>{a.roster}</span>
<span className="att-good">{a.participated}</span>
<span className={a.missed?"att-bad":""}>{a.missed}</span>
<strong className={a.missed?"att-bad":""}>{a.missed?`−${a.missed*5} pts`:"None"}</strong>
</div>)}</div>
</section>}
 {tab==="overview"&&<section className="admin-card offender-admin">
<div className="admin-card-head"><div><p className="eyebrow red-text">MEMBER FOLLOW-UP</p><h2>Frequent offenders & required actions</h2></div><span className="offender-count">{offenderRows.length} members to review</span></div>
{offenderRows.length?<div className="offender-table"><div className="offender-heading"><span>MEMBER / TEAM</span><span>UNEXCUSED INCIDENTS</span><span>CITATIONS</span><span>REQUIRED ACTION</span><span>STATUS</span></div>{offenderRows.map((o:any)=><div className="offender-line" key={o.name}><span><b>{o.name}</b><small>{o.team}</small></span><strong>{o.incidents}</strong><span>{o.citations}</span><span><b>Team Leader review</b></span><em>Action needed</em></div>)}</div>:<div className="empty-detail"><span>✓</span><h2>No frequent offenders</h2><p>A member will appear here only after three recorded unexcused absences or non-participation incidents.</p></div>}
</section>}
 {tab==="overview"&&<section className="admin-card award-approval">
<div className="admin-card-head">
<div>
<p className="eyebrow">AWARD CLAIMS</p>
<h2>Weekly division winner approvals</h2>
</div>
<span className="claim-count">{stored.claims.filter((claim:any)=>claim.status==='pending').length} awaiting approval</span>
</div>
{stored.claims.length?stored.claims.map((claim:any)=><div className="award-claim-row" key={claim.id}><span className="gift-icon">$5</span><div><b>{claim.team_name}</b><small>{claim.claim_type} · {claim.period_label}</small></div><strong>{claim.status==='approved'?"Ready for pickup":claim.status}</strong>{claim.status==='pending'&&<button onClick={async()=>{await request(`/api/award-claims/${claim.id}/status`,{method:'PUT',body:JSON.stringify({status:'approved'})});await refreshBootstrap();setAwardApproved(true)}}>Approve award</button>}</div>):<div className="empty-detail"><span>0</span><h2>No award claims</h2><p>Claims appear only after a team qualifies and submits one.</p></div>}
</section>}
 <div className="admin-beta">Shared beta data refreshes from the Cleanlympics Server. Unentered results remain at 0 and no attendance citation is created without recorded incidents.</div>
</div>
</section>
}
function TeamStandings({onBack}:{onBack:()=>void}){
 const [board,setBoard]=useState<"weekly"|"season">("weekly"),[division,setDivision]=useState<"Day"|"Evening">("Day"),[claimState,setClaimState]=useState<"available"|"confirm"|"submitted">("available"),[rulesOpen,setRulesOpen]=useState(false),[liveTeams,setLiveTeams]=useState<any[]>([]);
 const season=session.bootstrap?.season||{name:'Launch Season',theme:'The Launch of the Cleanlympics',start_date:'2026-09-01',end_date:'2026-09-30',current_week:1};const seasonWeeks=Math.max(1,Math.ceil((new Date(`${season.end_date}T12:00:00`).getTime()-new Date(`${season.start_date}T12:00:00`).getTime()+86400000)/604800000));const weeksRemaining=Math.max(0,seasonWeeks-Number(season.current_week));
 useEffect(()=>{const bounds=weekBounds(isoToday());request(`/api/standings?from=${bounds.start}&to=${bounds.end}`).then(rows=>setLiveTeams(rows.map((row:any)=>({id:row.id,name:row.name,checklist:session.bootstrap?.checklists?.find((c:any)=>c.id===session.bootstrap?.teams?.find((t:any)=>t.id===row.id)?.checklist_id)?.name||'Checklist',division:row.division,schedule:session.bootstrap?.teams?.find((t:any)=>t.id===row.id)?.schedule||'',weekly:Number(row.weekly_points),season:Number(row.season_points),average:Number(row.completion),move:'same'})))).catch(()=>setLiveTeams([]))},[]);
 const sourceTeams=liveTeams.length?liveTeams:(session.bootstrap?.teams||[]).map((team:any)=>({id:team.id,name:team.name,checklist:'Checklist',division:team.division,schedule:team.schedule,weekly:0,season:0,average:0,move:'same'}));const ranked=sourceTeams.filter(t=>t.division===division).slice().sort((a,b)=>board==="weekly"?b.weekly-a.weekly:b.season-a.season); const leader=ranked[0],dayOverall=sourceTeams.filter(t=>t.division==='Day').sort((a,b)=>b.weekly-a.weekly)[0],eveningOverall=sourceTeams.filter(t=>t.division==='Evening').sort((a,b)=>b.weekly-a.weekly)[0];
 const submitClaim=async()=>{if(leader?.id)await request('/api/award-claims',{method:'POST',body:JSON.stringify({team_id:leader.id,claim_type:`${division} weekly winner`,period_label:'Current week'})});setClaimState('submitted');refreshBootstrap().catch(()=>{})};
 return <main className="standings-page"><LanguageToggle/>
<header className="league-top">
<button onClick={onBack}>← Checklists</button>
<div>
<span className="league-emblem"><img src="./cleanlympics-logo.png" alt="Cleanlympics mop torch"/></span>
<b>The Cleanlympics</b>
</div>
<small>{season.name.toUpperCase()} · WEEK {season.current_week} OF {seasonWeeks}</small>
</header>
<section className="league-hero">
<div className="sun-disc">☀</div>
<div>
<p>{season.name.toUpperCase()} · TWO DIVISIONS</p>
<h1>{weeksRemaining} week{weeksRemaining===1?'':'s'} remain—and the<br/>
<span>{leader?.name}</span> lead the {division} Tournament!</h1>
<small>Day teams compete Monday–Friday. Evening teams compete across their evening and weekend schedule.</small>
</div>
<div className="countdown">
<strong>{weeksRemaining}</strong>
<span>WEEKS<br/>REMAINING</span>
</div>
</section>
<div className="league-shell">
<section className={`game-rules ${rulesOpen?"open":""}`}>
<button className="rules-toggle" onClick={()=>setRulesOpen(v=>!v)} aria-expanded={rulesOpen}><span><i>?</i><span><small>THE CLEANLYMPICS GAME</small><b>How It Works</b><em>A quick guide to scoring, bonuses, penalties and prizes</em></span></span><strong>{rulesOpen?"Close guide":"View game rules"} {rulesOpen?"↑":"↓"}</strong></button>
{rulesOpen&&<div className="rules-content">
<div className="rules-intro"><div><p>THE BASIC GAME</p><h2>Complete the checklist. Support the team. Earn points.</h2><span>Day teams compete against Day teams, and Evening teams compete against Evening teams. Rankings are based on approved weekly points.</span></div><div className="score-example"><small>DAILY CHECKLIST SCORE</small><b>Completion % ÷ 10</b><span>100% = 10 pts · 80% = 8 pts · 50% = 5 pts</span></div></div>
<div className="rules-grid">
<article className="rule-card earn"><header><span>+</span><div><small>EARN MORE</small><h3>Bonuses & achievements</h3></div></header><ul><li><b>First-place streak:</b> +5 points each week in first place; increases to +10 points after five consecutive weeks.</li><li><b>Perfect checklist streak:</b> recognizes consecutive weeks of 100% completion.</li><li><b>Completed on time:</b> bonus recognition for submitting every required checklist by its deadline.</li><li><b>Comeback Team:</b> bonus recognition for a major rise in the standings.</li><li><b>Most Improved Area:</b> bonus recognition for measurable improvement in cleaning quality.</li></ul><p>Bonus values still being finalized will be announced before the live season.</p></article>
<article className="rule-card penalties"><header><span>−</span><div><small>POINT DEDUCTIONS</small><h3>Penalties</h3></div></header><ul><li><b>Unaccounted-for member:</b> −5 points per person.</li><li><b>No checklist submitted:</b> 0 checklist points for that day.</li><li><b>Required jumpsuit not worn:</b> −1 point per person on Day 1, −2 on the second consecutive day, −3 on the third, and so on.</li><li><b>Area fails inspection:</b> −10 points.</li></ul><p>Excused members must have a documented reason and do not receive the attendance penalty.</p></article>
<article className="rule-card prizes"><header><span>★</span><div><small>WIN & CELEBRATE</small><h3>Prizes</h3></div></header><ul><li><b>Weekly division winners:</b> $5 in-house café gift card, unlocked after administrator approval.</li><li><b>Season champions:</b> pizza party for the whole winning team in each division.</li><li><b>Weekly streak prizes:</b> special rewards announced during the season.</li></ul><p>All checklist results and award claims are reviewed by the Master Administrator.</p></article>
</div>
<div className="rules-flow"><span><b>1</b>Complete today’s checklist</span><i>→</i><span><b>2</b>Add bonuses</span><i>→</i><span><b>3</b>Apply penalties</span><i>→</i><span><b>4</b>Update weekly & season standings</span></div>
</div>}
</section>
<section className="prize-row">
<article>
<div>★</div>
<span>
<small>TWO WEEKLY WINNERS</small>
<b>Day Champion + Evening Champion</b>
<p>Each division awards its own $5 café gift card.</p>
</span>
</article>
<article className="season-prize">
<div>♛</div>
<span>
<small>TWO SEASON CHAMPIONS</small>
<b>Day + Evening Season Awards</b>
<p>Each division crowns a season winner after Week {seasonWeeks}.</p>
</span>
</article>
</section>
<section className="division-summary"><article><span>☀</span><div><small>DAY TEAM LEADER</small><b>{dayOverall?.weekly>0?dayOverall.name:"No leader yet"}</b><p>Mon–Fri · {(dayOverall?.weekly||0).toFixed(1)} weekly points</p></div></article><article><span>☾</span><div><small>EVENING TEAM LEADER</small><b>{eveningOverall?.weekly>0?eveningOverall.name:"No leader yet"}</b><p>Mon–Sun · {(eveningOverall?.weekly||0).toFixed(1)} weekly points</p></div></article></section>
<section className="reward-unlock"><div className="reward-burst">★</div><div className="reward-copy"><p>{division.toUpperCase()} WINNER REWARD</p><h2>{leader?.weekly>0?(claimState==="submitted"?"Award claim sent for approval":"Achievement unlocked: Division Champion"):"No weekly winner yet"}</h2><span>{leader?.weekly>0?(claimState==="submitted"?"The Master Administrator must approve the reward before the café gift card is ready.":`${leader?.name} is #1 in the ${division} Tournament.`):"The award unlocks after checklist results establish a weekly winner."}</span></div><div className="cafe-card"><small>IN-HOUSE CAFÉ</small><strong>$5</strong><span>GIFT CARD</span></div>{leader?.weekly>0&&claimState==="available"&&<button onClick={()=>setClaimState("confirm")}>Claim Award →</button>}{claimState==="confirm"&&<div className="claim-confirm"><b>Submit this {division} claim?</b><span>It will be sent to the Master Administrator.</span><div><button onClick={()=>setClaimState("available")}>Cancel</button><button onClick={submitClaim}>Submit claim</button></div></div>}{claimState==="submitted"&&<div className="claim-pending"><b>⏳ Awaiting approval</b><small>Division claim · Current week</small></div>}</section>
<section className="streak-preview"><div>🔒</div><span><p>CONSECUTIVE 100% STREAK</p><h3>Streak rewards are coming next</h3><small>Complete 100% of the checklist for more than two consecutive weeks to begin unlocking tier rewards.</small></span><em>Tier levels to be defined</em></section>
<section className="grand-champion-note"><span>♛</span><div><p>FUTURE CROSS-DIVISION EVENT</p><b>Grand Champion playoff</b><small>Reserved for a future scoring model that can fairly compare five-day Day teams with seven-day Evening teams using completion, streak, participation, and bonus performance.</small></div><em>Not active yet</em></section>
<section className="standings-card">
<div className="standings-head">
<div>
<p>TEAM STANDINGS</p>
<h2>{board==="weekly"?"This week’s race":`${season.name} standings`}</h2>
</div>
<div className="standing-controls">
<div className="division-toggle">
<button className={division==="Day"?"active":""} onClick={()=>{setDivision("Day");setClaimState("available")}}>☀ Day Teams</button>
<button className={division==="Evening"?"active":""} onClick={()=>{setDivision("Evening");setClaimState("available")}}>☾ Evening Teams</button>
</div>
<div>
<button className={board==="weekly"?"active":""} onClick={()=>setBoard("weekly")}>Weekly</button>
<button className={board==="season"?"active":""} onClick={()=>setBoard("season")}>Season</button>
</div>
</div>
</div>
<div className="podium">{ranked.slice(0,3).map((t,i)=>
<article className={`place p${i+1}`} key={t.name}>
<span>{i===0?"♛":i+1}</span>
<div className="team-badge">{t.name.split(" ").map(x=>x[0]).join("").slice(0,2)}</div>
<b>{t.name}</b>
<small>{t.checklist} · {t.schedule}</small>
<strong>{(board==="weekly"?t.weekly:t.season).toFixed(1)} <i>pts</i>
</strong>{i===0&&<em>Current leader</em>}</article>)}</div>
<div className="rank-table">
<div className="rank-heading">
<span>RANK</span>
<span>TEAM</span>
<span>COMPLETION</span>
<span>{board==="weekly"?"WEEKLY POINTS":"SEASON POINTS"}</span>
</div>{ranked.map((t,i)=>
<div className={`rank-line ${i===0?"first":""}`} key={t.name}>
<span>
<b>{i+1}</b>{t.move==="up"?"↑":t.move==="down"?"↓":"—"}</span>
<span>
<i>{t.name.split(" ").map(x=>x[0]).join("").slice(0,2)}</i>
<div>
<b>{t.name}</b>
<small>{t.checklist} · {t.schedule}</small>
</div>
</span>
<span>
<div>
<i style={{width:`${t.average}%`}}/>
</div>
<b>{t.average}%</b>
</span>
<strong>{(board==="weekly"?t.weekly:t.season).toFixed(1)} <small>pts</small>
</strong>
</div>)}</div>
</section>
<section className="season-progress">
<div>
<p>{season.name.toUpperCase()} PROGRESS</p>
<h2>Week {season.current_week} of {seasonWeeks}. {weeksRemaining} week{weeksRemaining===1?'':'s'} remaining.</h2>
</div>
<div className="week-track">{Array.from({length:seasonWeeks},(_,i)=>i+1).map(w=>
<span className={w<=season.current_week?"complete":""} key={w}>
<i>{w<season.current_week?"✓":w}</i>
<b>{w===season.current_week?"NOW":`W${w}`}</b>
</span>)}</div>
<aside>
<span>Championship</span>
<b>{new Date(`${season.end_date}T12:00:00`).toLocaleDateString(undefined,{month:'short',day:'numeric'})}</b>
</aside>
</section>
<p className="league-note">Standings use the current team names and approved submissions saved in the shared Cleanlympics database.</p>
</div>
</main>
}
export default function Home(){
 const [selectedId,setSelectedId]=useState("dusting"),[statuses,setStatuses]=useState<Record<string,Status>>({}),[memberStatuses,setMemberStatuses]=useState<Record<string,MemberStatus>>({}),[excuseReasons,setExcuseReasons]=useState<Record<string,string>>({}),[assignments,setAssignments]=useState<Record<string,string>>({}),[areas,setAreas]=useState<Record<string,string>>({}),[selectedDay,setSelectedDay]=useState("Tue"),[workDate,setWorkDate]=useState(isoToday()),[submitted,setSubmitted]=useState(false),[view,setView]=useState<"checklist"|"review"|"alert"|"admin"|"standings">("checklist"),[reviewDay,setReviewDay]=useState("Mon"),[role,setRole]=useState<"leader"|"admin">(session.user?.role==="admin"?"admin":"leader"),[lockedNotice,setLockedNotice]=useState(false),[adminPrompt,setAdminPrompt]=useState(false),[adminPassword,setAdminPassword]=useState(""),[adminError,setAdminError]=useState(false),[scanState,setScanState]=useState<"idle"|"ready"|"review">("idle"),[scanName,setScanName]=useState(""),[checklistPhoto,setChecklistPhoto]=useState<ChecklistPhoto|null>(null),[citationOpen,setCitationOpen]=useState(false),[citationLevel,setCitationLevel]=useState(1),[citationIssued,setCitationIssued]=useState(false),[liveHistory,setLiveHistory]=useState<any[]>([]);
 const checklist=checklists.find(c=>c.id===selectedId)!; const allItems=checklist.sections.flatMap(s=>s.items); const scoped=(id:string)=>`${workDate}:${selectedId}:${id}`; const currentStatuses=Object.fromEntries(allItems.map(i=>[i.id,statuses[scoped(i.id)]??null]));
 const assignedChecklist=session.bootstrap?.checklists?.find((c:any)=>c.name===checklist.name);const assignedTeam=session.user?.teamId?session.bootstrap?.teams?.find((t:any)=>t.id===session.user.teamId):session.bootstrap?.teams?.find((t:any)=>t.checklist_id===assignedChecklist?.id);const sharedRoster=assignedTeam?session.bootstrap?.members?.filter((m:any)=>m.team_id===assignedTeam.id).map((m:any)=>m.name):[];const roster=sharedRoster||[];const frequentOffenders=(session.bootstrap?.offenders||[]).filter((entry:any)=>entry.team_id===assignedTeam?.id);const selectedOffender=frequentOffenders[0]; const rosterStatus=(name:string)=>memberStatuses[`${workDate}:${selectedId}:${name}`]??null; const attendanceAnswered=roster.filter(n=>{const s=rosterStatus(n);return s&&(!(s==="excused")||Boolean(excuseReasons[`${workDate}:${selectedId}:${n}`]?.trim()))}).length; const penalties=roster.filter(n=>rosterStatus(n)==="absent"||rosterStatus(n)==="noParticipation").length*5; const participationBonus=roster.length>0&&roster.every(n=>rosterStatus(n)==="participated")?5:0;
 const counts=useMemo(()=>{const v=Object.values(currentStatuses),done=v.filter(x=>x==="done").length,notDone=v.filter(x=>x==="notDone").length,na=v.filter(x=>x==="na").length,answered=done+notDone+na,applicable=allItems.length-na;return{done,notDone,na,answered,score:applicable?Math.round(done/applicable*1000)/10:0}},[selectedId,statuses]);
 const switchChecklist=(id:string)=>{setSelectedId(id);setSubmitted(false);setScanState("idle");setChecklistPhoto(null);setScanName("");window.scrollTo({top:0,behavior:"smooth"})}; const setStatus=(id:string,status:Exclude<Status,null>)=>{setSubmitted(false);setStatuses(s=>{const key=scoped(id);return{...s,[key]:s[key]===status?null:status}})}; const setMemberStatus=(name:string,status:Exclude<MemberStatus,null>)=>{setSubmitted(false);setMemberStatuses(s=>({...s,[`${workDate}:${selectedId}:${name}`]:status}))}; const markAllDone=()=>{setSubmitted(false);setStatuses(s=>({...s,...Object.fromEntries(allItems.map(i=>[scoped(i.id),"done"]))}))}; const trySubmit=async()=>{if(counts.answered<allItems.length||attendanceAnswered<roster.length){document.querySelector(counts.answered<allItems.length?".unanswered-note":".roster-card")?.scrollIntoView({behavior:"smooth",block:"center"});return}const remoteChecklist=session.bootstrap?.checklists?.find((c:any)=>c.name===checklist.name);const team=session.user?.teamId?session.bootstrap?.teams?.find((t:any)=>t.id===session.user.teamId):session.bootstrap?.teams?.find((t:any)=>t.checklist_id===remoteChecklist?.id)||session.bootstrap?.teams?.[0];const remoteItems=session.bootstrap?.items?.filter((i:any)=>i.checklist_id===remoteChecklist?.id)||[];const payloadItems=allItems.map(item=>{const remote=remoteItems.find((i:any)=>i.label===item.label);return remote?{id:remote.id,status:currentStatuses[item.id],assigned_to:null}:null}).filter(Boolean);const attendance=roster.map(name=>{const member=session.bootstrap?.members?.find((m:any)=>m.team_id===team?.id&&m.name===name);return member?{member_id:member.id,status:rosterStatus(name),excuse_reason:excuseReasons[`${workDate}:${selectedId}:${name}`]||null,uniform_streak:0}:null}).filter(Boolean);await request('/api/submissions',{method:'POST',body:JSON.stringify({team_id:team?.id,checklist_id:remoteChecklist?.id,work_date:workDate,completionPercent:counts.score,unaccounted:roster.filter(n=>['absent','noParticipation'].includes(rosterStatus(n)||'')).length,uniformViolations:[],inspectionPassed:true,submitted:true,items:payloadItems,attendance,photo:checklistPhoto?{name:checklistPhoto.name,mime:checklistPhoto.mime,data:checklistPhoto.data}:null})});await refreshBootstrap();setSubmitted(true)};
 useEffect(()=>{const remoteChecklist=session.bootstrap?.checklists?.find((c:any)=>c.name===checklist.name);const team=session.user?.teamId?session.bootstrap?.teams?.find((t:any)=>t.id===session.user.teamId):session.bootstrap?.teams?.find((t:any)=>t.checklist_id===remoteChecklist?.id);if(!team){setLiveHistory([]);return}const bounds=weekBounds(workDate);request(`/api/history/${team.id}`).then(rows=>setLiveHistory(rows.filter((row:any)=>row.work_date>=bounds.start&&row.work_date<=bounds.end).map((row:any)=>({day:new Date(`${row.work_date}T12:00:00`).toLocaleDateString('en-US',{weekday:'short'}),score:Number(row.completion_percent),done:0,missed:[]})))).catch(()=>setLiveHistory([]))},[selectedId,submitted,workDate]);
 const displayWeekData=emptyWeekData.map(empty=>liveHistory.find(row=>row.day===empty.day)||empty);const enteredDays=liveHistory.length;const average=enteredDays?Math.round(liveHistory.reduce((sum,d)=>sum+d.score,0)/enteredDays*10)/10:0; const selectedReview=displayWeekData.find(d=>d.day===reviewDay)||displayWeekData[0],selectedHasEntry=liveHistory.some(row=>row.day===selectedReview.day); const weeklyPoints=Math.round(liveHistory.reduce((sum,d)=>sum+d.score/10,0)*10)/10; const dailyPoints=Math.round(selectedReview.score)/10; const seasonPoints=session.bootstrap?.submissions?.filter((s:any)=>s.team_id===(session.user?.teamId||0)&&s.status!=="rejected").reduce((sum:number,s:any)=>sum+Number(s.total_points),0)||0; const linePoints=displayWeekData.map((d,i)=>`${50+i*100},${210-d.score*2}`).join(" ");
 if(view==="admin"&&role==="admin")return <AdminPortal onBack={()=>{setRole("leader");setView("checklist")}}/>;
 if(view==="standings")return <TeamStandings onBack={()=>setView("checklist")}/>;
 if(view==="alert")return <main><LanguageToggle/>
<header className="topbar">
<div className="brand-mark"><img src="./cleanlympics-logo.png" alt="Cleanlympics mop torch"/></div>
<div className="brand-copy">
<strong>Cleanlympics</strong>
<span>Team Leader Portal · Beta</span>
</div>
<div className="top-actions">
<button className="alert-nav active" onClick={()=>setView("checklist")}>← Back to checklist</button>
<button onClick={()=>setView("review")}>▥ Review completed checklists</button>
<div className="leader-pill">
<span>{checklist.shortName.slice(0,2).toUpperCase()}</span>
<div>
<b>{checklist.team}</b>
<small>{checklist.schedule}</small>
</div>
</div>
</div>
</header>
<div className="page-shell">
<EstatesAlert checklist={checklist} onBack={()=>setView("checklist")}/>
</div>
</main>;
 return <main><LanguageToggle/>
<header className="topbar">
<div className="brand-mark"><img src="./cleanlympics-logo.png" alt="Cleanlympics mop torch"/></div>
<div className="brand-copy">
<strong>Cleanlympics</strong>
<span>Team Leader Portal · Beta</span>
</div>
<div className="top-actions">
<button className="standings-nav" onClick={()=>setView("standings")}>♛ Team Standings</button>
<button className={`alert-nav ${view==="alert"?"active":""}`} onClick={()=>setView(view==="alert"?"checklist":"alert")}>{view==="alert"?"← Back to checklist":"⚠ Estates Alert"}</button>
<button className={view==="review"?"active":""} onClick={()=>setView(view==="review"?"checklist":"review")}>{view==="review"?"← Back to checklist":"▥ Review completed checklists"}</button>
<div className="leader-pill">
<span>{checklist.shortName.slice(0,2).toUpperCase()}</span>
<div>
<b>{checklist.team}</b>
<small>{checklist.schedule}</small>
</div>
</div>
</div>
</header>
<div className="page-shell">
 {view==="review"?<section className="review-view">
<div className="review-header">
<div>
<p className="eyebrow">WEEKLY PERFORMANCE</p>
<h1>{checklist.name}</h1>
<p>{checklist.team} · {weekBounds(workDate).label}</p>
</div>
<div className={`average-card ${average>=90?"qualified":""}`}>
<span>Weekly average</span>
<strong>{average}%</strong>
<small>{average>=90?"✓ Weekly award qualified":"Below 90% goal"}</small>
</div>
</div>
<div className="review-controls">
<label>Checklist being reviewed<select value={selectedId} onChange={e=>{setSelectedId(e.target.value);setReviewDay("Tue")}}>{checklists.map(c=>
<option key={c.id} value={c.id}>{c.name}</option>)}</select>
</label>
<button onClick={()=>setView("checklist")}>Open today’s checklist</button>
</div>
<div className="points-board">
<article>
<span>POINTS FOR {selectedReview.day.toUpperCase()}</span>
<strong>{dailyPoints.toFixed(1)}</strong>
<small>{selectedReview.score}% ÷ 10</small>
</article>
<article>
<span>POINTS THIS WEEK</span>
<strong>{weeklyPoints.toFixed(1)}</strong>
<small>7 daily results combined</small>
</article>
<article className="season-points">
<span>POINTS THIS SEASON</span>
<strong>{seasonPoints.toFixed(1)}</strong>
<small>Week {session.bootstrap?.season?.current_week||1} · {session.bootstrap?.season?.name||'Launch Season'}</small>
<div>
<i style={{width:"50%"}}/>
</div>
</article>
<aside>
<b>Weekly Award</b>
<span>{average>=90?"Qualified":"Not yet qualified"}</span>
<b>Season Award</b>
<span>Currently ranked #2</span>
</aside>
</div>
<div className="chart-card">
<div className="chart-title">
<div>
<h2>Daily completion percentage</h2>
<p>Select a plotted point to review what was missed.</p>
</div>
<div className="legend">
<i/>90% qualification line</div>
</div>
<div className="line-chart">
<svg viewBox="0 0 700 250" role="img" aria-label="Weekly completion line graph">
<line className="grid-line" x1="50" y1="10" x2="650" y2="10"/>
<line className="grid-line" x1="50" y1="110" x2="650" y2="110"/>
<line className="grid-line" x1="50" y1="210" x2="650" y2="210"/>
<line className="qualification-line" x1="50" y1="30" x2="650" y2="30"/>
<text className="axis-label" x="8" y="14">100%</text>
<text className="axis-label qualification-label" x="14" y="34">90%</text>
<text className="axis-label" x="20" y="114">50%</text>
<text className="axis-label" x="30" y="214">0%</text>
<polyline className="score-line" points={linePoints}/>{displayWeekData.map((d,i)=>{const x=50+i*(600/Math.max(1,displayWeekData.length-1)),y=210-d.score*2;return <g key={`${d.day}-${i}`} className={`plot-point ${reviewDay===d.day?"selected":""} ${d.score<90?"below":""}`} onClick={()=>setReviewDay(d.day)} role="button" aria-label={`${d.day} ${d.score}%`} tabIndex={0} onKeyDown={e=>{if(e.key==="Enter"||e.key===" ")setReviewDay(d.day)}}>
<circle cx={x} cy={y} r={reviewDay===d.day?9:7}/>
<text className="point-value" x={x} y={y-14} textAnchor="middle">{d.score}%</text>
<text className="day-label" x={x} y="238" textAnchor="middle">{d.day}</text>
</g>})}</svg>
</div>
</div>
<div className="day-review">
<div className="day-summary">
<span>{selectedReview.day}</span>
<div>
<p>DAILY RESULT</p>
<strong>{selectedReview.score}% completed</strong>
<small>{dailyPoints.toFixed(1)} points earned</small>
</div>
</div>
<div className="missed-review">
<div>
<h2>{!selectedHasEntry?"No submission entered":selectedReview.missed.length?"Items missed or not completed":"Completed checklist"}</h2>
<p>{!selectedHasEntry?"Enter this day as a backlog checklist when it becomes available.":selectedReview.missed.length?"These items caused the daily percentage to drop.":"The submitted checklist contains no recorded missed-item detail."}</p>
</div>{!selectedHasEntry?<div className="perfect-state">0 points</div>:selectedReview.missed.length?<ul>{selectedReview.missed.map(item=>
<li key={item}>
<span>×</span>{item}<b>Not done</b>
</li>)}</ul>:<div className="perfect-state">✓ 100% complete</div>}<button className="view-submission">View full {selectedReview.day} submission</button>
</div>
</div>
<div className="beta-note">Only saved checklist submissions are included. Unentered days remain at 0 and are not counted in the weekly average.</div>
</section>:<>
 <div className="portal-switch">
<div>
<span>SECURE ADMINISTRATOR ACCESS</span>
<b>{role==="admin"?"Signed in as Master Administrator":"Master Administrator sign-in required"}</b>
</div>
<label>Beta role<select value={role} onChange={e=>{if(e.target.value==="admin"){setAdminPrompt(true);setAdminPassword("");setAdminError(false)}else{setRole("leader");setView("checklist")}setLockedNotice(false)}}>
<option value="leader">Team Leader</option>
<option value="admin">Master Administrator</option>
</select>
</label>
<button className={role!=="admin"?"locked":""} aria-disabled={role!=="admin"} onClick={()=>{if(role==="admin")setView("admin");else setLockedNotice(true)}}>{role==="admin"?"Open Administrator Portal →":"🔒 Administrator Portal"}</button>
</div>{adminPrompt&&<div className="admin-login-backdrop"><form className="admin-login" onSubmit={e=>{e.preventDefault();if(adminPassword==="Password123!"){setRole("admin");setAdminPrompt(false);setView("admin")}else setAdminError(true)}}><span className="admin-lock">A</span><p className="eyebrow">MASTER ADMINISTRATOR</p><h2>Password required</h2><p>Enter the trial administrator password to continue.</p><label>Password<input autoFocus type="password" value={adminPassword} onChange={e=>{setAdminPassword(e.target.value);setAdminError(false)}} placeholder="Enter administrator password"/></label>{adminError&&<div className="login-error">Incorrect password. Please try again.</div>}<div><button type="button" onClick={()=>setAdminPrompt(false)}>Cancel</button><button type="submit">Sign in securely</button></div><small>Beta access only · Trial password provided by the Master Administrator</small></form></div>}{lockedNotice&&<div className="locked-message">🔒 Access denied. This area is available only to an authenticated Master Administrator.</div>}<div className="catalog-heading">
<div>
<p className="eyebrow">CHECKLIST LIBRARY</p>
<h1>Select a checklist</h1>
</div>
<span>{checklists.length} checklist types</span>
</div>
 <nav className="checklist-tabs" aria-label="Checklist types">{checklists.map(c=>
<button key={c.id} className={selectedId===c.id?"active":""} onClick={()=>switchChecklist(c.id)}>
<ChecklistIcon checklist={c}/>
<span>
<b>{c.shortName}</b>
<small>{c.schedule}</small>
</span>
</button>)}</nav>
 <div className="crumbs">My checklists <span>›</span> {checklist.name}</div>
<section className="checklist-hero">
<ChecklistIcon checklist={checklist}/>
<div className="hero-copy">
<span className="beta-badge">BETA CHECKLIST</span>
<h1>{checklist.name}</h1>
<p>{checklist.schedule} checklist · {checklist.team}</p>
</div>
<div className="date-card">
<span>WORK DATE</span>
<strong>{displayDate(workDate).split(',')[0]}</strong>
<input aria-label="Checklist work date" type="date" value={workDate} max={isoToday()} onChange={e=>{setWorkDate(e.target.value);setSubmitted(false);setReviewDay(new Date(`${e.target.value}T12:00:00`).toLocaleDateString('en-US',{weekday:'short'}))}}/>
<small>{workDate===isoToday()?"Today":"Backlog entry"}</small>
</div>
</section>
 {selectedId==="operationsMonitor"&&<section className="monitor-role-note"><span>WORKING ROLE NAME</span><div><b>Cleaning Operations Monitor</b><p>Previously described as the “Enforcer.” This role verifies readiness, participation, checklist use, uniforms, and cleaning quality while Team Leaders remain responsible for correcting their team’s work.</p></div></section>}
 {checklist.weekly&&<section className="day-card">
<div>
<p className="eyebrow">WEEKLY ROUTE</p>
<strong>Which day’s assigned portion is this?</strong>
</div>
<div className="day-picker">{days.map(d=>
<button key={d} className={selectedDay===d?"active":""} onClick={()=>setSelectedDay(d)}>{d}</button>)}</div>
<p>The weekly route is divided by day. Only today’s assigned portion is scored on this submission.</p>
</section>}
 <section className="setup-card">
<label htmlFor="area">{checklist.areaLabel}</label>
<input id="area" value={areas[selectedId]??""} onChange={e=>setAreas(a=>({...a,[selectedId]:e.target.value}))} placeholder={checklist.weekly?`Example: ${selectedDay} – West Wing offices`:"Example: East Wing – First Floor"}/>
<button className="mark-all" onClick={markAllDone}>✓ Mark all done</button>
</section>
 <section className="paper-import">
<div className="camera-mark">▣</div>
<div><p className="eyebrow">PAPER CHECKLIST OPTION</p><h2>Attach a completed hardcopy</h2><span>Take a clear photo or upload one. The image will be attached to this dated checklist submission for Team Leader and administrator review.</span><small className="scan-active">Photo attachments are active.</small></div>
<label className="photo-button">{scanState==="idle"?"Take photo or upload":"Choose another photo"}<input type="file" accept="image/*" capture="environment" onChange={async e=>{const f=e.target.files?.[0];if(f){setScanName(f.name);setScanState("ready");try{setChecklistPhoto(await prepareChecklistPhoto(f));setScanState("review")}catch(error){window.alert(error instanceof Error?error.message:"Could not prepare photo");setChecklistPhoto(null);setScanState("idle")}}}}/></label>
{scanState==="ready"&&<div className="scan-status">Preparing photo…</div>}
{scanState==="review"&&checklistPhoto&&<div className="scan-review photo-attached"><img src={checklistPhoto.preview} alt="Selected hardcopy checklist preview"/><div><b>✓ Photo attached</b><span>{scanName}</span><strong>Complete or confirm the checklist answers below, then submit. The photo will be saved with this record.</strong><button onClick={()=>{setChecklistPhoto(null);setScanName("");setScanState("idle")}}>Remove photo</button></div></div>}
</section>
 <section className="roster-card">
<div className="roster-head">
<div>
<p className="eyebrow">TODAY’S TEAM</p>
<h2>Attendance & participation</h2>
<small>Confirm every member’s status before submitting the checklist.</small>
</div>
<div>
<strong>{attendanceAnswered}/{roster.length}</strong>
<span>reported</span>
</div>
</div>
{selectedOffender&&<div className="frequent-alert"><span>!</span><div><p>FREQUENT OFFENDER NOTICE</p><b>{selectedOffender.name} has {selectedOffender.incidents} unexcused attendance or participation incidents.</b><small>Review the history and issue the appropriate citation.</small></div><button onClick={()=>{setCitationOpen(true);setCitationIssued(false)}}>Review & issue citation</button></div>}
{citationOpen&&selectedOffender&&<div className="citation-panel"><div><p className="eyebrow">MEMBER CITATION · {selectedOffender.name.toUpperCase()}</p><h3>Select the current offense level</h3></div><button className="citation-close" onClick={()=>setCitationOpen(false)}>×</button><div className="citation-levels">{[
"First offense — Member is warned.","Second offense — Warning plus all cleaning instruction videos must be watched within 1 week.","Third offense — Member must independently deep clean one assigned area.","Fourth offense — Member is disqualified from the game but must continue cleaning duties."
].map((x,i)=><button key={x} className={citationLevel===i+1?"active":""} onClick={()=>setCitationLevel(i+1)}><b>{i+1}</b><span>{x}</span></button>)}</div><label>Team leader notes<textarea rows={3} placeholder="Record dates, pattern observed, discussion, and assigned corrective action."/></label><div className="citation-actions"><small>Citation is sent to the Master Administrator and kept in the member’s history.</small><button onClick={async()=>{await request('/api/citations',{method:'POST',body:JSON.stringify({member_id:selectedOffender.member_id,offense_level:citationLevel,notes:'Issued through Team Leader portal'})});await refreshBootstrap();setCitationIssued(true)}}>{citationIssued?"✓ Citation issued":"Issue citation"}</button></div>{citationIssued&&<div className="citation-success">Citation #{citationLevel} recorded for {selectedOffender.name}.</div>}</div>}
<div className="member-list">{roster.map((name,i)=>{const ms=rosterStatus(name),reasonKey=`${workDate}:${selectedId}:${name}`;return <div className={`member-row ${ms??""}`} key={name}>
<span className="member-avatar">{name.split(" ").map(x=>x[0]).join("")}</span>
<div>
<b>{name}</b>
<small>{i===0?"Team member · Assigned to dusting route":"Team member · Assigned checklist duties"}</small>
</div>
<div className="member-choices">
<button className={ms==="participated"?"selected present":""} onClick={()=>setMemberStatus(name,"participated")}>✓ Present & participated</button>
<button className={ms==="absent"?"selected absent":""} onClick={()=>setMemberStatus(name,"absent")}>Absent</button>
<button className={ms==="noParticipation"?"selected no-part":""} onClick={()=>setMemberStatus(name,"noParticipation")}>Did not participate</button>
<button className={ms==="excused"?"selected excused":""} onClick={()=>setMemberStatus(name,"excused")}>Excused</button>
</div>
{ms==="excused"&&<label className="excuse-reason">Why is {name} excused? *<textarea value={excuseReasons[reasonKey]??""} onChange={e=>{setSubmitted(false);setExcuseReasons(r=>({...r,[reasonKey]:e.target.value}))}} rows={2} placeholder="Example: Approved medical appointment; supervisor notified."/><small>An excused absence does not deduct team points. A reason is required.</small></label>}
</div>})}</div>
<div className="penalty-notice">
<span>!</span>
<p>
<b>Participation rule</b> Each absent or non-participating member deducts <strong>5 points</strong> from the team’s daily score.</p>
<em className={penalties?"applied":""}>{penalties?`−${penalties} points today`:"No penalty"}</em>
</div>
<div className={`participation-bonus ${participationBonus?"earned":""}`}><span>★</span><p><b>100% participation bonus</b> When every team member is present and participates, the team earns <strong>+5 bonus points.</strong></p><em>{participationBonus?"+5 points earned":"Not earned yet"}</em></div>
</section>
 <section className="progress-card">
<div className="progress-top">
<div>
<span>CHECKLIST PROGRESS</span>
<strong>{counts.answered} of {allItems.length} answered</strong>
</div>
<b>{Math.round(counts.answered/allItems.length*100)}%</b>
</div>
<div className="progress-track">
<span style={{width:`${counts.answered/allItems.length*100}%`}}/>
</div>
<div className="score-strip">
<div>
<i className="dot blue"/>{counts.done} Done</div>
<div>
<i className="dot red"/>{counts.notDone} Not done</div>
<div>
<i className="dot gray"/>{counts.na} N/A</div>
<div className="score">
<span>Current score</span>
<strong>{counts.score}%</strong>
</div>
</div>
</section>
 <section className="points-impact">
<div>
<span>CHECKLIST POINTS</span>
<strong>{(counts.score/10).toFixed(1)}</strong>
</div>
<b>−</b>
<div className={penalties?"penalized":""}>
<span>ATTENDANCE PENALTY</span>
<strong>{penalties.toFixed(1)}</strong>
</div>
<b>+</b>
<div className={participationBonus?"bonus-earned":""}>
<span>PARTICIPATION BONUS</span>
<strong>{participationBonus.toFixed(1)}</strong>
</div>
<b>=</b>
<div className="final-points">
<span>PROJECTED DAILY POINTS</span>
<strong>{Math.max(0,counts.score/10-penalties+participationBonus).toFixed(1)}</strong>
</div>
</section>
 {checklist.sections.map(section=>
<section className="check-section" key={section.title}>
<div className="section-heading">
<div>
<p className="eyebrow">{section.title}</p>
<h2>{section.instruction}</h2>
</div>
<span className="section-count">{section.items.filter(i=>currentStatuses[i.id]).length}/{section.items.length}</span>
</div>
<div className="rows">{section.items.map(item=>{const status=currentStatuses[item.id],assignmentKey=`${workDate}:${selectedId}:${item.id}`;return <div className={`task-row ${status??""}`} key={item.id}>
<button className="task-label" onClick={()=>setStatus(item.id,"done")} aria-label={status==="done"?`Clear completed status for ${item.label}`:`Mark ${item.label} done`}>
<span className="check-circle">{status==="done"?"✓":""}</span>
<span>{item.label}</span>
</button>
<label className="task-assignee"><span>Assigned to</span><select value={assignments[assignmentKey]??""} onChange={e=>setAssignments(a=>({...a,[assignmentKey]:e.target.value}))}><option value="">Unassigned</option>{roster.map(name=><option key={name}>{name}</option>)}</select></label>
<div className="choices" role="group" aria-label={`Status for ${item.label}`}>
<button aria-pressed={status==="done"} className={status==="done"?"selected done-choice":""} onClick={()=>setStatus(item.id,"done")}>Done</button>
<button aria-pressed={status==="notDone"} className={status==="notDone"?"selected missed-choice":""} onClick={()=>setStatus(item.id,"notDone")}>Not done</button>
<button aria-pressed={status==="na"} className={status==="na"?"selected na-choice":""} onClick={()=>setStatus(item.id,"na")}>N/A</button>
</div>
</div>})}</div>
</section>)}
 <section className={`submit-card ${counts.answered<allItems.length||attendanceAnswered<roster.length?"incomplete":"complete"}`}>
<div className="unanswered-note">
<span>{counts.answered===allItems.length&&attendanceAnswered===roster.length?"✓":"!"}</span>
<div>
<strong>{counts.answered===allItems.length&&attendanceAnswered===roster.length?"Checklist ready to submit":counts.answered<allItems.length?`${allItems.length-counts.answered} checklist items still need an answer`:`${roster.length-attendanceAnswered} team members still need a status`}</strong>
<p>Complete the checklist and report attendance for every team member.</p>
</div>
</div>
<button className="submit-button" onClick={trySubmit}>Submit for approval</button>{submitted&&<div className="success-message">Submitted successfully with attendance and participation. Projected points: {Math.max(0,counts.score/10-penalties+participationBonus).toFixed(1)}.</div>}</section>
 </>}</div>
</main>}
