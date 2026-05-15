// Shared AudioContext for notification chime sounds.
// Dashboard and BreakNotification both need to play short oscillator
// tones. Using a single shared context instead of creating 2-3 separate
// ones reduces memory and avoids hitting Chrome's AudioContext limit.

let _ctx = null;

export function getChimeContext() {
  if (!_ctx || _ctx.state === "closed") {
    _ctx = new (window.AudioContext || window.webkitAudioContext)();
  }
  return _ctx;
}
