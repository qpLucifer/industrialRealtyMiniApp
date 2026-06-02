/** WeChat mini program global InnerAudio output (speaker vs earpiece). */

let applied = false

/**
 * Route follow-up voice through the loudspeaker on iOS (not the earpiece).
 * Must use wx.setInnerAudioOption — per-instance obeyMuteSwitch is deprecated since base lib 2.3.0.
 */
export function applyInnerAudioOutputOptions(force = false) {
  if (applied && !force) return
  applied = true

  const options = {
    speakerOn: true,
    obeyMuteSwitch: false,
    mixWithOther: true,
  }

  if (typeof uni.setInnerAudioOption === 'function') {
    uni.setInnerAudioOption(options)
    return
  }

  const wxApi = (globalThis as { wx?: { setInnerAudioOption?: (opts: typeof options) => void } }).wx
  wxApi?.setInnerAudioOption?.(options)
}
