import { useState } from 'react'
import { Button, Callout } from '../components'
import { getApiErrorMessage } from '../api/argos'

const imvainGuide = [
  { key: 'I', title: '독립성', question: '이 출처는 사안과 이해관계가 없는가', body: '출처가 사안으로 이익이나 손해를 보는 이해관계자인지 검토합니다.', risk: '시청 대변인은 예산 삭감이 불가피하다고 말했다.', riskNote: '예산을 편성한 당사자의 발언입니다.', trust: '외부 재정 전문가인 김OO 교수는 삭감 규모가 과도하지 않다고 분석했다.', trustNote: '사안과 이해관계가 없는 제3자의 분석입니다.' },
  { key: 'M', title: '복수성', question: '기사 속 여러 출처가 같은 내용을 확인하는가', body: '같은 내용이 서로 독립적인 여러 출처에서 확인되는지 검토합니다.', risk: '한 명의 관계자만 예산이 30% 줄어든다고 말했다.', riskNote: '독립적인 출처가 부족합니다.', trust: '서로 다른 출처가 같은 내용을 확인했습니다.', trustNote: '복수의 독립된 출처가 확인됩니다.' },
  { key: 'V', title: '검증성', question: '근거를 제시하는가, 주장만 하는가', body: '주장에 확인 가능한 근거가 함께 제시되었는지 검토합니다. 발언만 있으면 주장이고, 문서·통계·현장 자료가 함께 있으면 근거입니다.', risk: '예산이 크게 줄어든다고 한 관계자가 말했다.', riskNote: '주장을 뒷받침할 근거가 없습니다.', trust: '공개된 보고서와 통계가 같은 내용을 보여줍니다.', trustNote: '외부 자료로 검증할 수 있습니다.' },
  { key: 'A', title: '권위·정보성', question: '이 주체를 말할 만한 위치에 있는가', body: '해당 분야의 전문성이 있거나 사건을 가까이서 알고 있는 위치인지 검토합니다.', risk: '한 시민이 SNS에 예산 삭감이 확정되었다고 적었다.', riskNote: '전문성과 정보 접근이 확인되지 않습니다.', trust: '해당 분야 전문가가 공개 자료를 바탕으로 분석했습니다.', trustNote: '전문성과 정보 접근이 함께 확인됩니다.' },
  { key: 'N', title: '기명성', question: '이름과 출처를 밝혔는가', body: '이름을 밝힌 출처는 책임을 지며 확인 가능한 정보가 됩니다. 작성자·기관·사용된 자료와 날짜가 밝혀져 있는지 검토합니다.', risk: '“관계자”에 따르면 한 조사에서만 결과가 나왔다.', riskNote: '누가 말했는지 확인할 수 없습니다.', trust: 'OO연구원의 2026 시민 인식 조사 결과가 공개되었다.', trustNote: '자료 제공처와 조사 내용을 확인할 수 있습니다.' },
] as const

export function InputPage({ onAnalyze }: { onAnalyze: (articleUrl: string) => Promise<void> }) {
  const [url, setUrl] = useState('')
  const [activeCriterion, setActiveCriterion] = useState<string>(imvainGuide[0].key)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const activeGuide = imvainGuide.find((item) => item.key === activeCriterion) || imvainGuide[0]

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
    <main className="figma-page input-page">
      <section className="input-hero">
        <h1>이 뉴스, 신뢰할 수 있습니까?</h1>
        <p>뉴스 기사 링크를 입력하면 AI가 핵심 주장을 추출해 외부 자료와 비교하고,<br className="desktop-only" /> 기사에 인용된 출처까지 함께 확인합니다.</p>
        <form className="url-form" onSubmit={(event) => { event.preventDefault(); void submit(url) }}>
          <input
            aria-label="기사 URL"
            type="url"
            value={url}
            onChange={(event) => setUrl(event.target.value)}
            placeholder="뉴스 기사 링크를 입력하십시오 (예: https://news.example.com/article/123)"
            disabled={isSubmitting}
          />
          <Button type="submit" disabled={isSubmitting}>{isSubmitting ? '접수 중…' : '판독하기'}</Button>
        </form>
        {error && <div className="input-error"><Callout title="분석 요청을 처리하지 못했습니다" tone="risk">{error}</Callout></div>}
      </section>

      <section className="imvain-overview">
        <div className="section-intro">
          <h2>출처는 IMVAIN 기준으로 평가합니다</h2>
          <p>IMVAIN은 미국 스토니브룩 대학교 뉴스 리터러시 센터가 만든 출처 평가 기준입니다.<br className="desktop-only" /> 5가지 질문으로 기사가 기대고 있는 사람·기관·자료의 신뢰성을 검토합니다.</p>
        </div>

        <div className="method-grid">
          <article className="method-card">
            <span className="method-label">기사 바깥</span>
            <h3>사실 검증</h3>
            <p>다른 뉴스와 정부·기관 자료를 통해 기사 내용의 사실 여부를 확인합니다.</p>
            <small>결과: 뒷받침 · 반박 · 근거 충돌 · 근거 부족</small>
          </article>
          <article className="method-card">
            <span className="method-label">기사 안</span>
            <h3>출처 평가 (IMVAIN)</h3>
            <p>기사가 인용한 사람·기관·자료의 신뢰성을 확인합니다.</p>
            <small>결과: 기준마다 충족 · 미충족 · 확인 불가</small>
          </article>
        </div>

        <section className="criterion-panel">
          <div className="criterion-tabs" role="tablist" aria-label="IMVAIN 기준">
            {imvainGuide.map((item) => (
              <button key={item.key} className={activeGuide.key === item.key ? 'active' : ''} onClick={() => setActiveCriterion(item.key)} role="tab" aria-selected={activeGuide.key === item.key}>
                {item.key} <span>{item.title}</span>
              </button>
            ))}
          </div>
          <h3>{activeGuide.question}</h3>
          <p className="criterion-copy">{activeGuide.body}</p>
          <div className="criterion-examples">
            <article className="source-example source-example-risk">
              <strong>신뢰도가 낮은 출처</strong>
              <p>“{activeGuide.risk}”</p>
              <span>→ {activeGuide.riskNote}</span>
            </article>
            <article className="source-example source-example-trust">
              <strong>신뢰도가 높은 출처</strong>
              <p>“{activeGuide.trust}”</p>
              <span>→ {activeGuide.trustNote}</span>
            </article>
          </div>
        </section>
        <p className="page-disclaimer">출처는 사람에 한정되지 않습니다. 정부 발표, 통계, 보고서, 여론조사도 같은 기준으로 평가합니다. IMVAIN 평가가 낮다고 해서 가짜뉴스임을 의미하지는 않습니다.</p>
      </section>
    </main>
  )
}
