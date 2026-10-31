export const sampleArticle = {
  title: '[판독] ㅇㅇ시, 내년 예산 30% 감액…복지 사업 줄줄이 중단 위기',
  url: 'https://news.example.com/article/2024-0312',
  summary: '일부 내용이 과장됐고, 이름을 밝히지 않은 출처에 많이 기대고 있습니다.',
  description: '기사 속 핵심 주장과 출처를 분리해 확인하고, 문장에 담긴 사실과 해석의 범위를 비교했습니다.',
}

export const sourceRows = [
  { source: '국가통계포털', type: '공공 데이터', date: '2024.03.12', reliability: 92 },
  { source: '한국은행 보도자료', type: '1차 출처', date: '2024.03.11', reliability: 88 },
  { source: '뉴스 아카이브', type: '기사 기록', date: '2024.03.13', reliability: 67 },
]

export const claims = [
  { claim: '내년 예산이 30% 감액된다.', verdict: 'caution' as const, source: '기획재정부 예산안', score: 78, summary: '공개된 예산안에는 일부 사업 조정이 확인되지만 전체 예산이 30% 줄어든다는 근거는 없습니다.' },
  { claim: '복지 사업이 줄줄이 중단된다.', verdict: 'risk' as const, source: '익명 관계자 발언', score: 42, summary: '사업 중단을 뒷받침하는 공식 문서가 확인되지 않아 표현의 범위가 근거보다 넓습니다.' },
  { claim: '지역 복지 예산이 조정될 예정이다.', verdict: 'trust' as const, source: 'ㅇㅇ시 보도자료', score: 86, summary: '지자체가 공개한 보도자료에서 일부 사업의 조정 계획을 확인할 수 있습니다.' },
]

export const imvainItems = [
  { key: 'I', label: '독립성', title: '이 출처는 사건과 이해관계가 없는가', score: 1, color: 'risk' as const, body: '직접적인 관계자가 작성한 자료인지, 제3자 출처인지 확인합니다.' },
  { key: 'M', label: '복수성', title: '기사 속 여러 주장이 같은 내용을 확인하는가', score: 0, color: 'hold' as const, body: '서로 독립된 출처가 같은 사실을 확인하는지 비교합니다.' },
  { key: 'V', label: '공정성', title: '근거를 왜곡하거나 생략하지 않았는가', score: 1, color: 'caution' as const, body: '기사의 인용과 표현이 원자료의 맥락을 보존하는지 확인합니다.' },
  { key: 'A', label: '출처성·정보성', title: '이 주장을 뒷받침하는 출처가 있는가', score: 3, color: 'trust' as const, body: '핵심 수치와 주장을 뒷받침하는 1차 자료의 존재를 확인합니다.' },
  { key: 'N', label: '기명성', title: '이름을 밝힌 발언과 자료인가', score: 2, color: 'caution' as const, body: '익명 발언에 의존하는 정도와 발언 주체의 확인 가능성을 살핍니다.' },
]

export const loadingSteps = [
  '기사 본문 구조 분석',
  '출처와 수치 교차 검증',
  '사실성·맥락 판정 정리',
]

