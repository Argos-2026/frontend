import { useEffect, useState } from 'react'
import { getAnalysisResult, getApiErrorMessage } from '../api/argos'
import type { AnalysisResult } from '../api/argos'
import { ArgosLogo, Button } from '../components'
import { decodeHtmlEntities } from '../utils/decodeHtmlEntities'

function formatDate(value: string | null) {
  if (!value) return '확인되지 않음'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return new Intl.DateTimeFormat('ko-KR', { dateStyle: 'medium' }).format(date)
}

function ArticleSummary({ result }: { result: AnalysisResult }) {
  return (
    <article className="article-summary-card">
      <p>{result.article.publisher || '언론사 확인되지 않음'} <span>·</span> {formatDate(result.article.publishedAt)} <span>·</span> {result.article.author || '작성자 확인되지 않음'}</p>
      <h1>{decodeHtmlEntities(result.article.title)}</h1>
      <a href={result.article.url} target="_blank" rel="noreferrer">{result.article.url}</a>
    </article>
  )
}

export function SummaryPage({ analysisId, isDemo, onNewAnalysis, onGoToResult }: { analysisId: string; isDemo: boolean; onNewAnalysis: () => void; onGoToResult: () => void }) {
  const [result, setResult] = useState<AnalysisResult | null>(null)
  const [loadedAnalysisId, setLoadedAnalysisId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let disposed = false
    void getAnalysisResult(analysisId, isDemo)
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
  }, [analysisId, isDemo])

  if (loadedAnalysisId !== analysisId) {
    return <main className="figma-page result-page"><section className="result-state"><ArgosLogo /><h1>종합 분석을 불러오는 중입니다.</h1><p>저장된 분석 결과를 정리하고 있습니다.</p></section></main>
  }

  if (error || !result) {
    return (
      <main className="figma-page result-page">
        <section className="result-state">
          <ArgosLogo />
          <h1>종합 분석을 불러오지 못했습니다.</h1>
          <p>{error || '분석 결과가 없습니다.'}</p>
          <div className="result-state-actions"><Button variant="secondary" onClick={onGoToResult}>결과 다시 확인</Button><Button onClick={onNewAnalysis}>새 기사 판독</Button></div>
        </section>
      </main>
    )
  }

  const sourceOverview = result.summary.sourceAssessmentOverview || '기사 속 출처에 대한 평가 정보를 확인하지 못했습니다.'
  const crossReportOverview = result.summary.crossReportOverview || '기사의 핵심 주장을 외부 자료와 비교한 결과입니다.'

  return (
    <main className="figma-page result-page summary-page">
      <section className="result-heading"><ArticleSummary result={result} /></section>

      <section className="summary-content">
        <h2>종합 분석</h2>
        <article className="summary-card">
          <span className="summary-eyebrow">종합 의견</span>
          <h1>{result.summary.overallComment}</h1>
          <p className="summary-overview">{crossReportOverview}</p>
          <div className="summary-detail-grid">
            <article className="summary-detail-card">
              <h3>기사 내용은 사실과 맞는가?</h3>
              <p>{crossReportOverview}</p>
            </article>
            <article className="summary-detail-card">
              <h3>기사에 출처는 믿을 만한가</h3>
              <p>{sourceOverview}</p>
            </article>
          </div>
          <div className="summary-unverified">
            <strong>확인하지 않은 내용</strong>
            {result.summary.unverifiedPoints.length > 0
              ? result.summary.unverifiedPoints.map((point) => <p key={point}>· {point}</p>)
              : <p>· 확인하지 못한 내용이 없습니다.</p>}
          </div>
        </article>
        <div className="summary-actions"><Button onClick={onGoToResult}>분석 결과 확인하기</Button></div>
      </section>

      <p className="result-disclaimer">AI가 수집한 자료를 바탕으로 한 참고용 분석이며, 최종 판단은 사용자에게 있습니다.</p>
    </main>
  )
}
