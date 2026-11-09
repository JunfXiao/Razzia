import type { EstimationQuestionOptions } from "@razzia/common/types/game"
import {
  buildHistogram,
  formatValue,
} from "@razzia/web/features/questions/estimation/utils"
import { useTranslation } from "react-i18next"

const BAR_MAX_PERCENT = 85

interface Props {
  responses: Record<number, number>
  options: EstimationQuestionOptions
}

const EstimationDistribution = ({ responses, options }: Props) => {
  const { min, max } = options
  const { t } = useTranslation()
  const bins = buildHistogram(responses, options)
  const maxCount = Math.max(1, ...bins.map(({ count }) => count))
  const entries = Object.entries(responses)
  const total = entries.reduce((sum, [, count]) => sum + count, 0)
  const average =
    total > 0
      ? entries.reduce(
          (sum, [value, count]) => sum + Number(value) * count,
          0,
        ) / total
      : null

  return (
    <div className="mx-auto mt-4 w-full max-w-4xl rounded-2xl bg-white p-4 shadow-md">
      <div className="flex h-56 items-end gap-1">
        {bins.map(({ from, to, count }) => (
          <div
            key={from}
            title={
              from === to
                ? formatValue(from)
                : `${formatValue(from)} – ${formatValue(to)}`
            }
            className="flex h-full min-w-0 flex-1 flex-col items-center justify-end"
          >
            {count > 0 && (
              <span className="text-foreground text-sm font-bold">{count}</span>
            )}
            <div
              className="bg-primary w-full rounded-t"
              style={{ height: `${(count / maxCount) * BAR_MAX_PERCENT}%` }}
            />
          </div>
        ))}
      </div>

      <div className="bg-foreground h-0.5 w-full" />

      <div className="text-foreground mt-1 flex justify-between font-bold tabular-nums">
        <span>{formatValue(min)}</span>
        <span>{formatValue((min + max) / 2)}</span>
        <span>{formatValue(max)}</span>
      </div>

      {average !== null && (
        <p className="text-muted-foreground mt-1 text-center font-semibold">
          {t("manager:result.estimation.average", {
            value: formatValue(Math.round(average * 100) / 100),
          })}
        </p>
      )}
    </div>
  )
}

export default EstimationDistribution
