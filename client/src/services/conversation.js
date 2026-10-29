export function getOpeningMessage(scenarioId) {
  const openings = {
    transport: { kannada: 'ನಮಸ್ಕಾರ! ನಿಮಗೆ ಹೇಗೆ ಸಹಾಯ ಮಾಡಲಿ?', transliteration: 'Namaskāra! Nimage hēge sahāya māḍali?', english: 'Hello! How can I help you?' },
    shopping: { kannada: 'ನಮಸ್ಕಾರ! ನಿಮಗೆ ಏನು ಬೇಕು?', transliteration: 'Namaskāra! Nimage ēnu bēku?', english: 'Hello! What are you looking for?' },
    healthcare: { kannada: 'ನಮಸ್ಕಾರ, ನಿಮಗೆ ಏನು ತೊಂದರೆ?', transliteration: 'Namaskāra, nimage ēnu tondare?', english: 'Hello, what seems to be the matter?' },
    education: { kannada: 'ನಮಸ್ಕಾರ! ನಿಮಗೆ ಏನು ಬೇಕು?', transliteration: 'Namaskāra! Nimage ēnu bēku?', english: 'Hello! What do you need?' },
    workplace: { kannada: 'ನಮಸ್ಕಾರ! ನಮ್ಮ ತಂಡಕ್ಕೆ ಸ್ವಾಗತ.', transliteration: 'Namaskāra! Namma taṇḍakke svāgata.', english: 'Hello! Welcome to our team.' },
  }
  return openings[scenarioId] ?? openings.transport
}
