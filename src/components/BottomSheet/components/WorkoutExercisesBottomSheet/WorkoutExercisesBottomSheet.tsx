import { IExercise, IWorkoutExercise } from '@dgoudie/isometric-types';
import React, { Suspense, useMemo } from 'react';

import BottomSheet from '../../BottomSheet';
import MuscleGroupTag from '../../../MuscleGroupTag/MuscleGroupTag';
import { ReadableResource } from '../../../../utils/fetch-from-api';
import RouteLoader from '../../../RouteLoader/RouteLoader';
import classNames from 'classnames';
import styles from './WorkoutExercisesBottomSheet.module.scss';

interface Props {
  exercises: IWorkoutExercise[];
  exercisesResponse: ReadableResource<IExercise[]>;
  onResult: (resultIndex: number | undefined) => void;
}

export default function WorkoutExercisesBottomSheet({
  onResult,
  ...props
}: Props) {
  return (
    <BottomSheet onResult={onResult} title={`Today`}>
      {(onResult) => (
        <div className={styles.root}>
          <Suspense fallback={<RouteLoader />}>
            <WorkoutExercisesBottomSheetContent
              onResult={onResult}
              {...props}
            />
          </Suspense>
        </div>
      )}
    </BottomSheet>
  );
}

interface WorkoutExercisesBottomSheetContentProps
  extends Omit<Props, 'onResult'> {
  onResult: (resultIndex: number) => void;
}

function WorkoutExercisesBottomSheetContent({
  onResult,
  exercisesResponse,
  exercises,
}: WorkoutExercisesBottomSheetContentProps) {
  const exerciseMap: Map<string, IExercise> = useMemo(
    () =>
      new Map<string, IExercise>(
        exercisesResponse.read().map(({ _id, ...ex }) => [_id, { _id, ...ex }])
      ),
    [exercisesResponse]
  );

  const exerciseElements = exercises.map((exercise, index) => {
    const exerciseData = exerciseMap.get(exercise.exerciseId)!;
    const exerciseComplete = exercise.sets.every((set) => set.complete);
    return (
      <button
        key={index}
        className={classNames(
          styles.item,
          exerciseComplete && styles.itemComplete
        )}
        onClick={() => onResult(index)}
      >
        <i
          className={classNames('fa-solid', exerciseComplete && 'fa-check')}
        ></i>
        <div className={styles.itemText}>{exerciseData.name}</div>
        <MuscleGroupTag muscleGroup={exerciseData.primaryMuscleGroup} />
      </button>
    );
  });

  return <div className={styles.items}>{exerciseElements}</div>;
}
