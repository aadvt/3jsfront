import { Assembly } from './Assembly'
import { Checkpoint } from './Checkpoint'
import { Children } from './Children'
import { ConsentManager } from './ConsentManager'
import { Director } from './Director'
import { Duties } from './Duties'
import { Evidence } from './Evidence'
import { Journey } from './Journey'
import { Protagonist } from './Protagonist'
import { Rights } from './Rights'
import { System } from './System'
import { Withdrawal } from './Withdrawal'
import { useStageColors } from '../hooks/useStageColors'

interface SceneProps {
  reducedMotion: boolean
}

/**
 * The persistent stage. One world, one object followed through it.
 *
 * The world is vertical: you at the top, your data on its thread beneath you,
 * the system below that, and the data's route running on down through every
 * environment the chapters add. The script — where the data is and where the
 * camera looks at each point of the story — is `timeline.ts`.
 *
 * Nothing here is decorative. Every object stands for something the text
 * names; see each component for the mapping.
 *
 * `Director` is mounted first so its frame callback runs first: everything
 * after it reads the story position and the data's location it has just set.
 */
export function StoryScene({ reducedMotion }: SceneProps) {
  const colors = useStageColors()

  return (
    <>
      <Director reducedMotion={reducedMotion} />

      <hemisphereLight args={['#ffffff', '#8a8578', 1.1]} />
      <directionalLight position={[2.5, 4, 5]} intensity={1.35} />
      <directionalLight position={[-4, -1, 2]} intensity={0.35} />

      <System colors={colors} />
      <Journey colors={colors} />
      <Checkpoint colors={colors} />
      <Evidence colors={colors} />
      <Withdrawal colors={colors} />
      <Rights colors={colors} />
      <Duties colors={colors} />
      <Children colors={colors} />
      <ConsentManager colors={colors} />
      <Assembly colors={colors} />
      <Protagonist colors={colors} />
    </>
  )
}
