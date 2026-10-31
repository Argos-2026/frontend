import { useEffect, useState } from 'react'
import { IMVAIN_KEYS, getAnalysisResult, getApiErrorMessage } from '../api/argos'
import type { AnalysisResult, ArticleSource, Claim, ClaimVerdict, Criterion, CriterionStatus, Evidence, ImvainKey } from '../api/argos'
import { Banner, Button, Callout, Card, Chip, FactRow, Tabs, VerdictBadge, type Verdict } from '../components'

const verdictConfig: Record<ClaimVerdict, { label: string; tone: Verdict }> = {
  SUPPORT: { label: '뒷받침', tone: 'trust' },
  REFUTE: { label: '반박', tone: 'risk' },
  CONFLICT: { label: '상충', tone: 'caution' },
  INSUFFICIENT: { label: '근거 부족', tone: 'hold' },
}

const criterionLabels: Record<ImvainKey, string> = {
  independent: '독립성',
  multiple: '복수성',
  verify: '검증 가능성',
  authoritative: '권위성',
  informed: '정보성',
  named: '기명성',
}

const sourceTypeLabels: Record<ArticleSource['type'], string> = {
  PERSON: '인물',
  ORGANIZATION: '기관',
  DOCUMENT: '문서',
  OTHER: '기타',
}

const stanceLabels = {
  SUPPORTS: '뒷받침',
  REFUTES: '반박',
  CONTEXT: '맥락',
} as const

function formatDate(value: string | null) {
  if (!value) return '확인되지 않음'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return new Intl.DateTimeFormat('ko-KR', { dateStyle: 'medium', timeStyle: 'short' }).format(date)
}

function statusTone(status: AnalysisResult['status']): Verdict {
  if (status === 'COMPLETED') return 'trust'
  if (status === 'PARTIAL_COMPLETED') return 'caution'
  if (status === 'FAILED') return 'risk'
  return 'hold'
}

function statusLabel(status: AnalysisResult['status']) {
  if (status === 'COMPLETED') return '완료'
  if (status === 'PARTIAL_COMPLETED') return '부분 완료'
  if (status === 'FAILED') return '실패'
  return '진행 중'
}

function criterionTone(status: CriterionStatus): Verdict {
  if (status === 'MET') return 'trust'
  if (status === 'NOT_MET') return 'risk'
  return 'hold'
}

function criterionLabel(status: CriterionStatus) {
  if (status === 'MET') return '충족'
  if (status === 'NOT_MET') return '미충족'
  return '확인 불가'
}

function ClaimResult({ claim, evidenceById, sourceNames }: { claim: Claim; evidenceById: Map<string, Evidence>; sourceNames: Map<string, string> }) {
  const verdict = verdictConfig[claim.verdict]
  return (
    <article className={`claim-card claim-card-${verdict.tone}`}>
      <div className="card-eyebrow"><span>핵심 주장</span><VerdictBadge verdict={verdict.tone} label={verdict.label} /></div>
      <h3>{claim.text}</h3>
      <p>{claim.reason}</p>
      {claim.articleSourceIds.length > 0 && <div className="claim-relations"><strong>기사 내부 정보원</strong><span>{claim.articleSourceIds.map((sourceId) => sourceNames.get(sourceId) || sourceId).join(' · ')}</span></div>}
      <div className="claim-evidence-links">
        <strong>연결된 근거</strong>
        {claim.evidenceLinks.length > 0 ? claim.evidenceLinks.map((link) => {
          const evidence = evidenceById.get(link.evidenceId)
          return <div className="claim-evidence-link" key={`${claim.claimId}-${link.evidenceId}`}><Chip tone={link.stance === 'REFUTES' ? 'risk' : link.stance === 'SUPPORTS' ? 'trust' : 'brand'}>{stanceLabels[link.stance]}</Chip>{evidence ? <a href={evidence.url} target="_blank" rel="noreferrer">{evidence.title} ↗</a> : <span>{link.evidenceId}</span>}</div>
        }) : <span className="muted-text">연결된 외부 근거가 없습니다.</span>}
      </div>
    </article>
  )
}

function SourceCard({ source, evidenceById }: { source: ArticleSource; evidenceById: Map<string, Evidence> }) {
  return (
    <article className="source-card">
      <div className="source-card-heading"><div><Chip tone="brand">{sourceTypeLabels[source.type]}</Chip><h3>{source.name}</h3></div><span className="mono">{source.sourceId}</span></div>
      <blockquote className="source-quote">“{source.citedInArticle}”</blockquote>
      <p className="source-note">{source.verificationNote}</p>
      <div className="criterion-list">
        {IMVAIN_KEYS.map((key) => {
          const criterion: Criterion | undefined = source.imvain[key]
          const status = criterion?.status || 'UNKNOWN'
          return <div className="criterion-row" key={key}><div className="criterion-heading"><strong>{criterionLabels[key]}</strong><Chip tone={criterionTone(status)}>{criterionLabel(status)}</Chip></div><p>{criterion?.reason || '이 기준에 대한 평가 정보가 없습니다.'}</p>{criterion && criterion.evidenceIds.length > 0 && <small>연결 근거: {criterion.evidenceIds.map((id) => evidenceById.get(id)?.title || id).join(' · ')}</small>}</div>
        })}
      </div>
    </article>
  )
}

function EvidenceCard({ evidence }: { evidence: Evidence }) {
  return <article className="api-evidence-card"><div className="source-mark">{(evidence.publisher || evidence.title).slice(0, 1)}</div><div className="api-evidence-content"><a href={evidence.url} target="_blank" rel="noreferrer"><strong>{evidence.title} ↗</strong></a><small>{evidence.publisher || '발행처 확인되지 않음'} · {formatDate(evidence.publishedAt)}</small><p>{evidence.excerpt}</p></div></article>
}

export function ResultPage({ analysisId, onNewAnalysis, onGoToLoading }: { analysisId: string; onNewAnalysis: () => void; onGoToLoading: () => void }) {
  const [activeTab, setActiveTab] = useState('판정 요약')
  const [compact, setCompact] = useState(false)
  const [result, setResult] = useState<AnalysisResult | null>(null)
  const [loadedAnalysisId, setLoadedAnalysisId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let disposed = false
    void getAnalysisResult(analysisId)
      .then((nextResult) => {
        if (!disposed) {
          setResult(nextResult)
          setError(null)
          setLoadedAnalysisId(analysisId)
        }
      })
      .catch((resultError) => {
        if (!disposed) {
          setError(getApiErrorMessage(resultError))
          setLoadedAnalysisId(analysisId)
        }
      })

    return () => { disposed = true }
  }, [analysisId])

  const isLoading = loadedAnalysisId !== analysisId

  if (isLoading) {
    return <main className="page-content loading-page"><section className="loading-card-wrap"><Card className="loading-card"><div className="loading-orbit" aria-hidden="true"><span /><span /><span /></div><h1>결과를 불러오는 중입니다.</h1><p>저장된 분석 결과를 확인하고 있습니다.</p></Card></section></main>
  }

  if (error || !result) {
    return <main className="page-content loading-page"><section className="loading-card-wrap"><Card className="loading-card"><h1>결과를 불러오지 못했습니다.</h1><p>{error || '분석 결과가 없습니다.'}</p><div className="result-actions result-error-actions"><Button variant="secondary" onClick={onGoToLoading}>상태 다시 확인</Button><Button onClick={onNewAnalysis}>새 기사 판독</Button></div></Card></section></main>
  }

  const evidenceById = new Map(result.evidence.map((evidence) => [evidence.evidenceId, evidence]))
  const sourceNames = new Map((result.articleSources || []).map((source) => [source.sourceId, source.name]))

  return (
    <main className={`page-content result-page ${compact ? 'is-compact' : ''}`}>
      <section className="result-topbar">
        <div><p className="section-kicker">Output page · {activeTab}</p><h1>{result.article.title}</h1><p>{result.article.publisher || '언론사 확인되지 않음'} · {formatDate(result.article.publishedAt)}</p><a className="article-link" href={result.article.url} target="_blank" rel="noreferrer">기사 원문 열기 ↗</a></div>
        <div className="result-actions"><Button variant="secondary" size="sm" onClick={() => setCompact((value) => !value)}>{compact ? '자세히 보기' : '간단히 보기'}</Button><Button size="sm" onClick={onNewAnalysis}>새 기사 판독</Button></div>
      </section>

      <section className="result-summary section-soft">
        <div className="result-summary-heading"><div><p className="section-kicker">판정 분석</p><h2>{result.summary.overallComment || '종합 분석 코멘트가 없습니다.'}</h2></div><div className="result-status-box"><Chip tone={statusTone(result.status)}>{statusLabel(result.status)}</Chip><strong>{result.analysisOutcome === 'NO_VERIFIABLE_CLAIMS' ? '주장 없음' : `${result.claims.length}개 주장`}</strong><small>{result.analysisOutcome}</small></div></div>
        <div className="summary-cards"><Card title="분석 범위"><p>API가 반환한 실제 분석 항목입니다.</p><FactRow label="핵심 주장" value={`${result.claims.length}개`} /><FactRow label="외부 근거" value={`${result.evidence.length}개`} /><FactRow label="경고" value={`${result.warnings.length}개`} /></Card><Card title="기사 정보"><p>분석 대상 기사 메타데이터입니다.</p><FactRow label="언론사" value={result.article.publisher || '확인되지 않음'} /><FactRow label="작성자" value={result.article.author || '확인되지 않음'} /><FactRow label="발행일" value={formatDate(result.article.publishedAt)} /></Card></div>
        <Callout title="사실 검증 요약">{result.summary.factCheckOverview || '사실 검증 요약이 없습니다.'}</Callout>
        {result.summary.sourceAssessmentOverview && <Callout title="정보원 평가 요약">{result.summary.sourceAssessmentOverview}</Callout>}
        {result.summary.unverifiedPoints.length > 0 && <div className="unverified-points"><strong>확인하지 못한 내용</strong><ul>{result.summary.unverifiedPoints.map((point) => <li key={point}>{point}</li>)}</ul></div>}
      </section>

      <div className="result-tabs"><Tabs items={['판정 요약', '근거 보기', '출처 평가']} active={activeTab} onChange={setActiveTab} /><span className="mono">저장된 결과</span></div>

      <section className="result-columns">
        <div className="result-column">
          <Card title="사실 검증" className="result-section-card">
            <p className="card-description">기사의 핵심 주장과 실제로 연결된 자료를 비교했습니다.</p>
            <div className="claim-list">{result.claims.length > 0 ? result.claims.map((claim) => <ClaimResult key={claim.claimId} claim={claim} evidenceById={evidenceById} sourceNames={sourceNames} />) : <Callout title="검증 가능한 주장이 없습니다">{result.summary.factCheckOverview || '검증 가능한 주장이 없어 주장별 판정을 만들지 않았습니다.'}</Callout>}</div>
          </Card>
          <Card title="검증에 사용한 근거"><div className="api-evidence-list">{result.evidence.length > 0 ? result.evidence.map((evidence) => <EvidenceCard key={evidence.evidenceId} evidence={evidence} />) : <p className="muted-text">사용 가능한 외부 근거가 없습니다.</p>}</div></Card>
        </div>

        <div className="result-column">
          <Card title="출처 평가 (IMVAIN)" className="result-section-card">
            <p className="card-description">기사 속 정보원을 6개 기준으로 각각 확인했습니다.</p>
            {result.articleSources === null ? <Callout title="정보원 평가를 확인할 수 없습니다" tone="caution">정보원 평가가 제공되지 않았습니다. 사실 검증 결과와 경고를 확인해 주세요.</Callout> : result.articleSources.length > 0 ? <div className="source-list">{result.articleSources.map((source) => <SourceCard key={source.sourceId} source={source} evidenceById={evidenceById} />)}</div> : <Callout title="기사 내부 정보원이 없습니다">분석한 기사에서 별도의 정보원을 확인하지 못했습니다.</Callout>}
          </Card>
          {result.warnings.length > 0 && <Card title="일부 처리 안내"><div className="warning-list">{result.warnings.map((warning, index) => <Callout key={`${warning.code}-${index}`} title={`${warning.code} · ${warning.stage}`} tone="caution">{warning.message}</Callout>)}</div></Card>}
          <Card title="분석 원칙"><Banner>API가 제공한 판정·근거·정보원 연결만 표시하며, 합산 신뢰도 점수는 산출하지 않습니다.</Banner></Card>
        </div>
      </section>

      {!compact && <section className="result-bottom section-soft"><div className="section-heading"><div><p className="section-kicker">Evidence</p><h2>원문 근거를 다시 확인하세요.</h2></div><p>각 자료의 원문 링크와 실제 분석에 사용된 발췌를 함께 표시합니다.</p></div><div className="evidence-grid">{result.evidence.length > 0 ? result.evidence.map((evidence) => <EvidenceCard key={evidence.evidenceId} evidence={evidence} />) : <p className="muted-text">표시할 근거가 없습니다.</p>}</div></section>}
    </main>
  )
}
