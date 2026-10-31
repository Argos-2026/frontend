import { useEffect, useState, type ReactNode } from 'react'
import { getAnalysisResult, getApiErrorMessage } from '../api/argos'
import type { AnalysisResult, CrossReport, CrossReportVerdict, CriterionStatus, Evidence, ImvainKey, ReportComparisonStance, ReviewedSource, SourceAssessment } from '../api/argos'
import { ArgosLogo, Button, Callout, Chip, type Verdict } from '../components'

const verdictConfig: Record<CrossReportVerdict, { label: string; tone: Verdict }> = {
  MATCHED: { label: '뒷받침', tone: 'trust' },
  CONTRADICTED: { label: '반박', tone: 'risk' },
  MIXED: { label: '근거 충돌', tone: 'caution' },
  UNCONFIRMED: { label: '근거 부족', tone: 'hold' },
}

const sourceTypeLabels: Record<ReviewedSource['type'], string> = {
  PERSON: '인물',
  ORGANIZATION: '기관',
  DOCUMENT: '문서',
  OTHER: '기타',
}

const sourceCriterionGroups = [
  { letter: 'I', title: '독립성', keys: ['independent'] as ImvainKey[] },
  { letter: 'M', title: '복수성', keys: ['multiple'] as ImvainKey[] },
  { letter: 'V', title: '검증성', keys: ['verify'] as ImvainKey[] },
  { letter: 'A', title: '권위·정보성', keys: ['authoritative', 'informed'] as ImvainKey[] },
  { letter: 'N', title: '기명성', keys: ['named'] as ImvainKey[] },
] as const

type CriterionVisualStatus = CriterionStatus | 'PARTIAL'

function formatDate(value: string | null) {
  if (!value) return '확인되지 않음'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return new Intl.DateTimeFormat('ko-KR', { dateStyle: 'medium' }).format(date)
}

function criterionTone(status: CriterionVisualStatus): Verdict {
  if (status === 'MET') return 'trust'
  if (status === 'NOT_MET') return 'risk'
  if (status === 'PARTIAL') return 'caution'
  return 'hold'
}

function criterionLabel(status: CriterionVisualStatus) {
  if (status === 'MET') return '충족'
  if (status === 'NOT_MET') return '미충족'
  if (status === 'PARTIAL') return '부분'
  return '확인 불가'
}

function getGroupedCriterion(source: ReviewedSource, keys: readonly ImvainKey[]) {
  const criteria = keys.map((key) => source.imvain[key]).filter(Boolean)
  const statuses = criteria.map((criterion) => criterion?.status)
  const status: CriterionVisualStatus = statuses.length === 0
    ? 'UNKNOWN'
    : statuses.every((value) => value === 'MET')
      ? 'MET'
      : statuses.some((value) => value === 'NOT_MET')
        ? 'NOT_MET'
        : statuses.some((value) => value === 'MET')
          ? 'PARTIAL'
          : 'UNKNOWN'
  const reasons = criteria.map((criterion) => criterion?.reason).filter((reason): reason is string => Boolean(reason))
  return { status, reason: [...new Set(reasons)].join(' ') || '이 기준에 대한 평가 정보가 없습니다.' }
}

function comparisonLabel(stance: ReportComparisonStance) {
  return stance === 'MATCHES' ? '뒷받침' : '반박'
}

function EvidenceLink({ evidence, stance, reason }: { evidence?: Evidence; stance: ReportComparisonStance; reason: string }) {
  return (
    <div className="verification-evidence">
      <span className={`evidence-dot evidence-dot-${stance === 'MATCHES' ? 'trust' : 'risk'}`} aria-hidden="true" />
      <div>
        {evidence ? <a href={evidence.url} target="_blank" rel="noreferrer">{evidence.title}</a> : <strong>연결된 근거를 확인할 수 없습니다.</strong>}
        <small>{evidence?.publisher || '발행처 확인되지 않음'} · {comparisonLabel(stance)} · {reason}</small>
      </div>
      {evidence && <a className="evidence-open" href={evidence.url} target="_blank" rel="noreferrer">원문 보기</a>}
    </div>
  )
}

function VerificationClaim({ report, evidenceById }: { report: CrossReport; evidenceById: Map<string, Evidence> }) {
  const config = verdictConfig[report.verdict]
  return (
    <article className={`verification-claim verification-claim-${config.tone}`}>
      <span className="claim-number">핵심 주장</span>
      <h3>“{report.text}”</h3>
      <p>{report.reason}</p>
      {report.comparisons.length > 0 && <div className="verification-evidence-list">{report.comparisons.map((comparison) => <EvidenceLink key={`${report.claimId}-${comparison.evidenceId}`} evidence={evidenceById.get(comparison.evidenceId)} stance={comparison.stance} reason={comparison.reason} />)}</div>}
      {report.comparisons.length === 0 && <div className="verification-empty">검색한 뉴스·공식 자료에서 관련 내용을 확인하지 않았습니다.</div>}
      {report.analysisFailed && <Callout title="일부 비교 자료를 확인하지 못했습니다" tone="caution">확인된 결과만 화면에 표시합니다.</Callout>}
    </article>
  )
}

function VerificationGroup({ verdict, reports, evidenceById }: { verdict: CrossReportVerdict; reports: CrossReport[]; evidenceById: Map<string, Evidence> }) {
  const config = verdictConfig[verdict]
  if (reports.length === 0) return null
  return (
    <section className={`verification-group verification-group-${config.tone}`}>
      <h3><span>{config.label}</span> {reports.length}건</h3>
      <div className="verification-group-line" />
      <div className="verification-group-list">{reports.map((report) => <VerificationClaim key={report.claimId} report={report} evidenceById={evidenceById} />)}</div>
    </section>
  )
}

function SourceReviewCard({ source }: { source: ReviewedSource }) {
  return (
    <article className="source-review-card">
      <div className="source-review-heading">
        <div><span className="source-index">정보원</span><h3>{source.name}</h3></div>
        <Chip tone="brand">{sourceTypeLabels[source.type]}</Chip>
      </div>
      {source.affiliation && <p className="source-affiliation">{source.affiliation}</p>}
      <blockquote>“{source.citedInArticle}”</blockquote>
      <div className="source-criterion-grid">
        {sourceCriterionGroups.map((group) => {
          const criterion = getGroupedCriterion(source, group.keys)
          return <article className={`source-criterion source-criterion-${criterionTone(criterion.status)}`} key={group.letter}><strong className="criterion-letter">{group.letter}</strong><h4>{group.title}</h4><b>{criterionLabel(criterion.status)}</b><p>{criterion.reason}</p></article>
        })}
      </div>
    </article>
  )
}

function SourceAssessmentPanel({ assessments }: { assessments: SourceAssessment[] }) {
  const [selectedClaimId, setSelectedClaimId] = useState(assessments[0]?.claimId || '')
  const selectedAssessment = assessments.find((assessment) => assessment.claimId === selectedClaimId) || assessments[0]
  if (!selectedAssessment) return <Callout title="정보원 평가를 확인할 수 없습니다" tone="caution">평가할 기사 내부 정보원이 제공되지 않았습니다.</Callout>

  return (
    <section className="result-panel source-panel">
      <p className="result-panel-lead">기사 속 출처들을 IMVAIN 기준으로 각각 확인했습니다.</p>
      <div className="source-claim-list" role="tablist" aria-label="평가 대상 주장">
        {assessments.map((assessment, index) => <button key={assessment.claimId} className={assessment.claimId === selectedAssessment.claimId ? 'active' : ''} onClick={() => setSelectedClaimId(assessment.claimId)} role="tab" aria-selected={assessment.claimId === selectedAssessment.claimId}><span>주장 {index + 1}</span><strong>{assessment.text}</strong><small>{assessment.sources.length > 0 ? assessment.sources[0].name : '정보원 없음'}</small></button>)}
      </div>
      <div className="source-review-list">{selectedAssessment.sources.length > 0 ? selectedAssessment.sources.map((source) => <SourceReviewCard key={source.sourceId} source={source} />) : <Callout title="기사 내부 정보원이 없습니다">이 주장에 연결된 정보원을 확인하지 못했습니다.</Callout>}</div>
    </section>
  )
}

function ResultState({ title, body, children }: { title: string; body: string; children?: ReactNode }) {
  return <main className="figma-page result-page"><section className="result-state"><ArgosLogo /><h1>{title}</h1><p>{body}</p>{children}</section></main>
}

export function ResultPage({ analysisId, onNewAnalysis, onGoToLoading }: { analysisId: string; onNewAnalysis: () => void; onGoToLoading: () => void }) {
  const [activeTab, setActiveTab] = useState<'교차 검증' | '출처 평가'>('교차 검증')
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

  if (loadedAnalysisId !== analysisId) return <ResultState title="결과를 불러오는 중입니다." body="저장된 분석 결과를 확인하고 있습니다." />
  if (error || !result) return <ResultState title="결과를 불러오지 못했습니다." body={error || '분석 결과가 없습니다.'}><div className="result-state-actions"><Button variant="secondary" onClick={onGoToLoading}>상태 다시 확인</Button><Button onClick={onNewAnalysis}>새 기사 판독</Button></div></ResultState>

  const evidenceById = new Map(result.evidence.map((evidence) => [evidence.evidenceId, evidence]))
  const counts = (Object.keys(verdictConfig) as CrossReportVerdict[]).map((verdict) => ({ verdict, count: result.crossReports.filter((report) => report.verdict === verdict).length }))
  const totalReports = Math.max(result.crossReports.length, 1)

  return (
    <main className="figma-page result-page">
      <section className="result-heading">
        <button className="back-link" onClick={onNewAnalysis}>← <span>새 기사 판독하기</span></button>
        <article className="article-summary-card">
          <p>{result.article.publisher || '언론사 확인되지 않음'} <span>·</span> {formatDate(result.article.publishedAt)} <span>·</span> {result.article.author || '작성자 확인되지 않음'}</p>
          <h1>{result.article.title}</h1>
          <a href={result.article.url} target="_blank" rel="noreferrer">{result.article.url}</a>
        </article>
      </section>

      <div className="result-tabs" role="tablist">
        {(['교차 검증', '출처 평가'] as const).map((tab) => <button key={tab} className={activeTab === tab ? 'active' : ''} onClick={() => setActiveTab(tab)} role="tab" aria-selected={activeTab === tab}>{tab}</button>)}
      </div>

      {activeTab === '교차 검증' ? (
        <section className="result-panel verification-panel">
          <p className="result-panel-lead">{result.summary.crossReportOverview || '기사의 핵심 주장들이 다른 뉴스와 공식 자료에서 같게 나오는지 확인했습니다.'}</p>
          <div className="verdict-bar" aria-label="판정 분포">{counts.map(({ verdict, count }) => <span key={verdict} className={`verdict-bar-${verdictConfig[verdict].tone}`} style={{ width: `${(count / totalReports) * 100}%` }} />)}</div>
          <div className="verdict-legend">{counts.map(({ verdict, count }) => <span key={verdict}><i className={`legend-dot legend-dot-${verdictConfig[verdict].tone}`} />{verdictConfig[verdict].label} {count}</span>)}</div>
          <div className="verification-columns">
            <VerificationGroup verdict="CONTRADICTED" reports={result.crossReports.filter((report) => report.verdict === 'CONTRADICTED')} evidenceById={evidenceById} />
            <VerificationGroup verdict="MATCHED" reports={result.crossReports.filter((report) => report.verdict === 'MATCHED')} evidenceById={evidenceById} />
            <VerificationGroup verdict="UNCONFIRMED" reports={result.crossReports.filter((report) => report.verdict === 'UNCONFIRMED')} evidenceById={evidenceById} />
            <VerificationGroup verdict="MIXED" reports={result.crossReports.filter((report) => report.verdict === 'MIXED')} evidenceById={evidenceById} />
          </div>
          {result.summary.unverifiedPoints.length > 0 && <div className="unverified-box"><strong>확인하지 못한 내용</strong>{result.summary.unverifiedPoints.map((point) => <p key={point}>{point}</p>)}</div>}
        </section>
      ) : <SourceAssessmentPanel assessments={result.sourceAssessments} />}

      <p className="result-disclaimer">AI가 수집한 자료를 바탕으로 한 참고용 분석이며, 최종 판단은 사용자에게 있습니다.</p>
    </main>
  )
}
