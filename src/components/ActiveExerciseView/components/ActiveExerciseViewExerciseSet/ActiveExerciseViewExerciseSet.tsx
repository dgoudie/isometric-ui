import {
  IExercise,
  IWorkoutExercise,
  IWorkoutExerciseSet,
} from '@dgoudie/isometric-types';
import React, { useCallback, useContext, useEffect, useRef } from 'react';

import { WorkoutContext } from '../../../../providers/Workout/Workout';
import classNames from 'classnames';
import { inputForceInteger } from '../../../../utils/input-force-integer';
import { inputSelectAllOnFocus } from '../../../../utils/input-select-all-on-focus';
import styles from './ActiveExerciseViewExerciseSet.module.scss';

interface Props {
  set: IWorkoutExerciseSet;
  data: IExercise;
  exerciseSelected: boolean;
  setSelected: boolean;
  exerciseIndex: number;
  setIndex: number;
}
export default function ActiveExerciseViewExerciseSet(props: Props) {
  let children = <WeightedSet {...props} />;
  if (props.data.exerciseType === 'timed') {
    children = <TimedSet {...props} />;
  } else if (props.data.exerciseType === 'rep_based') {
    children = <RepBasedSet {...props} />;
  }
  return (
    <div
      className={classNames(
        styles.root,
        props.exerciseSelected && styles.selected,
        props.setSelected && styles.highlighted,
        props.set.complete && styles.completed
      )}
    >
      {children}
    </div>
  );
}

function WeightedSet({
  set,
  data,
  exerciseSelected,
  exerciseIndex,
  setIndex,
}: Props) {
  const { persistSetComplete, persistSetRepetitions, persistSetResistance } =
    useContext(WorkoutContext);

  const resistanceInput = useRef<HTMLInputElement>(null);
  const repCountInput = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!exerciseSelected) {
      resistanceInput.current?.blur();
      repCountInput.current?.blur();
    }
  }, [resistanceInput, repCountInput, exerciseSelected]);

  useEffect(() => {
    resistanceInput.current &&
      (resistanceInput.current.value =
        set.resistanceInPounds?.toString() ?? '');
  }, [resistanceInput, set]);

  useEffect(() => {
    repCountInput.current &&
      (repCountInput.current.value = set.repetitions?.toString() ?? '');
  }, [repCountInput, set]);

  return (
    <div className={classNames(styles.set, styles.setTypeWeighted)}>
      <div className={styles.setInput}>
        <div className={styles.setInputWrapper}>
          <input
            ref={resistanceInput}
            type='number'
            placeholder='0'
            inputMode='numeric'
            onFocus={inputSelectAllOnFocus}
            onInput={inputForceInteger}
            onBlur={(e) =>
              persistSetResistance(
                exerciseIndex,
                setIndex,
                e.target.value ? parseInt(e.target.value) : undefined
              )
            }
          />
        </div>

        <span className={styles.setInputSuffix}>lbs</span>
      </div>
      <div className={styles.setInput}>
        <div className={styles.setInputWrapper}>
          <input
            ref={repCountInput}
            type='number'
            inputMode='numeric'
            placeholder={`${data.minimumRecommendedRepetitions}-${data.maximumRecommendedRepetitions}`}
            onFocus={inputSelectAllOnFocus}
            onInput={inputForceInteger}
            onBlur={(e) =>
              persistSetRepetitions(
                exerciseIndex,
                setIndex,
                e.target.value ? parseInt(e.target.value) : undefined
              )
            }
          />
        </div>
        <span className={styles.setInputSuffix}>reps</span>
      </div>
      <button
        type='button'
        onClick={() =>
          persistSetComplete(exerciseIndex, setIndex, !set.complete)
        }
        className={styles.setCompletedButton}
      >
        <i className='fa-solid fa-check'></i>
      </button>
    </div>
  );
}

function TimedSet({}: Props) {
  return <div></div>;
}

function RepBasedSet({
  set,
  data,
  exerciseSelected,
  exerciseIndex,
  setIndex,
}: Props) {
  const { persistSetComplete, persistSetRepetitions } =
    useContext(WorkoutContext);
  const repCountInput = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!exerciseSelected) {
      repCountInput.current?.blur();
    }
  }, [repCountInput, exerciseSelected]);

  useEffect(() => {
    repCountInput.current &&
      (repCountInput.current.value = set.repetitions?.toString() ?? '');
  }, [repCountInput, set]);

  return (
    <div className={classNames(styles.set, styles.setTypeRepBased)}>
      <div className={styles.setInput}>
        <div className={styles.setInputWrapper}>
          <input
            ref={repCountInput}
            type='number'
            inputMode='numeric'
            placeholder='--'
            onFocus={inputSelectAllOnFocus}
            onInput={inputForceInteger}
            onBlur={(e) =>
              persistSetRepetitions(
                exerciseIndex,
                setIndex,
                e.target.value ? parseInt(e.target.value) : undefined
              )
            }
          />
        </div>
        <span className={styles.setInputSuffix}>reps</span>
      </div>
      <button
        type='button'
        onClick={() =>
          persistSetComplete(exerciseIndex, setIndex, !set.complete)
        }
        className={styles.setCompletedButton}
      >
        <i className='fa-solid fa-check'></i>
      </button>
    </div>
  );
}
