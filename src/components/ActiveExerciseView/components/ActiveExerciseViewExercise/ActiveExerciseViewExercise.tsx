import {
  ExerciseType,
  IExercise,
  IExerciseExtended,
  IExerciseInstance,
  IWorkout,
  IWorkoutExercise,
} from '@dgoudie/isometric-types';
import { ReactNode, useCallback, useContext, useEffect, useRef } from 'react';

import ActiveExerciseViewExerciseSet from '../ActiveExerciseViewExerciseSet/ActiveExerciseViewExerciseSet';
import { AfterExerciseTimerContext } from '../../../../providers/AfterExerciseTimer/AfterExerciseTimer';
import ExerciseMetadata from '../../../ExerciseMetadata/ExerciseMetadata';
import MuscleGroupTag from '../../../MuscleGroupTag/MuscleGroupTag';
import classNames from 'classnames';
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
      {!!data.instances.length && <ExerciseHistory data={data} />}
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
  const itemsDivRef = useRef<HTMLDivElement>(null);

  const move = useCallback(
    (index: number) => {
      itemsDivRef.current?.children[index]?.scrollIntoView({
        behavior: 'smooth',
      });
    },
    [itemsDivRef]
  );

  return (
    <div className={styles.history}>
      <h2>History</h2>
      <ExerciseMetadata exercise={data} />
      {/* {data.exerciseType !== 'timed' && (
        <div className={styles.historyItems} ref={itemsDivRef}>
          {data.instances.map((instance, index) => (
            <ExerciseHistoryItem
              exerciseType={data.exerciseType}
              key={instance.createdAt}
              instance={instance}
              first={index === 0}
              last={index === data.instances.length - 1}
              next={() => move(index + 1)}
              previous={() => move(index - 1)}
            />
          ))}
        </div>
      )} */}
    </div>
  );
}

interface ExerciseHistoryItemProps {
  exerciseType: ExerciseType;
  instance: IExerciseInstance;
  first: boolean;
  last: boolean;
  next: () => void;
  previous: () => void;
}

const format = new Intl.DateTimeFormat('en-US');

function ExerciseHistoryItem({
  exerciseType,
  instance,
  first,
  last,
  next,
  previous,
}: ExerciseHistoryItemProps) {
  const { ref, inView } = useInView({
    threshold: 0.55,
  });

  let weightItems: ReactNode;

  if (exerciseType === 'assisted' || exerciseType === 'weighted') {
    weightItems = instance.sets.map((set, index) => (
      <div key={index} className={styles.historyItemBodyItem}>
        {set.repetitions}
        <i className='fa-solid fa-xmark'></i>
        {set.resistanceInPounds}
      </div>
    ));
  }
  return (
    <div
      ref={ref}
      className={classNames(
        styles.historyItem,
        inView && styles.visible,
        first && styles.first,
        last && styles.last
      )}
    >
      <button type='button' onClick={previous} disabled={first}>
        <i className='fa-solid fa-chevron-left'></i>
      </button>
      <div className={styles.historyItemBody}>
        <div>{format.format(new Date(instance.createdAt))}</div>
        <div className={styles.historyItemBodyItems}>{weightItems}</div>
      </div>
      <button type='button' onClick={next} disabled={last}>
        <i className='fa-solid fa-chevron-right '></i>
      </button>
    </div>
  );
}
