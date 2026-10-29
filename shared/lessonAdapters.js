export function normalizeSupplementaryLesson({ id, level, topic, lesson }) {
  const lessonId = String(id)

  return {
    ...lesson,
    id: lessonId,
    level,
    topic,
    order: 0,
    module: 'SUPPLEMENTARY LESSON',
    vocabulary: lesson.vocabulary.map((item, index) => ({
      ...item,
      id: `${lessonId}-vocabulary-${index + 1}`,
    })),
    exercises: lesson.exercises.map((exercise, questionIndex) => {
      const options = exercise.options.map((text, optionIndex) => ({
        id: `${lessonId}-question-${questionIndex + 1}-option-${optionIndex + 1}`,
        text,
      }))
      const answer = options.find((option) => option.text === exercise.answer)

      if (!answer) throw new Error('Supplementary lesson answer is not one of its options.')

      return {
        id: `${lessonId}-question-${questionIndex + 1}`,
        type: 'choice',
        prompt: exercise.prompt,
        options,
        answer: answer.id,
        explanation: exercise.explanation,
      }
    }),
    isSupplementary: true,
    supplementaryContent: lesson,
  }
}
