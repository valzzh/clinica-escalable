import React,{useState,useEffect,useCallback,useRef}from 'react'
import{supabase}from'./supabase'
import'./App.css'
const FASES=['Analisis','Extraccion','Arquitectura','Activacion']
const FL={Analisis:'Fase 1 — Análisis',Extraccion:'Fase 2 — Extracción',Arquitectura:'Fase 3 — Arquitectura',Activacion:'Fase 4 — Activación'}
const PCT={Analisis:25,Extraccion:37,Arquitectura:50,Activacion:75}
const TD={Analisis:[{t:'Mapear tipo de pacientes y problemas frecuentes',n:'Entrevista de diagnóstico inicial'},{t:'Documentar número de consultas y duración promedio'},{t:'Identificar el 70% repetitivo del proceso clínico'},{t:'Completar diagnóstico de escalabilidad'},{t:'Detectar puntos de agotamiento en el modelo'},{t:'Definir el resultado ideal del programa'}],Extraccion:[{t:'Documentar proceso de evaluación inicial'},{t:'Mapear etapas de intervención clínica'},{t:'Identificar puntos de seguimiento repetitivos'},{t:'Extraer la metodología implícita en 5 pasos'},{t:'Nombrar cada etapa del proceso clínico'},{t:'Validar el método con 2-3 casos recientes'}],Arquitectura:[{t:'Definir duración y número de sesiones del programa'},{t:'Crear oferta completa con stack de valor'},{t:'Diseñar victoria temprana semanas 1-2',n:'Primer resultado visible para la paciente'},{t:'Definir precio y modelo de acceso'},{t:'Redactar garantía del programa'},{t:'Completar kit de plantillas clínicas'},{t:'Definir métricas de progreso de la paciente'},{t:'Diseñar estructura de las 6 sesiones 1:1'}],Activacion:[{t:'Seleccionar 5-10 pacientes candidatos del primer grupo',n:'Pacientes actuales comprometidos'},{t:'Redactar script de invitación personalizado'},{t:'Confirmar sistema de cobro Stripe o Clip'},{t:'Configurar Calendly para sesiones grupales'},{t:'Invitar a los primeros 3-5 pacientes'},{t:'Iniciar primer grupo y documentar resultados'},{t:'Recopilar primer testimonio al finalizar semana 2'}]}
const SD=[{numero:1,titulo:'Análisis del modelo clínico',estado:'Completada',nota:'Diagnóstico completo. Agenda saturada, 70% repetitivo identificado.'},{numero:2,titulo:'Extracción de metodología',estado:'Completada',nota:'Protocolo documentado en 5 pasos.'},{numero:3,titulo:'Diseño de la oferta',estado:'Completada',nota:'Oferta completa: precio, sesiones, garantía definidos.'},{numero:4,titulo:'Activación del primer grupo',estado:'Proxima',nota:'Selección de pacientes ideales e invitación.'},{numero:5,titulo:'Seguimiento del programa',estado:'Pendiente',nota:''},{numero:6,titulo:'Cierre y resultados',estado:'Pendiente',nota:''}]
const ED={Analisis:[{nombre:'Diagnóstico de escalabilidad',icono:'📄',estado:'En curso'},{nombre:'Mapa del modelo clínico',icono:'🗺️',estado:'Pendiente'}],Extraccion:[{nombre:'Diagnóstico de escalabilidad',icono:'📄',estado:'Listo'},{nombre:'Mapa de metodología',icono:'📋',estado:'En curso'}],Arquitectura:[{nombre:'Oferta del programa clínico',icono:'📄',estado:'Listo'},{nombre:'Avatar ideal documentado',icono:'👤',estado:'Listo'},{nombre:'Kit de plantillas clínicas',icono:'📋',estado:'En curso'},{nombre:'Scripts de invitación',icono:'💬',estado:'Bloqueado'},{nombre:'Plan de activación del primer grupo',icono:'🚀',estado:'Bloqueado'}],Activacion:[{nombre:'Oferta del programa clínico',icono:'📄',estado:'Listo'},{nombre:'Avatar ideal documentado',icono:'👤',estado:'Listo'},{nombre:'Kit de plantillas clínicas',icono:'📋',estado:'Listo'},{nombre:'Scripts de invitación',icono:'💬',estado:'En curso'},{nombre:'Plan de activación del primer grupo',icono:'🚀',estado:'Pendiente'}]}
const ESTADOS=['Pendiente','En curso','Listo','Bloqueado']
const Check=()=><svg width='10' height='8' viewBox='0 0 10 8' fill='none'><path d='M1 4L3.5 6.5L9 1' stroke='white' strokeWidth='1.5' strokeLinecap='round'/></svg>
const params=new URLSearchParams(window.location.search)
const CLIENTA_ID=params.get('clienta')
const IS_CLIENT_VIEW=!!CLIENTA_ID

function useDebounce(fn,delay){
  const timer=useRef(null)
  return useCallback((...args)=>{
    clearTimeout(timer.current)
    timer.current=setTimeout(()=>fn(...args),delay)
  },[fn,delay]) // eslint-disable-line
}

function CircleProgress({pct}){
  const r=40,c=2*Math.PI*r,dash=c*(pct/100)
  return(<svg width='100' height='100' viewBox='0 0 100 100'>
    <circle cx='50' cy='50' r={r} fill='none' stroke='#e8e7e0' strokeWidth='8'/>
    <circle cx='50' cy='50' r={r} fill='none' stroke='#1D6B5A' strokeWidth='8'
      strokeDasharray={`${dash} ${c}`} strokeDashoffset={c*0.25} strokeLinecap='round'
      style={{transition:'stroke-dasharray .5s ease'}}/>
    <text x='50' y='54' textAnchor='middle' fontSize='18' fontWeight='500' fill='#1a1a18'>{pct}%</text>
  </svg>)
}

export default function App(){
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
  const [logForm,setLogForm]=useState({sesion_numero:'',titulo:'',fecha:'',link_fathom:'',notas:'',tareas_extra:''})
  const [form,setForm]=useState({nombre:'',profesion:'',especialidad:'',pais:'México',fase_activa:'Analisis'})
  const [copied,setCopied]=useState(false)

  useEffect(()=>{if(!IS_CLIENT_VIEW)loadClientas()},[]) // eslint-disable-line
  useEffect(()=>{if(selId)loadData(selId)},[selId]) // eslint-disable-line

  async function loadClientas(){
    setLoading(true)
    const{data}=await supabase.from('clientas').select('*').order('created_at',{ascending:false})
    setClientas(data||[])
    setLoading(false)
  }
  async function loadData(id){
    setLoading(true)
    const[rc,rt,rs,re,rl]=await Promise.all([
      supabase.from('clientas').select('*').eq('id',id).single(),
      supabase.from('tareas').select('*').eq('clienta_id',id).order('orden'),
      supabase.from('sesiones').select('*').eq('clienta_id',id).order('numero'),
      supabase.from('entregables').select('*').eq('clienta_id',id).order('orden'),
      supabase.from('coaching_log').select('*').eq('clienta_id',id).order('created_at',{ascending:false}),
    ])
    setC(rc.data);setTareas(rt.data||[]);setSesiones(rs.data||[]);setEntregables(re.data||[]);setLogs(rl.data||[])
    setLoading(false)
  }
  async function crearClienta(){
    if(!form.nombre.trim())return
    setSaving(true)
    const{data:n}=await supabase.from('clientas').insert([{...form,sesiones_completadas:0}]).select().single()
    if(n){
      const f=n.fase_activa
      await Promise.all([
        supabase.from('tareas').insert((TD[f]||[]).map((x,i)=>({clienta_id:n.id,fase:f,texto:x.t,nota:x.n||null,completada:false,orden:i}))),
        supabase.from('sesiones').insert(SD.map(s=>({...s,clienta_id:n.id}))),
        supabase.from('entregables').insert((ED[f]||[]).map((e,i)=>({...e,clienta_id:n.id,fase:f,orden:i}))),
      ])
      setShowForm(false);setForm({nombre:'',profesion:'',especialidad:'',pais:'México',fase_activa:'Analisis'})
      await loadClientas();setSelId(n.id);setView('dashboard')
    }
    setSaving(false)
  }
  async function toggleTarea(t){
    if(IS_CLIENT_VIEW)return
    const{data}=await supabase.from('tareas').update({completada:!t.completada}).eq('id',t.id).select().single()
    if(data)setTareas(prev=>prev.map(x=>x.id===t.id?data:x))
  }
  const saveNotaDebounced=useDebounce(async(nota)=>{
    await supabase.from('clientas').update({notas_internas:nota}).eq('id',c.id)
    setSaving(false)
  },1000)
  function handleNotaChange(v){setSaving(true);setC(prev=>({...prev,notas_internas:v}));saveNotaDebounced(v)}
  async function updateEntregableEstado(id,estado){
    const{data}=await supabase.from('entregables').update({estado}).eq('id',id).select().single()
    if(data)setEntregables(prev=>prev.map(e=>e.id===id?data:e))
  }
  async function saveEntregableUrl(id,url){
    const{data}=await supabase.from('entregables').update({url}).eq('id',id).select().single()
    if(data)setEntregables(prev=>prev.map(e=>e.id===id?data:e))
  }
  async function cambiarFase(f){
    setSaving(true)
    await supabase.from('clientas').update({fase_activa:f}).eq('id',c.id)
    await supabase.from('tareas').delete().eq('clienta_id',c.id)
    await supabase.from('entregables').delete().eq('clienta_id',c.id)
    await Promise.all([
      supabase.from('tareas').insert((TD[f]||[]).map((x,i)=>({clienta_id:c.id,fase:f,texto:x.t,nota:x.n||null,completada:false,orden:i}))),
      supabase.from('entregables').insert((ED[f]||[]).map((e,i)=>({...e,clienta_id:c.id,fase:f,orden:i}))),
    ])
    await loadData(c.id);await loadClientas();setSaving(false)
  }
  async function avanzarSesion(){
    const prox=sesiones.find(s=>s.estado==='Proxima')
    if(!prox)return
    await supabase.from('sesiones').update({estado:'Completada'}).eq('id',prox.id)
    const sig=sesiones.find(s=>s.numero===prox.numero+1)
    if(sig)await supabase.from('sesiones').update({estado:'Proxima'}).eq('id',sig.id)
    await loadData(c.id)
  }
  async function guardarLog(){
    if(!logForm.titulo.trim())return
    await supabase.from('coaching_log').insert([{...logForm,clienta_id:c.id}])
    setShowLogForm(false)
    setLogForm({sesion_numero:'',titulo:'',fecha:'',link_fathom:'',notas:'',tareas_extra:''})
    await loadData(c.id)
  }
  async function deleteLog(id){
    await supabase.from('coaching_log').delete().eq('id',id)
    setLogs(prev=>prev.filter(l=>l.id!==id))
  }
  function copyClientLink(){
    const url=window.location.origin+'/?clienta='+c.id
    navigator.clipboard.writeText(url).then(()=>{setCopied(true);setTimeout(()=>setCopied(false),2000)})
  }

  const tf=tareas.filter(t=>t.fase===c?.fase_activa)
  const pct=c?PCT[c.fase_activa]||0:0
  const fl=c?FL[c.fase_activa]||'':''
  const ini=c?(c.nombre.split(' ').map(p=>p[0]).slice(0,2).join('')).toUpperCase():''
  const sesComp=sesiones.filter(s=>s.estado==='Completada').length
  const tarComp=tareas.filter(t=>t.completada).length
  const entComp=entregables.filter(e=>e.estado==='Listo').length
  const progreso=Math.round((pct+(tf.length?tf.filter(t=>t.completada).length/tf.length*10:0)+(entregables.length?entregables.filter(e=>e.estado==='Listo').length/entregables.length*10:0))/1.2)

  if(loading&&view==='lista')return <div className='loading'>Cargando...</div>

  if(view==='lista')return(
    <div className='lista-view'>
      <div className='lista-header'>
        <div className='brand-big'>Clínica Escalable™</div>
        <div className='brand-sub'>Portal de gestión de clientas</div>
        <button className='btn-add' onClick={()=>setShowForm(true)}>+ Nueva clienta</button>
      </div>
      {showForm&&(<div className='modal-overlay'><div className='modal'>
        <div className='modal-title'>Nueva clienta</div>
        {['nombre','profesion','especialidad','pais'].map(k=>(<div key={k} className='form-group'><label>{k.charAt(0).toUpperCase()+k.slice(1)}</label><input value={form[k]} onChange={e=>setForm(p=>({...p,[k]:e.target.value}))}/></div>))}
        <div className='form-group'><label>Fase inicial</label><select value={form.fase_activa} onChange={e=>setForm(p=>({...p,fase_activa:e.target.value}))}>{FASES.map(f=><option key={f} value={f}>{FL[f]}</option>)}</select></div>
        <div className='modal-actions'><button className='btn-cancel' onClick={()=>setShowForm(false)}>Cancelar</button><button className='btn-green' onClick={crearClienta} disabled={saving}>{saving?'Creando...':'Crear clienta'}</button></div>
      </div></div>)}
      <div className='clientas-grid'>
        {clientas.length===0&&<div className='empty-state'>No tienes clientas aún.</div>}
        {clientas.map(x=>(<div key={x.id} className='clienta-card' onClick={()=>{setSelId(x.id);setView('dashboard')}}>
          <div className='card-avatar-row'><div className='card-avatar'>{(x.nombre.split(' ').map(p=>p[0]).slice(0,2).join('')).toUpperCase()}</div><div><div className='card-name'>{x.nombre}</div><div className='card-prof'>{x.profesion}{x.especialidad?' · '+x.especialidad:''}</div></div></div>
          <div className='card-tags'><span className='tag tag-green'>En proceso</span><span className='tag tag-purple'>{FL[x.fase_activa]}</span></div>
          <div className='card-country'>{x.pais}</div>
        </div>))}
      </div>
    </div>
  )

  if(loading)return <div className='loading'>Cargando...</div>
  if(!c)return null

  return(<div className='layout'>
    <nav className='sidebar'>
      <div className='brand'>Clínica Escalable™<span>{IS_CLIENT_VIEW?'Tu programa':'Portal de clientas'}</span></div>
      {!IS_CLIENT_VIEW&&<button className='nav-back' onClick={()=>{setView('lista');setC(null);setNav('dashboard')}}>← Todas las clientas</button>}
      <div className='section-label'>Secciones</div>
      {['dashboard','tareas','sesiones','entregables','log'].map(s=>(<button key={s} className={'nav-item'+(nav===s?' active':'')} onClick={()=>setNav(s)}>
        {s==='dashboard'?'◈':s==='tareas'?'✦':s==='sesiones'?'◎':s==='entregables'?'◇':'📋'} {s==='log'?'Coaching Log':s.charAt(0).toUpperCase()+s.slice(1)}
      </button>))}
      <div className='sidebar-bottom'>{IS_CLIENT_VIEW?'Tu progreso se actualiza en tiempo real':saving?'⏳ Guardando...':'✓ Guardado automático'}</div>
    </nav>
    <main className='main'>
      {!IS_CLIENT_VIEW&&editMode&&(<div className='edit-bar'>
        <label>Fase:</label>
        <select value={c.fase_activa} onChange={e=>cambiarFase(e.target.value)} disabled={saving}>{FASES.map(f=><option key={f} value={f}>{FL[f]}</option>)}</select>
        <button className='btn-session' onClick={avanzarSesion} disabled={saving}>✓ Completar sesión próxima</button>
        <div className='flex1'/>
        <button className='btn-green' onClick={()=>setEditMode(false)}>Cerrar edición</button>
      </div>)}
      <div className='topbar'>
        <div className='topbar-left'>
          <div className='avatar'>{ini}</div>
          <div className='client-meta'>
            <div className='client-name'>{c.nombre}</div>
            <div className='client-sub'>{c.profesion}{c.especialidad?' · '+c.especialidad:''}{c.pais?' · '+c.pais:''}</div>
            <div className='badges'><span className='badge badge-green'>En proceso</span><span className='badge badge-purple'>{fl}</span></div>
          </div>
        </div>
        <div className='topbar-right'>
          {!IS_CLIENT_VIEW&&(<>
            <button className='btn-edit' onClick={()=>setEditMode(!editMode)}>{editMode?'Cerrar':'✏️ Editar'}</button>
            <button className={'btn-copy-link'+(copied?' copied':'')} onClick={copyClientLink}>{copied?'✓ Link copiado':'🔗 Copiar link de clienta'}</button>
          </>)}
        </div>
      </div>
      <div className='progress-section'>
        <div className='progress-row'>
          <div className='progress-left'>
            <div className='progress-header'><span className='progress-title'>Avance del programa</span><span className='progress-pct'>{pct}%</span></div>
            <div className='progress-track'><div className='progress-fill' style={{width:pct+'%'}}/></div>
            <div className='phase-pills'>{FASES.map((f,i)=>{const idx=FASES.indexOf(c.fase_activa);const cls=i<idx?'pill-done':i===idx?'pill-active':'pill-locked';return <div key={f} className={'phase-pill '+cls}><span className='pnum'>Fase {i+1}</span>{i>idx?'🔒 ':''}{['Análisis','Extracción','Arquitectura','Activación'][i]}</div>})}</div>
          </div>
          <div className='progress-circle'>
            <CircleProgress pct={progreso}/>
            <div className='circle-label'>Progreso total</div>
          </div>
        </div>
      </div>
      {nav==='dashboard'&&(<>
        <div className='metrics'>
          <div className='metric'><div className='metric-icon'>📅</div><div className='metric-label'>Sesiones</div><div className='metric-value'>{sesComp}<span className='metric-of'>/6</span></div></div>
          <div className='metric'><div className='metric-icon'>✅</div><div className='metric-label'>Tareas fase actual</div><div className='metric-value'>{tf.filter(t=>t.completada).length}<span className='metric-of'>/{tf.length}</span></div></div>
          <div className='metric'><div className='metric-icon'>📄</div><div className='metric-label'>Entregables</div><div className='metric-value'>{entComp}<span className='metric-of'>/{entregables.length}</span></div></div>
        </div>
        <div className='cols'>
          <div className='card'><div className='card-title'>Tareas — {fl.split('— ')[1]}</div><div className='task-list'>{tf.map(t=>(<div key={t.id} className={'task-item'+(IS_CLIENT_VIEW?'':' clickable')} onClick={()=>!IS_CLIENT_VIEW&&toggleTarea(t)}><div className={'task-check '+(t.completada?'check-done':'check-pending')}>{t.completada&&<Check/>}</div><div className='task-body'><div className={'task-text '+(t.completada?'done':'')}>{t.texto}</div>{t.nota&&<div className='task-note'>{t.nota}</div>}</div><span className={'task-badge badge-'+(t.completada?'green':'purple')}>{t.completada?'Lista':'Pendiente'}</span></div>))}</div></div>
          <div className='card'><div className='card-title'>Sesiones</div><div className='session-list'>{sesiones.map(s=>(<div key={s.id} className='session-item'><div className={'session-dot '+(s.estado==='Completada'?'dot-done':s.estado==='Proxima'?'dot-next':'dot-pending')}/><div className='session-info'><div className={'session-title '+(s.estado==='Proxima'?'next':s.estado==='Pendiente'?'faint':'')}>Sesión {s.numero} — {s.titulo}</div><div className={'session-date '+(s.estado==='Proxima'?'next':'faint')}>{s.estado==='Completada'?'Completada':s.estado==='Proxima'?'Próxima — Por agendar':'Pendiente'}</div>{s.nota&&<div className='session-note-text'>{s.nota}</div>}</div></div>))}</div></div>
        </div>
        {!IS_CLIENT_VIEW&&(<div className='card'><div className='card-title'>Notas internas — se guardan automáticamente</div><textarea value={c.notas_internas||''} onChange={e=>handleNotaChange(e.target.value)} placeholder='Notas de sesión, observaciones, próximos pasos...'/></div>)}
      </>)}
      {nav==='tareas'&&(<div className='card full'><div className='card-title'>Tareas — {fl}</div><div className='task-list'>{tf.map(t=>(<div key={t.id} className={'task-item'+(IS_CLIENT_VIEW?'':' clickable')} onClick={()=>!IS_CLIENT_VIEW&&toggleTarea(t)}><div className={'task-check '+(t.completada?'check-done':'check-pending')}>{t.completada&&<Check/>}</div><div className='task-body'><div className={'task-text '+(t.completada?'done':'')}>{t.texto}</div>{t.nota&&<div className='task-note'>{t.nota}</div>}</div><span className={'task-badge badge-'+(t.completada?'green':'purple')}>{t.completada?'Lista':'Pendiente'}</span></div>))}</div><p className='phase-note'>Las fases se desbloquean al avanzar desde el modo Editar.</p></div>)}
      {nav==='sesiones'&&(<div className='card full'><div className='card-title'>Sesiones del programa</div><div className='session-list'>{sesiones.map(s=>(<div key={s.id} className='session-item big'><div className={'session-dot '+(s.estado==='Completada'?'dot-done':s.estado==='Proxima'?'dot-next':'dot-pending')}/><div className='session-info'><div className={'session-title '+(s.estado==='Proxima'?'next':s.estado==='Pendiente'?'faint':'')}>Sesión {s.numero} — {s.titulo}</div><div className={'session-date '+(s.estado==='Proxima'?'next':'faint')}>{s.estado==='Completada'?'Completada':s.estado==='Proxima'?'Próxima — Por agendar':'Pendiente'}</div>{s.nota&&<div className='session-note-text'>{s.nota}</div>}</div></div>))}</div></div>)}
      {nav==='entregables'&&(<div className='card full'><div className='card-title-row'><span className='card-title'>Entregables del programa</span>{!IS_CLIENT_VIEW&&<span className='card-subtitle'>Edita estado y agrega links de Drive</span>}</div><div className='doc-list'>{entregables.map(e=>(<EntregableItem key={e.id} e={e} isAdmin={!IS_CLIENT_VIEW} onEstado={updateEntregableEstado} onUrl={saveEntregableUrl}/>))}</div></div>)}
      {nav==='log'&&(<div className='card full'>
        <div className='card-title-row'><span className='card-title'>Coaching Log</span>{!IS_CLIENT_VIEW&&<button className='btn-new-log' onClick={()=>setShowLogForm(true)}>+ Nueva sesión</button>}</div>
        {showLogForm&&(<div className='log-form'>
          <div className='log-form-grid'>
            <div className='form-group'><label>Sesión #</label><input type='number' value={logForm.sesion_numero} onChange={e=>setLogForm(p=>({...p,sesion_numero:e.target.value}))} placeholder='4'/></div>
            <div className='form-group'><label>Fecha</label><input type='date' value={logForm.fecha} onChange={e=>setLogForm(p=>({...p,fecha:e.target.value}))}/></div>
          </div>
          <div className='form-group'><label>Título de la sesión</label><input value={logForm.titulo} onChange={e=>setLogForm(p=>({...p,titulo:e.target.value}))} placeholder='Diseño de la oferta y precios'/></div>
          <div className='form-group'><label>Link de Fathom (grabación)</label><input value={logForm.link_fathom} onChange={e=>setLogForm(p=>({...p,link_fathom:e.target.value}))} placeholder='https://fathom.video/...'/></div>
          <div className='form-group'><label>Notas de la sesión</label><textarea value={logForm.notas} onChange={e=>setLogForm(p=>({...p,notas:e.target.value}))} placeholder='Qué se trabajó, decisiones clave, acuerdos...'/></div>
          <div className='form-group'><label>Tareas extra (una por línea)</label><textarea value={logForm.tareas_extra} onChange={e=>setLogForm(p=>({...p,tareas_extra:e.target.value}))} placeholder='Revisar precios de competencia
Actualizar avatar con nueva info'/></div>
          <div className='modal-actions'><button className='btn-cancel' onClick={()=>setShowLogForm(false)}>Cancelar</button><button className='btn-green' onClick={guardarLog}>Guardar sesión</button></div>
        </div>)}
        <div className='logs-list'>
          {logs.length===0&&<div className='empty-state'>No hay sesiones registradas aún.</div>}
          {logs.map(l=>(<div key={l.id} className='log-item'>
            <div className='log-header'>
              <div className='log-title'>{l.sesion_numero?'Sesión '+l.sesion_numero+' — ':''}{l.titulo}</div>
              <div className='log-meta'>{l.fecha&&<span>{l.fecha}</span>}{!IS_CLIENT_VIEW&&<button className='btn-del-log' onClick={()=>deleteLog(l.id)}>×</button>}</div>
            </div>
            {l.link_fathom&&(<a href={l.link_fathom} target='_blank' rel='noreferrer' className='log-fathom'>▶ Ver grabación en Fathom</a>)}
            {l.notas&&(<div className='log-notas'>{l.notas}</div>)}
            {l.tareas_extra&&(<div className='log-tareas'><div className='log-tareas-title'>Tareas extra:</div>{l.tareas_extra.split('\n').filter(Boolean).map((t,i)=>(<div key={i} className='log-tarea-item'>◦ {t}</div>))}</div>)}
          </div>))}
        </div>
      </div>)}
    </main>
  </div>)
}

function EntregableItem({e,isAdmin,onEstado,onUrl}){
  const [editing,setEditing]=useState(false)
  const [urlVal,setUrlVal]=useState(e.url||'')
  const bloqueado=e.estado==='Bloqueado'
  return(<div className={'doc-item'+(bloqueado?' locked':'')+' big'}>
    <span className='doc-icon'>{e.icono}</span>
    <div className='doc-body'>
      <span className='doc-name'>{e.nombre}</span>
      {isAdmin&&editing&&(<div className='url-edit'>
        <input className='url-input' value={urlVal} onChange={ev=>setUrlVal(ev.target.value)} placeholder='Pega el link de Google Drive...'/>
        <button className='btn-save-url' onClick={()=>{onUrl(e.id,urlVal);setEditing(false)}}>Guardar</button>
        <button className='btn-cancel-url' onClick={()=>setEditing(false)}>Cancelar</button>
      </div>)}
    </div>
    <div className='doc-actions'>
      {!bloqueado&&e.url&&(<a href={e.url} target='_blank' rel='noreferrer' className='btn-ver'>Ver documento →</a>)}
      {isAdmin&&!bloqueado&&(<>
        <button className='btn-link' onClick={()=>setEditing(!editing)}>{e.url?'Editar link':'+ Link Drive'}</button>
        <select className='estado-select' value={e.estado} onChange={ev=>onEstado(e.id,ev.target.value)}>
          {ESTADOS.map(s=><option key={s} value={s}>{s}</option>)}
        </select>
      </>)}
      {(!isAdmin||bloqueado)&&(<span className={'tag '+(e.estado==='Listo'?'tag-green':e.estado==='En curso'?'tag-purple':'tag-gray')}>{bloqueado?'🔒':e.estado}</span>)}
    </div>
  </div>)
}