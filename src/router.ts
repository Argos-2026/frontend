import { useCallback, useEffect, useState } from 'react'

export type RoutePath = '/' | '/loading' | '/summary' | '/result' | '/about'
export type AppRoute = {
  path: RoutePath
  analysisId?: string
  isDemo?: boolean
}

export function normalizePath(pathname: string, search = ''): AppRoute {
  const analysisRoute = pathname.match(/^\/(loading|summary|result)\/([^/]+)$/)
  if (analysisRoute) {
    return {
      path: `/${analysisRoute[1]}` as '/loading' | '/summary' | '/result',
      analysisId: decodeURIComponent(analysisRoute[2]),
      isDemo: new URLSearchParams(search).get('demo') === '1',
    }
  }

  if (pathname === '/about') return { path: '/about' }
  return { path: '/' }
}

export function navigate(path: string) {
  window.history.pushState({}, '', path)
  window.dispatchEvent(new PopStateEvent('popstate'))
}

export function useRoute() {
  const [route, setRoute] = useState<AppRoute>(() => normalizePath(window.location.pathname, window.location.search))

  useEffect(() => {
    const onPopState = () => setRoute(normalizePath(window.location.pathname, window.location.search))
    window.addEventListener('popstate', onPopState)
    return () => window.removeEventListener('popstate', onPopState)
  }, [])

  const go = useCallback((nextPath: string) => navigate(nextPath), [])
  return { route, navigate: go }
}

