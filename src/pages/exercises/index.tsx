import {
  ExerciseMuscleGroup,
  ExerciseMuscleGroups,
} from '@dgoudie/isometric-types';
import ExerciseSearch, {
  HistoryOption,
  HistoryOptions,
} from '../../components/ExerciseSearch/ExerciseSearch';
import { useEffect, useState } from 'react';

import AppBarWithAppHeaderLayout from '../../components/AppBarWithAppHeaderLayout/AppBarWithAppHeaderLayout';
import styles from './index.module.scss';
import { useSearchParams } from 'react-router-dom';

const Exercises = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const q = searchParams.get('q');
  const muscleGroup = searchParams.get('muscleGroup');
  const muscleGroupDecoded = !!muscleGroup
    ? (muscleGroup as ExerciseMuscleGroup)
    : undefined;
  const history = searchParams.get('history');
  const historyDecoded = !!history ? (history as HistoryOption) : 'all';

  const [searchTerm, setSearchTerm] = useState(q ?? undefined);

  useEffect(() => {
    if (!!searchTerm) {
      searchParams.set('q', searchTerm);
    } else {
      searchParams.delete('q');
    }
    setSearchParams(searchParams);
  }, [searchTerm, searchParams, setSearchParams]);

  useEffect(() => {
    if (!!historyDecoded && !HistoryOptions.includes(historyDecoded)) {
      searchParams.delete('history');
      setSearchParams(searchParams);
    }
  }, [historyDecoded, searchParams, setSearchParams]);

  return (
    <AppBarWithAppHeaderLayout pageTitle={'Exercises'}>
      <div className={styles.root}>
        <ExerciseSearch
          className={styles.exerciseSearch}
          search={searchTerm}
          searchChanged={setSearchTerm}
          muscleGroup={muscleGroupDecoded}
          muscleGroupChanged={(group) => {
            if (!group) {
              searchParams.delete('muscleGroup');
            } else {
              searchParams.set('muscleGroup', group);
            }
            setSearchParams(searchParams);
          }}
          history={historyDecoded}
          historyChanged={(history) => {
            searchParams.set('history', history);
            setSearchParams(searchParams);
          }}
        />
      </div>
    </AppBarWithAppHeaderLayout>
  );
};

export default Exercises;
