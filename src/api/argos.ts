const DEFAULT_API_BASE_URL = 'https://api.argos.o-r.kr'

export const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || DEFAULT_API_BASE_URL).replace(/\/$/, '')

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
export type ClaimVerdict = 'SUPPORT' | 'REFUTE' | 'CONFLICT' | 'INSUFFICIENT'
export type EvidenceStance = 'SUPPORTS' | 'REFUTES' | 'CONTEXT'
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
  factCheckOverview: string
  sourceAssessmentOverview: string | null
  unverifiedPoints: string[]
}

export type EvidenceLink = {
  evidenceId: string
  stance: EvidenceStance
}

export type Claim = {
  claimId: string
  text: string
  verdict: ClaimVerdict
  reason: string
  articleSourceIds: string[]
  evidenceLinks: EvidenceLink[]
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

export type ArticleSource = {
  sourceId: string
  name: string
  type: ArticleSourceType
  citedInArticle: string
  verificationNote: string
  // The API describes this as additional properties. The product contract guarantees these six keys,
  // while the index signature keeps the client tolerant of future criteria.
  imvain: Partial<Record<ImvainKey, Criterion>> & Record<string, Criterion>
}

export type AnalysisResult = {
  analysisId: string
  status: AnalysisStatus
  analysisOutcome: string
  article: Article
  summary: Summary
  claims: Claim[]
  evidence: Evidence[]
  articleSources: ArticleSource[] | null
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
  return request<AnalysisAcceptedResponse>('/api/v1/analyses', {
    method: 'POST',
    body: JSON.stringify({ articleUrl }),
  })
}

export function getAnalysisStatus(analysisId: string) {
  return request<AnalysisStatusResponse>(`/api/v1/analyses/${encodeURIComponent(analysisId)}`)
}

export function getAnalysisResult(analysisId: string) {
  return request<AnalysisResult>(`/api/v1/analyses/${encodeURIComponent(analysisId)}/result`)
}

export function getApiErrorMessage(error: unknown) {
  if (error instanceof ArgosApiError) return error.message
  if (error instanceof TypeError) return 'API 서버에 연결할 수 없습니다. 잠시 후 다시 시도해 주세요.'
  if (error instanceof Error) return error.message
  return '알 수 없는 오류가 발생했습니다.'
}
