import { IExercise, IScheduleDayWithExercises } from '@dgoudie/isometric-types';
import React, { useMemo } from 'react';

import AppBarWithAppHeaderLayout from '../../components/AppBarWithAppHeaderLayout/AppBarWithAppHeaderLayout';
import { Link } from 'react-router-dom';
import MuscleGroupTag from '../../components/MuscleGroupTag/MuscleGroupTag';
import RouteLoader from '../../components/RouteLoader/RouteLoader';
import classNames from 'classnames';
import { getGreeting } from '../../utils/get-greeting';
import { secondsToMinutes } from 'date-fns';
import styles from './index.module.scss';
import { useFetchFromApi } from '../../utils/fetch-from-api';

const TIME_PER_SET = 60;

type Props = {};

const Home: React.FC<Props> = () => {
    const greeting = useMemo(() => getGreeting(), []);

    const response = useFetchFromApi<IScheduleDayWithExercises>(
        `/api/schedule/next-day`
    );

    const dayDurationInSeconds = useMemo(() => {
        if (!response) {
            return 0;
        }
        return response.data.exercises
            .map(
                (exercise) =>
                    (exercise.breakTimeInSeconds + TIME_PER_SET) *
                    exercise.setCount
            )
            .reduce((sum, exerciseDuration) => sum + exerciseDuration, 0);
    }, [response]);

    const setCount = useMemo(() => {
        if (!response) {
            return 0;
        }
        return response.data.exercises
            .map((exercise) => exercise.setCount)
            .reduce((sum, exerciseDuration) => sum + exerciseDuration, 0);
    }, [response]);

    const dayDurationInMinutes = useMemo(
        () => secondsToMinutes(dayDurationInSeconds),
        [dayDurationInSeconds]
    );

    if (!response) {
        return <RouteLoader />;
    }

    return (
        <AppBarWithAppHeaderLayout pageTitle='Home'>
            <div className={styles.wrapper}>
                <h1>{greeting}</h1>
                <div className={styles.root}>
                    <div className={styles.day}>
                        <div className={styles.dayHeader}>
                            <div className={styles.dayHeaderNumber}>
                                <div>
                                    Day {response.data.dayNumber + 1}/
                                    {response.data.dayCount}
                                </div>
                                <div>{response.data.nickname}</div>
                            </div>
                            <div className={styles.dayHeaderMeta}>
                                <HeaderItem
                                    title='Duration'
                                    value={dayDurationInMinutes}
                                    suffix='mins'
                                />
                                <HeaderItem
                                    title='Exercises'
                                    value={response.data.exercises.length}
                                />
                                <HeaderItem title='Sets' value={setCount} />
                            </div>
                        </div>
                        <div className={styles.exercises}>
                            {response.data.exercises.map((exercise) => (
                                <ExerciseItem
                                    key={exercise._id}
                                    exercise={exercise}
                                />
                            ))}
                        </div>
                    </div>
                    <div className={styles.actions}>
                        <Link
                            to={'/workout-plan'}
                            className={classNames(
                                'standard-button',
                                styles.editPlanButton
                            )}
                        >
                            <i className='fa-solid fa-calendar-week'></i>
                            Edit Plan
                        </Link>
                        <Link
                            to={'/workout-plan'}
                            className={classNames('standard-button primary')}
                        >
                            <i className='fa-solid fa-person-walking'></i>
                            Start Day {response.data.dayNumber + 1}
                        </Link>
                    </div>
                </div>
            </div>
        </AppBarWithAppHeaderLayout>
    );
};

export default Home;

interface HeaderItemProps {
    title: string;
    value: string | number;
    suffix?: string;
}

function HeaderItem({ title, value, suffix }: HeaderItemProps) {
    return (
        <div className={styles.headerItem}>
            <div className={styles.headerItemTitle}>{title}</div>
            <div className={styles.headerItemValue}>
                {value}
                {suffix && (
                    <span className={styles.headerItemValueSuffix}>
                        {suffix}
                    </span>
                )}
            </div>
        </div>
    );
}

interface ExerciseItemProps {
    exercise: IExercise;
}

function ExerciseItem({ exercise }: ExerciseItemProps) {
    const duration = useMemo(() => {
        switch (exercise.exerciseType) {
            case 'rep_based': {
                return <>{exercise.setCount} sets</>;
            }
            case 'timed': {
                if (exercise.setCount < 2) {
                    return (
                        <>
                            {secondsToMinutes(exercise.timePerSetInSeconds!)}{' '}
                            minutes
                        </>
                    );
                }
                return (
                    <>
                        {exercise.setCount} sets —{' '}
                        {secondsToMinutes(exercise.timePerSetInSeconds!)}{' '}
                        Minutes
                    </>
                );
            }
            default: {
                return (
                    <>
                        {exercise.setCount} sets —{' '}
                        {exercise.minimumRecommendedRepetitions}-
                        {exercise.maximumRecommendedRepetitions} reps
                    </>
                );
            }
        }
    }, [exercise]);

    return (
        <div className={styles.exercise}>
            <div className={styles.exerciseName}>{exercise.name}</div>
            <div className={styles.exerciseGroup}>
                <MuscleGroupTag muscleGroup={exercise.primaryMuscleGroup} />
            </div>
            <div className={styles.exerciseDuration}>{duration}</div>
        </div>
    );
}
