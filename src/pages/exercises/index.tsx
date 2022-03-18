import { Link, Navigate } from 'react-router-dom';

import AppBarWithAppHeaderLayout from '../../components/AppBarWithAppHeaderLayout/AppBarWithAppHeaderLayout';
import { IExercise } from '@dgoudie/isometric-types';
import MuscleGroupTag from '../../components/MuscleGroupTag/MuscleGroupTag';
import RouteLoader from '../../components/RouteLoader/RouteLoader';
import styles from './index.module.scss';
import { useFetchFromApi } from '../../utils/fetch-from-api';
import { useMemo } from 'react';

const Exercises = () => {
    const [response, error, loading] = useFetchFromApi<IExercise[]>(
        `/api/exercises`,
        null,
        null,
        false
    );

    const items = useMemo(
        () =>
            response?.data.map((ex) => (
                <ExerciseButton key={ex.name} exercise={ex} />
            )),
        [response]
    );
    let child = <RouteLoader />;

    if (!loading) {
        child = (
            <div className={styles.root}>
                <div className={styles.items}>{items}</div>
            </div>
        );
    }

    if (!!error) {
        return <Navigate to={'/error'} />;
    }

    return (
        <AppBarWithAppHeaderLayout pageTitle={'Exercises'}>
            {child}
        </AppBarWithAppHeaderLayout>
    );
};

export default Exercises;

interface ExerciseButtonProps {
    exercise: IExercise;
}

const ExerciseButton = ({ exercise }: ExerciseButtonProps) => {
    const format = useMemo(() => new Intl.DateTimeFormat('en-US'), []);

    const muscleGroupTags = useMemo(
        () =>
            [
                exercise.primaryMuscleGroup,
                ...(exercise.secondaryMuscleGroups ?? []),
            ].map((group) => (
                <MuscleGroupTag
                    className={styles.itemMusclesItem}
                    key={`${exercise.name}_${group}`}
                    muscleGroup={group}
                />
            )),
        [exercise]
    );
    return (
        <Link to={`/exercises/${exercise.name}`} className={styles.item}>
            <div className={styles.itemTitle}>{exercise.name}</div>
            <div className={styles.itemMuscles}>{muscleGroupTags}</div>
            <ol className={styles.itemMeta}>
                <li>PR: 185 lbs ({format.format(new Date())})</li>
                <li>Last Performed: {format.format(new Date())}</li>
            </ol>
        </Link>
    );
};
