import * as Yup from 'yup';

import { IExercise, ISchedule, IScheduleDay } from '@dgoudie/isometric-types';
import React, { useCallback, useEffect, useMemo, useState } from 'react';

import AppBarWithAppHeaderLayout from '../../components/AppBarWithAppHeaderLayout/AppBarWithAppHeaderLayout';
import RouteLoader from '../../components/RouteLoader/RouteLoader';
import WorkoutPlanEditor from '../../components/WorkoutPlanEditor/WorkoutPlanEditor';
import axios from 'axios';
import classNames from 'classnames';
import styles from './index.module.scss';
import { useFetchFromApi } from '../../utils/fetch-from-api';
import { useNavigate } from 'react-router-dom';

const WorkoutPlanSchema = Yup.array()
    .min(1)
    .required()
    .of(
        Yup.object().shape({
            nickname: Yup.string().required(),
            exercises: Yup.array().min(1).required().of(Yup.string()),
        })
    );

export default function WorkoutPlan() {
    const exercisesResponse = useFetchFromApi<IExercise[]>(
        `/api/exercises`,
        undefined,
        undefined,
        false
    );

    const scheduleResponse = useFetchFromApi<ISchedule>(
        `/api/schedule`,
        undefined,
        undefined,
        false
    );

    const exerciseMap: Map<string, IExercise> = useMemo(
        () =>
            new Map<string, IExercise>(
                !exercisesResponse
                    ? []
                    : exercisesResponse.data.map(({ _id, ...ex }) => [
                          _id,
                          { _id, ...ex },
                      ])
            ),
        [exercisesResponse]
    );

    const [workoutScheduleDays, setWorkoutScheduleDays] = useState<
        IScheduleDay[]
    >([]);

    useEffect(() => {
        !!scheduleResponse &&
            setWorkoutScheduleDays(scheduleResponse.data.days);
    }, [scheduleResponse]);

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

    const save = useCallback(async () => {
        await axios.put(
            `/api/schedule`,
            { days: workoutScheduleDays },
            { withCredentials: true }
        );
        navigate('/home');
    }, [workoutScheduleDays, navigate]);

    const [isReorderMode, setIsReorderMode] = useState(false);

    if (!exercisesResponse || !scheduleResponse) {
        return (
            <AppBarWithAppHeaderLayout pageTitle='Workout Plan'>
                <RouteLoader />
            </AppBarWithAppHeaderLayout>
        );
    }

    return (
        <AppBarWithAppHeaderLayout pageTitle='Workout Plan'>
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
                                {isReorderMode
                                    ? 'Done Reordering'
                                    : 'Reorder Days'}
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
        </AppBarWithAppHeaderLayout>
    );
}
