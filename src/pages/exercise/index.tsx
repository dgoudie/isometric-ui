import AppBarWithAppHeaderLayout from '../../components/AppBarWithAppHeaderLayout/AppBarWithAppHeaderLayout';
import { IExerciseWithHistory } from '@dgoudie/isometric-types';
import RouteLoader from '../../components/RouteLoader/RouteLoader';
import styles from './index.module.scss';
import { useFetch } from 'usehooks-ts';
import { useParams } from 'react-router-dom';

export default function Exercise() {
  const { exerciseName } = useParams();

  const { data, error } = useFetch<IExerciseWithHistory>(
    `/api/exercise/${exerciseName}`
  );

  let children = <RouteLoader />;

  if (!!data) {
    children = <ExerciseContent exercise={data} />;
  }

  return (
    <AppBarWithAppHeaderLayout pageTitle={exerciseName!}>
      {children}
    </AppBarWithAppHeaderLayout>
  );
}

interface ExerciseContentProps {
  exercise: IExerciseWithHistory;
}

function ExerciseContent({ exercise }: ExerciseContentProps) {
  return <div className={styles.root}>index</div>;
}
