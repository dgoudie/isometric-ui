import {
  IExercise,
  IWorkoutExercise,
  IWorkoutExerciseSet,
} from '@dgoudie/isometric-types';
import React, { useCallback, useContext, useEffect, useRef } from 'react';

import classNames from 'classnames';
import { inputForceInteger } from '../../../../utils/input-force-integer';
import { inputSelectAllOnFocus } from '../../../../utils/input-select-all-on-focus';
import styles from './ActiveExerciseViewExerciseSet.module.scss';

interface Props {
  set: IWorkoutExerciseSet;
  data: IExercise;
  exerciseSelected: boolean;
  setSelected: boolean;
  setUpdated: (set: IWorkoutExerciseSet) => void;
}
export default function ActiveExerciseViewExerciseSet(props: Props) {
  const completeToggled = useCallback(() => {
    props.setUpdated({
      ...props.set,
      complete: !props.set.complete,
    });
  }, [props.set, props.setUpdated]);

  const resistanceChanged = useCallback(
    (resistanceInPounds: number | undefined) => {
      props.setUpdated({
        ...props.set,
        resistanceInPounds,
      });
    },
    [props.set, props.setUpdated]
  );

  const repititionsChanged = useCallback(
    (repetitions: number | undefined) => {
      props.setUpdated({
        ...props.set,
        repetitions,
      });
    },
    [props.set, props.setUpdated]
  );

  let children = (
    <WeightedSet
      {...props}
      completeToggled={completeToggled}
      resistanceChanged={resistanceChanged}
      repititionsChanged={repititionsChanged}
    />
  );
  if (props.data.exerciseType === 'timed') {
    children = <TimedSet {...props} completeToggled={completeToggled} />;
  } else if (props.data.exerciseType === 'rep_based') {
    children = (
      <RepBasedSet
        {...props}
        completeToggled={completeToggled}
        repititionsChanged={repititionsChanged}
      />
    );
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

interface SetProps extends Props {
  completeToggled: () => void;
}

interface RepBasedSetProps extends SetProps {
  repititionsChanged: (resistance: number | undefined) => void;
}

interface WeightedAndAssistedSetProps extends RepBasedSetProps {
  resistanceChanged: (resistance: number | undefined) => void;
}

function WeightedSet({
  set,
  data,
  exerciseSelected: selected,
  completeToggled,
  resistanceChanged,
  repititionsChanged,
}: WeightedAndAssistedSetProps) {
  const resistanceInput = useRef<HTMLInputElement>(null);
  const repCountInput = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!selected) {
      resistanceInput.current?.blur();
      repCountInput.current?.blur();
    }
  }, [resistanceInput, repCountInput, selected]);

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
              resistanceChanged(
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
              repititionsChanged(
                e.target.value ? parseInt(e.target.value) : undefined
              )
            }
          />
        </div>
        <span className={styles.setInputSuffix}>reps</span>
      </div>
      <button
        type='button'
        onClick={completeToggled}
        className={styles.setCompletedButton}
      >
        <i className='fa-solid fa-check'></i>
      </button>
    </div>
  );
}

function TimedSet({}: SetProps) {
  return <div></div>;
}

function RepBasedSet({
  set,
  data,
  exerciseSelected: selected,
  completeToggled,
  repititionsChanged,
}: RepBasedSetProps) {
  const repCountInput = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!selected) {
      repCountInput.current?.blur();
    }
  }, [repCountInput, selected]);

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
              repititionsChanged(
                e.target.value ? parseInt(e.target.value) : undefined
              )
            }
          />
        </div>
        <span className={styles.setInputSuffix}>reps</span>
      </div>
      <button
        type='button'
        onClick={completeToggled}
        className={styles.setCompletedButton}
      >
        <i className='fa-solid fa-check'></i>
      </button>
    </div>
  );
}
