import {
    ExerciseMuscleGroup,
    ExerciseMuscleGroups,
    IExercise,
} from '@dgoudie/isometric-types';
import { Link, Navigate, useSearchParams } from 'react-router-dom';
import { useEffect, useMemo } from 'react';

import AppBarWithAppHeaderLayout from '../../components/AppBarWithAppHeaderLayout/AppBarWithAppHeaderLayout';
import MuscleGroupPicker from '../../components/MuscleGroupPicker/MuscleGroupPicker';
import MuscleGroupTag from '../../components/MuscleGroupTag/MuscleGroupTag';
import RouteLoader from '../../components/RouteLoader/RouteLoader';
import styles from './index.module.scss';
import { useFetchFromApi } from '../../utils/fetch-from-api';

const Exercises = () => {
    const [searchParams, setSearchParams] = useSearchParams();

    const muscleGroup = useMemo(() => {
        const mg = searchParams.get('muscleGroup');
        if (!!mg) {
            return decodeURIComponent(mg) as ExerciseMuscleGroup;
        }
        return undefined;
    }, [searchParams]);

    useEffect(() => {
        if (!!muscleGroup && !ExerciseMuscleGroups.includes(muscleGroup)) {
            searchParams.delete('muscleGroup');
            setSearchParams(searchParams);
        }
    }, [muscleGroup, searchParams, setSearchParams]);

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
                <div className={styles.filters}>
                    <label>Search:</label>
                    <div className={styles.filtersInput}>
                        <input
                            type={'search'}
                            placeholder='Enter a search term...'
                        />
                    </div>
                    <label>Muscle Group:</label>
                    <MuscleGroupPicker
                        value={muscleGroup}
                        valueChanged={(group) => {
                            if (!group) {
                                searchParams.delete('muscleGroup');
                            } else {
                                searchParams.set(
                                    'muscleGroup',
                                    encodeURIComponent(group)
                                );
                            }
                            setSearchParams(searchParams);
                        }}
                    />
                </div>
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
