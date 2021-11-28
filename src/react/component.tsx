import * as React from "react"
import type { MutableRefObject } from "react"
import {
  createElement,
  forwardRef,
  useContext,
  useEffect,
  useMemo,
  useRef,
} from "react"
import { createMotionState } from "../dom/state"
import type { Options } from "../dom/state/types"
import type { ElementProps } from "./types"
import { MotionContext } from "./context"
import { createStyles } from "../dom/utils/style-object"

export function createMotionComponent<Props extends ElementProps>(
  Component: string
) {
  function Motion(
    {
      initial,
      animate,
      press,
      hover,
      inView,
      variants,
      style,
      transition,
      onAnimationComplete,
      ...props
    }: Options & Props,
    externalRef: MutableRefObject<Element>
  ) {
    const options = {
      initial,
      animate,
      press,
      hover,
      inView,
      variants,
      transition,
      onAnimationComplete,
    }
    const state = createMotionState(options, useContext(MotionContext))

    const initialStyle = useMemo(() => createStyles(state.getTarget()), [])

    const ref = externalRef || useRef<Element>(null)
    const element = createElement(Component, {
      ...props,
      ref,
      style: { ...style, ...initialStyle },
    })

    useEffect(() => state.mount(ref.current!), [])
    useEffect(() => state.update(options))

    return (
      <MotionContext.Provider value={state}>{element}</MotionContext.Provider>
    )
  }

  return forwardRef(Motion)
}
