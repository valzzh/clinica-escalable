import React,{useState,useEffect,useCallback,useRef}from 'react'
import{supabase}from'./supabase'
import'./App.css'

// ─── AUTH SCREENS ─────────────────────────────────────────────────────────────
function LoginScreen(){
  const [email,setEmail]=useState('')
  const [pass,setPass]=useState('')
  const [loading,setLoading]=useState(false)
  const [error,setError]=useState('')
  async function login(e){
    e.preventDefault();setLoading(true);setError('')
    const{error:err}=await supabase.auth.signInWithPassword({email,password:pass})
    if(err)setError('Email o contraseña incorrectos')
    setLoading(false)
  }
  return(
    <div className='auth-wrap'>
      <div className='auth-card'>
        <div className='auth-brand'>Clínica Escalable™</div>
        <div className='auth-sub'>Portal de administración</div>
        <form onSubmit={login} className='auth-form'>
          <div className='form-group'><label>Email</label><input type='email' value={email} onChange={e=>setEmail(e.target.value)} placeholder='valeria@...' required/></div>
          <div className='form-group'><label>Contraseña</label><input type='password' value={pass} onChange={e=>setPass(e.target.value)} placeholder='••••••••' required/></div>
          {error&&<div className='auth-error'>{error}</div>}
          <button type='submit' className='btn-green auth-btn' disabled={loading}>{loading?'Entrando...':'Entrar'}</button>
        </form>
      </div>
    </div>
  )
}

function ClientPortalAuth({clientaId}){
  const [email,setEmail]=useState('')
  const [sent,setSent]=useState(false)
  const [loading,setLoading]=useState(false)
  async function sendMagicLink(e){
    e.preventDefault();setLoading(true)
    await supabase.auth.signInWithOtp({email,options:{emailRedirectTo:window.location.origin+'/?clienta='+clientaId}})
    setSent(true);setLoading(false)
  }
  return(
    <div className='auth-wrap'>
      <div className='auth-card'>
        <div className='auth-brand'>Clínica Escalable™</div>
        <div className='auth-sub'>Tu programa personal</div>
        {!sent?(
          <form onSubmit={sendMagicLink} className='auth-form'>
            <p style={{fontSize:'14px',color:'var(--text-muted)',marginBottom:'18px',lineHeight:'1.6'}}>Ingresa tu email para recibir un link de acceso seguro.</p>
            <div className='form-group'><label>Tu email</label><input type='email' value={email} onChange={e=>setEmail(e.target.value)} placeholder='tu@email.com' required/></div>
            <button type='submit' className='btn-green auth-btn' disabled={loading}>{loading?'Enviando...':'Enviar link de acceso'}</button>
          </form>
        ):(
          <div className='auth-sent'>
            <div style={{fontSize:'36px',marginBottom:'12px'}}>📬</div>
            <div style={{fontSize:'16px',fontWeight:500,marginBottom:'8px'}}>Link enviado</div>
            <p style={{fontSize:'14px',color:'var(--text-muted)',lineHeight:'1.6'}}>Revisa tu email <strong>{email}</strong> y haz clic en el link para entrar a tu portal.</p>
          </div>
        )}
      </div>
    </div>
  )
}
import{createContext,useContext}from 'react'
const FASES=['Analisis','Extraccion','Arquitectura','Activacion']
const FL={Analisis:'Fase 1 â AnÃ¡lisis',Extraccion:'Fase 2 â ExtracciÃ³n',Arquitectura:'Fase 3 â Arquitectura',Activacion:'Fase 4 â ActivaciÃ³n'}
const PCT={Analisis:25,Extraccion:37,Arquitectura:50,Activacion:75}
const TD={Analisis:[{t:'Mapear tipo de pacientes y problemas frecuentes',n:'Entrevista de diagnÃ³stico inicial'},{t:'Documentar nÃºmero de consultas y duraciÃ³n promedio'},{t:'Identificar el 70% repetitivo del proceso clÃ­nico'},{t:'Completar diagnÃ³stico de escalabilidad'},{t:'Detectar puntos de agotamiento en el modelo'},{t:'Definir el resultado ideal del programa'}],Extraccion:[{t:'Documentar proceso de evaluaciÃ³n inicial'},{t:'Mapear etapas de intervenciÃ³n clÃ­nica'},{t:'Identificar puntos de seguimiento repetitivos'},{t:'Extraer la metodologÃ­a implÃ­cita en 5 pasos'},{t:'Nombrar cada etapa del proceso clÃ­nico'},{t:'Validar el mÃ©todo con 2-3 casos recientes'}],Arquitectura:[{t:'Definir duraciÃ³n y nÃºmero de sesiones del programa'},{t:'Crear oferta completa con stack de valor'},{t:'DiseÃ±ar victoria temprana semanas 1-2',n:'Primer resultado visible para la paciente'},{t:'Definir precio y modelo de acceso'},{t:'Redactar garantÃ­a del programa'},{t:'Completar kit de plantillas clÃ­nicas'},{t:'Definir mÃ©tricas de progreso de la paciente'},{t:'DiseÃ±ar estructura de las 6 sesiones 1:1'}],Activacion:[{t:'Seleccionar 5-10 pacientes candidatos del primer grupo',n:'Pacientes actuales comprometidos'},{t:'Redactar script de invitaciÃ³n personalizado'},{t:'Confirmar sistema de cobro Stripe o Clip'},{t:'Configurar Calendly para sesiones grupales'},{t:'Invitar a los primeros 3-5 pacientes'},{t:'Iniciar primer grupo y documentar resultados'},{t:'Recopilar primer testimonio al finalizar semana 2'}]}
const SD=[{numero:1,titulo:'AnÃ¡lisis del modelo clÃ­nico',estado:'Completada',nota:'DiagnÃ³stico completo.'},{numero:2,titulo:'ExtracciÃ³n de metodologÃ­a',estado:'Completada',nota:'Protocolo documentado.'},{numero:3,titulo:'DiseÃ±o de la oferta',estado:'Completada',nota:'Oferta completa definida.'},{numero:4,titulo:'ActivaciÃ³n del primer grupo',estado:'Proxima',nota:'SelecciÃ³n de pacientes.'},{numero:5,titulo:'Seguimiento del programa',estado:'Pendiente',nota:''},{numero:6,titulo:'Cierre y resultados',estado:'Pendiente',nota:''}]
const ED={Analisis:[{nombre:'DiagnÃ³stico de escalabilidad',icono:'ð',estado:'En curso'},{nombre:'Mapa del modelo clÃ­nico',icono:'ðºï¸',estado:'Pendiente'}],Extraccion:[{nombre:'DiagnÃ³stico de escalabilidad',icono:'ð',estado:'Listo'},{nombre:'Mapa de metodologÃ­a',icono:'ð',estado:'En curso'}],Arquitectura:[{nombre:'Oferta del programa clÃ­nico',icono:'ð',estado:'Listo'},{nombre:'Avatar ideal documentado',icono:'ð¤',estado:'Listo'},{nombre:'Kit de plantillas clÃ­nicas',icono:'ð',estado:'En curso'},{nombre:'Scripts de invitaciÃ³n',icono:'ð¬',estado:'Bloqueado'},{nombre:'Plan de activaciÃ³n del primer grupo',icono:'ð',estado:'Bloqueado'}],Activacion:[{nombre:'Oferta del programa clÃ­nico',icono:'ð',estado:'Listo'},{nombre:'Avatar ideal documentado',icono:'ð¤',estado:'Listo'},{nombre:'Kit de plantillas clÃ­nicas',icono:'ð',estado:'Listo'},{nombre:'Scripts de invitaciÃ³n',icono:'ð¬',estado:'En curso'},{nombre:'Plan de activaciÃ³n del primer grupo',icono:'ð',estado:'Pendiente'}]}
const ESTADOS=['Pendiente','En curso','Listo','Bloqueado']
const Check=()=><svg width='10' height='8' viewBox='0 0 10 8' fill='none'><path d='M1 4L3.5 6.5L9 1' stroke='white' strokeWidth='1.5' strokeLinecap='round'/></svg>
const params=new URLSearchParams(window.location.search)
const CLIENTA_ID=params.get('clienta')
// IS_CLIENT_VIEW is now based on perfil inside AppContent

function useDebounce(fn,delay){const timer=useRef(null);return useCallback((...args)=>{clearTimeout(timer.current);timer.current=setTimeout(()=>fn(...args),delay)},[fn,delay])} // eslint-disable-line

function CircleProgress({pct}){const r=40,c=2*Math.PI*r,dash=c*(pct/100);return(<svg width='100' height='100' viewBox='0 0 100 100'><circle cx='50' cy='50' r={r} fill='none' stroke='#e8e7e0' strokeWidth='8'/><circle cx='50' cy='50' r={r} fill='none' stroke='#1D6B5A' strokeWidth='8' strokeDasharray={dash+' '+(c-dash)} strokeDashoffset={c*0.25} strokeLinecap='round' style={{transition:'stroke-dasharray .5s ease'}}/><text x='50' y='55' textAnchor='middle' fontSize='18' fontWeight='500' fill='#1a1a18'>{pct}%</text></svg>)}

function makeCalendarLink(s,nc){if(!s.fecha_agendada)return null;const f=s.fecha_agendada.replace(/-/g,'');const h=(s.hora||'10:00').replace(':','');const st=f+'T'+h+'00';const eh=String(parseInt(h.slice(0,2))+1).padStart(2,'0');const en=f+'T'+eh+h.slice(2)+'00';const t=encodeURIComponent('SesiÃ³n '+s.numero+' â '+s.titulo+' | '+nc);const d=encodeURIComponent((s.link_meet?'Google Meet: '+s.link_meet+'\n\n':'')+'ClÃ­nica Escalableâ¢');return 'https://calendar.google.com/calendar/render?action=TEMPLATE&text='+t+'&dates='+st+'/'+en+'&details='+d+(s.link_meet?'&location='+encodeURIComponent(s.link_meet):'')}

// ─── MAIN APP WITH AUTH ────────────────────────────────────────────────────────
function AppContent({user,perfil}){
  const IS_CLIENT_VIEW=perfil?.role==='clienta'
  const [view,setView]=useState(IS_CLIENT_VIEW?'dashboard':'lista')
  const [clientas,setClientas]=useState([])
  const [selId,setSelId]=useState(IS_CLIENT_VIEW?CLIENTA_ID:null)
  const [c,setC]=useState(null)
  const [tareas,setTareas]=useState([])
  const [sesiones,setSesiones]=useState([])
  const [entregables,setEntregables]=useState([])
  const [logs,setLogs]=useState([])
  const [loading,setLoading]=useState(true)
  const [saving,setSaving]=useState(false)
  const [editMode,setEditMode]=useState(false)
  const [nav,setNav]=useState('dashboard')
  const [showForm,setShowForm]=useState(false)
  const [showLogForm,setShowLogForm]=useState(false)
  const [showLogPrompt,setShowLogPrompt]=useState(false)
  const [logForm,setLogForm]=useState({sesion_numero:'',titulo:'',fecha:'',link_fathom:'',notas:'',tareas_extra:''})
  const [form,setForm]=useState({nombre:'',profesion:'',especialidad:'',pais:'MÃ©xico',fase_activa:'Analisis'})
  const [copied,setCopied]=useState(false)
  const [editTarea,setEditTarea]=useState(null)
  const [nuevaTarea,setNuevaTarea]=useState('')
  const [nuevaResponsable,setNuevaResponsable]=useState('valeria')
  const [aplicarA,setAplicarA]=useState('solo')
  const [editDrive,setEditDrive]=useState(false)
  const [driveUrl,setDriveUrl]=useState('')

  useEffect(()=>{if(!IS_CLIENT_VIEW)loadClientas()},[]) // eslint-disable-line
  useEffect(()=>{if(selId)loadData(selId)},[selId]) // eslint-disable-line
  useEffect(()=>{if(c){setDriveUrl(c.link_drive_carpeta||'')}},[c?.id]) // eslint-disable-line

  async function loadClientas(){setLoading(true);const{data}=await supabase.from('clientas').select('*').order('created_at',{ascending:false});setClientas(data||[]);setLoading(false)}
  async function loadData(id){setLoading(true);const[rc,rt,rs,re,rl]=await Promise.all([supabase.from('clientas').select('*').eq('id',id).single(),supabase.from('tareas').select('*').eq('clienta_id',id).order('orden'),supabase.from('sesiones').select('*').eq('clienta_id',id).order('numero'),supabase.from('entregables').select('*').eq('clienta_id',id).order('orden'),supabase.from('coaching_log').select('*').eq('clienta_id',id).order('created_at',{ascending:false})]);setC(rc.data);setTareas(rt.data||[]);setSesiones(rs.data||[]);setEntregables(re.data||[]);setLogs(rl.data||[]);setLoading(false)}
  async function crearClienta(){if(!form.nombre.trim())return;setSaving(true);const{data:n}=await supabase.from('clientas').insert([{...form,sesiones_completadas:0}]).select().single();if(n){const f=n.fase_activa;await Promise.all([supabase.from('tareas').insert((TD[f]||[]).map((x,i)=>({clienta_id:n.id,fase:f,texto:x.t,nota:x.n||null,completada:false,orden:i,responsable:'valeria'}))),supabase.from('sesiones').insert(SD.map(s=>({...s,clienta_id:n.id}))),supabase.from('entregables').insert((ED[f]||[]).map((e,i)=>({...e,clienta_id:n.id,fase:f,orden:i})))]);setShowForm(false);setForm({nombre:'',profesion:'',especialidad:'',pais:'MÃ©xico',fase_activa:'Analisis'});await loadClientas();setSelId(n.id);setView('dashboard')}setSaving(false)}
  async function toggleTarea(t){if(IS_CLIENT_VIEW)return;const{data}=await supabase.from('tareas').update({completada:!t.completada}).eq('id',t.id).select().single();if(data)setTareas(prev=>prev.map(x=>x.id===t.id?data:x))}
  const saveNotaDebounced=useDebounce(async(nota)=>{await supabase.from('clientas').update({notas_internas:nota}).eq('id',c.id);setSaving(false)},1000)
  function handleNotaChange(v){setSaving(true);setC(prev=>({...prev,notas_internas:v}));saveNotaDebounced(v)}
  async function saveDrive(){await supabase.from('clientas').update({link_drive_carpeta:driveUrl}).eq('id',c.id);setC(prev=>({...prev,link_drive_carpeta:driveUrl}));setEditDrive(false)}
  async function updateEntregableEstado(id,estado){const{data}=await supabase.from('entregables').update({estado}).eq('id',id).select().single();if(data)setEntregables(prev=>prev.map(e=>e.id===id?data:e))}
  async function saveEntregableUrl(id,url){const{data}=await supabase.from('entregables').update({url}).eq('id',id).select().single();if(data)setEntregables(prev=>prev.map(e=>e.id===id?data:e))}
  async function cambiarFase(f){setSaving(true);await supabase.from('clientas').update({fase_activa:f}).eq('id',c.id);await supabase.from('tareas').delete().eq('clienta_id',c.id);await supabase.from('entregables').delete().eq('clienta_id',c.id);await Promise.all([supabase.from('tareas').insert((TD[f]||[]).map((x,i)=>({clienta_id:c.id,fase:f,texto:x.t,nota:x.n||null,completada:false,orden:i,responsable:'valeria'}))),supabase.from('entregables').insert((ED[f]||[]).map((e,i)=>({...e,clienta_id:c.id,fase:f,orden:i})))]);await loadData(c.id);await loadClientas();setSaving(false)}
  async function completarSesion(s){await supabase.from('sesiones').update({estado:'Completada'}).eq('id',s.id);const sig=sesiones.find(x=>x.numero===s.numero+1);if(sig)await supabase.from('sesiones').update({estado:'Proxima'}).eq('id',sig.id);await loadData(c.id);setLogForm(prev=>({...prev,sesion_numero:String(s.numero),titulo:s.titulo}));setShowLogPrompt(true)}
  async function guardarSesionFecha(sesId,fields){const{data}=await supabase.from('sesiones').update(fields).eq('id',sesId).select().single();if(data)setSesiones(prev=>prev.map(s=>s.id===sesId?data:s))}
  async function guardarLog(){if(!logForm.titulo.trim())return;await supabase.from('coaching_log').insert([{...logForm,clienta_id:c.id}]);setShowLogForm(false);setLogForm({sesion_numero:'',titulo:'',fecha:'',link_fathom:'',notas:'',tareas_extra:''});await loadData(c.id)}
  async function deleteLog(id){await supabase.from('coaching_log').delete().eq('id',id);setLogs(prev=>prev.filter(l=>l.id!==id))}
  async function editarTarea(id,texto,responsable){const{data}=await supabase.from('tareas').update({texto,responsable}).eq('id',id).select().single();if(data)setTareas(prev=>prev.map(t=>t.id===id?data:t));setEditTarea(null)}
  async function agregarTarea(){if(!nuevaTarea.trim())return;const fase=c.fase_activa;const orden=tareas.filter(t=>t.fase===fase).length;if(aplicarA==='todas'){const{data:otras}=await supabase.from('clientas').select('id').eq('fase_activa',fase).neq('id',c.id);if(otras?.length)await supabase.from('tareas').insert(otras.map(x=>({clienta_id:x.id,fase,texto:nuevaTarea,completada:false,orden,responsable:nuevaResponsable})))}const{data}=await supabase.from('tareas').insert([{clienta_id:c.id,fase,texto:nuevaTarea,completada:false,orden,responsable:nuevaResponsable}]).select().single();if(data)setTareas(prev=>[...prev,data]);setNuevaTarea('')}
  async function eliminarTarea(id){await supabase.from('tareas').delete().eq('id',id);setTareas(prev=>prev.filter(t=>t.id!==id))}
  function copyClientLink(){const url=window.location.origin+'/?clienta='+c.id;navigator.clipboard.writeText(url).then(()=>{setCopied(true);setTimeout(()=>setCopied(false),2000)})}

  const tf=tareas.filter(t=>t.fase===c?.fase_activa)
  const pct=c?PCT[c.fase_activa]||0:0
  const fl=c?FL[c.fase_activa]||'':''
  const ini=c?(c.nombre.split(' ').map(p=>p[0]).slice(0,2).join('')).toUpperCase():''
  const sesComp=sesiones.filter(s=>s.estado==='Completada').length
  const entComp=entregables.filter(e=>e.estado==='Listo').length
  const progreso=Math.min(99,Math.round(pct+(tf.length?(tf.filter(t=>t.completada).length/tf.length)*12:0)+(entregables.length?(entregables.filter(e=>e.estado==='Listo').length/entregables.length)*8:0)))
  const proxSesion=sesiones.find(s=>s.estado==='Proxima')
  const navItems=[{id:'dashboard',icon:'â'},{id:'tareas',icon:'â¦'},{id:'sesiones',icon:'â'},{id:'entregables',icon:'â'},{id:'carpeta',icon:'ð'},{id:'log',icon:'ð'}]

  if(loading&&view==='lista')return <div className='loading'>Cargando...</div>
  if(view==='lista')return(
    <div className='lista-view'>
      <div className='lista-header'><div className='brand-big'>ClÃ­nica Escalableâ¢</div><div className='brand-sub'>Portal de gestiÃ³n de clientas</div><button className='btn-add' onClick={()=>setShowForm(true)}>+ Nueva clienta</button></div>
      {showForm&&(<div className='modal-overlay'><div className='modal'><div className='modal-title'>Nueva clienta</div>{['nombre','profesion','especialidad','pais'].map(k=>(<div key={k} className='form-group'><label>{k.charAt(0).toUpperCase()+k.slice(1)}</label><input value={form[k]} onChange={e=>setForm(p=>({...p,[k]:e.target.value}))}/></div>))}<div className='form-group'><label>Fase inicial</label><select value={form.fase_activa} onChange={e=>setForm(p=>({...p,fase_activa:e.target.value}))}>{FASES.map(f=><option key={f} value={f}>{FL[f]}</option>)}</select></div><div className='modal-actions'><button className='btn-cancel' onClick={()=>setShowForm(false)}>Cancelar</button><button className='btn-green' onClick={crearClienta} disabled={saving}>{saving?'Creando...':'Crear clienta'}</button></div></div></div>)}
      <div className='clientas-grid'>{clientas.length===0&&<div className='empty-state'>No tienes clientas aÃºn.</div>}{clientas.map(x=>(<div key={x.id} className='clienta-card' onClick={()=>{setSelId(x.id);setView('dashboard')}}><div className='card-avatar-row'><div className='card-avatar'>{(x.nombre.split(' ').map(p=>p[0]).slice(0,2).join('')).toUpperCase()}</div><div><div className='card-name'>{x.nombre}</div><div className='card-prof'>{x.profesion}{x.especialidad?' Â· '+x.especialidad:''}</div></div></div><div className='card-tags'><span className='tag tag-green'>En proceso</span><span className='tag tag-purple'>{FL[x.fase_activa]}</span></div><div className='card-country'>{x.pais}</div></div>))}</div>
    </div>
  )
  if(loading)return <div className='loading'>Cargando...</div>
  if(!c)return null

  return(<div className='layout'>
    <nav className='sidebar'>
      <div className='brand'>ClÃ­nica Escalableâ¢<span>{IS_CLIENT_VIEW?'Tu programa':'Portal de clientas'}</span></div>
      {!IS_CLIENT_VIEW&&<button className='nav-back' onClick={()=>{setView('lista');setC(null);setNav('dashboard')}}>â Todas las clientas</button>}
      <div className='section-label'>Secciones</div>
      {navItems.map(({id,icon})=>(<button key={id} className={'nav-item'+(nav===id?' active':'')} onClick={()=>setNav(id)}>{icon} {id==='log'?'Coaching Log':id==='carpeta'?'Carpeta Drive':id.charAt(0).toUpperCase()+id.slice(1)}</button>))}
      <div className='sidebar-bottom'>{IS_CLIENT_VIEW?'Tu progreso se actualiza en tiempo real':saving?'â³ Guardando...':'â Guardado automÃ¡tico'}</div>
    </nav>
    <main className='main'>
      {!IS_CLIENT_VIEW&&editMode&&(<div className='edit-bar'><label>Fase:</label><select value={c.fase_activa} onChange={e=>cambiarFase(e.target.value)} disabled={saving}>{FASES.map(f=><option key={f} value={f}>{FL[f]}</option>)}</select><div className='flex1'/><button className='btn-green' onClick={()=>setEditMode(false)}>Cerrar ediciÃ³n</button></div>)}

      {/* Modal prompt: completar sesiÃ³n â coaching log */}
      {showLogPrompt&&(<div className='modal-overlay'><div className='modal'><div className='modal-title'>â SesiÃ³n completada</div><p style={{fontSize:'14px',color:'var(--text-muted)',marginBottom:'18px',lineHeight:'1.6'}}>Â¿Quieres registrar las notas de esta sesiÃ³n en el Coaching Log? Te ayudarÃ¡ a tener un historial completo del proceso.</p><div className='modal-actions'><button className='btn-cancel' onClick={()=>setShowLogPrompt(false)}>Ahora no</button><button className='btn-green' onClick={()=>{setShowLogPrompt(false);setNav('log');setShowLogForm(true)}}>Ir al Coaching Log â</button></div></div></div>)}

      <div className='topbar'>
        <div className='topbar-left'><div className='avatar'>{ini}</div><div className='client-meta'><div className='client-name'>{c.nombre}</div><div className='client-sub'>{c.profesion}{c.especialidad?' Â· '+c.especialidad:''}{c.pais?' Â· '+c.pais:''}</div><div className='badges'><span className='badge badge-green'>En proceso</span><span className='badge badge-purple'>{fl}</span></div></div></div>
        <div className='topbar-right'>{!IS_CLIENT_VIEW&&(<><button className='btn-edit' onClick={()=>setEditMode(!editMode)}>{editMode?'Cerrar':'âï¸ Editar fase'}</button><button className={'btn-copy-link'+(copied?' copied':'')} onClick={copyClientLink}>{copied?'â Copiado':'ð Copiar link'}</button></>)}</div>
      </div>

      {proxSesion&&(<div className={'prox-sesion-banner'+(IS_CLIENT_VIEW?' client-banner':'')}>
        <div className='prox-info'>
          <span className='prox-label'>ð PrÃ³xima sesiÃ³n</span>
          <span className='prox-title'>SesiÃ³n {proxSesion.numero} â {proxSesion.titulo}</span>
          {proxSesion.fecha_agendada?<span className='prox-fecha'>{new Date(proxSesion.fecha_agendada+'T12:00:00').toLocaleDateString('es-MX',{weekday:'long',day:'numeric',month:'long'})}{proxSesion.hora&&' Â· '+proxSesion.hora}</span>:<span className='prox-sin-fecha'>{IS_CLIENT_VIEW?'Valeria te contactarÃ¡ pronto':'Sin fecha agendada â ve a Sesiones para agendar'}</span>}
        </div>
        <div className='prox-actions'>
          {proxSesion.link_meet&&(<a href={proxSesion.link_meet} target='_blank' rel='noreferrer' className='btn-meet'>ð¹ Unirse</a>)}
          {!IS_CLIENT_VIEW&&makeCalendarLink(proxSesion,c.nombre)&&(<a href={makeCalendarLink(proxSesion,c.nombre)} target='_blank' rel='noreferrer' className='btn-calendar'>ð Agendar en Calendar</a>)}
          {!IS_CLIENT_VIEW&&(<button className='btn-agenda-banner' onClick={()=>setNav('sesiones')}>âï¸ Gestionar sesiones</button>)}
        </div>
      </div>)}

      <div className='progress-section'><div className='progress-row'><div className='progress-left'><div className='progress-header'><span className='progress-title'>Avance del programa</span><span className='progress-pct'>{pct}%</span></div><div className='progress-track'><div className='progress-fill' style={{width:pct+'%'}}/></div><div className='phase-pills'>{FASES.map((f,i)=>{const idx=FASES.indexOf(c.fase_activa);const cls=i<idx?'pill-done':i===idx?'pill-active':'pill-locked';return <div key={f} className={'phase-pill '+cls}><span className='pnum'>Fase {i+1}</span>{i>idx?'ð ':''}{['AnÃ¡lisis','ExtracciÃ³n','Arquitectura','ActivaciÃ³n'][i]}</div>})}</div></div><div className='progress-circle'><CircleProgress pct={progreso}/><div className='circle-label'>Progreso total</div></div></div></div>

      {nav==='dashboard'&&(<>
        <div className='metrics'><div className='metric'><div className='metric-icon'>ð</div><div className='metric-label'>Sesiones</div><div className='metric-value'>{sesComp}<span className='metric-of'>/6</span></div></div><div className='metric'><div className='metric-icon'>â</div><div className='metric-label'>Tareas</div><div className='metric-value'>{tf.filter(t=>t.completada).length}<span className='metric-of'>/{tf.length}</span></div></div><div className='metric'><div className='metric-icon'>ð</div><div className='metric-label'>Entregables</div><div className='metric-value'>{entComp}<span className='metric-of'>/{entregables.length}</span></div></div></div>
        <div className='cols'>
          <div className='card'><div className='card-title'>Tareas â {fl.split('â ')[1]}</div><div className='task-list'>{tf.map(t=>(<div key={t.id} className={'task-item'+(IS_CLIENT_VIEW?'':' clickable')} onClick={()=>!IS_CLIENT_VIEW&&toggleTarea(t)}><div className={'task-check '+(t.completada?'check-done':'check-pending')}>{t.completada&&<Check/>}</div><div className='task-body'><div className={'task-text '+(t.completada?'done':'')}>{t.texto}</div><div className='task-resp-badge'>{t.responsable==='clienta'?'ð¤ Clienta':'ð©ââï¸ Valeria'}</div></div><span className={'task-badge badge-'+(t.completada?'green':'purple')}>{t.completada?'Lista':'Pendiente'}</span></div>))}</div></div>
          <div className='card'><div className='card-title'>Sesiones</div><div className='session-list'>{sesiones.map(s=>(<div key={s.id} className='session-item'><div className={'session-dot '+(s.estado==='Completada'?'dot-done':s.estado==='Proxima'?'dot-next':'dot-pending')}/><div className='session-info'><div className={'session-title '+(s.estado==='Proxima'?'next':s.estado==='Pendiente'?'faint':'')}>SesiÃ³n {s.numero} â {s.titulo}</div><div className={'session-date '+(s.estado==='Proxima'?'next':'faint')}>{s.estado==='Completada'?'Completada':s.estado==='Proxima'?'PrÃ³xima':'Pendiente'}{s.fecha_agendada&&' Â· '+new Date(s.fecha_agendada+'T12:00:00').toLocaleDateString('es-MX',{day:'numeric',month:'short'})}</div></div></div>))}</div></div>
        </div>
        {!IS_CLIENT_VIEW&&(<div className='card'><div className='card-title'>Notas internas â guardado automÃ¡tico</div><textarea value={c.notas_internas||''} onChange={e=>handleNotaChange(e.target.value)} placeholder='Notas de sesiÃ³n, observaciones, prÃ³ximos pasos...'/></div>)}
      </>)}

      {nav==='tareas'&&(<div className='card full'>
        <div className='card-title-row'><span className='card-title'>Tareas â {fl}</span></div>
        <div className='task-list'>
          {tf.map(t=>(<div key={t.id} className='task-item-edit'>
            <div className={'task-check clickable '+(t.completada?'check-done':'check-pending')} onClick={()=>!IS_CLIENT_VIEW&&toggleTarea(t)}>{t.completada&&<Check/>}</div>
            {!IS_CLIENT_VIEW&&editTarea===t.id?(<EditTareaInline texto={t.texto} responsable={t.responsable||'valeria'} onSave={(txt,resp)=>editarTarea(t.id,txt,resp)} onCancel={()=>setEditTarea(null)}/>
            ):(<div className='task-body' style={{flex:1}}><div className={'task-text '+(t.completada?'done':'')}>{t.texto}</div><div className='task-resp-badge'>{t.responsable==='clienta'?'ð¤ Clienta':'ð©ââï¸ Valeria'}</div></div>)}
            {!IS_CLIENT_VIEW&&editTarea!==t.id&&(<div className='task-edit-actions'><button className='btn-edit-tarea' onClick={()=>setEditTarea(t.id)}>âï¸</button><button className='btn-del-tarea' onClick={()=>eliminarTarea(t.id)}>Ã</button></div>)}
            <span className={'task-badge badge-'+(t.completada?'green':'purple')}>{t.completada?'Lista':'Pendiente'}</span>
          </div>))}
        </div>
        {!IS_CLIENT_VIEW&&(<div className='nueva-tarea-box'>
          <div className='nueva-tarea-title'>+ Agregar tarea</div>
          <input className='nueva-tarea-input' value={nuevaTarea} onChange={e=>setNuevaTarea(e.target.value)} placeholder='Escribe la nueva tarea...' onKeyDown={e=>e.key==='Enter'&&agregarTarea()}/>
          <div className='nueva-tarea-opciones'>
            <div className='resp-option-group'><span style={{fontSize:'12px',color:'var(--text-muted)',fontWeight:500}}>Responsable:</span><label><input type='radio' name='resp' value='valeria' checked={nuevaResponsable==='valeria'} onChange={()=>setNuevaResponsable('valeria')}/> ð©ââï¸ Valeria</label><label><input type='radio' name='resp' value='clienta' checked={nuevaResponsable==='clienta'} onChange={()=>setNuevaResponsable('clienta')}/> ð¤ Clienta</label></div>
            <div className='resp-option-group'><span style={{fontSize:'12px',color:'var(--text-muted)',fontWeight:500}}>Aplicar a:</span><label><input type='radio' name='aplica' value='solo' checked={aplicarA==='solo'} onChange={()=>setAplicarA('solo')}/> Solo {c.nombre.split(' ')[0]}</label><label><input type='radio' name='aplica' value='todas' checked={aplicarA==='todas'} onChange={()=>setAplicarA('todas')}/> Todas en {fl.split('â ')[1]||'esta fase'}</label></div>
          </div>
          <button className='btn-green' onClick={agregarTarea} disabled={!nuevaTarea.trim()}>Agregar tarea</button>
        </div>)}
        <p className='phase-note'>Las fases se desbloquean al avanzar desde Editar fase.</p>
      </div>)}

      {nav==='sesiones'&&(<div className='card full'>
        <div className='card-title'>Sesiones del programa</div>
        <div className='session-list'>{sesiones.map(s=>(<SesionItem key={s.id} s={s} isAdmin={!IS_CLIENT_VIEW} nombreClienta={c.nombre} onSave={guardarSesionFecha} onCompletar={completarSesion}/>))}</div>
      </div>)}

      {nav==='entregables'&&(<div className='card full'><div className='card-title-row'><span className='card-title'>Entregables del programa</span>{!IS_CLIENT_VIEW&&<span className='card-subtitle'>Edita estado y agrega links de Drive</span>}</div><div className='doc-list'>{entregables.map(e=>(<EntregableItem key={e.id} e={e} isAdmin={!IS_CLIENT_VIEW} onEstado={updateEntregableEstado} onUrl={saveEntregableUrl}/>))}</div></div>)}

      {nav==='carpeta'&&(<div className='card full'>
        <div className='card-title-row'><span className='card-title'>ð Carpeta de Drive â {c.nombre.split(' ')[0]}</span></div>
        <div className='carpeta-box'>
          {c.link_drive_carpeta?(<>
            <div className='carpeta-preview'>
              <div className='carpeta-icon'>ð</div>
              <div className='carpeta-info'>
                <div className='carpeta-nombre'>Carpeta de {c.nombre.split(' ')[0]}</div>
                <div className='carpeta-url'>{c.link_drive_carpeta}</div>
              </div>
              <a href={c.link_drive_carpeta} target='_blank' rel='noreferrer' className='btn-meet'>Abrir carpeta â</a>
            </div>
            {!IS_CLIENT_VIEW&&(<button className='btn-link' style={{marginTop:'12px'}} onClick={()=>setEditDrive(true)}>Cambiar link</button>)}
          </>):(IS_CLIENT_VIEW?(<div className='empty-state'>Tu carpeta de documentos estarÃ¡ disponible pronto.</div>):(<div className='carpeta-empty'>
            <div style={{fontSize:'40px',marginBottom:'12px'}}>ð</div>
            <div style={{fontSize:'15px',fontWeight:500,marginBottom:'6px',color:'var(--text)'}}>Sin carpeta de Drive vinculada</div>
            <div style={{fontSize:'13px',color:'var(--text-muted)',marginBottom:'20px'}}>Vincula la carpeta de Drive donde guardarÃ¡s todos los documentos de {c.nombre.split(' ')[0]}.</div>
            <button className='btn-green' onClick={()=>setEditDrive(true)}>+ Vincular carpeta de Drive</button>
          </div>))}
          {!IS_CLIENT_VIEW&&editDrive&&(<div className='drive-edit-box'>
            <div className='form-group'><label>Link de la carpeta de Google Drive</label><input value={driveUrl} onChange={e=>setDriveUrl(e.target.value)} placeholder='https://drive.google.com/drive/folders/...'/></div>
            <div className='modal-actions'><button className='btn-cancel' onClick={()=>setEditDrive(false)}>Cancelar</button><button className='btn-green' onClick={saveDrive}>Guardar</button></div>
          </div>)}
          {IS_CLIENT_VIEW&&c.link_drive_carpeta&&(<div className='carpeta-msg'>AquÃ­ encontrarÃ¡s todos los documentos y materiales de tu programa. Puedes acceder en cualquier momento.</div>)}
        </div>
      </div>)}

      {nav==='log'&&(<div className='card full'>
        <div className='card-title-row'><span className='card-title'>Coaching Log</span>{!IS_CLIENT_VIEW&&<button className='btn-new-log' onClick={()=>setShowLogForm(true)}>+ Nueva sesiÃ³n</button>}</div>
        {showLogForm&&(<div className='log-form'>
          <div className='log-form-grid'><div className='form-group'><label>SesiÃ³n #</label><input type='number' value={logForm.sesion_numero} onChange={e=>setLogForm(p=>({...p,sesion_numero:e.target.value}))} placeholder='4'/></div><div className='form-group'><label>Fecha</label><input type='date' value={logForm.fecha} onChange={e=>setLogForm(p=>({...p,fecha:e.target.value}))}/></div></div>
          <div className='form-group'><label>TÃ­tulo</label><input value={logForm.titulo} onChange={e=>setLogForm(p=>({...p,titulo:e.target.value}))} placeholder='DiseÃ±o de la oferta y precios'/></div>
          <div className='form-group'><label>Link de Fathom (grabaciÃ³n)</label><input value={logForm.link_fathom} onChange={e=>setLogForm(p=>({...p,link_fathom:e.target.value}))} placeholder='https://fathom.video/...'/></div>
          <div className='form-group'><label>Notas de la sesiÃ³n</label><textarea value={logForm.notas} onChange={e=>setLogForm(p=>({...p,notas:e.target.value}))} placeholder='QuÃ© se trabajÃ³, decisiones, acuerdos...'/></div>
          <div className='form-group'><label>Tareas extra (una por lÃ­nea)</label><textarea value={logForm.tareas_extra} onChange={e=>setLogForm(p=>({...p,tareas_extra:e.target.value}))} placeholder='Revisar precios&#10;Actualizar avatar'/></div>
          <div className='modal-actions'><button className='btn-cancel' onClick={()=>setShowLogForm(false)}>Cancelar</button><button className='btn-green' onClick={guardarLog}>Guardar sesiÃ³n</button></div>
        </div>)}
        <div className='logs-list'>{logs.length===0&&<div className='empty-state'>No hay sesiones registradas aÃºn.</div>}{logs.map(l=>(<div key={l.id} className='log-item'><div className='log-header'><div className='log-title'>{l.sesion_numero?'SesiÃ³n '+l.sesion_numero+' â ':''}{l.titulo}</div><div className='log-meta'>{l.fecha&&<span>{l.fecha}</span>}{!IS_CLIENT_VIEW&&<button className='btn-del-log' onClick={()=>deleteLog(l.id)}>Ã</button>}</div></div>{l.link_fathom&&(<a href={l.link_fathom} target='_blank' rel='noreferrer' className='log-fathom'>â¶ Ver grabaciÃ³n en Fathom</a>)}{l.notas&&(<div className='log-notas'>{l.notas}</div>)}{l.tareas_extra&&(<div className='log-tareas'><div className='log-tareas-title'>Tareas extra:</div>{l.tareas_extra.split('\n').filter(Boolean).map((t,i)=>(<div key={i} className='log-tarea-item'>â¦ {t}</div>))}</div>)}</div>))}</div>
      </div>)}
    </main>
  </div>)
}

function EditTareaInline({texto,responsable,onSave,onCancel}){
  const [val,setVal]=useState(texto)
  const [resp,setResp]=useState(responsable||'valeria')
  return(<div className='edit-tarea-inline'>
    <div style={{flex:1}}>
      <input className='edit-tarea-input' value={val} onChange={e=>setVal(e.target.value)} autoFocus onKeyDown={e=>{if(e.key==='Enter')onSave(val,resp);if(e.key==='Escape')onCancel()}}/>
      <div className='resp-mini'><label><input type='radio' value='valeria' checked={resp==='valeria'} onChange={()=>setResp('valeria')}/> ð©ââï¸ Valeria</label><label><input type='radio' value='clienta' checked={resp==='clienta'} onChange={()=>setResp('clienta')}/> ð¤ Clienta</label></div>
    </div>
    <button className='btn-save-url' onClick={()=>onSave(val,resp)}>Guardar</button>
    <button className='btn-cancel-url' onClick={onCancel}>Ã</button>
  </div>)
}

function SesionItem({s,isAdmin,nombreClienta,onSave,onCompletar}){
  const [editing,setEditing]=useState(false)
  const [fecha,setFecha]=useState(s.fecha_agendada||'')
  const [hora,setHora]=useState(s.hora||'')
  const [meet,setMeet]=useState(s.link_meet||'')
  const calLink=makeCalendarLink({...s,fecha_agendada:fecha,hora,link_meet:meet},nombreClienta)
  const esProxima=s.estado==='Proxima'
  const esPendiente=s.estado==='Pendiente'
  return(<div className={'session-item big'+(esProxima?' proxima-item':'')}>
    <div className={'session-dot '+(s.estado==='Completada'?'dot-done':esProxima?'dot-next':'dot-pending')}/>
    <div className='session-info' style={{flex:1}}>
      <div className={'session-title '+(esProxima?'next':esPendiente?'faint':'')}>SesiÃ³n {s.numero} â {s.titulo}</div>
      <div className={'session-date '+(esProxima?'next':'faint')}>
        {s.estado==='Completada'?'â Completada':esProxima?'PrÃ³xima':'Pendiente'}
        {s.fecha_agendada&&<strong> Â· {new Date(s.fecha_agendada+'T12:00:00').toLocaleDateString('es-MX',{weekday:'short',day:'numeric',month:'long'})}</strong>}
        {s.hora&&<strong> {s.hora}</strong>}
      </div>
      {s.nota&&<div className='session-note-text'>{s.nota}</div>}
      {s.link_meet&&(<a href={s.link_meet} target='_blank' rel='noreferrer' className={IS_CLIENT_VIEW?'btn-meet':'log-fathom'} style={{marginTop:'6px',display:'inline-flex'}}>{IS_CLIENT_VIEW?'ð¹ Unirse a la sesiÃ³n':'ð¹ Google Meet'}</a>)}
      {isAdmin&&editing&&(<div className='sesion-edit-box'>
        <div className='sesion-edit-row'><div className='form-group'><label>Fecha</label><input type='date' value={fecha} onChange={e=>setFecha(e.target.value)}/></div><div className='form-group'><label>Hora</label><input type='time' value={hora} onChange={e=>setHora(e.target.value)}/></div></div>
        <div className='form-group'><label>Link de Google Meet</label><input value={meet} onChange={e=>setMeet(e.target.value)} placeholder='https://meet.google.com/...'/></div>
        <div className='sesion-edit-actions'>
          {calLink&&<a href={calLink} target='_blank' rel='noreferrer' className='btn-calendar'>ð Crear evento en Google Calendar</a>}
          <button className='btn-green' onClick={()=>{onSave(s.id,{fecha_agendada:fecha||null,hora:hora||null,link_meet:meet||null});setEditing(false)}}>Guardar</button>
          <button className='btn-cancel' onClick={()=>setEditing(false)}>Cancelar</button>
        </div>
      </div>)}
    </div>
    {isAdmin&&s.estado!=='Completada'&&(<div className='sesion-actions'>
      <button className={'btn-agenda-sesion'+(esProxima?' proxima':'')} onClick={()=>setEditing(!editing)}>{editing?'Cerrar':'ð Agendar'}</button>
      {esProxima&&<button className='btn-completar-sesion' onClick={()=>onCompletar(s)}>â Completar sesiÃ³n</button>}
    </div>)}
  </div>)
}

function EntregableItem({e,isAdmin,onEstado,onUrl}){
  const [editing,setEditing]=useState(false)
  const [urlVal,setUrlVal]=useState(e.url||'')
  const bloqueado=e.estado==='Bloqueado'
  return(<div className={'doc-item'+(bloqueado?' locked':'')+' big'}><span className='doc-icon'>{e.icono}</span><div className='doc-body'><span className='doc-name'>{e.nombre}</span>{isAdmin&&editing&&(<div className='url-edit'><input className='url-input' value={urlVal} onChange={ev=>setUrlVal(ev.target.value)} placeholder='Pega el link de Google Drive...'/><button className='btn-save-url' onClick={()=>{onUrl(e.id,urlVal);setEditing(false)}}>Guardar</button><button className='btn-cancel-url' onClick={()=>setEditing(false)}>Cancelar</button></div>)}</div><div className='doc-actions'>{!bloqueado&&e.url&&(<a href={e.url} target='_blank' rel='noreferrer' className='btn-ver'>Ver â</a>)}{isAdmin&&!bloqueado&&(<><button className='btn-link' onClick={()=>setEditing(!editing)}>{e.url?'Editar link':'+ Link'}</button><select className='estado-select' value={e.estado} onChange={ev=>onEstado(e.id,ev.target.value)}>{ESTADOS.map(s=><option key={s} value={s}>{s}</option>)}</select></>)}{(!isAdmin||bloqueado)&&(<span className={'tag '+(e.estado==='Listo'?'tag-green':e.estado==='En curso'?'tag-purple':'tag-gray')}>{bloqueado?'ð':e.estado}</span>)}</div></div>)
}

// Auth wrapper
export default function App(){
  const [session,setSession]=useState(undefined)
  const [perfil,setPerfil]=useState(null)
  const params=new URLSearchParams(window.location.search)
  const clientaId=params.get('clienta')

  useEffect(()=>{
    supabase.auth.getSession().then(({data:{session}})=>setSession(session))
    const{data:{subscription}}=supabase.auth.onAuthStateChange((_,session)=>{
      setSession(session)
      if(session)loadPerfil(session.user.id)
      else setPerfil(null)
    })
    return()=>subscription.unsubscribe()
  },[]) // eslint-disable-line

  async function loadPerfil(uid){
    const{data}=await supabase.from('perfiles').select('*').eq('id',uid).single()
    setPerfil(data)
    // Si es clienta, vincular su user_id con su registro si no está vinculado
    if(data?.role==='clienta'&&data?.clienta_id){
      await supabase.from('clientas').update({clienta_user_id:uid}).eq('id',data.clienta_id).is('clienta_user_id',null)
    }
  }

  // Cargando sesión
  if(session===undefined)return <div className='loading'>Cargando...</div>

  // Vista de clienta: requiere auth o muestra pantalla de magic link
  if(clientaId){
    if(!session)return <ClientPortalAuth clientaId={clientaId}/>
    if(!perfil)return <div className='loading'>Verificando acceso...</div>
    // Verificar que la clienta tiene acceso a este portal específico
    if(perfil.role==='clienta'&&perfil.clienta_id!==clientaId){
      return <div className='auth-wrap'><div className='auth-card'><div className='auth-brand'>Acceso no autorizado</div><p style={{color:'var(--text-muted)',marginTop:'12px'}}>Este portal no corresponde a tu cuenta.</p></div></div>
    }
    return <AppContent user={session.user} perfil={perfil}/>
  }

  // Vista admin: requiere login
  if(!session)return <LoginScreen/>
  if(!perfil)return <div className='loading'>Verificando acceso...</div>
  if(perfil.role!=='admin'){
    return <div className='auth-wrap'><div className='auth-card'><div className='auth-brand'>Acceso restringido</div><p style={{color:'var(--text-muted)',marginTop:'12px'}}>Esta área es solo para administradores.</p><button className='btn-cancel' style={{marginTop:'16px'}} onClick={()=>supabase.auth.signOut()}>Cerrar sesión</button></div></div>
  }
  return <AppContent user={session.user} perfil={perfil}/>
}