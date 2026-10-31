import type { CSSProperties, ReactNode } from 'react'

export type Verdict = 'trust' | 'caution' | 'risk' | 'hold'

const verdictLabel: Record<Verdict, string> = {
  trust: '신뢰',
  caution: '주의',
  risk: '위험',
  hold: '보류',
}

export function Button({
  children,
  variant = 'primary',
  size = 'md',
  type = 'button',
  disabled = false,
  onClick,
}: {
  children: ReactNode
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  type?: 'button' | 'submit' | 'reset'
  disabled?: boolean
  onClick?: () => void
}) {
  return (
    <button className={`button button-${variant} button-${size}`} type={type} disabled={disabled} onClick={onClick}>
      {children}
    </button>
  )
}

export function Chip({ children, tone = 'neutral' }: { children: ReactNode; tone?: 'neutral' | 'brand' | Verdict }) {
  return <span className={`chip chip-${tone}`}>{children}</span>
}

export function VerdictBadge({ verdict, compact = false }: { verdict: Verdict; compact?: boolean }) {
  return <span className={`verdict-badge verdict-${verdict} ${compact ? 'is-compact' : ''}`}>{verdictLabel[verdict]}</span>
}

export function ScoreRing({ score, label = '신뢰도' }: { score: number; label?: string }) {
  const safeScore = Math.min(100, Math.max(0, score))
  return (
    <div className="score-ring" style={{ '--score': `${safeScore * 3.6}deg` } as CSSProperties}>
      <div className="score-ring-inner">
        <strong>{safeScore}</strong>
        <span>{label}</span>
      </div>
    </div>
  )
}

export function ImvainAxis({ values = [72, 64, 38, 55, 78] }: { values?: number[] }) {
  const labels = ['정보', '동기', '가치', '행동', '감정']
  return (
    <div className="imvain-axis">
      {labels.map((label, index) => (
        <div className="axis-item" key={label}>
          <div className="axis-track"><span style={{ height: `${values[index] ?? 0}%` }} /></div>
          <span>{label}</span>
          <strong>{values[index] ?? 0}</strong>
        </div>
      ))}
    </div>
  )
}

export function Tag({ children, color = 'default' }: { children: ReactNode; color?: 'default' | 'gold' | 'iris' }) {
  return <span className={`tag tag-${color}`}>#{children}</span>
}

export function MetricBar({ label, value, max = 100, tone = 'brand' }: { label: string; value: number; max?: number; tone?: 'brand' | 'iris' | Verdict }) {
  const width = Math.min(100, Math.max(0, (value / max) * 100))
  return (
    <div className="metric-bar">
      <div className="metric-bar-label"><span>{label}</span><strong>{value}</strong></div>
      <div className="metric-track"><span className={`fill-${tone}`} style={{ width: `${width}%` }} /></div>
    </div>
  )
}

export function CheckRow({ label, checked, detail }: { label: string; checked: boolean; detail?: string }) {
  return <div className="check-row"><span className={`check-icon ${checked ? 'checked' : ''}`}>{checked ? '✓' : '—'}</span><span>{label}</span>{detail && <small>{detail}</small>}</div>
}

export function DistributionBar({ label, value, color = 'brand' }: { label: string; value: number; color?: 'brand' | 'gold' | 'iris' }) {
  return <div className="distribution-bar"><span>{label}</span><div className="distribution-track"><i className={`distribution-${color}`} style={{ width: `${Math.min(100, value)}%` }} /></div><strong>{value}%</strong></div>
}

export function ProbabilityMeter({ verdict, probability }: { verdict: Verdict; probability: number }) {
  return <div className="probability-meter"><div className="probability-head"><VerdictBadge verdict={verdict} /><strong>{probability}%</strong></div><div className="probability-track"><span className={`fill-${verdict}`} style={{ width: `${probability}%` }} /></div></div>
}

export function EvidenceRow({ source, title, score }: { source: string; title: string; score: number }) {
  return <div className="evidence-row"><div className="source-mark">{source.slice(0, 1)}</div><div><strong>{title}</strong><small>{source}</small></div><Chip tone={score > 70 ? 'trust' : 'caution'}>{score}% 일치</Chip></div>
}

export function ClaimCard({ claim, verdict = 'caution', summary }: { claim: string; verdict?: Verdict; summary: string }) {
  return <article className="claim-card"><div className="card-eyebrow">핵심 주장 <VerdictBadge verdict={verdict} /></div><h3>{claim}</h3><p>{summary}</p></article>
}

export function SourceTable({ rows }: { rows: Array<{ source: string; type: string; date: string; reliability: number }> }) {
  return <div className="source-table"><div className="table-row table-head"><span>출처</span><span>유형</span><span>발행일</span><span>신뢰도</span></div>{rows.map((row) => <div className="table-row" key={`${row.source}-${row.date}`}><strong>{row.source}</strong><span>{row.type}</span><span>{row.date}</span><Chip tone={row.reliability > 70 ? 'trust' : 'caution'}>{row.reliability}%</Chip></div>)}</div>
}

export function Header({ onAnalyze, onNavigate, activePath = '/' }: { onAnalyze?: () => void; onNavigate?: (path: string) => void; activePath?: string }) {
  const links = [
    { label: '판독하기', path: '/' },
    { label: '서비스 소개', path: '/about' },
  ]

  return (
    <header className="app-header">
      <a className="brand-lockup" href="/" onClick={(event) => { if (onNavigate) { event.preventDefault(); onNavigate('/') } }}>
        <span className="brand-mark">A</span>
        <div><strong>아르고스</strong><small>가짜뉴스 판독기</small></div>
      </a>
      <nav>
        {links.map((link) => <a className={activePath === link.path ? 'active' : ''} href={link.path} key={link.path} onClick={(event) => { if (onNavigate) { event.preventDefault(); onNavigate(link.path) } }}>{link.label}</a>)}
      </nav>
      <Button size="sm" variant="secondary" onClick={onAnalyze}>새 판독</Button>
    </header>
  )
}

export function Tabs({ items, active, onChange }: { items: string[]; active: string; onChange: (value: string) => void }) {
  return <div className="tabs" role="tablist">{items.map((item) => <button className={active === item ? 'active' : ''} key={item} onClick={() => onChange(item)} role="tab" aria-selected={active === item}>{item}</button>)}</div>
}

export function Footer() {
  return <footer className="app-footer"><span>아르고스 · 정보의 맥락을 읽습니다.</span><span className="mono">v0.1.0</span></footer>
}

export function TextField({ label, placeholder, value, onChange }: { label: string; placeholder?: string; value: string; onChange: (value: string) => void }) {
  return <label className="field"><span>{label}</span><input value={value} placeholder={placeholder} onChange={(event) => onChange(event.target.value)} /></label>
}

export function Textarea({ label, placeholder, value, onChange }: { label: string; placeholder?: string; value: string; onChange: (value: string) => void }) {
  return <label className="field"><span>{label}</span><textarea value={value} placeholder={placeholder} onChange={(event) => onChange(event.target.value)} /></label>
}

export function Dropzone({ children = '기사 본문이나 캡처 이미지를 올려주세요.' }: { children?: ReactNode }) {
  return <div className="dropzone"><span className="dropzone-icon">↑</span><strong>{children}</strong><small>파일을 끌어다 놓거나 클릭해서 선택</small></div>
}

export function Thumbnail({ src, alt }: { src?: string; alt: string }) {
  return <div className="thumbnail">{src ? <img src={src} alt={alt} /> : <span>IMG</span>}</div>
}

export function LoadingSteps({ current = 1 }: { current?: number }) {
  return <div className="loading-steps">{['본문 구조 분석', '출처 교차 검증', '판정 근거 정리'].map((step, index) => <div className={`loading-step ${index < current ? 'done' : ''}`} key={step}><span>{index < current ? '✓' : index + 1}</span>{step}</div>)}</div>
}

export function Callout({ title, children, tone = 'brand' }: { title: string; children: ReactNode; tone?: 'brand' | 'caution' | 'risk' }) {
  return <aside className={`callout callout-${tone}`}><strong>{title}</strong><p>{children}</p></aside>
}

export function Card({ title, children, className = '' }: { title?: string; children: ReactNode; className?: string }) {
  return <section className={`card ${className}`}>{title && <div className="card-title"><h3>{title}</h3></div>}{children}</section>
}

export function QuoteBlock({ children, source }: { children: ReactNode; source?: string }) {
  return <blockquote className="quote-block"><p>“{children}”</p>{source && <cite>— {source}</cite>}</blockquote>
}

export function StepCard({ step, title, children }: { step: number; title: string; children: ReactNode }) {
  return <div className="step-card"><span className="step-number">{String(step).padStart(2, '0')}</span><div><h3>{title}</h3><p>{children}</p></div></div>
}

export function Banner({ children, tone = 'brand' }: { children: ReactNode; tone?: 'brand' | Verdict }) {
  return <div className={`banner banner-${tone}`}><span>✦</span>{children}</div>
}

export function FactRow({ label, value }: { label: string; value: string }) {
  return <div className="fact-row"><span>{label}</span><strong>{value}</strong></div>
}

export function StanceCard({ title, body, tone }: { title: string; body: string; tone: Verdict }) {
  return <div className={`stance-card stance-${tone}`}><VerdictBadge verdict={tone} /><h3>{title}</h3><p>{body}</p></div>
}

export function Spectrum({ position = 58 }: { position?: number }) {
  return <div className="spectrum"><div className="spectrum-labels"><span>사실</span><span>의견</span><span>추정</span></div><div className="spectrum-track"><i style={{ left: `${position}%` }} /></div></div>
}
