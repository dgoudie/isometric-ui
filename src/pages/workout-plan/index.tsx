import * as Yup from 'yup';

import { IExercise, ISchedule, IScheduleDay } from '@dgoudie/isometric-types';
import {
    ReadableResource,
    fetchFromApiAsReadableResource,
} from '../../utils/fetch-from-api';
import {
    Suspense,
    useCallback,
    useEffect,
    useMemo,
    useState,
    useTransition,
} from 'react';

import AppBarWithAppHeaderLayout from '../../components/AppBarWithAppHeaderLayout/AppBarWithAppHeaderLayout';
import RouteLoader from '../../components/RouteLoader/RouteLoader';
import WorkoutPlanEditor from '../../components/WorkoutPlanEditor/WorkoutPlanEditor';
import axios from 'axios';
import classNames from 'classnames';
import styles from './index.module.scss';
import { useNavigate } from 'react-router-dom';
import { useSnackbar } from '../../utils/use-snackbar';
import { v4 } from 'uuid';

const WorkoutPlanSchema = Yup.array()
    .min(1)
    .required()
    .of(
        Yup.object().shape({
            nickname: Yup.string().required(),
            exerciseIds: Yup.array().min(1).required().of(Yup.string()),
        })
    );

let initialExercisesResponse =
    fetchFromApiAsReadableResource<IExercise[]>(`/api/exercises`);
let initialScheduleResponse = fetchFromApiAsReadableResource<ISchedule | null>(
    `/api/schedule`
);

export default function WorkoutPlan() {
    const [exercisesResponse, setExercisesResponse] = useState(
        initialExercisesResponse
    );
    const [scheduleResponse, setScheduleResponse] = useState(
        initialScheduleResponse
    );

    const [_isPending, startTransaction] = useTransition();

    useEffect(() => {
        startTransaction(() => {
            const updatedExercisesResponse =
                fetchFromApiAsReadableResource<IExercise[]>(`/api/exercises`);
            const updatedScheduleResponse =
                fetchFromApiAsReadableResource<ISchedule | null>(
                    `/api/schedule`
                );
            setExercisesResponse(updatedExercisesResponse);
            setScheduleResponse(updatedScheduleResponse);
            initialExercisesResponse = updatedExercisesResponse;
            initialScheduleResponse = updatedScheduleResponse;
        });
    }, []);

    return (
        <AppBarWithAppHeaderLayout pageTitle='Workout Plan'>
            <Suspense fallback={<RouteLoader />}>
                <WorkoutPlanContent
                    scheduleResponse={scheduleResponse}
                    exercisesResponse={exercisesResponse}
                />
            </Suspense>
        </AppBarWithAppHeaderLayout>
    );
}

interface WorkoutPlanContentProps {
    exercisesResponse: ReadableResource<IExercise[]>;
    scheduleResponse: ReadableResource<ISchedule | null>;
}

function WorkoutPlanContent({
    exercisesResponse,
    scheduleResponse,
}: WorkoutPlanContentProps) {
    let exercises = exercisesResponse.read();
    let schedule = scheduleResponse.read();
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

    const [openSnackbar] = useSnackbar();

    const save = useCallback(async () => {
        await axios.put(
            `/api/schedule`,
            { days: workoutScheduleDays },
            { withCredentials: true }
        );
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
                                className={`fa-solid fa-${
                                    isReorderMode ? 'check' : 'sort'
                                }`}
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
