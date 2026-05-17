'use client';
import { useState, use } from 'react';
import { useRouter } from 'next/navigation';
import CompanySidebar from '@/components/CompanySidebar';
import CompanyTopBar from '@/components/CompanyTopBar';
import CompanyBottomNav from '@/components/CompanyBottomNav';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Pencil, Users, X, Download, Star, XCircle, ChevronRight, Check } from 'lucide-react';

type ApplicantStatus = 'on-review' | 'shortlisted' | 'rejected';
type JobStatus = 'Active' | 'On-Review' | 'Closed';

interface Applicant {
  id: string; name: string; compatibility: number;
  skills: string[]; experience: string; education: string;
  summary: string; status: ApplicantStatus;
}

const JOBS: Record<string, { id:string;title:string;department:string;location:string;type:string;salary:string;postedDaysAgo:number;description:string;applicants:Applicant[] }> = {
  '1': { id:'1', title:'Senior Frontend Developer', department:'Engineering', location:'Kuala Lumpur (Hybrid)', type:'Full-time', salary:'MYR 6,000 – 10,000', postedDaysAgo:5,
    description:'We are looking for a Senior Frontend Developer with strong React/Next.js experience. You will lead frontend architecture decisions and mentor junior developers.',
    applicants:[
      {id:'a1',name:'Ahmad Fariz bin Ismail',compatibility:94,skills:['React','TypeScript','Next.js'],experience:'5 years',education:'BSc Computer Science, UTM',summary:'Senior frontend engineer with 5 years of React experience building large-scale SaaS products.',status:'on-review'},
      {id:'a2',name:'Siti Nurhaliza Binti Hassan',compatibility:87,skills:['React','Vue.js','CSS'],experience:'4 years',education:'BSc Information Technology, UM',summary:'4 years experience in modern frontend frameworks. Passionate about UI/UX and accessibility.',status:'on-review'},
      {id:'a3',name:'Rajan Kumar s/o Subramaniam',compatibility:81,skills:['React','JavaScript','Node.js'],experience:'3 years',education:'BSc Software Engineering, UPM',summary:'Full-stack developer with strong frontend fundamentals and production React experience.',status:'on-review'},
      {id:'a4',name:'Nurul Ain Binti Mohd Yusof',compatibility:74,skills:['Angular','React','TypeScript'],experience:'3 years',education:'BSc Computer Science, UiTM',summary:'Transitioned from Angular to React. Strong TypeScript and test-driven development skills.',status:'on-review'},
      {id:'a5',name:'Lim Wei Jie',compatibility:68,skills:['React','HTML','CSS'],experience:'2 years',education:'Diploma in IT, Sunway College',summary:'Junior-to-mid developer with solid React basics and a keen eye for design.',status:'on-review'},
      {id:'a6',name:'Priya Devi a/p Krishnamurthy',compatibility:61,skills:['JavaScript','jQuery','Bootstrap'],experience:'2 years',education:'BSc Software Engineering, MMU',summary:'Transitioning from traditional web dev to modern React ecosystem.',status:'on-review'},
    ]},
  '2': { id:'2', title:'UI/UX Designer', department:'Design', location:'Remote', type:'Full-time', salary:'MYR 4,000 – 7,000', postedDaysAgo:8,
    description:'Join our design team to craft beautiful, user-centered interfaces for our enterprise platform.',
    applicants:[
      {id:'b1',name:'Farah Izzati Binti Zulkifli',compatibility:91,skills:['Figma','UX Research','Prototyping'],experience:'4 years',education:'BA Design, UITM',summary:'Lead UX designer with end-to-end product design and design systems experience.',status:'on-review'},
      {id:'b2',name:'Marcus Tan Chee Keong',compatibility:78,skills:['Figma','Sketch','Adobe XD'],experience:'3 years',education:'BSc Multimedia, MMU',summary:'Creative designer with strong visual communication and mobile-first design skills.',status:'on-review'},
    ]},
};

const COMPAT_COLOR = (p:number) => p>=80 ? {bg:'#E8F9D9',cl:'#2E7D32'} : p>=60 ? {bg:'#FFF8E1',cl:'#CC9F00'} : {bg:'#FFEAEA',cl:'#C62828'};
const STATUS_STYLE: Record<ApplicantStatus,{bg:string;cl:string;label:string}> = {
  'on-review': {bg:'#FFF8E1',cl:'#CC9F00',label:'On-Review'},
  'shortlisted':{bg:'#E8F7FF',cl:'#1565C0',label:'⭐ Shortlisted'},
  'rejected':   {bg:'#FFEAEA',cl:'#C62828',label:'✗ Rejected'},
};
const JOB_STATUS_STYLE: Record<JobStatus,{bg:string;cl:string}> = {
  'Active':   {bg:'#E8F9D9',cl:'#2E7D32'},
  'On-Review':{bg:'#FFF8E1',cl:'#CC9F00'},
  'Closed':   {bg:'#FFEAEA',cl:'#C62828'},
};

type FilterTab = 'all' | ApplicantStatus;
const FILTER_TABS: {key:FilterTab;label:string}[] = [
  {key:'all',label:'All'},{key:'on-review',label:'On-Review'},
  {key:'shortlisted',label:'Shortlisted'},{key:'rejected',label:'Rejected'},
];

function Modal({a,onClose,onShortlist,onReject}:{a:Applicant;onClose:()=>void;onShortlist:()=>void;onReject:()=>void}) {
  const c=COMPAT_COLOR(a.compatibility); const s=STATUS_STYLE[a.status];
  return (
    <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}
      onClick={onClose} style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.55)',zIndex:200,display:'flex',alignItems:'center',justifyContent:'center',padding:16}}>
      <motion.div initial={{scale:0.92,opacity:0}} animate={{scale:1,opacity:1}} exit={{scale:0.92,opacity:0}}
        transition={{type:'spring',stiffness:360,damping:30}} onClick={e=>e.stopPropagation()}
        style={{background:'#fff',borderRadius:24,width:'100%',maxWidth:520,maxHeight:'88vh',overflow:'auto',boxShadow:'0 24px 64px rgba(0,0,0,0.25)'}}>
        <div style={{background:'#1A1A1A',borderRadius:'24px 24px 0 0',padding:'18px 22px',display:'flex',justifyContent:'space-between',alignItems:'center'}}>
          <div style={{display:'flex',alignItems:'center',gap:10}}>
            <div style={{width:40,height:40,borderRadius:10,background:'#FFC800',display:'flex',alignItems:'center',justifyContent:'center',fontWeight:800,color:'#1A1A1A'}}>
              {a.name.split(' ').map((w:string)=>w[0]).slice(0,2).join('')}
            </div>
            <div><div style={{fontWeight:800,color:'#fff'}}>{a.name}</div><div style={{fontSize:12,color:'#ABABAB'}}>{a.experience} exp</div></div>
          </div>
          <button onClick={onClose} style={{background:'rgba(255,255,255,0.1)',border:'none',borderRadius:8,padding:6,cursor:'pointer'}}><X size={16} color="#fff"/></button>
        </div>
        <div style={{padding:22}}>
          <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:18}}>
            <div style={{background:c.bg,color:c.cl,borderRadius:10,padding:'8px 16px',textAlign:'center'}}>
              <div style={{fontSize:26,fontWeight:800}}>{a.compatibility}%</div>
              <div style={{fontSize:11,fontWeight:700}}>Resume Match</div>
            </div>
            <span style={{background:s.bg,color:s.cl,borderRadius:9999,padding:'4px 12px',fontSize:13,fontWeight:700}}>{s.label}</span>
          </div>
          <div style={{marginBottom:14}}><div style={{fontSize:11,fontWeight:700,color:'#ABABAB',textTransform:'uppercase',letterSpacing:'0.5px',marginBottom:6}}>Resume Summary</div>
            <div style={{fontSize:14,color:'#1A1A1A',lineHeight:1.6,background:'#F5F0E8',borderRadius:10,padding:14}}>{a.summary}</div></div>
          <div style={{marginBottom:14}}><div style={{fontSize:11,fontWeight:700,color:'#ABABAB',textTransform:'uppercase',letterSpacing:'0.5px',marginBottom:6}}>Education</div>
            <div style={{fontSize:14,fontWeight:600}}>{a.education}</div></div>
          <div style={{marginBottom:20}}><div style={{fontSize:11,fontWeight:700,color:'#ABABAB',textTransform:'uppercase',letterSpacing:'0.5px',marginBottom:6}}>Key Skills</div>
            <div style={{display:'flex',flexWrap:'wrap',gap:6}}>{a.skills.map((sk:string)=><span key={sk} style={{background:'#F0EBFF',color:'#7C5CBF',borderRadius:9999,padding:'3px 10px',fontSize:12,fontWeight:700}}>{sk}</span>)}</div></div>
          <div style={{display:'flex',gap:8,flexWrap:'wrap'}}>
            <button onClick={()=>alert('Downloading resume PDF…')} style={{flex:1,display:'flex',alignItems:'center',justifyContent:'center',gap:6,background:'#F5F0E8',color:'#1A1A1A',border:'none',borderRadius:10,padding:12,fontWeight:700,fontSize:13,cursor:'pointer'}}><Download size={14}/>Download Resume</button>
            <button onClick={onShortlist} disabled={a.status==='shortlisted'} style={{flex:1,display:'flex',alignItems:'center',justifyContent:'center',gap:6,background:a.status==='shortlisted'?'#E8F7FF':'#1A1A1A',color:a.status==='shortlisted'?'#1565C0':'#FFC800',border:'none',borderRadius:10,padding:12,fontWeight:700,fontSize:13,cursor:a.status==='shortlisted'?'default':'pointer'}}><Star size={14}/>{a.status==='shortlisted'?'Shortlisted':'Shortlist'}</button>
            <button onClick={onReject} disabled={a.status==='rejected'} style={{flex:1,display:'flex',alignItems:'center',justifyContent:'center',gap:6,background:a.status==='rejected'?'#FFEAEA':'#FF4B4B',color:a.status==='rejected'?'#C62828':'#fff',border:'none',borderRadius:10,padding:12,fontWeight:700,fontSize:13,cursor:a.status==='rejected'?'default':'pointer'}}><XCircle size={14}/>{a.status==='rejected'?'Rejected':'Reject'}</button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

export default function JobDetailPage({params}:{params:Promise<{jobId:string}>}) {
  const {jobId}=use(params); const router=useRouter(); const jobData=JOBS[jobId];
  const [applicants,setApplicants]=useState<Applicant[]>(jobData?.applicants??[]);
  const [selected,setSelected]=useState<Applicant|null>(null);
  const [jobStatus,setJobStatus]=useState<JobStatus>('Active');
  const [editingStatus,setEditingStatus]=useState(false);
  const [desc,setDesc]=useState(jobData?.description??'');
  const [editingDesc,setEditingDesc]=useState(false);
  const [descDraft,setDescDraft]=useState('');
  const [filter,setFilter]=useState<FilterTab>('on-review');

  if(!jobData) return (
    <div style={{display:'flex',minHeight:'100vh',background:'#F5F0E8'}}><CompanySidebar/>
      <div className="flex-1 lg:ml-[220px]" style={{display:'flex',alignItems:'center',justifyContent:'center',flexDirection:'column',gap:16}}>
        <div style={{fontSize:48}}>🔍</div><div style={{fontSize:20,fontWeight:700}}>Job not found</div>
        <button onClick={()=>router.push('/company/dashboard')} style={{background:'#FFC800',color:'#1A1A1A',padding:'10px 24px',borderRadius:12,fontWeight:700,border:'none',cursor:'pointer'}}>Back</button>
      </div>
    </div>
  );

  function updateStatus(id:string,status:ApplicantStatus){
    setApplicants(prev=>prev.map(a=>a.id===id?{...a,status}:a));
    setSelected(prev=>prev?.id===id?{...prev,status}:prev);
  }

  const liveApplicant = selected ? applicants.find(a=>a.id===selected.id)??selected : null;
  const filtered = filter==='all' ? applicants : applicants.filter(a=>a.status===filter);
  const js=JOB_STATUS_STYLE[jobStatus];

  return (
    <div style={{display:'flex',minHeight:'100vh',background:'#F5F0E8'}}>
      <CompanySidebar/>
      <div className="flex-1 lg:ml-[220px]" style={{display:'flex',flexDirection:'column',minHeight:'100vh'}}>
        <CompanyTopBar/>
        {/* Desktop banner */}
        <div className="hidden lg:flex" style={{background:'#1A1A1A',padding:'20px 40px',alignItems:'center',justifyContent:'space-between'}}>
          <div style={{display:'flex',alignItems:'center',gap:16}}>
            <button onClick={()=>router.back()} style={{background:'rgba(255,255,255,0.1)',border:'1px solid rgba(255,255,255,0.2)',borderRadius:10,padding:'8px 14px',color:'#fff',cursor:'pointer',display:'flex',alignItems:'center',gap:6,fontSize:13,fontWeight:700}}><ArrowLeft size={15}/>Back</button>
            <div><div style={{fontSize:11,fontWeight:700,color:'#FFC800',textTransform:'uppercase',letterSpacing:'1px'}}>JOB DETAILS</div>
              <div style={{fontSize:20,fontWeight:800,color:'#fff',marginTop:2}}>{jobData.title}</div></div>
          </div>
        </div>

        <div style={{flex:1,padding:'28px 20px 120px',maxWidth:820,margin:'0 auto',width:'100%'}}>
          {/* Mobile header */}
          <div className="lg:hidden" style={{display:'flex',alignItems:'center',gap:10,marginBottom:20}}>
            <button onClick={()=>router.back()} style={{background:'#fff',border:'1px solid #E8E0D0',borderRadius:10,padding:8,cursor:'pointer',display:'flex'}}><ArrowLeft size={18} color="#1A1A1A"/></button>
            <div style={{fontSize:18,fontWeight:800,color:'#1A1A1A'}}>{jobData.title}</div>
          </div>

          {/* ── Job Info Card ── */}
          <motion.div initial={{opacity:0,y:12}} animate={{opacity:1,y:0}}
            style={{background:'#fff',borderRadius:20,border:'1px solid #E8E0D0',padding:24,boxShadow:'0 2px 8px rgba(0,0,0,0.04)',marginBottom:20}}>

            {/* Status row */}
            <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:16,flexWrap:'wrap'}}>
              {/* Editable job status */}
              <div style={{position:'relative'}}>
                <button onClick={()=>setEditingStatus(!editingStatus)}
                  style={{display:'flex',alignItems:'center',gap:6,background:js.bg,color:js.cl,border:'none',borderRadius:9999,padding:'4px 12px',fontSize:12,fontWeight:700,cursor:'pointer'}}>
                  {jobStatus}<Pencil size={10}/>
                </button>
                {editingStatus&&(
                  <div style={{position:'absolute',top:'110%',left:0,background:'#fff',border:'1px solid #E8E0D0',borderRadius:12,padding:8,zIndex:50,boxShadow:'0 8px 24px rgba(0,0,0,0.12)',display:'flex',flexDirection:'column',gap:4,minWidth:130}}>
                    {(['Active','On-Review','Closed'] as JobStatus[]).map(s=>(
                      <button key={s} onClick={()=>{setJobStatus(s);setEditingStatus(false);}}
                        style={{display:'flex',alignItems:'center',gap:6,background:jobStatus===s?'#1A1A1A':'transparent',color:jobStatus===s?'#FFC800':'#1A1A1A',border:'none',borderRadius:8,padding:'7px 12px',fontSize:13,fontWeight:700,cursor:'pointer',textAlign:'left'}}>
                        {jobStatus===s&&<Check size={12}/>}{s}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <span style={{background:'#E8F7FF',color:'#1565C0',borderRadius:9999,padding:'4px 12px',fontSize:12,fontWeight:700}}>{jobData.type}</span>
              <span style={{fontSize:12,color:'#ABABAB'}}>Posted {jobData.postedDaysAgo} days ago</span>
            </div>

            {/* Details grid */}
            <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(170px,1fr))',gap:14,marginBottom:20}}>
              {[['Location',jobData.location],['Department',jobData.department],['Salary',jobData.salary]].map(([l,v])=>(
                <div key={l}><div style={{fontSize:11,fontWeight:700,color:'#ABABAB',textTransform:'uppercase',letterSpacing:'0.5px',marginBottom:4}}>{l}</div>
                  <div style={{fontSize:14,fontWeight:600,color:'#1A1A1A'}}>{v}</div></div>
              ))}
            </div>

            {/* Editable description */}
            <div>
              <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:8}}>
                <span style={{fontSize:11,fontWeight:700,color:'#ABABAB',textTransform:'uppercase',letterSpacing:'0.5px'}}>Description</span>
                {!editingDesc&&<button onClick={()=>{setDescDraft(desc);setEditingDesc(true);}} style={{background:'#F5F0E8',border:'none',borderRadius:6,padding:'3px 7px',cursor:'pointer',display:'flex',alignItems:'center'}}><Pencil size={11} color="#6B6B6B"/></button>}
              </div>
              {editingDesc?(
                <div>
                  <textarea value={descDraft} onChange={e=>setDescDraft(e.target.value)} rows={5}
                    style={{width:'100%',border:'2px solid #1A1A1A',borderRadius:10,padding:'10px 12px',fontSize:14,color:'#1A1A1A',outline:'none',resize:'vertical',fontFamily:'inherit',lineHeight:1.6,boxSizing:'border-box'}}/>
                  <div style={{display:'flex',gap:8,marginTop:8}}>
                    <button onClick={()=>{setDesc(descDraft);setEditingDesc(false);}} style={{display:'flex',alignItems:'center',gap:6,background:'#1A1A1A',color:'#FFC800',border:'none',borderRadius:8,padding:'8px 16px',fontWeight:700,fontSize:13,cursor:'pointer'}}><Check size={13}/>Save</button>
                    <button onClick={()=>setEditingDesc(false)} style={{background:'#F5F0E8',color:'#6B6B6B',border:'none',borderRadius:8,padding:'8px 14px',fontWeight:700,fontSize:13,cursor:'pointer'}}>Cancel</button>
                  </div>
                </div>
              ):<div style={{fontSize:14,color:'#1A1A1A',lineHeight:1.7}}>{desc}</div>}
            </div>
          </motion.div>

          {/* ── Applicants ── */}
          <motion.div initial={{opacity:0,y:12}} animate={{opacity:1,y:0}} transition={{delay:0.1}}>
            <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:14}}>
              <div style={{fontSize:18,fontWeight:800,color:'#1A1A1A'}}>Applicants</div>
              <div style={{display:'flex',alignItems:'center',gap:6}}><Users size={15} color="#6B6B6B"/>
                <span style={{fontSize:13,fontWeight:700,color:'#6B6B6B'}}>{applicants.length} total</span></div>
            </div>

            {/* Filter tabs */}
            <div style={{display:'flex',gap:8,marginBottom:16,flexWrap:'wrap'}}>
              {FILTER_TABS.map(({key,label})=>{
                const count = key==='all' ? applicants.length : applicants.filter(a=>a.status===key).length;
                const active=filter===key;
                return (
                  <button key={key} onClick={()=>setFilter(key)}
                    style={{display:'flex',alignItems:'center',gap:5,background:active?'#1A1A1A':'#fff',color:active?'#FFC800':'#6B6B6B',border:`1px solid ${active?'#1A1A1A':'#E8E0D0'}`,borderRadius:9999,padding:'6px 14px',fontSize:12,fontWeight:700,cursor:'pointer',transition:'all 150ms'}}>
                    {label}<span style={{background:active?'rgba(255,200,0,0.2)':'#F5F0E8',color:active?'#FFC800':'#6B6B6B',borderRadius:9999,padding:'1px 7px',fontSize:11,fontWeight:800}}>{count}</span>
                  </button>
                );
              })}
            </div>

            {/* Compatibility legend */}
            <div style={{display:'flex',gap:10,marginBottom:12,flexWrap:'wrap'}}>
              {[{l:'≥80% Strong',bg:'#E8F9D9',cl:'#2E7D32'},{l:'60–79% Good',bg:'#FFF8E1',cl:'#CC9F00'},{l:'<60% Weak',bg:'#FFEAEA',cl:'#C62828'}].map(x=>(
                <span key={x.l} style={{background:x.bg,color:x.cl,borderRadius:9999,padding:'2px 10px',fontSize:11,fontWeight:700}}>{x.l}</span>
              ))}
            </div>

            {/* Applicant rows */}
            <div style={{display:'flex',flexDirection:'column',gap:8}}>
              {filtered.length===0
                ? <div style={{textAlign:'center',padding:'40px 20px',background:'#fff',borderRadius:16,border:'1px solid #E8E0D0',color:'#6B6B6B',fontSize:14,fontWeight:600}}>No applicants in this category</div>
                : filtered.map((a,i)=>{
                  const c=COMPAT_COLOR(a.compatibility); const s=STATUS_STYLE[a.status];
                  return (
                    <motion.button key={a.id} initial={{opacity:0,x:-10}} animate={{opacity:1,x:0}} transition={{delay:0.04*i}}
                      whileHover={{boxShadow:'0 4px 20px rgba(0,0,0,0.1)',borderColor:'#FFC800'}}
                      onClick={()=>setSelected(a)}
                      style={{all:'unset',display:'flex',alignItems:'center',background:'#fff',borderRadius:14,border:'1px solid #E8E0D0',padding:'12px 16px',gap:12,cursor:'pointer',boxShadow:'0 2px 8px rgba(0,0,0,0.04)',transition:'box-shadow 150ms,border-color 150ms'}}>
                      {/* Rank */}
                      <div style={{fontSize:11,fontWeight:800,color:'#ABABAB',minWidth:24,textAlign:'center'}}>#{applicants.indexOf(a)+1}</div>
                      {/* Avatar */}
                      <div style={{width:38,height:38,borderRadius:10,background:'#F5F0E8',display:'flex',alignItems:'center',justifyContent:'center',fontSize:13,fontWeight:800,color:'#6B6B6B',flexShrink:0}}>
                        {a.name.split(' ').map((w:string)=>w[0]).slice(0,2).join('')}
                      </div>
                      {/* Name + exp */}
                      <div style={{flex:1,minWidth:0}}>
                        <div style={{fontSize:14,fontWeight:700,color:'#1A1A1A',whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis'}}>{a.name}</div>
                        <div style={{fontSize:12,color:'#6B6B6B',marginTop:2}}>{a.experience} · {a.skills.slice(0,2).join(', ')}</div>
                      </div>
                      {/* Status column */}
                      <span style={{background:s.bg,color:s.cl,borderRadius:9999,padding:'3px 10px',fontSize:11,fontWeight:700,flexShrink:0,whiteSpace:'nowrap'}}>{s.label}</span>
                      {/* Compatibility */}
                      <div style={{display:'flex',flexDirection:'column',alignItems:'flex-end',flexShrink:0}}>
                        <span style={{background:c.bg,color:c.cl,borderRadius:9999,padding:'4px 10px',fontSize:14,fontWeight:800}}>{a.compatibility}%</span>
                        <span style={{fontSize:10,color:'#ABABAB',fontWeight:600}}>match</span>
                      </div>
                      <ChevronRight size={15} color="#ABABAB"/>
                    </motion.button>
                  );
                })
              }
            </div>
          </motion.div>
        </div>
      </div>

      <CompanyBottomNav/>

      <AnimatePresence>
        {liveApplicant&&(
          <Modal key={liveApplicant.id} a={liveApplicant}
            onClose={()=>setSelected(null)}
            onShortlist={()=>updateStatus(liveApplicant.id,'shortlisted')}
            onReject={()=>updateStatus(liveApplicant.id,'rejected')}/>
        )}
      </AnimatePresence>

      {/* Close status dropdown on outside click */}
      {editingStatus&&<div style={{position:'fixed',inset:0,zIndex:40}} onClick={()=>setEditingStatus(false)}/>}
    </div>
  );
}
