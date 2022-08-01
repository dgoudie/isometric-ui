import {
  IExercise,
  IExerciseExtended,
  IWorkoutExercise,
  IWorkoutExerciseSet,
} from '@dgoudie/isometric-types';
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import { ActiveExercise } from '../../pages/workout';
import ActiveExerciseViewExercise from './components/ActiveExerciseViewExercise/ActiveExerciseViewExercise';
import { ReadableResource } from '../../utils/fetch-from-api';
import classNames from 'classnames';
import styles from './ActiveExerciseView.module.scss';

interface Props {
  exercises: IWorkoutExercise[];
  exercisesResource: ReadableResource<IExerciseExtended[]>;
  focusedExercise: ActiveExercise;
  focusedExerciseChanged: (exercise: ActiveExercise) => void;
}
export default function ActiveExerciseView({
  exercises,
  exercisesResource,
  focusedExercise,
  focusedExerciseChanged,
}: Props) {
  const exerciseMap: Map<string, IExerciseExtended> = useMemo(
    () =>
      new Map<string, IExerciseExtended>(
        exercisesResource.read().map(({ _id, ...ex }) => [_id, { _id, ...ex }])
      ),
    [exercisesResource]
  );
  const rootRef = useRef<HTMLDivElement>(null);
  const scrollExerciseIntoViewByIndex = useCallback(
    (index: number) => {
      rootRef.current?.children &&
        rootRef.current?.children[index]?.scrollIntoView({
          behavior: 'smooth',
        });
    },
    [rootRef]
  );
  useEffect(() => {
    !!focusedExercise.scrollIntoView &&
      scrollExerciseIntoViewByIndex(focusedExercise.index);
  }, [scrollExerciseIntoViewByIndex, focusedExercise]);
  const [nextNoncompleteExercise, setNextNoncompleteExercise] = useState<{
    index: number;
    exerciseData: IExerciseExtended;
  }>();
  useEffect(() => {
    let indexOfNextNonCompleteExercise = exercises.findIndex(
      (exercise, i) =>
        focusedExercise.index !== i &&
        !exercise.sets.every((set) => set.complete)
    );
    if (indexOfNextNonCompleteExercise >= 0) {
      setNextNoncompleteExercise({
        index: indexOfNextNonCompleteExercise,
        exerciseData: exerciseMap.get(
          exercises[indexOfNextNonCompleteExercise]._id
        )!,
      });
    } else {
      setNextNoncompleteExercise(undefined);
    }
  }, [exercises, focusedExercise, exerciseMap]);
  const onSelected = useCallback(
    (index: number) => focusedExerciseChanged({ index, scrollIntoView: false }),
    [focusedExerciseChanged]
  );
  const onCompleted = useCallback(() => {
    if (typeof nextNoncompleteExercise !== 'undefined') {
      focusedExerciseChanged({
        index: nextNoncompleteExercise.index,
        scrollIntoView: true,
      });
    }
  }, [nextNoncompleteExercise, focusedExerciseChanged]);
  return (
    <div className={classNames(styles.root, 'fade-in')} ref={rootRef}>
      {exercises.map((exercise, index) => (
        <ActiveExerciseViewExercise
          key={index}
          data={exerciseMap.get(exercise._id)!}
          exercise={exercise}
          nextExercise={nextNoncompleteExercise?.exerciseData}
          exerciseIndex={index}
          exerciseCount={exercises.length}
          onSelected={onSelected}
          onCompleted={onCompleted}
        />
      ))}
    </div>
  );
}
