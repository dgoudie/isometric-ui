import {
  ExerciseMuscleGroup,
  IExercise,
  IExerciseExtended,
} from '@dgoudie/isometric-types';
import {
  ReadableResource,
  fetchFromApi,
  fetchFromApiAsReadableResource,
} from '../../utils/fetch-from-api';
import {
  Suspense,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  useTransition,
} from 'react';

import InfiniteScroll from '../InfiniteScroll/InfiniteScroll';
import { Link } from 'react-router-dom';
import MuscleGroupPicker from '../MuscleGroupPicker/MuscleGroupPicker';
import MuscleGroupTag from '../MuscleGroupTag/MuscleGroupTag';
import RouteLoader from '../RouteLoader/RouteLoader';
import classNames from 'classnames';
import styles from './ExerciseSearch.module.scss';

let initialExercisesResponse = fetchFromApiAsReadableResource<
  IExerciseExtended[]
>(`/api/exercises`, {
  page: '1',
});

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
    !!props.muscleGroup && searchParams.set('muscleGroup', props.muscleGroup);
    return searchParams;
  }, [props.muscleGroup, props.search]);

  const [_isPending, startTransaction] = useTransition();

  useEffect(() => {
    startTransaction(() => {
      const params = new URLSearchParams(searchParams);
      params.set('page', '1');
      setExercisesResponse(
        fetchFromApiAsReadableResource(`/api/exercises`, params)
      );
    });
  }, [searchParams]);

  return (
    <Suspense fallback={<RouteLoader />}>
      <ExerciseSearchContent exercisesResponse={exercisesResponse} {...props} />
    </Suspense>
  );
}

interface ExerciseSearchContentProps extends Props {
  exercisesResponse: ReadableResource<IExerciseExtended[]>;
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
  const itemsRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const [exercises, setExercises] = useState(exercisesResponse.read());
  const [moreExercises, setMoreExercises] = useState(exercises.length >= 10);
  const [page, setPage] = useState(2);

  useEffect(() => {
    const exs = exercisesResponse.read();
    setExercises(exs);
    setMoreExercises(exs.length >= 10);
    setPage(2);
  }, [exercisesResponse]);

  const searchParams = useMemo(() => {
    const searchParams = new URLSearchParams();
    !!search && searchParams.set('search', search);
    !!muscleGroup && searchParams.set('muscleGroup', muscleGroup);
    return searchParams;
  }, [muscleGroup, search]);

  const loadMore = useCallback(async () => {
    const params = new URLSearchParams(searchParams);
    params.set('page', page.toString());
    const nextPage = await fetchFromApi<IExerciseExtended[]>(
      `/api/exercises`,
      params
    );
    if (!nextPage.length) {
      setMoreExercises(false);
    } else {
      setExercises([...exercises, ...nextPage]);
    }
    setPage(page + 1);
  }, [searchParams, exercises, setExercises, setMoreExercises, page]);

  const items = useMemo(
    () =>
      exercises.map((ex) => (
        <ExerciseButton key={ex.name} exercise={ex} onSelect={onSelect} />
      )),
    [exercises, onSelect]
  );
  return (
    <div className={classNames(styles.root, className)}>
      <div className={styles.filters}>
        <div className={styles.filtersInput}>
          <input
            ref={inputRef}
            autoCapitalize='none'
            autoCorrect='off'
            autoComplete='off'
            defaultValue={search}
            type={'text'}
            placeholder='Enter a search term...'
            onChange={(e) => searchChanged(e.target.value)}
          />
          <div className={styles.filtersInputClear}>
            {search && (
              <button
                type='button'
                onClick={() => {
                  searchChanged('');
                  inputRef.current!.value = '';
                  inputRef.current!.focus();
                }}
              >
                <i className='fa-solid fa-close'></i>
              </button>
            )}
          </div>
        </div>
        <div className={styles.filtersMuscleGroup}>
          <label>Muscle Group:</label>
          <MuscleGroupPicker
            value={muscleGroup}
            valueChanged={muscleGroupChanged}
          />
        </div>
      </div>
      <div className={styles.items}>
        <InfiniteScroll
          //@ts-ignore
          className={styles.itemsInfiniteScroll}
          pageStart={1}
          loadMore={loadMore}
          hasMore={moreExercises}
          useWindow={false}
        >
          {items}
        </InfiniteScroll>
      </div>
    </div>
  );
}

interface ExerciseButtonProps {
  exercise: IExerciseExtended;
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

  let itemMetaLineOne = (
    <li>
      PR: <span className={styles.itemMetaNone}>None</span>
    </li>
  );
  if (!!exercise.bestSet) {
    switch (exercise.exerciseType) {
      case 'rep_based': {
        itemMetaLineOne = (
          <li>
            PR: {exercise.bestInstance!.totalRepsForInstance} reps (
            {format.format(new Date(exercise.bestInstance!.createdAt))})
          </li>
        );
        break;
      }
      case 'timed': {
        itemMetaLineOne = <></>;
        break;
      }
      default: {
        itemMetaLineOne = (
          <li>
            PR: {exercise.bestSet.resistanceInPounds} lbs (
            {format.format(new Date(exercise.bestInstance!.createdAt))})
          </li>
        );
      }
    }
  }

  let itemMetaLineTwo = (
    <li>
      Last Performed: <span className={styles.itemMetaNone}>Never</span>
    </li>
  );

  if (!!exercise.lastPerformed) {
    itemMetaLineTwo = (
      <li>Last Performed: {format.format(new Date(exercise.lastPerformed))}</li>
    );
  }

  const itemInnards = useMemo(
    () => (
      <>
        <div className={styles.itemTitle}>{exercise.name}</div>
        <div className={styles.itemMuscles}>{muscleGroupTags}</div>
        <ol className={styles.itemMeta}>
          {itemMetaLineOne}
          {itemMetaLineTwo}
        </ol>
      </>
    ),
    [exercise.name, format, muscleGroupTags]
  );

  if (!!onSelect) {
    return (
      <button
        type='button'
        className={classNames('fade-in', styles.item)}
        onClick={() => onSelect(exercise._id)}
      >
        {itemInnards}
      </button>
    );
  } else {
    return (
      <Link
        draggable='false'
        to={`/exercises/${exercise.name}`}
        className={classNames('fade-in', styles.item)}
      >
        {itemInnards}
      </Link>
    );
  }
};
