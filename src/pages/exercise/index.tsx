import { IExerciseExtended, IWorkoutExercise } from '@dgoudie/isometric-types';
import { Link, useParams } from 'react-router-dom';
import React, {
  Suspense,
  useCallback,
  useEffect,
  useMemo,
  useState,
  useTransition,
} from 'react';
import {
  ReadableResource,
  emptyReadableResource,
  fetchFromApi,
  fetchFromApiAsReadableResource,
} from '../../utils/fetch-from-api';

import AppBarWithAppHeaderLayout from '../../components/AppBarWithAppHeaderLayout/AppBarWithAppHeaderLayout';
import ExerciseMetadata from '../../components/ExerciseMetadata/ExerciseMetadata';
import InfiniteScroll from '../../components/InfiniteScroll/InfiniteScroll';
import MuscleGroupTag from '../../components/MuscleGroupTag/MuscleGroupTag';
import RouteLoader from '../../components/RouteLoader/RouteLoader';
import SetView from '../../components/SetView/SetView';
import styles from './index.module.scss';

let initialExerciseResponse = emptyReadableResource();
let initialInstancesResponse = emptyReadableResource();
const format = new Intl.DateTimeFormat('en-US', {
  dateStyle: 'medium',
});

export default function Exercise() {
  const { exerciseName } = useParams();

  const [exerciseResponse, setExerciseResponse] = useState<
    ReadableResource<IExerciseExtended>
  >(initialExerciseResponse);
  const [instancesResponse, setInstancesResponse] = useState<
    ReadableResource<IWorkoutExercise[]>
  >(initialInstancesResponse);

  const [_isPending, startTransaction] = useTransition();

  useEffect(() => {
    startTransaction(() => {
      const updatedExerciseResponse =
        fetchFromApiAsReadableResource<IExerciseExtended>(
          `/api/exercise/${exerciseName}`
        );
      setExerciseResponse(updatedExerciseResponse);
      const updatedInstancesResponse = fetchFromApiAsReadableResource<
        IWorkoutExercise[]
      >(`/api/workout-instances/${exerciseName}`, { page: '1' });
      setInstancesResponse(updatedInstancesResponse);
    });
  }, [exerciseName]);

  return (
    <AppBarWithAppHeaderLayout pageTitle={exerciseName!}>
      <Suspense fallback={<RouteLoader />}>
        <ExerciseContent
          exerciseName={exerciseName!}
          exerciseResponse={exerciseResponse}
          instancesResponse={instancesResponse}
        />
      </Suspense>
    </AppBarWithAppHeaderLayout>
  );
}

interface ExerciseContentProps {
  exerciseName: string;
  exerciseResponse: ReadableResource<IExerciseExtended>;
  instancesResponse: ReadableResource<IWorkoutExercise[]>;
}

function ExerciseContent({
  exerciseName,
  exerciseResponse,
  instancesResponse,
}: ExerciseContentProps) {
  const exercise = useMemo(() => exerciseResponse.read(), [exerciseResponse]);

  const [instances, setInstances] = useState(instancesResponse.read());
  const [moreInstances, setMoreInstances] = useState(instances.length >= 5);
  const [page, setPage] = useState(2);

  useEffect(() => {
    const newInstances = instancesResponse.read();
    setInstances(newInstances);
    setMoreInstances(newInstances.length >= 10);
    setPage(2);
  }, [instancesResponse]);

  const items = useMemo(() => {
    return instances.map((instance) => (
      <div key={instance.performedAt.toString()} className={styles.historyItem}>
        <div className={styles.historyItemDate}>
          {format.format(new Date(instance.performedAt))}
        </div>
        <SetView exerciseType={exercise.exerciseType} sets={instance.sets} />
      </div>
    ));
  }, [instances]);

  const loadMore = useCallback(async () => {
    const params = new URLSearchParams();
    params.set('page', page.toString());
    const nextPage = await fetchFromApi<IWorkoutExercise[]>(
      `/api/workout-instances/${exerciseName}`,
      params
    );
    if (!nextPage.length) {
      setMoreInstances(false);
    } else {
      setInstances([...instances, ...nextPage]);
    }
    setPage(page + 1);
  }, [instances, page]);
  return (
    <div className={styles.root}>
      <div className={styles.top}>
        <h1>{exercise.name}</h1>
        <label>Primary Muscle Group</label>
        <div className={styles.muscleGroups}>
          <MuscleGroupTag muscleGroup={exercise.primaryMuscleGroup} />
        </div>
        {!!exercise.secondaryMuscleGroups?.length && (
          <>
            <label>Secondary Muscle Groups</label>
            <div className={styles.muscleGroups}>
              {exercise.secondaryMuscleGroups.map((group, index) => (
                <MuscleGroupTag key={`${group}_${index}`} muscleGroup={group} />
              ))}
            </div>
          </>
        )}
        <ExerciseMetadata exercise={exercise} className={styles.metadata} />
        <label>History</label>
      </div>
      {!!instances.length ? (
        <InfiniteScroll
          //@ts-ignore
          className={styles.history}
          pageStart={1}
          loadMore={loadMore}
          hasMore={moreInstances}
          useWindow={false}
        >
          {items}
        </InfiniteScroll>
      ) : (
        <div className={styles.noInstances}>
          <i className='fa-solid fa-circle-info'></i>
          <span>You have not performed this exercise before.</span>
        </div>
      )}
      <div className={styles.buttonBar}>
        <Link
          to={`/exercises/${exerciseName}/edit`}
          className='standard-button'
        >
          <i className='fa-solid fa-pen'></i>
          Edit Exercise
        </Link>
      </div>
    </div>
  );
}
