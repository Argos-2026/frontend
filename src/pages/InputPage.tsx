import { useState } from 'react'
import { Banner, Button, Callout, Card, StanceCard, Tabs } from '../components'
import { getApiErrorMessage } from '../api/argos'

const imvainGuide = [
  { key: 'I', title: '독립성', body: '사안의 이해관계자로부터 독립적인 정보원인지 확인합니다.', tone: 'caution' as const },
  { key: 'M', title: '복수성', body: '같은 내용을 확인하는 독립적인 복수의 기사 내부 정보원이 있는지 봅니다.', tone: 'hold' as const },
  { key: 'V', title: '검증 가능성', body: '정보원의 주장이나 인용 내용을 외부 자료로 확인할 수 있는지 살핍니다.', tone: 'trust' as const },
  { key: 'A', title: '권위성', body: '해당 분야의 전문성과 공식성을 갖춘 정보원인지 평가합니다.', tone: 'trust' as const },
  { key: 'I', title: '정보성', body: '사건에 직접 접근해 충분한 정보를 가질 수 있는 위치인지 봅니다.', tone: 'trust' as const },
  { key: 'N', title: '기명성', body: '인물·기관·자료명이 기사에 구체적으로 명시되어 있는지 확인합니다.', tone: 'caution' as const },
]

export function InputPage({ onAnalyze }: { onAnalyze: (articleUrl: string) => Promise<void> }) {
  const [url, setUrl] = useState('')
  const [activeTab, setActiveTab] = useState('사실 검증')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const submit = async (articleUrl: string) => {
    const normalizedUrl = articleUrl.trim()
    if (!normalizedUrl) {
      setError('판독할 기사 URL을 입력해 주세요.')
      return
    }

    try {
      const parsedUrl = new URL(normalizedUrl)
      if (parsedUrl.protocol !== 'http:' && parsedUrl.protocol !== 'https:') {
        setError('http 또는 https 형식의 기사 URL을 입력해 주세요.')
        return
      }
    } catch {
      setError('올바른 기사 URL을 입력해 주세요.')
      return
    }

    setError(null)
    setIsSubmitting(true)
    try {
      await onAnalyze(normalizedUrl)
    } catch (submitError) {
      setError(getApiErrorMessage(submitError))
      setIsSubmitting(false)
    }
  }

  return (
    <main className="page-content input-page">
      <section className="input-hero">
        <p className="eyebrow">Argos · news context reader</p>
        <h1>이 뉴스, 신뢰할 수 있습니까?</h1>
        <p>기사의 주장과 출처를 분리해 확인하고, 판정의 이유까지 함께 보여드립니다.</p>
        <form className="url-form" onSubmit={(event) => { event.preventDefault(); void submit(url) }}>
          <input
            aria-label="기사 URL"
            type="url"
            value={url}
            onChange={(event) => setUrl(event.target.value)}
            placeholder="판독할 기사 URL을 입력하세요"
            disabled={isSubmitting}
          />
          <Button type="submit" disabled={isSubmitting}>{isSubmitting ? '접수 중…' : <>판독하기 <span aria-hidden="true">→</span></>}</Button>
        </form>
        <small className="input-hint">분석 API는 기사 URL을 기준으로 원문과 외부 근거를 확인합니다.</small>
        {error && <div className="input-error"><Callout title="분석 요청을 처리하지 못했습니다" tone="risk">{error}</Callout></div>}
      </section>

      <section className="imvain-intro section-soft">
        <p className="section-kicker">How it works</p>
        <h2>주장과 정보원을 따로 검증합니다.</h2>
        <p>기사 URL을 접수한 뒤 핵심 주장을 최대 3개까지 분리하고, 각 주장에 대한 외부 근거와 기사 내부 정보원을 함께 확인합니다.</p>
        <div className="mini-card-grid">
          <Card title="분석 흐름">
            <div className="fact-list">
              <div className="fact-row"><span>분석 요청</span><strong>URL 접수</strong></div>
              <div className="fact-row"><span>진행 확인</span><strong>2초 간격</strong></div>
              <div className="fact-row"><span>결과 범위</span><strong>주장 최대 3개</strong></div>
            </div>
          </Card>
          <Card title="판정 값">
            <div className="guide-chip-list">
              <span className="chip chip-trust">SUPPORT · 뒷받침</span>
              <span className="chip chip-risk">REFUTE · 반박</span>
              <span className="chip chip-caution">CONFLICT · 상충</span>
              <span className="chip chip-hold">INSUFFICIENT · 근거 부족</span>
            </div>
          </Card>
        </div>
      </section>

      <section className="input-detail section-soft">
        <Tabs items={['사실 검증', '출처 평가 (IMVAIN)']} active={activeTab} onChange={setActiveTab} />
        {activeTab === '사실 검증' ? (
          <div className="detail-panel">
            <div className="detail-panel-heading"><div><p className="section-kicker">Fact checking</p><h2>판정에는 연결된 근거가 필요합니다.</h2></div><span className="mono">SUPPORT · REFUTE · CONFLICT · INSUFFICIENT</span></div>
            <p className="detail-panel-copy">각 주장은 판정 이유와 외부 근거 링크를 함께 반환합니다. 근거가 충분하지 않으면 억지로 사실로 판정하지 않고 근거 부족으로 표시합니다.</p>
            <div className="stance-grid">
              <StanceCard title="확인된 주장" tone="trust" body="공식 문서나 원문 자료가 주장을 뒷받침하면 SUPPORT로 표시합니다." />
              <StanceCard title="확인할 수 없는 주장" tone="hold" body="검증 가능한 근거가 부족하면 INSUFFICIENT로 표시하고 부족한 내용을 설명합니다." />
            </div>
          </div>
        ) : (
          <div className="detail-panel">
            <div className="detail-panel-heading"><div><p className="section-kicker">Source assessment</p><h2>정보원은 IMVAIN 6개 기준으로 평가합니다.</h2></div><span className="mono">01 / 06</span></div>
            <p className="detail-panel-copy">각 기준은 MET, NOT_MET, UNKNOWN 중 하나와 판단 이유를 반환합니다. 합산 신뢰도 점수는 만들지 않습니다.</p>
            <div className="imvain-list">
              {imvainGuide.map((item, index) => <div className="imvain-row" key={`${item.title}-${index}`}><span className={`imvain-key imvain-${item.tone}`}>{item.key}</span><div><strong>{item.title}</strong><p>{item.body}</p></div><span className="mono">판정 기준</span></div>)}
            </div>
          </div>
        )}
      </section>

      <Banner>아르고스는 판정만 남기지 않고, 판단에 필요한 근거를 함께 정리합니다.</Banner>
    </main>
  )
}
