import * as Yup from 'yup';

import { IExercise, ISchedule, IScheduleDay } from '@dgoudie/isometric-types';
import {
  Suspense,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  useTransition,
} from 'react';

import AppBarWithAppHeaderLayout from '../../components/AppBarWithAppHeaderLayout/AppBarWithAppHeaderLayout';
import RouteLoader from '../../components/RouteLoader/RouteLoader';
import { SnackbarContext } from '../../providers/Snackbar/Snackbar';
import WorkoutPlanEditor from '../../components/WorkoutPlanEditor/WorkoutPlanEditor';
import classNames from 'classnames';
import styles from './index.module.scss';
import { useFetch } from 'usehooks-ts';
import { useNavigate } from 'react-router-dom';

const WorkoutPlanSchema = Yup.array()
  .min(1)
  .required()
  .of(
    Yup.object().shape({
      nickname: Yup.string().required(),
      exerciseIds: Yup.array().min(1).required().of(Yup.string()),
    })
  );

export default function WorkoutPlan() {
  const { data: exercisesResponse } = useFetch<IExercise[]>(`/api/exercises`);
  const { data: scheduleResponse } = useFetch<ISchedule | null>(
    `/api/schedule`
  );

  let children = <RouteLoader />;

  if (!!exercisesResponse && !!scheduleResponse) {
    children = (
      <WorkoutPlanContent
        schedule={scheduleResponse}
        exercises={exercisesResponse}
      />
    );
  }

  return (
    <AppBarWithAppHeaderLayout pageTitle='Workout Plan'>
      {children}
    </AppBarWithAppHeaderLayout>
  );
}

interface WorkoutPlanContentProps {
  exercises: IExercise[];
  schedule: ISchedule | null;
}

function WorkoutPlanContent({ exercises, schedule }: WorkoutPlanContentProps) {
  const exerciseMap: Map<string, IExercise> = useMemo(
    () =>
      new Map<string, IExercise>(
        exercises.map(({ _id, ...ex }) => [_id, { _id, ...ex }])
      ),
    [exercises]
  );

  const days = schedule?.days ?? [];

  const [workoutScheduleDays, setWorkoutScheduleDays] =
    useState<IScheduleDay[]>(days);

  useEffect(() => setWorkoutScheduleDays(days), [schedule]);

  const valid = useMemo(() => {
    try {
      WorkoutPlanSchema.validateSync(workoutScheduleDays, {
        strict: true,
      });
      return true;
    } catch (e) {
      return false;
    }
  }, [workoutScheduleDays]);

  const navigate = useNavigate();

  const { openSnackbar } = useContext(SnackbarContext);

  const save = useCallback(async () => {
    await fetch(`/api/schedule`, {
      method: 'PUT',
      body: JSON.stringify({ days: workoutScheduleDays }),
      headers: { 'content-type': 'application/json' },
      credentials: 'same-origin',
    });
    openSnackbar('Schedule saved successfully.');
    navigate('/home');
  }, [workoutScheduleDays, navigate]);

  const [isReorderMode, setIsReorderMode] = useState(false);

  return (
    <div className={styles.wrapper}>
      <h1>Workout Plan</h1>
      <div className={styles.root}>
        <WorkoutPlanEditor
          dayReorderModeEnabled={isReorderMode}
          days={workoutScheduleDays}
          exerciseMap={exerciseMap}
          daysChanged={setWorkoutScheduleDays}
        />
        {!!workoutScheduleDays.length && (
          <div className={styles.buttonBar}>
            <button
              onClick={() => setIsReorderMode(!isReorderMode)}
              type='button'
              className={classNames(
                'standard-button outlined',
                isReorderMode && 'highlighted'
              )}
            >
              <i
                className={`fa-solid fa-${isReorderMode ? 'check' : 'sort'}`}
              />
              {isReorderMode ? 'Done Reordering' : 'Reorder Days'}
            </button>
            <button
              disabled={!valid}
              onClick={save}
              type='button'
              className='standard-button primary'
            >
              <i className='fa-solid fa-save' />
              Save
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
