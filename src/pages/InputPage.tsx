import { useState } from 'react'
import { Banner, Button, Callout, Card, Dropzone, ImvainAxis, MetricBar, StanceCard, Tabs, Textarea, TextField } from '../components'
import { imvainItems, sampleArticle } from '../data/mockData'

export function InputPage({ onAnalyze }: { onAnalyze: (article: string) => void }) {
  const [article, setArticle] = useState('')
  const [url, setUrl] = useState(sampleArticle.url)
  const [activeTab, setActiveTab] = useState('사실 검증')

  return (
    <main className="page-content input-page">
      <section className="input-hero">
        <p className="eyebrow">Argos · news context reader</p>
        <h1>이 뉴스, 신뢰할 수 있습니까?</h1>
        <p>기사의 주장과 출처를 분리해 확인하고, 판정의 이유까지 함께 보여드립니다.</p>
        <form className="url-form" onSubmit={(event) => { event.preventDefault(); onAnalyze(article || sampleArticle.title) }}>
          <input aria-label="기사 URL" value={url} onChange={(event) => setUrl(event.target.value)} placeholder="판독할 기사 URL을 입력하세요" />
          <Button type="submit">판독하기 <span aria-hidden="true">→</span></Button>
        </form>
        <small className="input-hint">URL을 입력하거나 아래에 기사 본문을 붙여 넣을 수 있습니다.</small>
      </section>

      <section className="imvain-intro section-soft">
        <p className="section-kicker">How it works</p>
        <h2>출처는 IMVAIN 기준으로 평가합니다.</h2>
        <p>정보의 독립성, 복수성, 공정성, 출처성·정보성, 기명성을 차례로 확인해 출처의 신뢰도를 설명합니다.</p>
        <div className="mini-card-grid">
          <Card title="사실 검증"><MetricBar label="공식 출처 일치도" value={86} /><MetricBar label="주장 명확성" value={72} tone="iris" /></Card>
          <Card title="출처 평가 (IMVAIN)"><ImvainAxis values={[22, 8, 31, 72, 48]} /></Card>
        </div>
      </section>

      <section className="input-detail section-soft">
        <Tabs items={['사실 검증', '출처 평가 (IMVAIN)']} active={activeTab} onChange={setActiveTab} />
        <div className="detail-panel">
          <div className="detail-panel-heading"><div><p className="section-kicker">{activeTab}</p><h2>이 출처는 사실과 이해관계가 없는가</h2></div><span className="mono">01 / 05</span></div>
          <p className="detail-panel-copy">기사의 주장과 자료가 서로 독립적인 출처에서 확인되는지 살펴봅니다. 확인할 수 없는 내용은 판정에 반영하지 않습니다.</p>
          <div className="stance-grid">
            <StanceCard title="주의가 필요한 출처" tone="caution" body="익명 관계자의 발언만으로 핵심 주장을 뒷받침하고 있습니다." />
            <StanceCard title="확인 가능한 출처" tone="trust" body="공식 문서와 공개된 통계에서 일부 수치를 확인했습니다." />
          </div>
          <div className="imvain-list">
            {imvainItems.map((item) => <div className="imvain-row" key={item.key}><span className={`imvain-key imvain-${item.color}`}>{item.key}</span><div><strong>{item.title}</strong><p>{item.body}</p></div><span className="mono">{item.score}/6</span></div>)}
          </div>
        </div>
      </section>

      <section className="manual-input section-soft" id="manual-input">
        <div className="section-heading"><div><p className="section-kicker">Manual input</p><h2>본문으로 직접 판독하기</h2></div><p>URL을 열 수 없는 기사도 본문을 붙여 넣어 분석할 수 있습니다.</p></div>
        <Card className="manual-card">
          <div className="manual-grid">
            <div className="showcase-stack"><TextField label="기사 URL" placeholder="https://example.com/news" value={url} onChange={setUrl} /><Textarea label="기사 본문" placeholder="기사 내용을 붙여 넣으세요." value={article} onChange={setArticle} /></div>
            <div className="showcase-stack"><Dropzone /><Callout title="분석 범위 안내">본문 텍스트와 URL 모두 핵심 주장·출처·표현의 맥락을 확인하는 데 사용됩니다.</Callout></div>
          </div>
          <div className="manual-actions"><span className="mono">{article.length.toLocaleString()} chars</span><Button size="lg" onClick={() => onAnalyze(article || sampleArticle.title)}>이 내용 판독하기 →</Button></div>
        </Card>
      </section>

      <Banner>아르고스는 판정만 남기지 않고, 판단에 필요한 근거를 함께 정리합니다.</Banner>
    </main>
  )
}

