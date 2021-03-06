import test from '@interactjs/_dev/test/test'
import resize from '@interactjs/actions/resize/plugin'
import * as helpers from '@interactjs/core/tests/_helpers'
import * as Interact from '@interactjs/types/index'
import extend from '@interactjs/utils/extend'
import * as rectUtils from '@interactjs/utils/rect'

import modifiersBase from '../base'

import restrictSize from './size'

test('restrictSize', t => {
  const rect = rectUtils.xywhToTlbr({ left: 0, top: 0, right: 200, bottom: 300 })
  const {
    interaction,
    interactable,
    coords,
    down,
    start,
    move,
  } = helpers.testEnv({ plugins: [modifiersBase, resize], rect })
  const edges = { left: true, top: true }
  const action: any = { name: 'resize', edges }
  const options = {
    min: { width:  60, height:  50 } as any,
    max: { width: 300, height: 350 } as any,
  }
  let latestEvent: Interact.ResizeEvent = null

  interactable
    .resizable({
      modifiers: [restrictSize(options)],
    })
    .on('resizestart resizemove resizeend', e => { latestEvent = e })

  down()
  start(action)

  extend(coords.page, { x: -50, y: -40 })
  move()
  t.deepEqual(latestEvent.page, coords.page, 'within both min and max')

  extend(coords.page, { x: -200, y: -300 })
  move()

  t.deepEqual(latestEvent.page, { x: -100, y: -50 }, 'outside max')

  extend(coords.page, { x: 250, y: 320 })
  move()

  t.deepEqual(latestEvent.page, { x: 140, y: 250 }, 'outside min')

  // min and max function restrictions
  let minFuncArgs: any[]
  let maxFuncArgs: any[]

  options.min = (...args: any[]) => {
    minFuncArgs = args
  }
  options.max = (...args: any[]) => {
    maxFuncArgs = args
  }

  move()

  t.deepEqual(
    minFuncArgs,
    [coords.page.x, coords.page.y, interaction],
    'correct args are passed to min function restriction',
  )

  t.deepEqual(
    maxFuncArgs,
    [coords.page.x, coords.page.y, interaction],
    'correct args are passed to max function restriction',
  )

  t.end()
})
