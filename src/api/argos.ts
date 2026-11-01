// Keep API calls on the frontend origin so local development and Vercel do not
// depend on the API server allowing every frontend origin through CORS.
const DEFAULT_API_BASE_URL = '/argos-api'

export const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || DEFAULT_API_BASE_URL).replace(/\/$/, '')
export const DEMO_ARTICLE_URL = 'https://www.newspim.com/news/view/20251127000764'

export function isDemoArticleUrl(articleUrl: string) {
  return articleUrl.trim() === DEMO_ARTICLE_URL
}

export type AnalysisStatus = 'QUEUED' | 'RUNNING' | 'COMPLETED' | 'PARTIAL_COMPLETED' | 'FAILED'
export type AnalysisStage =
  | 'FETCHING_ARTICLE'
  | 'EXTRACTING_CLAIMS'
  | 'RETRIEVING_EVIDENCE'
  | 'SELECTING_EVIDENCE'
  | 'VERIFYING_CLAIMS'
  | 'ASSESSING_SOURCES'
  | 'AGGREGATING_RESULT'

export type CriterionStatus = 'MET' | 'NOT_MET' | 'UNKNOWN'
export type CrossReportVerdict = 'MATCHED' | 'CONTRADICTED' | 'MIXED' | 'UNCONFIRMED'
export type ReportComparisonStance = 'MATCHES' | 'CONTRADICTS'
export type ArticleSourceType = 'PERSON' | 'ORGANIZATION' | 'DOCUMENT' | 'OTHER'

export type Issue = {
  code: string
  stage: AnalysisStage | string
  message: string
}

export type AnalysisAcceptedResponse = {
  analysisId: string
  status: AnalysisStatus
  createdAt: string
  expiresAt: string
}

export type AnalysisStatusResponse = {
  analysisId: string
  status: AnalysisStatus
  activeStages: AnalysisStage[]
  expiresAt: string
  warnings: Issue[]
  error: Issue | null
}

export type Article = {
  url: string
  title: string
  publisher: string | null
  author: string | null
  publishedAt: string | null
}

export type Summary = {
  overallComment: string
  crossReportOverview: string
  sourceAssessmentOverview: string | null
  unverifiedPoints: string[]
}

export type ReportComparison = {
  evidenceId: string
  stance: ReportComparisonStance
  reason: string
}

export type CrossReport = {
  claimId: string
  text: string
  verdict: CrossReportVerdict
  reason: string
  matchingCount: number
  contradictingCount: number
  comparisons: ReportComparison[]
  analysisFailed: boolean
}

export type Evidence = {
  evidenceId: string
  title: string
  publisher: string | null
  url: string
  publishedAt: string | null
  excerpt: string
}

export type Criterion = {
  status: CriterionStatus
  reason: string
  evidenceIds: string[]
}

export const IMVAIN_KEYS = ['independent', 'multiple', 'verify', 'authoritative', 'informed', 'named'] as const
export type ImvainKey = (typeof IMVAIN_KEYS)[number]

export type ReviewedSource = {
  sourceId: string
  name: string
  affiliation: string | null
  type: ArticleSourceType
  citedInArticle: string
  verificationNote: string
  // The API describes this as additional properties, one entry for each IMVAIN criterion.
  imvain: Partial<Record<ImvainKey, Criterion>> & Record<string, Criterion>
  assessmentFailed: boolean
}

export type SourceAssessment = {
  claimId: string
  text: string
  sources: ReviewedSource[]
}

export type AnalysisResult = {
  analysisId: string
  status: AnalysisStatus
  article: Article
  summary: Summary
  crossReports: CrossReport[]
  sourceAssessments: SourceAssessment[]
  evidence: Evidence[]
  warnings: Issue[]
}

type ApiErrorBody = {
  error?: {
    code?: string
    message?: string
  }
}

export class ArgosApiError extends Error {
  readonly status: number
  readonly code: string

  constructor(status: number, code: string, message: string) {
    super(message)
    this.name = 'ArgosApiError'
    this.status = status
    this.code = code
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers: {
      Accept: 'application/json',
      ...(init?.body ? { 'Content-Type': 'application/json' } : {}),
      ...init?.headers,
    },
  })

  let body: T | ApiErrorBody | null = null
  try {
    body = await response.json() as T | ApiErrorBody
  } catch {
    body = null
  }

  if (import.meta.env.DEV) {
    console.log('[Argos API response]', {
      method: init?.method || 'GET',
      path,
      status: response.status,
      ok: response.ok,
      body,
    })
  }

  if (!response.ok) {
    const errorBody = body as ApiErrorBody | null
    throw new ArgosApiError(
      response.status,
      errorBody?.error?.code || `HTTP_${response.status}`,
      errorBody?.error?.message || 'API 요청을 처리하지 못했습니다.',
    )
  }

  return body as T
}

export function createAnalysis(articleUrl: string) {
  const basePath = isDemoArticleUrl(articleUrl) ? '/api/v1/demo/analyses' : '/api/v1/analyses'
  return request<AnalysisAcceptedResponse>(basePath, {
    method: 'POST',
    body: JSON.stringify({ articleUrl }),
  })
}

export function getAnalysisStatus(analysisId: string, isDemo = false) {
  const basePath = isDemo ? '/api/v1/demo/analyses' : '/api/v1/analyses'
  return request<AnalysisStatusResponse>(`${basePath}/${encodeURIComponent(analysisId)}`)
}

export function getAnalysisResult(analysisId: string, isDemo = false) {
  const basePath = isDemo ? '/api/v1/demo/analyses' : '/api/v1/analyses'
  return request<AnalysisResult>(`${basePath}/${encodeURIComponent(analysisId)}/result`)
}

export function getApiErrorMessage(error: unknown) {
  if (error instanceof ArgosApiError) return error.message
  if (error instanceof TypeError) return 'API 서버에 연결할 수 없습니다. 잠시 후 다시 시도해 주세요.'
  if (error instanceof Error) return error.message
  return '알 수 없는 오류가 발생했습니다.'
}
