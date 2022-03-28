import { IExercise, IScheduleDayWithExercises } from '@dgoudie/isometric-types';
import { ReadableResource, fetchFromApi2 } from '../../utils/fetch-from-api';
import { Suspense, useEffect, useMemo, useState, useTransition } from 'react';

import AppBarWithAppHeaderLayout from '../../components/AppBarWithAppHeaderLayout/AppBarWithAppHeaderLayout';
import ConfirmationBottomSheet from '../../components/BottomSheet/components/ConfirmationBottomSheet/ConfirmationBottomSheet';
import { Link } from 'react-router-dom';
import MuscleGroupTag from '../../components/MuscleGroupTag/MuscleGroupTag';
import RouteLoader from '../../components/RouteLoader/RouteLoader';
import classNames from 'classnames';
import { getGreeting } from '../../utils/get-greeting';
import { secondsToMinutes } from 'date-fns';
import styles from './index.module.scss';

const TIME_PER_SET = 60;

let initialScheduleResponse = fetchFromApi2<IScheduleDayWithExercises>(
    `/api/schedule/next-day`
);

export default function Home() {
    const [scheduleResponse, setScheduleResponse] = useState(
        initialScheduleResponse
    );

    const [_isPending, startTransaction] = useTransition();

    useEffect(() => {
        startTransaction(() => {
            const updatedResponse = fetchFromApi2<IScheduleDayWithExercises>(
                `/api/schedule/next-day`
            );
            setScheduleResponse(updatedResponse);
            initialScheduleResponse = updatedResponse;
        });
    }, []);

    return (
        <AppBarWithAppHeaderLayout pageTitle='Home'>
            <Suspense fallback={<RouteLoader />}>
                <HomeContent scheduleResponse={scheduleResponse} />
            </Suspense>
        </AppBarWithAppHeaderLayout>
    );
}

interface HomeContentProps {
    scheduleResponse: ReadableResource<IScheduleDayWithExercises>;
}

function HomeContent({ scheduleResponse }: HomeContentProps) {
    const schedule = scheduleResponse.read();

    const greeting = useMemo(() => getGreeting(), []);

    const dayDurationInSeconds = useMemo(() => {
        return schedule.exercises
            .map(
                (exercise) =>
                    (exercise.breakTimeInSeconds + TIME_PER_SET) *
                    exercise.setCount
            )
            .reduce((sum, exerciseDuration) => sum + exerciseDuration, 0);
    }, [schedule]);

    const setCount = useMemo(() => {
        return schedule.exercises
            .map((exercise) => exercise.setCount)
            .reduce((sum, exerciseDuration) => sum + exerciseDuration, 0);
    }, [schedule]);

    const dayDurationInMinutes = useMemo(
        () => secondsToMinutes(dayDurationInSeconds),
        [dayDurationInSeconds]
    );

    return (
        <div className={styles.wrapper}>
            <h1>{greeting}</h1>
            <div className={styles.root}>
                <div className={styles.day}>
                    <div className={styles.dayHeader}>
                        <div className={styles.dayHeaderNumber}>
                            <div>
                                Day {schedule.dayNumber + 1}/{schedule.dayCount}
                            </div>
                            <div>{schedule.nickname}</div>
                        </div>
                        <div className={styles.dayHeaderMeta}>
                            <HeaderItem
                                title='Duration'
                                value={dayDurationInMinutes}
                                suffix='mins'
                            />
                            <HeaderItem
                                title='Exercises'
                                value={schedule.exercises.length}
                            />
                            <HeaderItem title='Sets' value={setCount} />
                        </div>
                    </div>
                    <div className={styles.exercises}>
                        {schedule.exercises.map((exercise) => (
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
                        Start Day {schedule.dayNumber + 1}
                    </Link>
                </div>
            </div>
        </div>
    );
}

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
                        {exercise.setCount} sets,{' '}
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
