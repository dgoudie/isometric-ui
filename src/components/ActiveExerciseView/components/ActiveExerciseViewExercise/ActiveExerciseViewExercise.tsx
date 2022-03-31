import {
  IExercise,
  IWorkoutExercise,
  IWorkoutExerciseSet,
} from '@dgoudie/isometric-types';
import { useCallback, useEffect, useRef, useState } from 'react';

import ActiveExerciseViewExerciseSet from '../ActiveExerciseViewExerciseSet/ActiveExerciseViewExerciseSet';
import MuscleGroupTag from '../../../MuscleGroupTag/MuscleGroupTag';
import SwipeDeadZone from '../../../SwipeDeadZone/SwipeDeadZone';
import styles from './ActiveExerciseViewExercise.module.scss';
import { useInView } from 'react-intersection-observer';

interface Props {
  exercise: IWorkoutExercise;
  data: IExercise;
  exerciseIndex: number;
  onSelected: () => void;
  onCompleted: () => void;
}

export default function ActiveExerciseViewExercise({
  exercise,
  data,
  exerciseIndex,
  onSelected,
  onCompleted,
}: Props) {
  const getFirstNotComplete = useCallback(
    () => exercise.sets.findIndex((set) => !set.complete),
    [exercise]
  );

  const previouslyFirstNotComplete = useRef(getFirstNotComplete());
  const firstNotComplete = getFirstNotComplete();

  useEffect(() => {
    if (previouslyFirstNotComplete.current >= 0 && firstNotComplete < 0) {
      onCompleted();
    }
    previouslyFirstNotComplete.current = firstNotComplete;
  }, [firstNotComplete, onCompleted]);

  const { ref, inView } = useInView({
    threshold: 0.6,
  });
  useEffect(() => {
    !!inView && onSelected();
  }, [inView, onSelected]);

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
            setSelected={firstNotComplete === index}
            exerciseIndex={exerciseIndex}
            setIndex={index}
          />
        ))}
      </div>
    </section>
  );
}
