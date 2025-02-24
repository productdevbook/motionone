import { animate } from ".."
import { style } from "../style"
import "config/waapi-polyfill"

/**
 * TODO: All tests currently have to define at least two keyframes
 * because the polyfill doesn't support partial keyframes.
 */
const duration = 0.001

describe("animate", () => {
  test("No type errors", async () => {
    const div = document.createElement("div")
    const animation = animate(
      div,
      { opacity: 0.6, x: 1, scale: 1, "--css-var": 2 },
      {
        duration,
        x: {},
        "--css-var": {
          direction: "alternate",
        },
        direction: "alternate",
        easing: "steps(2, start)",
        offset: [0],
      }
    )
    await animation.finished.then(() => {
      expect(true).toBe(true)
    })
  })

  test("Applies target keyframe when animation has finished", async () => {
    const div = document.createElement("div")
    const animation = animate(
      div,
      { opacity: 0.6 },
      { duration, x: {}, "--css-var": {} }
    )
    await animation.finished.then(() => {
      expect(div).toHaveStyle("opacity: 0.6")
    })
  })

  test("Applies final target keyframe when animation has finished", async () => {
    const div = document.createElement("div")
    const animation = animate(div, { opacity: [0.2, 0.5] }, { duration })
    await animation.finished.then(() => {
      expect(div).toHaveStyle("opacity: 0.5")
    })
  })

  test("Applies transform template", async () => {
    const div = document.createElement("div")
    const animation = animate(div, { x: 1 }, { duration })
    await animation.finished.then(() => {
      expect(div).toHaveStyle("transform: translateX(var(--motion-translateX))")
    })
  })

  test.skip("Can manually finish animation", async () => {
    const div = document.createElement("div")
    const animation = animate(div, { opacity: 0.5 }, { duration: 10 })

    return new Promise<void>((resolve) => {
      animation.finished.then(() => {
        expect(div).toHaveStyle("opacity: 0.5")
        resolve()
      })
      animation.finish()
    })
  })

  test.skip("Can manually cancel animation", async () => {
    const div = document.createElement("div")
    div.style.opacity = "0.2"
    const animation = animate(div, { opacity: 0.5 }, { duration: 10 })
    return new Promise<void>((resolve) => {
      animation.finished.catch(() => {
        expect(div).toHaveStyle("opacity: 0.2")
        resolve()
      })
      animation.cancel()
    })
  })

  test("currentTime sets and gets currentTime", async () => {
    const div = document.createElement("div")
    const animation = animate(div, { opacity: 0.5 }, { duration: 10 })

    expect(animation.currentTime).toBe(0)
    animation.currentTime = 5
    expect(animation.currentTime).toBe(5)
  })

  test("currentTime can be set to duration", async () => {
    const div = document.createElement("div")
    div.style.opacity = "0"
    const animation = animate(div, { opacity: 0.5 }, { duration: 1 })
    animation.pause()
    animation.currentTime = 1

    return new Promise<void>((resolve) => {
      setTimeout(() => {
        expect(div).toHaveStyle("opacity: 0.5")
        resolve()
      }, 50)
    })
  })

  test("duration gets the duration of the animation", async () => {
    const div = document.createElement("div")
    const animation = animate(div, { opacity: 0.5 }, { duration: 10 })

    expect(animation.duration).toBe(10)
  })

  test("Interrupt polyfilled transforms", async () => {
    const div = document.createElement("div")
    animate(div, { x: 300 }, { duration: 1 })

    const promise = new Promise<string | undefined>((resolve) => {
      setTimeout(() => {
        const animation = animate(div, { x: 0 }, { duration: 1 })
        setTimeout(() => {
          animation.stop()
          resolve(style.get(div, "--motion-translateX"))
        }, 50)
      }, 100)
    })

    return expect(promise).resolves.not.toBe("0px")
  })

  test("Split transforms support other units", async () => {
    const div = document.createElement("div")
    const animation = animate(div, { x: "10%" }, { duration })
    await animation.finished.then(() => {
      expect(div).toHaveStyle("transform: translateX(var(--motion-translateX))")
      expect(style.get(div, "--motion-translateX")).toBe("10%")
    })
  })
})
