import {
  IExercise,
  IWorkoutExercise,
  IWorkoutExerciseSet,
} from '@dgoudie/isometric-types';
import { useCallback, useContext, useEffect, useRef, useState } from 'react';

import ActiveExerciseViewExerciseSet from '../ActiveExerciseViewExerciseSet/ActiveExerciseViewExerciseSet';
import { AfterExerciseTimerContext } from '../../../../providers/AfterExerciseTimer/AfterExerciseTimer';
import MuscleGroupTag from '../../../MuscleGroupTag/MuscleGroupTag';
import SwipeDeadZone from '../../../SwipeDeadZone/SwipeDeadZone';
import styles from './ActiveExerciseViewExercise.module.scss';
import { useInView } from 'react-intersection-observer';

interface Props {
  exercise: IWorkoutExercise;
  data: IExercise;
  nextExercise: IExercise | undefined;
  exerciseIndex: number;
  onSelected: (i: number) => void;
  onCompleted: () => void;
}

export default function ActiveExerciseViewExercise({
  exercise,
  data,
  exerciseIndex,
  nextExercise,
  onSelected,
  onCompleted,
}: Props) {
  const { show, showAfterLastExercise, showAfterLastSet } = useContext(
    AfterExerciseTimerContext
  );

  const getNumberOfCompletedSets = useCallback(
    () => exercise.sets.filter((set) => set.complete).length,
    [exercise]
  );

  const previousNumberOfCompletedSets = useRef(getNumberOfCompletedSets());

  const numberOfCompletedSets = getNumberOfCompletedSets();

  useEffect(() => {
    if (numberOfCompletedSets > previousNumberOfCompletedSets.current) {
      let allSetsCompleted = numberOfCompletedSets === exercise.sets.length;
      if (allSetsCompleted) {
        if (!!nextExercise) {
          showAfterLastSet(
            data.breakTimeInSeconds,
            nextExercise.name,
            nextExercise.primaryMuscleGroup,
            () => onCompleted()
          );
        } else {
          showAfterLastExercise(data.breakTimeInSeconds);
        }
      } else {
        show(data.breakTimeInSeconds);
      }
    }
    previousNumberOfCompletedSets.current = numberOfCompletedSets;
  }, [exercise, nextExercise]);

  const { ref, inView } = useInView({
    threshold: 0.55,
  });

  useEffect(() => {
    if (inView) {
      onSelected(exerciseIndex);
    }
  }, [inView, onSelected, exerciseIndex]);

  return (
    <section ref={ref} className={styles.section}>
      <div className={styles.header}>{data.name}</div>
      <div className={styles.groups}>
        {[data.primaryMuscleGroup, ...(data.secondaryMuscleGroups ?? [])].map(
          (group) => (
            <MuscleGroupTag key={group} muscleGroup={group} />
          )
        )}
      </div>
      <div className={styles.sets}>
        {exercise.sets.map((set, index) => (
          <ActiveExerciseViewExerciseSet
            key={index}
            set={set}
            data={data}
            exerciseSelected={inView}
            setSelected={numberOfCompletedSets === index}
            exerciseIndex={exerciseIndex}
            setIndex={index}
          />
        ))}
      </div>
    </section>
  );
}
