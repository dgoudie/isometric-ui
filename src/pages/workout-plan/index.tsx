import * as Yup from 'yup';

import { FieldArray, Form, Formik } from 'formik';
import React, { useMemo } from 'react';

import AppBarWithAppHeaderLayout from '../../components/AppBarWithAppHeaderLayout/AppBarWithAppHeaderLayout';
import { IExercise } from '@dgoudie/isometric-types';
import MuscleGroupTag from '../../components/MuscleGroupTag/MuscleGroupTag';
import { Navigate } from 'react-router-dom';
import RouteLoader from '../../components/RouteLoader/RouteLoader';
import styles from './index.module.scss';
import { useFetchFromApi } from '../../utils/fetch-from-api';

const WorkoutPlanSchema = Yup.array().of(
    Yup.object().shape({
        days: Yup.array()
            .required()
            .min(1)
            .of(
                Yup.object().shape({
                    exercises: Yup.array()
                        .required()
                        .min(1)
                        .of(Yup.string().required()),
                })
            ),
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
                <h2>Click a day to expand it...</h2>
                <Formik
                    initialValues={{
                        days: [
                            { exercises: ['622cf5ac671ab3d12676b6c8'] },
                            {
                                exercises: [
                                    '622cf5ac671ab3d12676b6c9',
                                    '622cf5ac671ab3d12676b731',
                                ],
                            },
                            { exercises: ['622cf5ac671ab3d12676b6c8'] },
                            {
                                exercises: [
                                    '622cf5ac671ab3d12676b6c9',
                                    '622cf5ac671ab3d12676b731',
                                ],
                            },
                            { exercises: ['622cf5ac671ab3d12676b6c8'] },
                            {
                                exercises: [
                                    '622cf5ac671ab3d12676b6c9',
                                    '622cf5ac671ab3d12676b731',
                                ],
                            },
                            { exercises: ['622cf5ac671ab3d12676b6c8'] },
                            {
                                exercises: [
                                    '622cf5ac671ab3d12676b6c9',
                                    '622cf5ac671ab3d12676b731',
                                ],
                            },
                            { exercises: ['622cf5ac671ab3d12676b6c8'] },
                            {
                                exercises: [
                                    '622cf5ac671ab3d12676b6c9',
                                    '622cf5ac671ab3d12676b731',
                                ],
                            },
                            { exercises: ['622cf5ac671ab3d12676b6c8'] },
                            {
                                exercises: [
                                    '622cf5ac671ab3d12676b6c9',
                                    '622cf5ac671ab3d12676b731',
                                ],
                            },
                            { exercises: ['622cf5ac671ab3d12676b6c8'] },
                            {
                                exercises: [
                                    '622cf5ac671ab3d12676b6c9',
                                    '622cf5ac671ab3d12676b731',
                                ],
                            },
                        ],
                    }}
                    validationSchema={WorkoutPlanSchema}
                    onSubmit={(values) => {
                        console.log('values', values);
                    }}
                >
                    {({ values }) => (
                        <Form className={styles.root}>
                            <FieldArray name='days'>
                                {(arrayHelpers) => (
                                    <React.Fragment>
                                        <div className={styles.list}>
                                            {values.days.map((day, index) => (
                                                <Day
                                                    day={day}
                                                    index={index}
                                                    key={index}
                                                    map={exerciseMap}
                                                />
                                            ))}
                                        </div>
                                        <div className={styles.buttonBar}>
                                            <button
                                                type='submit'
                                                className='standard-button primary'
                                            >
                                                <i className='fa-solid fa-save' />
                                                Save
                                            </button>
                                        </div>
                                    </React.Fragment>
                                )}
                            </FieldArray>
                        </Form>
                    )}
                </Formik>
            </div>
        </AppBarWithAppHeaderLayout>
    );
}

interface DayProps {
    day: { exercises: string[] };
    index: number;
    map: Map<string, IExercise>;
}

function Day({ day, index, map }: DayProps) {
    return (
        <details key={index} className={styles.day}>
            <summary>Day {index + 1}</summary>
            <FieldArray name={`days.${index}.exercises`}>
                {(arrayHelpers) => {
                    return day.exercises.map((exerciseId, index) => {
                        const exercise = map.get(exerciseId)!;
                        return (
                            <div className={styles.exercise} key={exerciseId}>
                                <div className={styles.exerciseName}>
                                    {exercise.name}
                                </div>
                                <MuscleGroupTag
                                    muscleGroup={exercise.primaryMuscleGroup}
                                />
                            </div>
                        );
                    });
                }}
            </FieldArray>
        </details>
    );
}
