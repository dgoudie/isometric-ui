import * as Yup from 'yup';

import {
    IExercise,
    IWorkoutSchedule,
    IWorkoutScheduleDay,
} from '@dgoudie/isometric-types';
import React, { useCallback, useEffect, useMemo, useState } from 'react';

import AppBarWithAppHeaderLayout from '../../components/AppBarWithAppHeaderLayout/AppBarWithAppHeaderLayout';
import { Navigate } from 'react-router-dom';
import RouteLoader from '../../components/RouteLoader/RouteLoader';
import WorkoutPlanEditor from '../../components/WorkoutPlanEditor/WorkoutPlanEditor';
import axios from 'axios';
import styles from './index.module.scss';
import { useFetchFromApi } from '../../utils/fetch-from-api';

const WorkoutPlanSchema = Yup.array()
    .min(1)
    .required()
    .of(
        Yup.object().shape({
            exercises: Yup.array().min(1).required().of(Yup.string()),
        })
    );

export default function WorkoutPlan() {
    const [exercisesResponse, error1, loading1] = useFetchFromApi<
        (IExercise & { _id: string })[]
    >(`/api/exercises`, undefined, undefined, false);

    const [scheduleResponse, error2, loading2] =
        useFetchFromApi<IWorkoutSchedule>(
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
                    : exercisesResponse.data.map(({ _id, ...ex }) => [_id, ex])
            ),
        [exercisesResponse]
    );

    const [workoutScheduleDays, setWorkoutScheduleDays] = useState<
        IWorkoutScheduleDay[]
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

    const save = useCallback(() => {
        axios.put(
            `/api/schedule`,
            { days: workoutScheduleDays },
            { withCredentials: true }
        );
    }, [workoutScheduleDays]);

    if (!!loading1 || !!loading2) {
        return (
            <AppBarWithAppHeaderLayout pageTitle='Workout Plan'>
                <RouteLoader />
            </AppBarWithAppHeaderLayout>
        );
    }

    if (!!error1 || error2) {
        return <Navigate to={'/error'} />;
    }

    return (
        <AppBarWithAppHeaderLayout pageTitle='Workout Plan'>
            <div className={styles.wrapper}>
                <h1>Workout Plan</h1>
                <div className={styles.root}>
                    <WorkoutPlanEditor
                        days={workoutScheduleDays}
                        exerciseMap={exerciseMap}
                        daysChanged={setWorkoutScheduleDays}
                    />
                    {!!workoutScheduleDays.length && (
                        <div className={styles.buttonBar}>
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
