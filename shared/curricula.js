import { lessons as beginnerLessons } from './lessonContent.js'

const intermediateLessons = [
  {
    id: 'intermediate-connectors',
    order: 1,
    title: 'Connect ideas naturally',
    module: 'Build longer thoughts',
    objective: 'Join two short ideas with common Kannada connectors.',
    introduction: 'Kannada often connects clauses with forms that attach to the first verb. Learn a few frequent connectors in complete, natural sentences.',
    vocabulary: [
      { id: 'int-because', kannada: 'ಏಕೆಂದರೆ', transliteration: 'Ēkendare', english: 'Because', usage: 'Introduces a reason. The reason can follow the statement it explains.', example: { kannada: 'ನಾನು ಬರಲಿಲ್ಲ, ಏಕೆಂದರೆ ನನಗೆ ಕೆಲಸವಿತ್ತು.', transliteration: 'Nānu baralilla, ēkendare nanage kelasavittu.', english: 'I did not come because I had work.' } },
      { id: 'int-but', kannada: 'ಆದರೆ', transliteration: 'Ādare', english: 'But; however', usage: 'Contrasts the next idea with what came before it.', example: { kannada: 'ದಾರಿ ದೂರವಿದೆ, ಆದರೆ ಬಸ್ ಇದೆ.', transliteration: 'Dāri dūravide, ādare bas ide.', english: 'The way is far, but there is a bus.' } },
      { id: 'int-after', kannada: 'ಮುಗಿದ ನಂತರ', transliteration: 'Mugida nantara', english: 'After finishing', usage: 'ನಂತರ means “after”; pair it with the completed activity that comes before it.', example: { kannada: 'ಕೆಲಸ ಮುಗಿದ ನಂತರ ಮನೆಗೆ ಹೋಗುತ್ತೇನೆ.', transliteration: 'Kelasa mugida nantara manege hōguttēne.', english: 'I will go home after finishing work.' } },
    ],
    context: 'When explaining why you missed a meeting, give the main point and add a reason with ಏಕೆಂದರೆ. Use ಆದರೆ when you want to add a contrast.',
    summary: ['ಏಕೆಂದರೆ introduces a reason.', 'ಆದರೆ marks a contrast.', 'ನಂತರ helps order events in time.'],
    choice: { prompt: 'Which connector introduces a reason?', answer: 'int-because' },
    matching: ['int-because', 'int-but', 'int-after'],
    fill: { before: 'ನಾನು ಬರಲಿಲ್ಲ, ', after: ' ನನಗೆ ಕೆಲಸವಿತ್ತು.', answer: 'ಏಕೆಂದರೆ', hint: 'Choose the connector meaning “because”.', explanation: 'ಏಕೆಂದರೆ introduces the reason: “because I had work”.' },
    orderingExercise: { prompt: 'Arrange the words to say “I will go home after finishing work.”', items: [{ id: 'home', text: 'ಮನೆಗೆ' }, { id: 'after', text: 'ಮುಗಿದ ನಂತರ' }, { id: 'work', text: 'ಕೆಲಸ' }, { id: 'go', text: 'ಹೋಗುತ್ತೇನೆ' }], answer: ['work', 'after', 'home', 'go'] },
    review: { prompt: 'The route is long, but a bus is available. Which connector fits?', answerId: 'int-but' },
  },
  {
    id: 'intermediate-verb-forms',
    order: 2,
    title: 'Talk about past, present, and plans',
    module: 'Use verb forms in context',
    objective: 'Distinguish a completed action, an ongoing action, and a future plan.',
    introduction: 'Verb endings carry time information. Compare the verb in each example instead of translating every word separately.',
    vocabulary: [
      { id: 'int-past', kannada: 'ನಿನ್ನೆ ನೋಡಿದೆ', transliteration: 'Ninne nōḍide', english: 'I saw it yesterday', usage: 'ನೋಡಿದೆ is a completed past form; ನಿನ್ನೆ anchors the event in yesterday.', example: { kannada: 'ನಿನ್ನೆ ಆ ಚಿತ್ರ ನೋಡಿದೆ.', transliteration: 'Ninne ā citra nōḍide.', english: 'I saw that film yesterday.' } },
      { id: 'int-present', kannada: 'ಈಗ ಓದುತ್ತಿದ್ದೇನೆ', transliteration: 'Īga ōduttiddēne', english: 'I am reading now', usage: 'The -ತ್ತಿದ್ದೇನೆ form describes an action in progress around now.', example: { kannada: 'ನಾನು ಈಗ ವರದಿ ಓದುತ್ತಿದ್ದೇನೆ.', transliteration: 'Nānu īga varadi ōduttiddēne.', english: 'I am reading the report now.' } },
      { id: 'int-future', kannada: 'ನಾಳೆ ಭೇಟಿಯಾಗುತ್ತೇನೆ', transliteration: 'Nāḷe bhēṭiyāguttēne', english: 'I will meet tomorrow', usage: 'The verb form with a future time expression can describe a planned action.', example: { kannada: 'ನಾಳೆ ನಿಮ್ಮನ್ನು ಭೇಟಿಯಾಗುತ್ತೇನೆ.', transliteration: 'Nāḷe nimmannu bhēṭiyāguttēne.', english: 'I will meet you tomorrow.' } },
    ],
    context: 'At work, distinguish what you finished yesterday from what you are reading now and what you plan to do tomorrow.',
    summary: ['ನೋಡಿದೆ describes a completed past action.', 'ಓದುತ್ತಿದ್ದೇನೆ describes an action in progress.', 'ನಾಳೆ ಭೇಟಿಯಾಗುತ್ತೇನೆ expresses a future plan.'],
    choice: { prompt: 'Which expression describes an action happening now?', answer: 'int-present' },
    matching: ['int-past', 'int-present', 'int-future'],
    fill: { before: 'ನಾನು ಈಗ ವರದಿ ', after: '.', answer: 'ಓದುತ್ತಿದ್ದೇನೆ', hint: 'Use the ongoing form of “read”.', explanation: 'ಓದುತ್ತಿದ್ದೇನೆ describes reading that is in progress now.' },
    orderingExercise: { prompt: 'Arrange the words to say “I will meet you tomorrow.”', items: [{ id: 'tomorrow', text: 'ನಾಳೆ' }, { id: 'you', text: 'ನಿಮ್ಮನ್ನು' }, { id: 'meet', text: 'ಭೇಟಿಯಾಗುತ್ತೇನೆ' }], answer: ['tomorrow', 'you', 'meet'] },
    review: { prompt: 'You are describing a report you are reading at this moment. Choose the suitable phrase.', answerId: 'int-present' },
  },
  {
    id: 'intermediate-travel-work',
    order: 3,
    title: 'Navigate travel and work situations',
    module: 'Handle practical conversations',
    objective: 'Ask for clarification and explain a route or work-related need politely.',
    introduction: 'Longer requests are easier to understand when you state the place or need first, then ask a clear follow-up.',
    vocabulary: [
      { id: 'int-directions', kannada: 'ಹೋಗುವ ದಾರಿ', transliteration: 'Hōguva dāri', english: 'The way to go', usage: 'Name a destination before this phrase to ask for its route.', example: { kannada: 'ರೈಲು ನಿಲ್ದಾಣಕ್ಕೆ ಹೋಗುವ ದಾರಿ ಯಾವುದು?', transliteration: 'Railu nildāṇakke hōguva dāri yāvudu?', english: 'Which is the way to the railway station?' } },
      { id: 'int-repeat', kannada: 'ಮತ್ತೊಮ್ಮೆ ಹೇಳಿ', transliteration: 'Mattomme hēḷi', english: 'Please say it once more', usage: 'A polite request for repetition when you have not understood.', example: { kannada: 'ದಯವಿಟ್ಟು ಮತ್ತೊಮ್ಮೆ ಹೇಳಿ.', transliteration: 'Dayaviṭṭu mattomme hēḷi.', english: 'Please say it once more.' } },
      { id: 'int-meeting', kannada: 'ಸಭೆಯನ್ನು ಮುಂದೂಡಬಹುದೇ?', transliteration: 'Sabheyannu mundūḍabahudē?', english: 'Could we postpone the meeting?', usage: 'The -ಬಹುದೇ? form makes a suggestion or request sound less direct.', example: { kannada: 'ಸಭೆಯನ್ನು ನಾಳೆಗೆ ಮುಂದೂಡಬಹುದೇ?', transliteration: 'Sabheyannu nāḷege mundūḍabahudē?', english: 'Could we postpone the meeting until tomorrow?' } },
    ],
    context: 'When directions are unclear, ask the speaker to repeat them. In a professional conversation, the -ಬಹುದೇ? question softens a request.',
    summary: ['State the destination before asking which way to go.', 'ಮತ್ತೊಮ್ಮೆ asks for something to be repeated.', '-ಬಹುದೇ? can soften a suggestion or request.'],
    choice: { prompt: 'Which phrase politely asks someone to repeat what they said?', answer: 'int-repeat' },
    matching: ['int-directions', 'int-repeat', 'int-meeting'],
    fill: { before: 'ದಯವಿಟ್ಟು ', after: '.', answer: 'ಮತ್ತೊಮ್ಮೆ ಹೇಳಿ', hint: 'Ask them to say it once more.', explanation: 'ಮತ್ತೊಮ್ಮೆ ಹೇಳಿ is a polite request to repeat something.' },
    orderingExercise: { prompt: 'Arrange the words to ask which way leads to the railway station.', items: [{ id: 'station', text: 'ರೈಲು ನಿಲ್ದಾಣಕ್ಕೆ' }, { id: 'way', text: 'ಹೋಗುವ ದಾರಿ' }, { id: 'which', text: 'ಯಾವುದು?' }], answer: ['station', 'way', 'which'] },
    review: { prompt: 'You want to suggest moving a meeting to tomorrow without sounding too direct. Which ending helps?', answerId: 'int-meeting' },
  },
  {
    id: 'intermediate-opinions',
    order: 4,
    title: 'Explain an opinion with context',
    module: 'Express and support ideas',
    objective: 'Share a preference and support it with a short reason.',
    introduction: 'Use a preference phrase and a connector to explain your view. Context helps a listener understand why you chose something.',
    vocabulary: [
      { id: 'int-prefer', kannada: 'ನನಗೆ ಹೆಚ್ಚು ಇಷ್ಟ', transliteration: 'Nanage heccu iṣṭa', english: 'I prefer; I like more', usage: 'Compare the options you prefer; more context can clarify what “more” refers to.', example: { kannada: 'ನನಗೆ ಬಸ್‌ಗಿಂತ ರೈಲು ಹೆಚ್ಚು ಇಷ್ಟ.', transliteration: 'Nanage basgiṃta railu heccu iṣṭa.', english: 'I prefer the train to the bus.' } },
      { id: 'int-opinion', kannada: 'ನನ್ನ ಅಭಿಪ್ರಾಯದಲ್ಲಿ', transliteration: 'Nanna abhiprāyadalli', english: 'In my opinion', usage: 'Use this phrase to signal that the following statement is your view.', example: { kannada: 'ನನ್ನ ಅಭಿಪ್ರಾಯದಲ್ಲಿ ಈ ಯೋಜನೆ ಉಪಯುಕ್ತವಾಗಿದೆ.', transliteration: 'Nanna abhiprāyadalli ī yōjane upayuktavāgide.', english: 'In my opinion, this plan is useful.' } },
      { id: 'int-reason', kannada: 'ಆದ್ದರಿಂದ', transliteration: 'Āddarinda', english: 'Therefore; for that reason', usage: 'Introduces a conclusion or result that follows from the earlier reason.', example: { kannada: 'ರೈಲು ವೇಗವಾಗಿದೆ, ಆದ್ದರಿಂದ ಅದನ್ನು ಆಯ್ಕೆ ಮಾಡಿದೆ.', transliteration: 'Railu vēgavāgide, āddarinda adannu āyke māḍide.', english: 'The train is fast, so I chose it.' } },
    ],
    context: 'When recommending a travel option, state your preference and add a reason so the listener can follow your decision.',
    summary: ['ನನ್ನ ಅಭಿಪ್ರಾಯದಲ್ಲಿ marks a personal view.', 'ಹೆಚ್ಚು ಇಷ್ಟ expresses a preference.', 'ಆದ್ದರಿಂದ introduces a result or conclusion.'],
    choice: { prompt: 'Which phrase means “In my opinion”?', answer: 'int-opinion' },
    matching: ['int-prefer', 'int-opinion', 'int-reason'],
    fill: { before: 'ರೈಲು ವೇಗವಾಗಿದೆ, ', after: ' ಅದನ್ನು ಆಯ್ಕೆ ಮಾಡಿದೆ.', answer: 'ಆದ್ದರಿಂದ', hint: 'Choose the connector meaning “therefore”.', explanation: 'ಆದ್ದರಿಂದ introduces the result: “therefore I chose it”.' },
    orderingExercise: { prompt: 'Arrange the words to say “In my opinion, this plan is useful.”', items: [{ id: 'opinion', text: 'ನನ್ನ ಅಭಿಪ್ರಾಯದಲ್ಲಿ' }, { id: 'plan', text: 'ಈ ಯೋಜನೆ' }, { id: 'useful', text: 'ಉಪಯುಕ್ತವಾಗಿದೆ' }], answer: ['opinion', 'plan', 'useful'] },
    review: { prompt: 'You want to introduce your own view before giving a reason. Which expression fits?', answerId: 'int-opinion' },
  },
]

const advancedLessons = [
  {
    id: 'advanced-register',
    order: 1,
    title: 'Choose a register that fits',
    module: 'Nuance and register',
    objective: 'Compare formal and conversational phrasing and choose language appropriate to the relationship.',
    introduction: 'A grammatically correct sentence can still feel too blunt or too formal. Notice the effect of respectful forms and softening phrases.',
    vocabulary: [
      { id: 'adv-request', kannada: 'ದಯವಿಟ್ಟು ಪರಿಶೀಲಿಸಬಹುದೇ?', transliteration: 'Dayaviṭṭu pariśīlisabahudē?', english: 'Could you please review it?', usage: 'The polite request with -ಬಹುದೇ? invites action without making a direct demand.', example: { kannada: 'ಸಮಯ ಸಿಕ್ಕಾಗ ದಯವಿಟ್ಟು ಇದನ್ನು ಪರಿಶೀಲಿಸಬಹುದೇ?', transliteration: 'Samaya sikkāga dayaviṭṭu idannu pariśīlisabahudē?', english: 'When you have time, could you please review this?' } },
      { id: 'adv-casual', kannada: 'ಒಮ್ಮೆ ನೋಡುತ್ತೀಯಾ?', transliteration: 'Omme nōḍuttīyā?', english: 'Could you take a look? (informal)', usage: 'An informal, casual singular form for a familiar peer; avoid it with a customer or senior colleague.', example: { kannada: 'ಈ ಕರಡನ್ನು ಒಮ್ಮೆ ನೋಡುತ್ತೀಯಾ?', transliteration: 'Ī karaḍannu omme nōḍuttīyā?', english: 'Could you take a look at this draft?' } },
      { id: 'adv-softener', kannada: 'ಸಾಧ್ಯವಾದರೆ', transliteration: 'Sādhyavādare', english: 'If possible', usage: 'Softens a request by acknowledging that the other person may not be able to do it.', example: { kannada: 'ಸಾಧ್ಯವಾದರೆ ಇಂದು ಉತ್ತರಿಸಿ.', transliteration: 'Sādhyavādare indu uttarsi.', english: 'If possible, please reply today.' } },
    ],
    context: 'Use the respectful request with a client or senior colleague. The casual question is more suitable among close peers.',
    summary: ['-ಬಹುದೇ? softens a request.', 'Casual second-person endings depend on familiarity.', 'ಸಾಧ್ಯವಾದರೆ signals flexibility.'],
    choice: { prompt: 'Which request is better suited to a client or senior colleague?', answer: 'adv-request' },
    matching: ['adv-request', 'adv-casual', 'adv-softener'],
    fill: { before: 'ಸಮಯ ಸಿಕ್ಕಾಗ ದಯವಿಟ್ಟು ಇದನ್ನು ', after: '?', answer: 'ಪರಿಶೀಲಿಸಬಹುದೇ', hint: 'Use the polite “could you review?” form.', explanation: 'ಪರಿಶೀಲಿಸಬಹುದೇ? is a respectful, softened request.' },
    orderingExercise: { prompt: 'Arrange the words to make a softened request: “If possible, reply today.”', items: [{ id: 'if-possible', text: 'ಸಾಧ್ಯವಾದರೆ' }, { id: 'today', text: 'ಇಂದು' }, { id: 'reply', text: 'ಉತ್ತರಿಸಿ' }], answer: ['if-possible', 'today', 'reply'] },
    review: { prompt: 'You are writing to a senior colleague. Which style is more appropriate?', answerId: 'adv-request' },
  },
  {
    id: 'advanced-idioms',
    order: 2,
    title: 'Read idioms in context',
    module: 'Idioms and implied meaning',
    objective: 'Infer a familiar figurative expression from its surrounding context.',
    introduction: 'Idiomatic meaning is not always the sum of individual words. Use the situation and nearby clues before choosing a translation.',
    vocabulary: [
      { id: 'adv-hand', kannada: 'ಕೈಜೋಡಿಸು', transliteration: 'Kaijōḍisu', english: 'To join hands; to cooperate', usage: 'Literally “join hands”; in collaborative contexts it means to work together.', example: { kannada: 'ಈ ಕೆಲಸದಲ್ಲಿ ಎಲ್ಲರೂ ಕೈಜೋಡಿಸಿದರು.', transliteration: 'Ī kelasadalli ellarū kaijōḍisidaru.', english: 'Everyone joined hands (cooperated) in this work.' } },
      { id: 'adv-heart', kannada: 'ಮನಸ್ಸಿಗೆ ಹತ್ತಿರ', transliteration: 'Manassige hattira', english: 'Close to the heart; personally meaningful', usage: 'Describes a person, place, or cause that matters deeply to someone.', example: { kannada: 'ಈ ಊರು ನನಗೆ ಮನಸ್ಸಿಗೆ ಹತ್ತಿರವಾಗಿದೆ.', transliteration: 'Ī ūru nanage manassige hattiravāgide.', english: 'This town is close to my heart.' } },
      { id: 'adv-balance', kannada: 'ಸಮತೋಲನ ಕಾಪಾಡು', transliteration: 'Samatōlana kāpāḍu', english: 'To maintain balance', usage: 'Used literally for balance and figuratively for keeping competing demands manageable.', example: { kannada: 'ಕೆಲಸ ಮತ್ತು ವಿಶ್ರಾಂತಿಯ ನಡುವೆ ಸಮತೋಲನ ಕಾಪಾಡಬೇಕು.', transliteration: 'Kelasa mattu viśrāṃtiya naḍuve samatōlana kāpāḍabēku.', english: 'We should maintain a balance between work and rest.' } },
    ],
    context: 'A team shares a demanding project and everyone contributes: ಕೈಜೋಡಿಸು here means cooperate, not only physically join hands.',
    summary: ['ಕೈಜೋಡಿಸು can mean cooperate.', 'ಮನಸ್ಸಿಗೆ ಹತ್ತಿರ signals personal importance.', 'Context distinguishes literal and figurative meanings.'],
    choice: {
      prompt: 'In a team project, what does ಎಲ್ಲರೂ ಕೈಜೋಡಿಸಿದರು most likely mean?',
      options: [{ id: 'cooperated', text: 'Everyone cooperated' }, { id: 'joined-physically', text: 'Everyone stood in a line' }, { id: 'left', text: 'Everyone left' }],
      answerId: 'cooperated',
    },
    matching: ['adv-hand', 'adv-heart', 'adv-balance'],
    fill: { before: 'ಈ ಕೆಲಸದಲ್ಲಿ ಎಲ್ಲರೂ ', after: '.', answer: 'ಕೈಜೋಡಿಸಿದರು', hint: 'Use the past plural form of “cooperate”.', explanation: 'ಕೈಜೋಡಿಸಿದರು means everyone cooperated in this context.' },
    orderingExercise: { prompt: 'Arrange the words to say “This town is close to my heart.”', items: [{ id: 'town', text: 'ಈ ಊರು' }, { id: 'me', text: 'ನನಗೆ' }, { id: 'heart', text: 'ಮನಸ್ಸಿಗೆ ಹತ್ತಿರವಾಗಿದೆ' }], answer: ['town', 'me', 'heart'] },
    review: { prompt: 'A person is managing work and rest well. Which expression describes this?', answer: 'ಸಮತೋಲನ ಕಾಪಾಡು' },
  },
  {
    id: 'advanced-complex-ideas',
    order: 3,
    title: 'Build a reasoned explanation',
    module: 'Complex sentences and argument',
    objective: 'Contrast evidence with a conclusion and qualify an opinion appropriately.',
    introduction: 'Longer explanations are clearer when you mark contrast, evidence, and conclusion. These connectors help listeners follow your reasoning.',
    vocabulary: [
      { id: 'adv-although', kannada: 'ಆದರೂ', transliteration: 'Ādarū', english: 'Although; even so', usage: 'Introduces a concession: the following point remains true despite an earlier fact.', example: { kannada: 'ಸಮಯ ಕಡಿಮೆ ಇದ್ದರೂ, ವರದಿಯನ್ನು ಪೂರ್ಣಗೊಳಿಸಿದೆ.', transliteration: 'Samaya kaḍime iddarū, varadiyannu pūrṇagoḷiside.', english: 'Although time was short, I completed the report.' } },
      { id: 'adv-evidence', kannada: 'ಇದರಿಂದ ಸ್ಪಷ್ಟವಾಗುವುದು', transliteration: 'Idariṃda spaṣṭavāguvudu', english: 'What becomes clear from this', usage: 'Introduces an inference drawn from evidence already presented.', example: { kannada: 'ಇದರಿಂದ ಸ್ಪಷ್ಟವಾಗುವುದು ಯೋಜನೆಗೆ ಇನ್ನಷ್ಟು ಸಮಯ ಬೇಕು ಎಂಬುದು.', transliteration: 'Idariṃda spaṣṭavāguvudu yōjanegē innaṣṭu samaya bēku embudu.', english: 'What becomes clear is that the plan needs more time.' } },
      { id: 'adv-qualified', kannada: 'ನನ್ನ ದೃಷ್ಟಿಯಲ್ಲಿ', transliteration: 'Nanna dṛṣṭiyalli', english: 'From my perspective', usage: 'Frames an assessment as a perspective rather than an absolute claim.', example: { kannada: 'ನನ್ನ ದೃಷ್ಟಿಯಲ್ಲಿ ಈ ಬದಲಾವಣೆ ಅಗತ್ಯವಾಗಿದೆ.', transliteration: 'Nanna dṛṣṭiyalli ī badalāvaṇe agatyavāgide.', english: 'From my perspective, this change is necessary.' } },
    ],
    context: 'In a project review, acknowledge the limited time, state what the evidence suggests, then present your conclusion as a perspective.',
    summary: ['ಆದರೂ marks a concession.', 'ಇದರಿಂದ ಸ್ಪಷ್ಟವಾಗುವುದು introduces an inference.', 'ನನ್ನ ದೃಷ್ಟಿಯಲ್ಲಿ qualifies an opinion.'],
    choice: { prompt: 'Which connector introduces a point that holds despite a concession?', answerId: 'adv-although' },
    matching: ['adv-although', 'adv-evidence', 'adv-qualified'],
    fill: { before: 'ಸಮಯ ಕಡಿಮೆ ಇದ್ದರೂ, ವರದಿಯನ್ನು ', after: '.', answer: 'ಪೂರ್ಣಗೊಳಿಸಿದೆ', hint: 'Complete the past action “I completed”.', explanation: 'ಪೂರ್ಣಗೊಳಿಸಿದೆ means “I completed it”.' },
    orderingExercise: { prompt: 'Arrange the words to say “From my perspective, this change is necessary.”', items: [{ id: 'perspective', text: 'ನನ್ನ ದೃಷ್ಟಿಯಲ್ಲಿ' }, { id: 'change', text: 'ಈ ಬದಲಾವಣೆ' }, { id: 'necessary', text: 'ಅಗತ್ಯವಾಗಿದೆ' }], answer: ['perspective', 'change', 'necessary'] },
    review: { prompt: 'You need to present an inference based on evidence. Which phrase introduces it?', answerId: 'adv-evidence' },
  },
  {
    id: 'advanced-reading',
    order: 4,
    title: 'Comprehend a professional update',
    module: 'Reading and professional communication',
    objective: 'Identify sequence, cause, and recommendation in a longer workplace update.',
    introduction: 'Read the whole passage for its structure: a task was delayed, a cause is given, and a next step is recommended.',
    reading: 'ಪೂರೈಕೆ ತಡವಾದುದರಿಂದ ಕೆಲಸ ಪೂರ್ಣಗೊಳ್ಳಲು ಹೆಚ್ಚುವರಿ ಸಮಯ ಬೇಕಾಯಿತು. ಆದರೂ ತಂಡವು ಮುಖ್ಯ ಹಂತಗಳನ್ನು ಮುಗಿಸಿದೆ. ಮುಂದಿನ ಸಭೆಗೆ ಮುನ್ನ ಉಳಿದ ಭಾಗವನ್ನು ಪರಿಶೀಲಿಸುವುದು ಸೂಕ್ತ.',
    readingTransliteration: 'Pūraike taḍavādadariṃda kelasa pūrṇagoḷḷalu heccuvari samaya bēkāyitu. Ādarū taṃḍavu mukhya haṃṭagaḷannu mugiside. Muṃdina sabhege munna uḷida bhāgavannu pariśīlisuvudu sūkta.',
    readingMeaning: 'Because the delivery was delayed, additional time was needed to complete the work. Even so, the team finished the main stages. It would be appropriate to review the remaining part before the next meeting.',
    vocabulary: [
      { id: 'adv-delay', kannada: 'ತಡವಾದುದರಿಂದ', transliteration: 'Taḍavādadariṃda', english: 'Because it was delayed', usage: 'A cause-marking form that links a delay to its consequence.', example: { kannada: 'ಪೂರೈಕೆ ತಡವಾದುದರಿಂದ ಕೆಲಸ ನಿಂತಿತು.', transliteration: 'Pūraike taḍavādadariṃda kelasa nintitu.', english: 'The work stopped because the delivery was delayed.' } },
      { id: 'adv-even-so', kannada: 'ಆದರೂ', transliteration: 'Ādarū', english: 'Even so; nevertheless', usage: 'Signals that the next fact is true despite the preceding difficulty.', example: { kannada: 'ಸಮಯ ಕಡಿಮೆ ಇತ್ತು. ಆದರೂ ನಾವು ಮುಗಿಸಿದೆವು.', transliteration: 'Samaya kaḍime ittu. Ādarū nāvu mugisidevu.', english: 'There was little time. Even so, we finished.' } },
      { id: 'adv-appropriate', kannada: 'ಸೂಕ್ತ', transliteration: 'Sūkta', english: 'Appropriate; advisable', usage: 'A measured way to recommend an action in formal or professional contexts.', example: { kannada: 'ಸಭೆಗೆ ಮುನ್ನ ಪರಿಶೀಲಿಸುವುದು ಸೂಕ್ತ.', transliteration: 'Sabhege munna pariśīlisuvudu sūkta.', english: 'It is advisable to review it before the meeting.' } },
    ],
    context: 'Use a concise update like this when explaining a delay to colleagues while keeping the tone constructive and focused on next steps.',
    summary: ['ತಡವಾದುದರಿಂದ introduces the cause.', 'ಆದರೂ marks a contrast with the delay.', 'ಸೂಕ್ತ presents a measured recommendation.'],
    choice: {
      prompt: 'According to the passage, what should happen before the next meeting?',
      options: [{ id: 'review', text: 'Review the remaining part' }, { id: 'restart', text: 'Restart all completed stages' }, { id: 'cancel', text: 'Cancel the next meeting' }],
      answerId: 'review',
    },
    matching: ['adv-delay', 'adv-even-so', 'adv-appropriate'],
    fill: { before: 'ಮುಂದಿನ ಸಭೆಗೆ ಮುನ್ನ ಉಳಿದ ಭಾಗವನ್ನು ಪರಿಶೀಲಿಸುವುದು ', after: '.', answer: 'ಸೂಕ್ತ', hint: 'Choose the word meaning “appropriate” or “advisable”.', explanation: 'ಸೂಕ್ತ describes the review as an appropriate next step.' },
    orderingExercise: { prompt: 'Arrange the ideas in the same order as the passage.', items: [{ id: 'cause', text: 'ಪೂರೈಕೆ ತಡವಾಯಿತು' }, { id: 'progress', text: 'ತಂಡವು ಮುಖ್ಯ ಹಂತಗಳನ್ನು ಮುಗಿಸಿತು' }, { id: 'next', text: 'ಉಳಿದ ಭಾಗವನ್ನು ಪರಿಶೀಲಿಸಬೇಕು' }], answer: ['cause', 'progress', 'next'] },
    review: { prompt: 'Which word signals “even so” after the delay?', answer: 'ಆದರೂ' },
  },
]

function createExercises(definition) {
  const terms = definition.vocabulary
  const choiceOptions = definition.choice.options ?? terms.map(({ id, english }) => ({ id, text: english }))
  const reviewOptions = definition.review.options ?? terms.map(({ id, kannada }) => ({ id, text: kannada }))

  return [
    {
      id: `${definition.id}-meaning`,
      type: 'choice',
      prompt: definition.choice.prompt,
      options: choiceOptions,
      answer: definition.choice.answerId ?? terms.find(({ id, english }) => (
        id === definition.choice.answer || english === definition.choice.answer
      ))?.id ?? choiceOptions.find(({ text }) => text === definition.choice.answer)?.id,
      explanation: definition.choice.explanation ?? terms.find(({ id, english }) => (
        id === definition.choice.answer || english === definition.choice.answer
      ))?.usage ?? definition.summary.join(' '),
    },
    {
      id: `${definition.id}-match`,
      type: 'matching',
      prompt: definition.matchPrompt ?? 'Match each Kannada expression to its meaning.',
      leftItems: terms.map(({ id, kannada }) => ({ id, text: kannada })),
      rightItems: terms.map(({ id, english }) => ({ id, text: english })),
      answer: terms.map(({ id }) => ({ leftId: id, rightId: id })),
      explanation: terms.map(({ kannada, english }) => `${kannada} = ${english}`).join('; '),
    },
    {
      id: `${definition.id}-fill`,
      type: 'fill',
      prompt: definition.fill.prompt ?? 'Complete the expression.',
      before: definition.fill.before,
      after: definition.fill.after,
      answer: definition.fill.answer,
      hint: definition.fill.hint,
      explanation: definition.fill.explanation,
    },
    {
      id: `${definition.id}-order`,
      type: 'order',
      prompt: definition.orderingExercise.prompt,
      items: definition.orderingExercise.items,
      answer: definition.orderingExercise.answer,
      explanation: definition.orderingExercise.explanation ?? terms[0].example.kannada,
    },
    {
      id: `${definition.id}-review`,
      type: 'review',
      prompt: definition.review.prompt,
      options: reviewOptions,
      answer: definition.review.answerId ?? terms.find(({ kannada, english }) => (
        kannada === definition.review.answer || english === definition.review.answer
      ))?.id ?? reviewOptions.find(({ text }) => text === definition.review.answer)?.id,
      explanation: definition.review.explanation ?? definition.summary.join(' '),
    },
  ]
}

function buildLesson(definition, level) {
  return { ...definition, level, exercises: createExercises(definition) }
}

const beginner = beginnerLessons.map((lesson) => ({
  ...lesson,
  level: 'beginner',
  ...(lesson.id === 'greetings' ? {
    readingGuide: {
      title: 'A first look at Kannada letters',
      explanation: 'Kannada is read from left to right. A consonant such as ಕ is read with an inherent “a” sound; the vowel sign ಾ changes it to ಕಾ (“kā”). Vowel signs attach to consonants to form syllables.',
      examples: [
        { kannada: 'ಕ', transliteration: 'ka', meaning: 'consonant with its inherent vowel' },
        { kannada: 'ಕಾ', transliteration: 'kā', meaning: 'the same consonant with the long ā vowel sign' },
      ],
    },
  } : {}),
}))
const intermediate = intermediateLessons.map((definition) => buildLesson(definition, 'intermediate'))
const advanced = advancedLessons.map((definition) => buildLesson(definition, 'advanced'))

export const curriculaByLevel = new Map([
  ['beginner', { level: 'beginner', label: 'Beginner', description: 'Build foundations with reading support, useful words, and short everyday sentences.', modules: [...new Set(beginner.map(({ module }) => module))], lessons: beginner }],
  ['intermediate', { level: 'intermediate', label: 'Intermediate', description: 'Connect ideas, use varied verb forms, and handle longer real-world conversations.', modules: [...new Set(intermediate.map(({ module }) => module))], lessons: intermediate }],
  ['advanced', { level: 'advanced', label: 'Advanced', description: 'Work with nuance, register, idioms, complex explanations, and longer reading.', modules: [...new Set(advanced.map(({ module }) => module))], lessons: advanced }],
])

export const allLessons = [...beginner, ...intermediate, ...advanced]
export const allLessonIds = allLessons.map(({ id }) => id)
export const allVocabularyIds = [...new Set(allLessons.flatMap(({ vocabulary }) => vocabulary.map(({ id }) => id)))]
export const allLessonsById = new Map(allLessons.map((lesson) => [lesson.id, lesson]))
