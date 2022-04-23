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
import { useDetails } from '@primer/react';

const format = new Intl.DateTimeFormat('en-US', {
  dateStyle: 'medium',
  timeStyle: 'short',
});

let initialResource = fetchFromApiAsReadableResource<IWorkout[]>(
  `/api/workouts`,
  { page: '1' }
);

export default function History() {
  const [resource, setResponse] = useState(initialResource);

  const [_isPending, startTransaction] = useTransition();

  useEffect(() => {
    startTransaction(() => {
      const updatedResource = fetchFromApiAsReadableResource<IWorkout[]>(
        `/api/workouts`,
        { page: '1' }
      );
      setResponse(updatedResource);
      initialResource = updatedResource;
    });
  }, []);

  return (
    <AppBarWithAppHeaderLayout pageTitle='History'>
      <Suspense fallback={<RouteLoader />}>
        <HistoryContent resource={resource} />
      </Suspense>
    </AppBarWithAppHeaderLayout>
  );
}

interface HistoryContentProps {
  resource: ReadableResource<IWorkout[]>;
}

function HistoryContent({ resource }: HistoryContentProps) {
  const [workouts, setWorkouts] = useState(resource.read());
  const [moreWorkouts, setMoreWorkouts] = useState(workouts.length >= 10);
  const [page, setPage] = useState(2);

  useEffect(() => {
    const newWorkouts = resource.read();
    setWorkouts(newWorkouts);
    setMoreWorkouts(newWorkouts.length >= 10);
    setPage(2);
  }, [resource]);

  const items = useMemo(() => {
    return workouts.map((workout) => (
      <Workout workout={workout} key={workout._id} />
    ));
  }, [workouts]);

  const loadMore = useCallback(async () => {
    const params = new URLSearchParams();
    params.set('page', page.toString());
    const nextPage = await fetchFromApi<IWorkout[]>(`/api/workouts`, params);
    if (nextPage.length < 10) {
      setMoreWorkouts(false);
    }
    setWorkouts([...workouts, ...nextPage]);
    setPage(page + 1);
  }, [workouts, page]);

  return (
    <div className={styles.root}>
      <h1>Workout History</h1>
      <div className={styles.workouts}>
        <InfiniteScroll
          //@ts-ignore
          className={styles.workoutsInner}
          pageStart={1}
          loadMore={loadMore}
          hasMore={moreWorkouts}
          useWindow={false}
        >
          {items}
        </InfiniteScroll>
      </div>
    </div>
  );
}

interface WorkoutProps {
  workout: IWorkout;
}

function Workout({ workout }: WorkoutProps) {
  const howLongAgo = useMemo(
    () =>
      formatDistance(new Date(workout.createdAt), new Date(), {
        addSuffix: true,
      }),
    [workout]
  );
  const duration = useMemo(() => {
    if (workout.durationInSeconds! < 60) {
      return `${workout.durationInSeconds!} seconds`;
    } else {
      return formatDuration(
        intervalToDuration({
          start: 0,
          end: secondsToMilliseconds(workout.durationInSeconds!),
        }),
        { format: ['hours', 'minutes'] }
      );
    }
  }, [workout]);

  const exercises = useMemo(
    () =>
      workout.exercises.map((exercise, index) => {
        return (
          <div key={index} className={styles.exercise}>
            <div className={styles.exerciseHeader}>
              <div>{exercise.name}</div>
              <MuscleGroupTag muscleGroup={exercise.primaryMuscleGroup} />
            </div>
            <SetView
              exerciseType={exercise.exerciseType}
              sets={exercise.sets.filter((set) => set.complete)}
            />
          </div>
        );
      }),
    [workout]
  );

  const { getDetailsProps, open } = useDetails({});

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
      <details {...getDetailsProps()}>
        <summary
          className={classNames(
            'standard-button outlined',
            open && 'highlighted'
          )}
        >
          <i className='fa-solid fa-person-walking'></i>
          <span>{open ? 'Hide' : 'Show'} Exercises</span>
        </summary>
        <div className={styles.exercises}>{exercises}</div>
      </details>
    </div>
  );
}
