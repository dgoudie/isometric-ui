import {
  IExercise,
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

import ActiveExerciseViewExercise from './components/ActiveExerciseViewExercise/ActiveExerciseViewExercise';
import { ReadableResource } from '../../utils/fetch-from-api';
import classNames from 'classnames';
import styles from './ActiveExerciseView.module.scss';

interface Props {
  exercises: IWorkoutExercise[];
  exercisesResponse: ReadableResource<IExercise[]>;
  focusedIndex?: number;
  focusedIndexChanged?: (index: number) => void;
}

export default function ActiveExerciseView({
  exercises,
  exercisesResponse,
  focusedIndex = 0,
  focusedIndexChanged = () => undefined,
}: Props) {
  const [focusedIndexInternal, setFocusedIndexInternal] =
    useState(focusedIndex);

  const exerciseMap: Map<string, IExercise> = useMemo(
    () =>
      new Map<string, IExercise>(
        exercisesResponse.read().map(({ _id, ...ex }) => [_id, { _id, ...ex }])
      ),
    [exercises]
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
    scrollExerciseIntoViewByIndex(focusedIndex);
  }, [scrollExerciseIntoViewByIndex, focusedIndex]);

  return (
    <div className={classNames(styles.root, 'fade-in')} ref={rootRef}>
      {exercises.map((exercise, index) => (
        <ActiveExerciseViewExercise
          key={exercise.exerciseId}
          data={exerciseMap.get(exercise.exerciseId)!}
          exercise={exercise}
          exerciseIndex={index}
          onSelected={() => {
            focusedIndexChanged(index);
            setFocusedIndexInternal(index);
          }}
          onCompleted={() => scrollExerciseIntoViewByIndex(index + 1)}
        />
      ))}
    </div>
  );
}
