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
import { formatDistance, formatDuration, intervalToDuration } from 'date-fns';

import AppBarWithAppHeaderLayout from '../../components/AppBarWithAppHeaderLayout/AppBarWithAppHeaderLayout';
import InfiniteScroll from '../../components/InfiniteScroll/InfiniteScroll';
import MuscleGroupTag from '../../components/MuscleGroupTag/MuscleGroupTag';
import RouteLoader from '../../components/RouteLoader/RouteLoader';
import SetView from '../../components/SetView/SetView';
import classNames from 'classnames';
import { fetchFromApi } from '../../utils/fetch-from-api';
import { secondsToMilliseconds } from 'date-fns/esm';
import styles from './index.module.scss';
import { useFetch } from 'usehooks-ts';

const format = new Intl.DateTimeFormat('en-US', {
  dateStyle: 'medium',
  timeStyle: 'short',
});

export default function History() {
  const { data: workouts } = useFetch<IWorkout[]>(`/api/workouts?page=1`);
  let children = <RouteLoader />;

  if (!!workouts) {
    children = <HistoryContent workouts={workouts} />;
  }
  return (
    <AppBarWithAppHeaderLayout pageTitle='History'>
      {children}
    </AppBarWithAppHeaderLayout>
  );
}

interface HistoryContentProps {
  workouts: IWorkout[];
}

function HistoryContent({ workouts: _workouts }: HistoryContentProps) {
  const [workouts, setWorkouts] = useState(_workouts);
  const [moreWorkouts, setMoreWorkouts] = useState(workouts.length >= 10);
  const [page, setPage] = useState(2);

  const items = useMemo(
    () =>
      workouts.map((workout) => (
        <Workout workout={workout} key={workout._id} />
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
}

function Workout({ workout }: WorkoutProps) {
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
        return (
          <div key={index} className={styles.exercise}>
            <div className={styles.exerciseHeader}>
              <div>{exercise.exercise.name}</div>
              <MuscleGroupTag
                muscleGroup={exercise.exercise.primaryMuscleGroup}
              />
            </div>
            <SetView
              exerciseType={exercise.exercise.exerciseType}
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
