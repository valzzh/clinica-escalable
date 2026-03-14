import React, { useState, useEffect } from 'react'
import { supabase } from './supabase'
import './App.css'

const FASES = ['Analisis','Extraccion','Arquitectura','Activacion']
const FL = {Analisis:'Fase 1 — Análisis',Extraccion:'Fase 2 — Extracción',Arquitectura:'Fase 3 — Arquitectura',Activacion:'Fase 4 — Activación'}
const PCT = {Analisis:25,Extraccion:37,Arquitectura:50,Activacion:75}

const TD = {
  Analisis:[
    {t:'Mapear tipo de pacientes y problemas frecuentes',n:'Entrevista de diagnóstico inicial'},
    {t:'Documentar número de consultas y duración promedio'},
    {t:'Identificar el 70% repetitivo del proceso clínico'},
    {t:'Completar diagnóstico de escalabilidad'},
    {t:'Detectar puntos de agotamiento en el modelo'},
    {t:'Definir el resultado ideal del programa'},
  ],
  Extraccion:[
    {t:'Documentar proceso de evaluación inicial'},
    {t:'Mapear etapas de intervención clínica'},
    {t:'Identificar puntos de seguimiento repetitivos'},
    {t:'Extraer la metodología implícita en 5 pasos'},
    {t:'Nombrar cada etapa del proceso clínico'},
    {t:'Validar el método con 2-3 casos recientes'},
  ],
  Arquitectura:[
    {t:'Definir duración y número de sesiones del programa'},
    {t:'Crear oferta completa con stack de valor'},
    {t:'Diseñar victoria temprana semanas 1-2',n:'Primer resultado visible para la paciente'},
    {t:'Definir precio y modelo de acceso'},
    {t:'Redactar garantía del programa'},
    {t:'Completar kit de plantillas clínicas'},
    {t:'Definir métricas de progreso de la paciente'},
    {t:'Diseñar estructura de las 6 sesiones 1:1'},
  ],
  Activacion:[
    {t:'Seleccionar 5-10 pacientes candidatos del primer grupo',n:'Pacientes actuales comprometidos'},
    {t:'Redactar script de invitación personalizado'},
    {t:'Confirmar sistema de cobro Stripe o Clip'},
    {t:'Configurar Calendly para sesiones grupales'},
    {t:'Invitar a los primeros 3-5 pacientes'},
    {t:'Iniciar primer grupo y documentar resultados'},
    {t:'Recopilar primer testimonio al finalizar semana 2'},
  ]
}

const SD = [
  {numero:1,titulo:'Análisis del modelo clínico',estado:'Completada',nota:'Diagnóstico completo. Agenda saturada, 70% repetitivo identificado.'},
  {numero:2,titulo:'Extracción de metodología',estado:'Completada',nota:'Protocolo documentado en 5 pasos.'},
  {numero:3,titulo:'Diseño de la oferta',estado:'Completada',nota:'Oferta completa: precio, sesiones, garantía definidos.'},
  {numero:4,titulo:'Activación del primer grupo',estado:'Proxima',nota:'Selección de pacientes ideales e invitación.'},
  {numero:5,titulo:'Seguimiento del programa',estado:'Pendiente',nota:''},
  {numero:6,titulo:'Cierre y resultados',estado:'Pendiente',nota:''},
]

const ED = {
  Analisis:[{nombre:'Diagnóstico de escalabilidad',icono:'📄',estado:'En curso'},{nombre:'Mapa del modelo clínico',icono:'🗺️',estado:'Pendiente'}],
  Extraccion:[{nombre:'Diagnóstico de escalabilidad',icono:'📄',estado:'Listo'},{nombre:'Mapa de metodología',icono:'📋',estado:'En curso'}],
  Arquitectura:[
    {nombre:'Oferta del programa clínico',icono:'📄',estado:'Listo'},
    {nombre:'Avatar ideal documentado',icono:'👤',estado:'Listo'},
    {nombre:'Kit de plantillas clínicas',icono:'📋',estado:'En curso'},
    {nombre:'Scripts de invitación',icono:'💬',estado:'Bloqueado'},
    {nombre:'Plan de activación del primer grupo',icono:'🚀',estado:'Bloqueado'},
  ],
  Activacion:[
    {nombre:'Oferta del programa clínico',icono:'📄',estado:'Listo'},
    {nombre:'Avatar ideal documentado',icono:'👤',estado:'Listo'},
    {nombre:'Kit de plantillas clínicas',icono:'📋',estado:'Listo'},
    {nombre:'Scripts de invitación',icono:'💬',estado:'En curso'},
    {nombre:'Plan de activación del primer grupo',icono:'🚀',estado:'Pendiente'},
  ]
}

const Check = () => <svg width='10' height='8' viewBox='0 0 10 8' fill='none'><path d='M1 4L3.5 6.5L9 1' stroke='white' strokeWidth='1.5' strokeLinecap='round'/></svg>

// Detectar si es vista de clienta (URL tiene ?clienta=ID)
const params = new URLSearchParams(window.location.search)
const CLIENTA_ID = params.get('clienta')
const IS_CLIENT_VIEW = !!CLIENTA_ID

export default function App() {
  const [view,setView] = useState(IS_CLIENT_VIEW ? 'dashboard' : 'lista')
  const [clientas,setClientas] = useState([])
  const [selId,setSelId] = useState(IS_CLIENT_VIEW ? CLIENTA_ID : null)
  const [c,setC] = useState(null)
  const [tareas,setTareas] = useState([])
  const [sesiones,setSesiones] = useState([])
  const [entregables,setEntregables] = useState([])
  const [loading,setLoading] = useState(true)
  const [saving,setSaving] = useState(false)
  const [editMode,setEditMode] = useState(false)
  const [nav,setNav] = useState('dashboard')
  const [showForm,setShowForm] = useState(false)
  const [form,setForm] = useState({nombre:'',profesion:'',especialidad:'',pais:'México',fase_activa:'Analisis'})

  useEffect(()=>{ if(!IS_CLIENT_VIEW) loadClientas() },[]) // eslint-disable-line
  useEffect(()=>{ if(selId) loadData(selId) },[selId]) // eslint-disable-line

  async function loadClientas(){
    setLoading(true)
    const {data}=await supabase.from('clientas').select('*').order('created_at',{ascending:false})
    setClientas(data||[])
    setLoading(false)
  }

  async function loadData(id){
    setLoading(true)
    const [rc,rt,rs,re]=await Promise.all([
      supabase.from('clientas').select('*').eq('id',id).single(),
      supabase.from('tareas').select('*').eq('clienta_id',id).order('orden'),
      supabase.from('sesiones').select('*').eq('clienta_id',id).order('numero'),
      supabase.from('entregables').select('*').eq('clienta_id',id).order('orden'),
    ])
    setC(rc.data);setTareas(rt.data||[]);setSesiones(rs.data||[]);setEntregables(re.data||[])
    setLoading(false)
  }

  async function crearClienta(){
    if(!form.nombre.trim())return
    setSaving(true)
    const {data:n}=await supabase.from('clientas').insert([{...form,sesiones_completadas:0}]).select().single()
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
    if(IS_CLIENT_VIEW) return
    const {data}=await supabase.from('tareas').update({completada:!t.completada}).eq('id',t.id).select().single()
    if(data)setTareas(prev=>prev.map(x=>x.id===t.id?data:x))
  }

  async function saveNota(nota){
    if(IS_CLIENT_VIEW) return
    await supabase.from('clientas').update({notas_internas:nota}).eq('id',c.id)
    setC(prev=>({...prev,notas_internas:nota}))
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
    const proxima = sesiones.find(s=>s.estado==='Proxima')
    if(!proxima) return
    await supabase.from('sesiones').update({estado:'Completada'}).eq('id',proxima.id)
    const sig = sesiones.find(s=>s.numero===proxima.numero+1)
    if(sig) await supabase.from('sesiones').update({estado:'Proxima'}).eq('id',sig.id)
    await loadData(c.id)
  }

  const tf=tareas.filter(t=>t.fase===c?.fase_activa)
  const pct=c?PCT[c.fase_activa]||0:0
  const fl=c?FL[c.fase_activa]||'':''
  const ini=c?(c.nombre.split(' ').map(p=>p[0]).slice(0,2).join('')).toUpperCase():''

  if(loading&&view==='lista')return <div className='loading'>Cargando...</div>

  // ── LISTA DE CLIENTAS (solo admin) ──
  if(view==='lista')return(
    <div className='lista-view'>
      <div className='lista-header'>
        <div className='brand-big'>Clínica Escalable™</div>
        <div className='brand-sub'>Portal de gestión de clientas</div>
        <button className='btn-add' onClick={()=>setShowForm(true)}>+ Nueva clienta</button>
      </div>
      {showForm&&(
        <div className='modal-overlay'>
          <div className='modal'>
            <div className='modal-title'>Nueva clienta</div>
            {['nombre','profesion','especialidad','pais'].map(k=>(
              <div key={k} className='form-group'>
                <label>{k.charAt(0).toUpperCase()+k.slice(1)}</label>
                <input value={form[k]} onChange={e=>setForm(p=>({...p,[k]:e.target.value}))} />
              </div>
            ))}
            <div className='form-group'><label>Fase inicial</label>
              <select value={form.fase_activa} onChange={e=>setForm(p=>({...p,fase_activa:e.target.value}))}>
                {FASES.map(f=><option key={f} value={f}>{FL[f]}</option>)}
              </select>
            </div>
            <div className='modal-actions'>
              <button className='btn-cancel' onClick={()=>setShowForm(false)}>Cancelar</button>
              <button className='btn-green' onClick={crearClienta} disabled={saving}>{saving?'Creando...':'Crear clienta'}</button>
            </div>
          </div>
        </div>
      )}
      <div className='clientas-grid'>
        {clientas.length===0&&<div className='empty-state'>No tienes clientas aún. Crea la primera.</div>}
        {clientas.map(x=>(
          <div key={x.id} className='clienta-card' onClick={()=>{setSelId(x.id);setView('dashboard')}}>
            <div className='card-avatar-row'>
              <div className='card-avatar'>{(x.nombre.split(' ').map(p=>p[0]).slice(0,2).join('')).toUpperCase()}</div>
              <div><div className='card-name'>{x.nombre}</div><div className='card-prof'>{x.profesion}</div></div>
            </div>
            <div className='card-tags'>
              <span className='tag tag-green'>En proceso</span>
              <span className='tag tag-purple'>{FL[x.fase_activa]}</span>
            </div>
            <div className='card-link'>Ver enlace de clienta →</div>
          </div>
        ))}
      </div>
    </div>
  )

  if(loading)return <div className='loading'>Cargando...</div>
  if(!c)return null

  // ── DASHBOARD (admin o clienta) ──
  return(
    <div className='layout'>
      <nav className='sidebar'>
        <div className='brand'>Clínica Escalable™<span>{IS_CLIENT_VIEW?'Tu programa':'Portal de clientas'}</span></div>
        {!IS_CLIENT_VIEW&&<button className='nav-back' onClick={()=>{setView('lista');setC(null)}}>← Todas las clientas</button>}
        <div className='section-label'>Secciones</div>
        {['dashboard','tareas','sesiones','entregables'].map(s=>(
          <button key={s} className={'nav-item'+(nav===s?' active':'')} onClick={()=>setNav(s)}>
            {s==='dashboard'?'◈':s==='tareas'?'✦':s==='sesiones'?'◎':'◇'} {s.charAt(0).toUpperCase()+s.slice(1)}
          </button>
        ))}
        {!IS_CLIENT_VIEW&&(
          <div className='sidebar-bottom'>{saving?'⏳ Guardando...':'✓ Guardado automático'}</div>
        )}
        {IS_CLIENT_VIEW&&(
          <div className='sidebar-bottom'>Tu progreso se actualiza en tiempo real</div>
        )}
      </nav>
      <main className='main'>
        {!IS_CLIENT_VIEW&&editMode&&(
          <div className='edit-bar'>
            <label>Fase activa:</label>
            <select value={c.fase_activa} onChange={e=>cambiarFase(e.target.value)} disabled={saving}>
              {FASES.map(f=><option key={f} value={f}>{FL[f]}</option>)}
            </select>
            <button className='btn-session' onClick={avanzarSesion} disabled={saving}>
              ✓ Completar sesión próxima
            </button>
            <div className='flex1'/>
            <button className='btn-green' onClick={()=>setEditMode(false)}>Cerrar edición</button>
          </div>
        )}
        <div className='topbar'>
          <div className='topbar-left'>
            <div className='avatar'>{ini}</div>
            <div className='client-meta'>
              <div className='client-name'>{c.nombre}</div>
              <div className='client-sub'>{c.profesion}{c.especialidad?' · '+c.especialidad:''}{c.pais?' · '+c.pais:''}</div>
              <div className='badges'>
                <span className='badge badge-green'>En proceso</span>
                <span className='badge badge-purple'>{fl}</span>
              </div>
            </div>
          </div>
          {!IS_CLIENT_VIEW&&(
            <div className='topbar-right'>
              <button className='btn-edit' onClick={()=>setEditMode(!editMode)}>{editMode?'Cerrar':'✏️ Editar'}</button>
              <div className='link-box'>
                <span className='link-label'>Link de clienta:</span>
                <code className='link-code'>?clienta={c.id}</code>
                <button className='btn-copy' onClick={()=>navigator.clipboard.writeText(window.location.origin+'/?clienta='+c.id)}>Copiar</button>
              </div>
            </div>
          )}
        </div>
        <div className='progress-section'>
          <div className='progress-header'><span className='progress-title'>Avance del programa</span><span className='progress-pct'>{pct}%</span></div>
          <div className='progress-track'><div className='progress-fill' style={{width:pct+'%'}}/></div>
          <div className='phase-pills'>
            {FASES.map((f,i)=>{
              const idx=FASES.indexOf(c.fase_activa)
              const cls=i<idx?'pill-done':i===idx?'pill-active':'pill-locked'
              return <div key={f} className={'phase-pill '+cls}><span className='pnum'>Fase {i+1}</span>{i>idx?'🔒 ':''}{['Análisis','Extracción','Arquitectura','Activación'][i]}</div>
            })}
          </div>
        </div>
        {nav==='dashboard'&&(<>
          <div className='metrics'>
            <div className='metric'><div className='metric-label'>Sesiones completadas</div><div className='metric-value'>{sesiones.filter(s=>s.estado==='Completada').length}</div><div className='metric-sub'>de 6 planeadas</div></div>
            <div className='metric'><div className='metric-label'>Tareas completadas</div><div className='metric-value'>{tf.filter(t=>t.completada).length}</div><div className='metric-sub'>de {tf.length} en fase activa</div></div>
            <div className='metric'><div className='metric-label'>Entregables listos</div><div className='metric-value'>{entregables.filter(e=>e.estado==='Listo').length}</div><div className='metric-sub'>de {entregables.length} totales</div></div>
          </div>
          <div className='cols'>
            <div className='card'>
              <div className='card-title'>Tareas — {fl.split('— ')[1]}</div>
              <div className='task-list'>
                {tf.map(t=>(
                  <div key={t.id} className={'task-item'+(IS_CLIENT_VIEW?'':' clickable')} onClick={()=>!IS_CLIENT_VIEW&&toggleTarea(t)}>
                    <div className={'task-check '+(t.completada?'check-done':'check-pending')}>{t.completada&&<Check/>}</div>
                    <div className='task-body'><div className={'task-text '+(t.completada?'done':'')}>{t.texto}</div>{t.nota&&<div className='task-note'>{t.nota}</div>}</div>
                    <span className={'task-badge badge-'+(t.completada?'green':'purple')}>{t.completada?'Lista':'Pendiente'}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className='card'>
              <div className='card-title'>Sesiones del programa</div>
              <div className='session-list'>
                {sesiones.map(s=>(
                  <div key={s.id} className='session-item'>
                    <div className={'session-dot '+(s.estado==='Completada'?'dot-done':s.estado==='Proxima'?'dot-next':'dot-pending')}/>
                    <div className='session-info'>
                      <div className={'session-title '+(s.estado==='Proxima'?'next':s.estado==='Pendiente'?'faint':'')}>Sesión {s.numero} — {s.titulo}</div>
                      <div className={'session-date '+(s.estado==='Proxima'?'next':'faint')}>{s.estado==='Completada'?'Completada':s.estado==='Proxima'?'Por agendar · Próxima':'Pendiente'}</div>
                      {s.nota&&<div className='session-note-text'>{s.nota}</div>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className='cols'>
            <div className='card'>
              <div className='card-title'>Entregables</div>
              <div className='doc-list'>
                {entregables.map(e=>(
                  <div key={e.id} className={'doc-item '+(e.estado==='Bloqueado'?'locked':'')}>
                    <span className='doc-icon'>{e.icono}</span>
                    <span className='doc-name'>{e.nombre}</span>
                    <span className={'tag '+(e.estado==='Listo'?'tag-green':e.estado==='En curso'?'tag-purple':'tag-gray')}>{e.estado==='Bloqueado'?'🔒 Bloqueado':e.estado}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className='card'>
              {!IS_CLIENT_VIEW&&<><div className='card-title'>Notas internas (solo tú las ves)</div>
              <textarea defaultValue={c.notas_internas||''} placeholder='Notas de sesión...' onBlur={e=>saveNota(e.target.value)}/></>}
              {IS_CLIENT_VIEW&&<><div className='card-title'>Tu avance</div>
              <div className='client-message'>
                <p>Estás en <strong>{fl}</strong>.</p>
                <p>Has completado {tf.filter(t=>t.completada).length} de {tf.length} tareas de esta fase.</p>
                <p>Tu próxima sesión está por agendar — Valeria te contactará pronto.</p>
              </div></>}
            </div>
          </div>
        </>)}
        {nav==='tareas'&&(
          <div className='card full'>
            <div className='card-title'>Tareas — {fl}</div>
            <div className='task-list'>
              {tf.map(t=>(
                <div key={t.id} className={'task-item'+(IS_CLIENT_VIEW?'':' clickable')} onClick={()=>!IS_CLIENT_VIEW&&toggleTarea(t)}>
                  <div className={'task-check '+(t.completada?'check-done':'check-pending')}>{t.completada&&<Check/>}</div>
                  <div className='task-body'><div className={'task-text '+(t.completada?'done':'')}>{t.texto}</div>{t.nota&&<div className='task-note'>{t.nota}</div>}</div>
                  <span className={'task-badge badge-'+(t.completada?'green':'purple')}>{t.completada?'Lista':'Pendiente'}</span>
                </div>
              ))}
            </div>
          </div>
        )}
        {nav==='sesiones'&&(
          <div className='card full'>
            <div className='card-title'>Sesiones del programa</div>
            <div className='session-list'>
              {sesiones.map(s=>(
                <div key={s.id} className='session-item big'>
                  <div className={'session-dot '+(s.estado==='Completada'?'dot-done':s.estado==='Proxima'?'dot-next':'dot-pending')}/>
                  <div className='session-info'>
                    <div className={'session-title '+(s.estado==='Proxima'?'next':s.estado==='Pendiente'?'faint':'')}>Sesión {s.numero} — {s.titulo}</div>
                    <div className={'session-date '+(s.estado==='Proxima'?'next':'faint')}>{s.estado==='Completada'?'Completada':s.estado==='Proxima'?'Por agendar · Próxima':'Pendiente'}</div>
                    {s.nota&&<div className='session-note-text'>{s.nota}</div>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        {nav==='entregables'&&(
          <div className='card full'>
            <div className='card-title'>Entregables del programa</div>
            <div className='doc-list'>
              {entregables.map(e=>(
                <div key={e.id} className={'doc-item big '+(e.estado==='Bloqueado'?'locked':'')}>
                  <span className='doc-icon'>{e.icono}</span>
                  <span className='doc-name'>{e.nombre}</span>
                  <span className={'tag '+(e.estado==='Listo'?'tag-green':e.estado==='En curso'?'tag-purple':'tag-gray')}>{e.estado==='Bloqueado'?'🔒 Bloqueado':e.estado}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  )
}