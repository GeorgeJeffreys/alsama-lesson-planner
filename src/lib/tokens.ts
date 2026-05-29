// Alsama brand tokens — single source of truth used by all UI components.
export const C = {
  pink:       '#B62A5C',
  pinkHover:  '#9C2351',
  pinkSoft:   '#FBE9F0',
  pinkBorder: '#F0CCD9',
  cream:      '#F5EDE5',
  creamDeep:  '#EFE5DA',
  surface:    '#FFFFFF',
  ink:        '#1A1A1A',
  faint:      '#6E6863',
  faint2:     '#A39C95',
  border:     '#E5DDD3',
  borderSoft: '#EFE8DF',
  amber:      '#E8A636',
  amberSoft:  '#FBF1DD',
  teal:       '#1F7A6C',
  tealSoft:   '#E0F0EC',
} as const;

export const SANS   = '"Sora", system-ui, -apple-system, sans-serif';
export const SCRIPT = '"Sacramento", cursive';

// The six section definitions that match the Alsama lesson template design.
export const SECTION_CONFIG = [
  { title: 'Warm-up & Recap',           timing_minutes: 7  },
  { title: 'New Content',               timing_minutes: 8  },
  { title: 'Check for Understanding',   timing_minutes: 5  },
  { title: 'Independent Practice',      timing_minutes: 25 },
  { title: 'Exit Ticket',               timing_minutes: 5  },
  { title: 'Homework',                  timing_minutes: 0  },
] as const;
