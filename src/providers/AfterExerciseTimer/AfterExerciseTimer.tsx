import React, {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  addMilliseconds,
  differenceInMilliseconds,
  intervalToDuration,
  millisecondsToSeconds,
  secondsToMilliseconds,
} from 'date-fns';

import { CSSTransition } from 'react-transition-group';
import { ExerciseMuscleGroup } from '@dgoudie/isometric-types';
import { Portal } from '@primer/react';
import { showNotification } from '../../utils/notification';
import styles from './AfterExerciseTimer.module.scss';

type AfterExerciseTimerContextType = {
  show: (durationInSeconds: number, onFinished?: () => void) => void;
  showAfterLastSet: (
    durationInSeconds: number,
    nextExerciseName: string,
    nextExerciseMuscleGroup: ExerciseMuscleGroup,
    onFinished?: () => void
  ) => void;
  showAfterLastExercise: (
    durationInSeconds: number,
    onFinished?: () => void
  ) => void;
};

export const AfterExerciseTimerContext =
  createContext<AfterExerciseTimerContextType>({
    show: () => undefined,
    showAfterLastSet: () => undefined,
    showAfterLastExercise: () => undefined,
  });

const TIMEOUT = 250;

export default function AfterExerciseTimerProvider({
  children,
}: React.PropsWithChildren<{}>) {
  const [durationInMilliSeconds, setDurationInMilliSeconds] = useState(0);
  const [onFinished, setOnFinished] = useState<() => void>();
  const [millisecondsRemaining, setMillisecondsRemaining] = useState(0);
  const [intervalId, setIntervalId] = useState<number>();

  useEffect(() => {
    clearInterval(intervalId);
    if (!!durationInMilliSeconds) {
      const endDate = addMilliseconds(new Date(), millisecondsRemaining);
      setIntervalId(
        setInterval(() => {
          const remaining = differenceInMilliseconds(endDate, new Date());
          if (remaining > 0) {
            setMillisecondsRemaining(remaining);
          } else {
            setDurationInMilliSeconds(0);
            showNotification('Time is up...');
          }
        }, 100) as unknown as number
      );
    }
    return () => {
      clearInterval(intervalId);
    };
  }, [durationInMilliSeconds]);

  const secondsRemaining = useMemo(
    () => millisecondsToSeconds(millisecondsRemaining),
    [millisecondsRemaining]
  );

  const formattedTime = useMemo(() => {
    const duration = intervalToDuration({
      start: 0,
      end: secondsToMilliseconds(secondsRemaining),
    });
    return `${duration.minutes}:${duration.seconds
      ?.toString()
      .padStart(2, '0')}`;
  }, [secondsRemaining]);

  const percentageComplete = useMemo(() => {
    const percentage =
      (durationInMilliSeconds - millisecondsRemaining) / durationInMilliSeconds;
    return Math.round((percentage + Number.EPSILON) * 100) / 100;
  }, [durationInMilliSeconds, millisecondsRemaining]);

  const show = useCallback<AfterExerciseTimerContextType['show']>(
    (durationInSeconds, onFinished) => {
      const millis = secondsToMilliseconds(durationInSeconds);
      setDurationInMilliSeconds(millis);
      setMillisecondsRemaining(millis);
      setOnFinished(() => onFinished);
    },
    []
  );

  const showAfterLastSet = useCallback<
    AfterExerciseTimerContextType['showAfterLastSet']
  >(
    (durationInSeconds, nextName, nextMuscleGroup, onFinished) => {
      const millis = secondsToMilliseconds(durationInSeconds);
      setDurationInMilliSeconds(millis);
      setMillisecondsRemaining(millis);
      setOnFinished(() => onFinished);
    },
    [setDurationInMilliSeconds]
  );

  const showAfterLastExercise = useCallback<
    AfterExerciseTimerContextType['showAfterLastExercise']
  >(
    (durationInSeconds, onFinished) => {
      const millis = secondsToMilliseconds(durationInSeconds);
      setDurationInMilliSeconds(millis);
      setMillisecondsRemaining(millis);
      setOnFinished(() => onFinished);
    },
    [setDurationInMilliSeconds]
  );

  const rootRef = useRef<HTMLDivElement>(null);

  return (
    <AfterExerciseTimerContext.Provider
      value={{ show, showAfterLastExercise, showAfterLastSet }}
    >
      {children}
      <Portal>
        <CSSTransition
          in={!!durationInMilliSeconds}
          nodeRef={rootRef}
          timeout={TIMEOUT}
          mountOnEnter
          unmountOnExit
          classNames={{
            enter: styles.enter,
            enterActive: styles.enterActive,
            enterDone: styles.enterDone,
            exit: styles.exit,
            exitActive: styles.exitActive,
            exitDone: styles.exitDone,
          }}
          onExited={onFinished}
        >
          <div ref={rootRef} className={styles.root}>
            <div className={styles.modal}>
              <div className={styles.time}>{formattedTime}</div>
              <button
                type='button'
                className={'standard-button primary'}
                onClick={() => setDurationInMilliSeconds(0)}
              >
                <i className='fa-solid fa-xmark'></i>
                Dismiss
              </button>
            </div>
          </div>
        </CSSTransition>
      </Portal>
    </AfterExerciseTimerContext.Provider>
  );
}
