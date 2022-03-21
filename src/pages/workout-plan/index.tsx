import * as Yup from 'yup';

import { IExercise, IWorkoutScheduleDay } from '@dgoudie/isometric-types';
import React, { useMemo, useState } from 'react';

import AppBarWithAppHeaderLayout from '../../components/AppBarWithAppHeaderLayout/AppBarWithAppHeaderLayout';
import { Navigate } from 'react-router-dom';
import RouteLoader from '../../components/RouteLoader/RouteLoader';
import WorkoutPlanEditor from '../../components/WorkoutPlanEditor/WorkoutPlanEditor';
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
    const [response, error, loading] = useFetchFromApi<
        (IExercise & { _id: string })[]
    >(`/api/exercises`, undefined, undefined, false);

    const exerciseMap: Map<string, IExercise> = useMemo(
        () =>
            new Map<string, IExercise>(
                !response
                    ? []
                    : response.data.map(({ _id, ...ex }) => [_id, ex])
            ),
        [response]
    );

    const [workoutScheduleDays, setWorkoutScheduleDays] = useState<
        IWorkoutScheduleDay[]
    >([]);

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

    if (!!loading) {
        return (
            <AppBarWithAppHeaderLayout pageTitle='Workout Plan'>
                <RouteLoader />
            </AppBarWithAppHeaderLayout>
        );
    }

    if (!!error) {
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
