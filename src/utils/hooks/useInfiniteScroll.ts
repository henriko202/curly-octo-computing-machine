"use client"

import { useCallback, useEffect, useRef, useState } from "react"

interface UseInfiniteScrollOptions {
  enabled: boolean
  onLoadMore: () => void
  rootMargin?: string
}

/**
 * Triggers `onLoadMore` when the returned sentinel callback ref enters the viewport.
 * Using a callback ref ensures the IntersectionObserver attaches reliably even when
 * the sentinel mounts conditionally after `enabled` is already true.
 */
export function useInfiniteScroll({ enabled, onLoadMore, rootMargin = "200px" }: UseInfiniteScrollOptions) {
  const [sentinelElement, setSentinelElement] = useState<HTMLDivElement | null>(null)
  const onLoadMoreRef = useRef(onLoadMore)

  useEffect(() => {
    onLoadMoreRef.current = onLoadMore
  }, [onLoadMore])

  useEffect(() => {
    if (!enabled || !sentinelElement || typeof IntersectionObserver === "undefined") {
      return
    }

    const observer = new IntersectionObserver(
      entries => {
        if (entries[0]?.isIntersecting) {
          onLoadMoreRef.current()
        }
      },
      { rootMargin }
    )

    observer.observe(sentinelElement)
    return () => observer.disconnect()
  }, [enabled, sentinelElement, rootMargin])

  return useCallback((node: HTMLDivElement | null) => {
    setSentinelElement(node)
  }, [])
}
