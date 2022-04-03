import { ExerciseType, IWorkoutExerciseSet } from '@dgoudie/isometric-types';
import React, { ReactNode, useMemo } from 'react';
import { intervalToDuration, secondsToMilliseconds } from 'date-fns';

import classNames from 'classnames';
import styles from './SetView.module.scss';

interface Props {
  exerciseType: ExerciseType;
  sets: IWorkoutExerciseSet[];
  className?: string;
}

export default function SetView({ exerciseType, sets, className }: Props) {
  let setBadge: (set: IWorkoutExerciseSet) => JSX.Element;
  switch (exerciseType) {
    case 'timed': {
      setBadge = (set) => <TimedBadge set={set} />;
      break;
    }
    case 'rep_based': {
      setBadge = (set) => <RepBasedBadge set={set} />;
      break;
    }
    default: {
      setBadge = (set) => <WeightedSetBadge set={set} />;
    }
  }
  return (
    <div className={classNames(styles.root, className)}>
      {sets.map((set, index) => (
        <div key={index} className={styles.set}>
          {setBadge(set)}
        </div>
      ))}
    </div>
  );
}

interface SetBadgeProps {
  set: IWorkoutExerciseSet;
}

function WeightedSetBadge({ set }: SetBadgeProps) {
  return (
    <>
      {set.repetitions} <i className='fa-solid fa-xmark'></i>{' '}
      {set.resistanceInPounds} lbs
    </>
  );
}

function RepBasedBadge({ set }: SetBadgeProps) {
  return <>{set.repetitions} reps</>;
}

function TimedBadge({ set }: SetBadgeProps) {
  const formattedTime = useMemo(() => {
    const duration = intervalToDuration({
      start: 0,
      end: secondsToMilliseconds(set.timeInSeconds!),
    });
    if (!duration.seconds) {
      return `${duration.minutes} minutes`;
    }
    return `${duration.minutes}m ${duration.seconds
      ?.toString()
      .padStart(2, '0')}s`;
  }, [set]);
  return <>{formattedTime}</>;
}
