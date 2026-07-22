import { useEffect, useMemo, useState } from 'react'
import guide from '../content/guide.md?raw'
import './App.css'

const AUTHOR_URL = 'https://instagram.com/aruzhan_jedai/'
const sectionNames = ['Введение', 'Инновационный двигатель', 'Воображение', 'Внимание', 'Мышление ресурсами', 'Среда', 'Культура эксперимента', '10 упражнений', '7-дневный челлендж']
const sectionIds = ['intro', 'engine', 'imagination', 'attention', 'resources', 'environment', 'culture', 'exercises', 'challenge']

type Progress = { notes: Record<string, string>; done: Record<string, boolean>; days: Record<string, boolean>; lastSection?: string }
const emptyProgress: Progress = { notes: {}, done: {}, days: {} }

function readProgress(): Progress {
  try { return { ...emptyProgress, ...JSON.parse(localStorage.getItem('innovation-engine-progress') || '{}') } } catch { return emptyProgress }
}

function inline(value: string) {
  const chunks = value.split(/(\*\*[^*]+\*\*)/g)
  return chunks.map((chunk, i) => chunk.startsWith('**') ? <strong key={i}>{chunk.slice(2, -2)}</strong> : chunk)
}

function slugFor(text: string) {
  const value = text.replace(/[\*\\.«»]/g, '').toLowerCase()
  if (value.includes('гайд')) return 'intro'
  if (value.includes('введение')) return 'intro'
  if (value.includes('инновационный двигатель')) return 'engine'
  if (value.includes('воображение')) return 'imagination'
  if (value.includes('внимание')) return 'attention'
  if (value.includes('ресурс')) return 'resources'
  if (value.includes('среда')) return 'environment'
  if (value.includes('культура')) return 'culture'
  if (value.includes('10 упражнений')) return 'exercises'
  if (value.includes('финальный челлендж')) return 'challenge'
  return ''
}

function App() {
  const [progress, setProgress] = useState<Progress>(emptyProgress)
  const [menuOpen, setMenuOpen] = useState(false)
  const [resetOpen, setResetOpen] = useState(false)
  const [active, setActive] = useState('intro')

  useEffect(() => setProgress(readProgress()), [])
  useEffect(() => { localStorage.setItem('innovation-engine-progress', JSON.stringify(progress)) }, [progress])
  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY + 180
      const found = [...sectionIds].reverse().find((id) => document.getElementById(id)?.offsetTop! <= y) || 'intro'
      setActive(found)
      setProgress((p) => p.lastSection === found ? p : { ...p, lastSection: found })
    }
    onScroll(); window.addEventListener('scroll', onScroll, { passive: true }); return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const completed = useMemo(() => Object.values(progress.done).filter(Boolean).length + Object.values(progress.days).filter(Boolean).length, [progress])
  const updateNote = (key: string, value: string) => setProgress((p) => ({ ...p, notes: { ...p.notes, [key]: value } }))
  const toggle = (kind: 'done' | 'days', key: string) => setProgress((p) => ({ ...p, [kind]: { ...p[kind], [key]: !p[kind][key] } }))
  const go = (id: string) => { document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' }); setMenuOpen(false) }

  const renderGuide = () => {
    const lines = guide.replace(/\r/g, '').split('\n')
    let exercise = 0
    return lines.map((raw, index) => {
      if (!raw || raw.startsWith('[image1]:')) return null
      if (raw === '---') return <div className="rule" key={index} aria-hidden="true" />
      if (raw.startsWith('# ')) {
        const text = raw.slice(2).trim(); const id = slugFor(text)
        return <section id={id || undefined} className={`guide-section ${id ? `section-${id}` : ''}`} key={index}><h2>{inline(text)}</h2>{id === 'engine' && <Engine />}</section>
      }
      if (raw.startsWith('## ')) {
        const text = raw.slice(3).trim()
        const match = text.match(/\*\*(\d+)\\?\.\s*/)
        if (match) { exercise = Number(match[1]); return <ExerciseTitle key={index} number={exercise} title={text} progress={progress} onToggle={toggle} onNote={updateNote} /> }
        return <h3 key={index}>{inline(text)}</h3>
      }
      if (raw.startsWith('### ')) return <h4 key={index}>{inline(raw.slice(4).trim())}</h4>
      if (raw.includes('![][image1]')) return <figure className="engine-image" key={index}><img src="/assets/innovation-engine.png" alt="Схема Innovation Engine — инновационного двигателя" /></figure>
      const day = raw.match(/\*\*День (\d+):\*\*\s*(.*)/)
      if (day) {
        const key = `day-${day[1]}`
        return <label className={`day ${progress.days[key] ? 'is-done' : ''}`} key={index}><input type="checkbox" checked={!!progress.days[key]} onChange={() => toggle('days', key)} /><span><b>День {day[1]}:</b> {day[2]}</span><textarea aria-label={`Заметка, день ${day[1]}`} placeholder="Заметка" value={progress.notes[key] || ''} onChange={(e) => updateNote(key, e.target.value)} /></label>
      }
      return <p key={index} className={raw.trim().startsWith('—') || raw.trim().startsWith('→') ? 'list-line' : ''}>{inline(raw.trim())}</p>
    })
  }

  return <>
    <a className="skip" href="#intro">Перейти к содержанию</a>
    <header className="topbar"><button className="menu-button" onClick={() => setMenuOpen(!menuOpen)} aria-expanded={menuOpen} aria-controls="contents">Содержание <span>+</span></button><div className="reading"><i style={{ width: `${Math.min(100, Math.round((window.scrollY / Math.max(1, document.body.scrollHeight - innerHeight)) * 100))}%` }} /></div><button className="reset" onClick={() => setResetOpen(true)}>Сбросить</button></header>
    <nav id="contents" className={menuOpen ? 'contents is-open' : 'contents'} aria-label="Оглавление">{sectionNames.map((name, i) => <button className={active === sectionIds[i] ? 'active' : ''} onClick={() => go(sectionIds[i])} key={name}><small>0{i + 1}</small>{name}</button>)}</nav>
    <main>
      <section className="cover" aria-labelledby="guide-title"><div className="cover-mark">✳</div><p className="eyebrow">ПРАКТИЧЕСКИЙ ГАЙД</p><h1 id="guide-title">«ИННОВАЦИОННЫЙ<br />ДВИГАТЕЛЬ»</h1><p className="cover-subtitle">Практическая система развития креативного мышления</p><button className="start" onClick={() => go('intro')}>Начать <span>↓</span></button><div className="cover-shape one" /><div className="cover-shape two" /></section>
      <aside className="resume" hidden={!progress.lastSection || progress.lastSection === 'intro'}><span>Мой прогресс · {completed} выполнено</span><button onClick={() => go(progress.lastSection!)}>Продолжить</button></aside>
      <article className="guide">{renderGuide()}</article>
      <footer className="author"><p>Автор</p><a href={AUTHOR_URL} target="_blank" rel="noreferrer" onClick={() => {}}><span>Аружан<br />Каримова</span><b>Instagram автора ↗</b></a></footer>
    </main>
    {resetOpen && <div className="modal" role="dialog" aria-modal="true" aria-labelledby="reset-title"><div><h2 id="reset-title">Сбросить прогресс?</h2><p>Заполненные упражнения и отметки будут удалены с этого устройства.</p><div className="modal-actions"><button onClick={() => setResetOpen(false)}>Назад</button><button className="danger" onClick={() => { setProgress(emptyProgress); localStorage.removeItem('innovation-engine-progress'); setResetOpen(false) }}>Сбросить</button></div></div></div>}
  </>
}

function Engine() { return <aside className="engine-card"><p>Innovation Engine</p><div className="engine-orbit"><span>воображение</span><b>идеи</b><span>знания</span><span>отношение</span><span>среда</span><span>ресурсы</span><span>культура</span></div></aside> }
function ExerciseTitle({ number, title, progress, onToggle, onNote }: { number: number; title: string; progress: Progress; onToggle: (k: 'done', key: string) => void; onNote: (key: string, value: string) => void }) { const key = `exercise-${number}`; return <div className={`exercise-title ${progress.done[key] ? 'is-done' : ''}`}><h3>{inline(title)}</h3><div className="exercise-tools"><textarea aria-label={`Ответ для упражнения ${number}`} placeholder="Начать упражнение" value={progress.notes[key] || ''} onChange={(e) => onNote(key, e.target.value)} /><label><input type="checkbox" checked={!!progress.done[key]} onChange={() => onToggle('done', key)} /> Выполнено</label></div></div> }
export default App
