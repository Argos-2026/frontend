import { Card, StepCard, Banner } from '../components'

export function AboutPage() {
  return <main className="page-content about-page"><section className="about-hero"><p className="eyebrow">About Argos</p><h1>판정을 설명하는<br /><span>뉴스 리더.</span></h1><p>아르고스는 뉴스가 사실인지 아닌지를 넘어, 어떤 근거로 그렇게 판단했는지 보여주는 맥락 중심 판독 서비스입니다.</p></section><section className="about-grid"><Card title="핵심 주장 분리"><StepCard step={1} title="주장 단위로 읽기">한 문장 안의 사실과 해석을 분리해 검증 가능한 단위로 만듭니다.</StepCard><StepCard step={2} title="출처의 성격 확인">공식 문서, 기사 기록, 익명 발언을 구분해 신뢰도를 평가합니다.</StepCard></Card><Card title="판정 기준"><StepCard step={3} title="맥락까지 설명하기">판정 색상만 남기지 않고 확인된 사실과 주의할 표현을 함께 보여줍니다.</StepCard><StepCard step={4} title="다시 확인할 수 있게">인용한 출처와 비교한 문장을 다시 찾아볼 수 있도록 구성합니다.</StepCard></Card></section><Banner>정보의 맥락을 읽고, 판단의 근거를 남깁니다.</Banner></main>
}

