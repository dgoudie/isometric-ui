import { useEffect, useMemo } from 'react';

import AppBarWithAppHeaderLayout from '../../components/AppBarWithAppHeaderLayout/AppBarWithAppHeaderLayout';
import { IExercise } from '@dgoudie/isometric-types';
import { Link } from 'react-router-dom';
import MuscleGroupTag from '../../components/MuscleGroupTag/MuscleGroupTag';
import styles from './index.module.scss';
import { useFetchFromApi } from '../../utils/fetch-from-api';

const Exercises = () => {
    useEffect(() => {
        document.title = `Exercises | ISOMETRIC`;
    }, []);

    const [response] = useFetchFromApi<IExercise[]>(
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

    return (
        <AppBarWithAppHeaderLayout>
            <div className={styles.root}>
                <div className={styles.items}>{items}</div>
            </div>
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
