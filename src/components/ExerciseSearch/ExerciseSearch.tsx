import { ExerciseMuscleGroup, IExercise } from '@dgoudie/isometric-types';
import { ReadableResource, fetchFromApi2 } from '../../utils/fetch-from-api';
import { Suspense, useEffect, useMemo, useState, useTransition } from 'react';

import { Link } from 'react-router-dom';
import MuscleGroupPicker from '../MuscleGroupPicker/MuscleGroupPicker';
import MuscleGroupTag from '../MuscleGroupTag/MuscleGroupTag';
import RouteLoader from '../RouteLoader/RouteLoader';
import classNames from 'classnames';
import styles from './ExerciseSearch.module.scss';

const initialExercisesResponse = fetchFromApi2<IExercise[]>(`/api/exercises`);

interface Props {
    search: string | undefined;
    muscleGroup: ExerciseMuscleGroup | undefined;
    className?: string;
    searchChanged: (search: string | undefined) => void;
    muscleGroupChanged: (muscleGroup: ExerciseMuscleGroup | undefined) => void;
    onSelect?: (exerciseId: string) => void;
}

export default function ExerciseSearch(props: Props) {
    const [exercisesResponse, setExercisesResponse] = useState(
        initialExercisesResponse
    );

    const searchParams = useMemo(() => {
        const searchParams = new URLSearchParams();
        !!props.search && searchParams.set('search', props.search);
        !!props.muscleGroup &&
            searchParams.set('muscleGroup', props.muscleGroup);
        return searchParams;
    }, [props.muscleGroup, props.search]);

    const [_isPending, startTransaction] = useTransition();

    useEffect(() => {
        startTransaction(() => {
            setExercisesResponse(fetchFromApi2(`/api/exercises`, searchParams));
        });
    }, [searchParams]);

    return (
        <Suspense fallback={<RouteLoader />}>
            <ExerciseSearchContent
                exercisesResponse={exercisesResponse}
                {...props}
            />
        </Suspense>
    );
}

interface ExerciseSearchContentProps extends Props {
    exercisesResponse: ReadableResource<IExercise[]>;
}

function ExerciseSearchContent({
    exercisesResponse,
    search,
    muscleGroup,
    className,
    searchChanged,
    muscleGroupChanged,
    onSelect,
}: ExerciseSearchContentProps) {
    const exercises = exercisesResponse.read();
    const items = useMemo(
        () =>
            exercises?.map((ex) => (
                <ExerciseButton
                    key={ex.name}
                    exercise={ex}
                    onSelect={onSelect}
                />
            )),
        [exercises, onSelect]
    );
    return (
        <div className={classNames(styles.root, className)}>
            <div className={styles.filters}>
                <div className={styles.filtersInput}>
                    <input
                        autoFocus
                        autoCapitalize='none'
                        autoCorrect='off'
                        autoComplete='off'
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
            <div className={styles.items}>{items}</div>
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
