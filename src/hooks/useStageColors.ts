import { useEffect, useState } from 'react'

/**
 * The design tokens the 3D layer draws with, read from the live CSS custom
 * properties so the stage and the page can never disagree about a colour —
 * including after the visitor's colour scheme changes mid-session.
 */
export interface StageColors {
  data: string
  grant: string
  withdraw: string
  purpose: string
  ink: string
  inkSoft: string
  inkMuted: string
  hairline: string
  paper: string
  paperRaised: string
}

const tokens: Record<keyof StageColors, string> = {
  data: '--c-data',
  grant: '--c-grant',
  withdraw: '--c-withdraw',
  purpose: '--c-purpose',
  ink: '--ink',
  inkSoft: '--ink-soft',
  inkMuted: '--ink-muted',
  hairline: '--hairline-strong',
  paper: '--paper',
  paperRaised: '--paper-raised',
}

function read(): StageColors {
  const style = getComputedStyle(document.documentElement)
  const out = {} as StageColors
  for (const key of Object.keys(tokens) as (keyof StageColors)[]) {
    out[key] = style.getPropertyValue(tokens[key]).trim() || '#808080'
  }
  return out
}

export function useStageColors(): StageColors {
  const [colors, setColors] = useState(read)

  useEffect(() => {
    const query = window.matchMedia('(prefers-color-scheme: dark)')
    const onChange = () => setColors(read())
    query.addEventListener('change', onChange)
    return () => query.removeEventListener('change', onChange)
  }, [])

  return colors
}
