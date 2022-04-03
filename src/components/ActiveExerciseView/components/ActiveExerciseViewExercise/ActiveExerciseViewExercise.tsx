import {
  ExerciseType,
  IExerciseExtended,
  IExerciseInstance,
  IWorkoutExercise,
} from '@dgoudie/isometric-types';
import { ReactNode, useCallback, useContext, useEffect, useRef } from 'react';

import ActiveExerciseViewExerciseSet from '../ActiveExerciseViewExerciseSet/ActiveExerciseViewExerciseSet';
import { AfterExerciseTimerContext } from '../../../../providers/AfterExerciseTimer/AfterExerciseTimer';
import ExerciseMetadata from '../../../ExerciseMetadata/ExerciseMetadata';
import MuscleGroupTag from '../../../MuscleGroupTag/MuscleGroupTag';
import SetView from '../../../SetView/SetView';
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

const format = new Intl.DateTimeFormat('en-US');

export default function ActiveExerciseViewExercise({
  exercise,
  data,
  exerciseIndex,
  nextExercise,
  onSelected,
  onCompleted,
}: Props) {
  const { show, showAfterLastExercise, showAfterLastSet, cancel } = useContext(
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
    return () => {
      cancel();
    };
  }, [exercise, nextExercise]);

  const { ref, inView } = useInView({
    threshold: 0.55,
  });

  const wasInViewPreviously = useRef(inView);

  const sectionInnerRef = useRef<HTMLDivElement>(null);

  const timeoutId = useRef<number>();

  useEffect(() => {
    if (inView) {
      onSelected(exerciseIndex);
    } else if (!inView && wasInViewPreviously.current) {
      clearTimeout(timeoutId.current);
      timeoutId.current = setTimeout(
        () => sectionInnerRef.current?.scrollTo({ top: 0, behavior: 'smooth' }),
        1000
      ) as unknown as number;
    }
    wasInViewPreviously.current = inView;
    return () => {
      clearTimeout(timeoutId.current);
    };
  }, [inView, onSelected, exerciseIndex, sectionInnerRef]);

  return (
    <section ref={ref} className={styles.section}>
      <div className={styles.sectionInner} ref={sectionInnerRef}>
        <div className={styles.main}>
          <div className={styles.mainContent}>
            <div className={styles.header}>{data.name}</div>
            <div className={styles.groups}>
              {[
                data.primaryMuscleGroup,
                ...(data.secondaryMuscleGroups ?? []),
              ].map((group) => (
                <MuscleGroupTag key={group} muscleGroup={group} />
              ))}
            </div>
            {!!data.lastPerformed && (
              <ExerciseMetadata className={styles.metadata} exercise={data} />
            )}
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
          </div>
          <div
            className={classNames(
              styles.mainFooter,
              inView && styles.mainFooterVisible
            )}
          >
            <i className='fa-solid fa-chevron-up'></i>
            <span>Swipe up to view history</span>
          </div>
        </div>
        <div className={styles.instances}>
          <div className={styles.instancesHeader}>Recent History</div>
          {!!data.instances.length ? (
            <div className={styles.instancesItems}>
              {data.instances.map((instance, index) => (
                <div className={styles.instancesItemsItem} key={index}>
                  <div>{format.format(new Date(instance.createdAt))}</div>
                  <SetView
                    key={index}
                    exerciseType={data.exerciseType}
                    sets={instance.sets}
                  />
                </div>
              ))}
            </div>
          ) : (
            <div className={styles.noInstances}>
              <i className='fa-solid fa-circle-info'></i>
              <span>You have not performed this exercise before.</span>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
