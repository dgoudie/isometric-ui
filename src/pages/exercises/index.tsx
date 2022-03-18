import {
    ExerciseMuscleGroup,
    ExerciseMuscleGroups,
    IExercise,
} from '@dgoudie/isometric-types';
import { Link, Navigate, useSearchParams } from 'react-router-dom';
import { useEffect, useMemo, useState } from 'react';

import AppBarWithAppHeaderLayout from '../../components/AppBarWithAppHeaderLayout/AppBarWithAppHeaderLayout';
import MuscleGroupPicker from '../../components/MuscleGroupPicker/MuscleGroupPicker';
import MuscleGroupTag from '../../components/MuscleGroupTag/MuscleGroupTag';
import RouteLoader from '../../components/RouteLoader/RouteLoader';
import styles from './index.module.scss';
import useDebounce from '../../utils/use-debouce';
import { useFetchFromApi } from '../../utils/fetch-from-api';

const Exercises = () => {
    const [searchParams, setSearchParams] = useSearchParams();

    const q = searchParams.get('q');
    const muscleGroup = searchParams.get('muscleGroup');
    const muscleGroupDecoded = !!muscleGroup
        ? (muscleGroup as ExerciseMuscleGroup)
        : undefined;

    const [searchTerm, setSearchTerm] = useState(q ?? '');

    const debouncedSearchTerm = useDebounce(searchTerm, 500);

    useEffect(() => {
        if (
            !!muscleGroupDecoded &&
            !ExerciseMuscleGroups.includes(muscleGroupDecoded)
        ) {
            searchParams.delete('muscleGroup');
            setSearchParams(searchParams);
        }
    }, [muscleGroupDecoded, searchParams, setSearchParams]);

    useEffect(() => {
        if (!!debouncedSearchTerm) {
            searchParams.set('q', debouncedSearchTerm);
        } else {
            searchParams.delete('q');
        }
        setSearchParams(searchParams);
    }, [debouncedSearchTerm, searchParams, setSearchParams]);

    const [response, error, loading] = useFetchFromApi<IExercise[]>(
        `/api/exercises`,
        searchParams,
        undefined,
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
        child = <div className={styles.items}>{items}</div>;
    }

    if (!!error) {
        return <Navigate to={'/error'} />;
    }

    return (
        <AppBarWithAppHeaderLayout pageTitle={'Exercises'}>
            <div className={styles.root}>
                <div className={styles.filters}>
                    <label>Search:</label>
                    <div className={styles.filtersInput}>
                        <input
                            defaultValue={searchTerm}
                            type={'search'}
                            placeholder='Enter a search term...'
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <label>Muscle Group:</label>
                    <MuscleGroupPicker
                        value={muscleGroupDecoded}
                        valueChanged={(group) => {
                            if (!group) {
                                searchParams.delete('muscleGroup');
                            } else {
                                searchParams.set('muscleGroup', group);
                            }
                            setSearchParams(searchParams);
                        }}
                    />
                </div>
                {child}
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
