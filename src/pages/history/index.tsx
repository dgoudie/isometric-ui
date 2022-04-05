import {
  IExerciseExtended,
  IWorkout,
  IWorkoutExercise,
} from '@dgoudie/isometric-types';
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
  fetchFromApi,
  fetchFromApiAsReadableResource,
} from '../../utils/fetch-from-api';
import { formatDistance, formatDuration, intervalToDuration } from 'date-fns';

import AppBarWithAppHeaderLayout from '../../components/AppBarWithAppHeaderLayout/AppBarWithAppHeaderLayout';
import InfiniteScroll from '../../components/InfiniteScroll/InfiniteScroll';
import MuscleGroupTag from '../../components/MuscleGroupTag/MuscleGroupTag';
import RouteLoader from '../../components/RouteLoader/RouteLoader';
import SetView from '../../components/SetView/SetView';
import classNames from 'classnames';
import { secondsToMilliseconds } from 'date-fns/esm';
import styles from './index.module.scss';

const format = new Intl.DateTimeFormat('en-US', {
  dateStyle: 'medium',
  timeStyle: 'short',
});

let initialResource = fetchFromApiAsReadableResource<IWorkout[]>(
  `/api/workouts`,
  { page: '1' }
);

let initialExercisesResource =
  fetchFromApiAsReadableResource<IExerciseExtended[]>(`/api/exercises`);

export default function History() {
  const [resource, setResponse] = useState(initialResource);
  const [exercisesResource, setExercisesResource] = useState(
    initialExercisesResource
  );

  const [_isPending, startTransaction] = useTransition();

  useEffect(() => {
    startTransaction(() => {
      const updatedResource = fetchFromApiAsReadableResource<IWorkout[]>(
        `/api/workouts`,
        { page: '1' }
      );
      setResponse(updatedResource);
      initialResource = updatedResource;
      const updatedExercisesResource =
        fetchFromApiAsReadableResource<IExerciseExtended[]>(`/api/exercises`);
      setExercisesResource(updatedExercisesResource);
      initialExercisesResource = updatedExercisesResource;
    });
  }, []);

  return (
    <AppBarWithAppHeaderLayout pageTitle='History'>
      <Suspense fallback={<RouteLoader />}>
        <HistoryContent
          resource={resource}
          exercisesResource={exercisesResource}
        />
      </Suspense>
    </AppBarWithAppHeaderLayout>
  );
}

interface HistoryContentProps {
  resource: ReadableResource<IWorkout[]>;
  exercisesResource: ReadableResource<IExerciseExtended[]>;
}

function HistoryContent({ resource, exercisesResource }: HistoryContentProps) {
  const exerciseMap: Map<string, IExerciseExtended> = useMemo(
    () =>
      new Map<string, IExerciseExtended>(
        exercisesResource.read().map(({ _id, ...ex }) => [_id, { _id, ...ex }])
      ),
    [exercisesResource]
  );

  const [workouts, setWorkouts] = useState(resource.read());
  const [moreWorkouts, setMoreWorkouts] = useState(workouts.length >= 10);
  const [page, setPage] = useState(2);

  const items = useMemo(
    () =>
      workouts.map((workout) => (
        <Workout
          workout={workout}
          key={workout._id}
          exerciseMap={exerciseMap}
        />
      )),
    [workouts]
  );

  const loadMore = useCallback(async () => {
    const params = new URLSearchParams();
    params.set('page', page.toString());
    const nextPage = await fetchFromApi<IWorkout[]>(`/api/workouts`, params);
    if (!nextPage.length) {
      setMoreWorkouts(false);
    } else {
      setWorkouts([...workouts, ...nextPage]);
    }
    setPage(page + 1);
  }, [workouts, page]);

  return (
    <AppBarWithAppHeaderLayout pageTitle='History'>
      <div className={styles.root}>
        <h1>Workout History</h1>
        <InfiniteScroll
          //@ts-ignore
          className={styles.workouts}
          pageStart={1}
          loadMore={loadMore}
          hasMore={moreWorkouts}
          useWindow={false}
        >
          {items}
        </InfiniteScroll>
      </div>
    </AppBarWithAppHeaderLayout>
  );
}

interface WorkoutProps {
  workout: IWorkout;
  exerciseMap: Map<string, IExerciseExtended>;
}

function Workout({ workout, exerciseMap }: WorkoutProps) {
  const howLongAgo = useMemo(
    () =>
      formatDistance(new Date(workout.createdAt), new Date(), {
        addSuffix: true,
      }),
    [workout]
  );
  const duration = useMemo(
    () =>
      formatDuration(
        intervalToDuration({
          start: 0,
          end: secondsToMilliseconds(workout.durationInSeconds!),
        }),
        { format: ['hours', 'minutes'] }
      ),
    [workout]
  );

  const exercises = useMemo(
    () =>
      workout.exercises.map((exercise, index) => {
        const exerciseData = exerciseMap.get(exercise.exerciseId)!;
        return (
          <div key={index} className={styles.exercise}>
            <div className={styles.exerciseHeader}>
              <div>{exerciseData.name}</div>
              <MuscleGroupTag muscleGroup={exerciseData.primaryMuscleGroup} />
            </div>
            <SetView
              exerciseType={exerciseData.exerciseType}
              sets={exercise.sets.filter((set) => set.complete)}
            />
          </div>
        );
      }),
    [workout]
  );

  return (
    <div className={classNames(styles.workout, 'fade-in')}>
      <div className={styles.item}>
        <div className={styles.header}>{workout.nickname}</div>
      </div>
      <div className={styles.item}>
        <label>Date</label>
        <div>{format.format(new Date(workout.createdAt))}</div>
        <div className={styles.suffix}>{howLongAgo}</div>
      </div>
      <div className={styles.item}>
        <label>Duration</label>
        <div>{duration}</div>
      </div>
      <div className={styles.exercises}>{exercises}</div>
    </div>
  );
}
