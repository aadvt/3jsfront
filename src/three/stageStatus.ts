/**
 * Tells the page the stage has gone, after it had been available: the 3D
 * chunk failed to load, or the browser took the WebGL context away. The page
 * responds through CSS (`[data-stage='lost']`): the flat figures appear where
 * the stage was, in place, without collapsing the scroll tracks under the
 * reader's thumb.
 */
export function markStageLost() {
  document.documentElement.dataset.stage = 'lost'
  delete document.documentElement.dataset.stageReady
}
