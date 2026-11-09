import clsx from "clsx"
import { useEffect, useRef, useState } from "react"

const PIXELS_PER_SECOND = 30
const MIN_DURATION_SECONDS = 4

interface Props {
  text: string
  className?: string
}

/** Scrolls with faded edges when the text does not fit, otherwise stays still. */
const MarqueeText = ({ text, className }: Props) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const textRef = useRef<HTMLSpanElement>(null)
  const [duration, setDuration] = useState<number | null>(null)

  useEffect(() => {
    const container = containerRef.current
    const content = textRef.current

    if (!container || !content) {
      return
    }

    const measure = () => {
      const { width } = content.getBoundingClientRect()

      setDuration(
        width > container.clientWidth
          ? Math.max(MIN_DURATION_SECONDS, width / PIXELS_PER_SECOND)
          : null,
      )
    }

    const observer = new ResizeObserver(measure)

    observer.observe(container)
    void document.fonts.ready.then(measure)

    return () => observer.disconnect()
  }, [text])

  return (
    <div
      ref={containerRef}
      title={text}
      className={clsx(
        "overflow-hidden whitespace-nowrap",
        duration !== null && "marquee-fade",
        className,
      )}
    >
      <div
        className={clsx("inline-flex", duration !== null && "marquee-track")}
        style={
          duration === null ? undefined : { animationDuration: `${duration}s` }
        }
      >
        <span ref={textRef} className={clsx(duration !== null && "pr-6")}>
          {text}
        </span>
        {duration !== null && (
          <span aria-hidden className="pr-6">
            {text}
          </span>
        )}
      </div>
    </div>
  )
}

export default MarqueeText
