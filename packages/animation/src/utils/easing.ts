import type { Easing, EasingFunction } from "@motionone/types"
import { cubicBezier, steps } from "@motionone/easing"
import { noopReturn, isFunction, isCubicBezier } from "@motionone/utils"

const namedEasings = {
  ease: cubicBezier(0.25, 0.1, 0.25, 1.0),
  "ease-in": cubicBezier(0.42, 0.0, 1.0, 1.0),
  "ease-in-out": cubicBezier(0.42, 0.0, 0.58, 1.0),
  "ease-out": cubicBezier(0.0, 0.0, 0.58, 1.0),
}

const functionArgsRegex = /\((.*?)\)/

export function getEasingFunction(
  definition: Easing | EasingFunction
): EasingFunction {
  // If already an easing function, return
  if (isFunction(definition)) return definition

  // If an easing curve definition, return bezier function
  if (isCubicBezier(definition)) return cubicBezier(...definition)

  // If we have a predefined easing function, return
  if (namedEasings[definition]) return namedEasings[definition]

  // If this is a steps function, attempt to create easing curve
  if (definition.startsWith("steps")) {
    const args = functionArgsRegex.exec(definition)
    if (args) {
      const argsArray = args[1].split(",")
      return steps(parseFloat(argsArray[0]), argsArray[1].trim() as any)
    }
  }

  return noopReturn
}
