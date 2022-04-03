import {
  IExercise,
  IExerciseExtended,
  IWorkoutExercise,
} from '@dgoudie/isometric-types';
import { useCallback, useContext, useEffect, useRef } from 'react';

import ActiveExerciseViewExerciseSet from '../ActiveExerciseViewExerciseSet/ActiveExerciseViewExerciseSet';
import { AfterExerciseTimerContext } from '../../../../providers/AfterExerciseTimer/AfterExerciseTimer';
import MuscleGroupTag from '../../../MuscleGroupTag/MuscleGroupTag';
import styles from './ActiveExerciseViewExercise.module.scss';
import { useInView } from 'react-intersection-observer';

interface Props {
  exercise: IWorkoutExercise;
  data: IExerciseExtended;
  nextExercise: IExerciseExtended | undefined;
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
            nextExercise.primaryMuscleGroup
          ).then(onCompleted);
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
      <ExerciseHistory data={data} />
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

type ExerciseHistoryProps = {
  data: IExerciseExtended;
};

function ExerciseHistory({ data }: ExerciseHistoryProps) {
  return (
    <div className={styles.history}>
      <h2>History</h2>
    </div>
  );
}
