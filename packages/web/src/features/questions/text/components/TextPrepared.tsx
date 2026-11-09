import { TextCursorInput } from "lucide-react"

const TextPrepared = () => (
  <div className="anim-quizz flex h-32 w-80 items-center rounded-2xl bg-gray-700 px-10">
    <div className="flex h-14 w-full items-center rounded-lg bg-white px-4">
      <TextCursorInput className="text-primary size-8" />
    </div>
  </div>
)

export default TextPrepared
