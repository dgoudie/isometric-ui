import React, {
  ReactNode,
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
  show: (durationInSeconds: number) => Promise<void>;
  showAfterLastSet: (
    durationInSeconds: number,
    nextExerciseName: string,
    nextExerciseMuscleGroup: ExerciseMuscleGroup
  ) => Promise<void>;
  showAfterLastExercise: (durationInSeconds: number) => Promise<void>;
  cancel: () => void;
};

export const AfterExerciseTimerContext =
  createContext<AfterExerciseTimerContextType>({
    show: () => Promise.resolve(),
    showAfterLastSet: () => Promise.resolve(),
    showAfterLastExercise: () => Promise.resolve(),
    cancel: () => undefined,
  });

const TIMEOUT = 250;

export default function AfterExerciseTimerProvider({
  children,
}: React.PropsWithChildren<{}>) {
  const [durationInMilliSeconds, setDurationInMilliSeconds] = useState(0);
  const [onFinished, setOnFinished] = useState<() => void>();
  const [type, setType] = useState<
    'AFTER_SET' | 'AFTER_EXERCISE' | 'END_OF_WORKOUT'
  >('AFTER_SET');
  const [millisecondsRemaining, setMillisecondsRemaining] = useState(0);
  const [intervalId, setIntervalId] = useState<number>();

  const buildPromise = useCallback(() => {
    if (typeof onFinished !== 'undefined') {
      onFinished();
    }
    return new Promise<void>((resolve) => setOnFinished(() => resolve));
  }, [setOnFinished, onFinished]);

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

  const show = useCallback<AfterExerciseTimerContextType['show']>(
    (durationInSeconds) => {
      const millis = secondsToMilliseconds(durationInSeconds);
      setDurationInMilliSeconds(millis);
      setMillisecondsRemaining(millis);
      setType('AFTER_SET');
      return buildPromise();
    },
    [buildPromise]
  );

  const showAfterLastSet = useCallback<
    AfterExerciseTimerContextType['showAfterLastSet']
  >(
    (durationInSeconds, nextName, nextMuscleGroup) => {
      const millis = secondsToMilliseconds(durationInSeconds);
      setDurationInMilliSeconds(millis);
      setMillisecondsRemaining(millis);
      setType('AFTER_EXERCISE');
      return buildPromise();
    },
    [buildPromise]
  );

  const showAfterLastExercise = useCallback<
    AfterExerciseTimerContextType['showAfterLastExercise']
  >(
    (durationInSeconds) => {
      const millis = secondsToMilliseconds(durationInSeconds);
      setDurationInMilliSeconds(millis);
      setMillisecondsRemaining(millis);
      setType('END_OF_WORKOUT');
      return buildPromise();
    },
    [buildPromise]
  );

  const cancel = useCallback(() => {
    setDurationInMilliSeconds(0);
    setOnFinished(undefined);
  }, []);

  const rootRef = useRef<HTMLDivElement>(null);

  return (
    <AfterExerciseTimerContext.Provider
      value={{ show, showAfterLastExercise, showAfterLastSet, cancel }}
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
