export const scenarios = [
  { id: 'transport', name: 'Transportation', description: 'Find your way, catch a bus, and get where you need to go.' },
  { id: 'shopping', name: 'Shopping', description: 'Browse local shops and ask about the things you love.' },
  { id: 'healthcare', name: 'Healthcare', description: 'Share what you need and understand simple questions.' },
  { id: 'education', name: 'Education', description: 'Feel at home in class, on campus, and around school.' },
  { id: 'workplace', name: 'Workplace', description: 'Make introductions and small moments at work easier.' },
]

export const scenarioIds = scenarios.map((scenario) => scenario.id)
export const scenarioNames = new Map(scenarios.map(({ id, name }) => [id, name]))
