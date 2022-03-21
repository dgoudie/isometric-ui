import { ExerciseMuscleGroup, IExercise } from '@dgoudie/isometric-types';
import React, { useMemo } from 'react';

import { Link } from 'react-router-dom';
import MuscleGroupPicker from '../MuscleGroupPicker/MuscleGroupPicker';
import MuscleGroupTag from '../MuscleGroupTag/MuscleGroupTag';
import RouteLoader from '../RouteLoader/RouteLoader';
import styles from './ExerciseSearch.module.scss';
import { useFetchFromApi } from '../../utils/fetch-from-api';

interface Props {
    search: string | undefined;
    searchChanged: (search: string | undefined) => void;
    muscleGroup: ExerciseMuscleGroup | undefined;
    muscleGroupChanged: (muscleGroup: ExerciseMuscleGroup | undefined) => void;
    onSelect?: (exerciseId: string) => void;
}

export default function ExerciseSearch({
    search,
    searchChanged,
    muscleGroup,
    muscleGroupChanged,
    onSelect,
}: Props) {
    const searchParams = useMemo(() => {
        const searchParams = new URLSearchParams();
        !!search && searchParams.set('search', search);
        !!muscleGroup && searchParams.set('muscleGroup', muscleGroup);
        return searchParams;
    }, [muscleGroup, search]);

    const [response, error, loading] = useFetchFromApi<
        (IExercise & { _id: string })[]
    >(`/api/exercises`, searchParams, undefined, false);

    const items = useMemo(
        () =>
            response?.data.map((ex) => (
                <ExerciseButton
                    key={ex.name}
                    exercise={ex}
                    onSelect={onSelect}
                />
            )),
        [response, onSelect]
    );
    let child = <RouteLoader />;

    if (!loading) {
        child = <div className={styles.items}>{items}</div>;
    }
    return (
        <div className={styles.root}>
            <div className={styles.filters}>
                <label>Search:</label>
                <div className={styles.filtersInput}>
                    <input
                        defaultValue={search}
                        type={'search'}
                        placeholder='Enter a search term...'
                        onChange={(e) => searchChanged(e.target.value)}
                    />
                </div>
                <label>Muscle Group:</label>
                <MuscleGroupPicker
                    value={muscleGroup}
                    valueChanged={muscleGroupChanged}
                />
            </div>
            {child}
        </div>
    );
}

interface ExerciseButtonProps {
    exercise: IExercise & { _id: string };
    onSelect?: (exerciseId: string) => void;
}

const ExerciseButton = ({ exercise, onSelect }: ExerciseButtonProps) => {
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

    const itemInnards = useMemo(
        () => (
            <>
                <div className={styles.itemTitle}>{exercise.name}</div>
                <div className={styles.itemMuscles}>{muscleGroupTags}</div>
                <ol className={styles.itemMeta}>
                    <li>PR: 185 lbs ({format.format(new Date())})</li>
                    <li>Last Performed: {format.format(new Date())}</li>
                </ol>
            </>
        ),
        [exercise.name, format, muscleGroupTags]
    );

    if (!!onSelect) {
        return (
            <button
                type='button'
                className={styles.item}
                onClick={() => onSelect(exercise._id)}
            >
                {itemInnards}
            </button>
        );
    } else {
        return (
            <Link to={`/exercises/${exercise.name}`} className={styles.item}>
                {itemInnards}
            </Link>
        );
    }
};
