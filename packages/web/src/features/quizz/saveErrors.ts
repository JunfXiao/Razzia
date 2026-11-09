export interface SaveIssue {
  questionIndex: number | null
  message: string
}

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null

const collectMessages = (node: unknown): string[] => {
  if (!isRecord(node)) {
    return []
  }

  if (typeof node.message === "string") {
    return [node.message]
  }

  // `ref` points at a DOM element, which holds no further errors.
  return Object.entries(node)
    .filter(([key]) => key !== "ref")
    .flatMap(([, value]) => collectMessages(value))
}

/** Flattens react-hook-form errors into one list, in question order. */
export const collectSaveIssues = (errors: unknown): SaveIssue[] => {
  if (!isRecord(errors)) {
    return []
  }

  const { questions, ...general } = errors
  const issues: SaveIssue[] = collectMessages(general).map((message) => ({
    questionIndex: null,
    message,
  }))

  if (Array.isArray(questions)) {
    questions.forEach((question: unknown, questionIndex) => {
      new Set(collectMessages(question)).forEach((message) => {
        issues.push({ questionIndex, message })
      })
    })
  } else {
    collectMessages(questions).forEach((message) => {
      issues.push({ questionIndex: null, message })
    })
  }

  return issues
}
