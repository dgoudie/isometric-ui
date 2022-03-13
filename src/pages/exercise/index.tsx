import AppBarWithAppHeaderLayout from '../../components/AppBarWithAppHeaderLayout/AppBarWithAppHeaderLayout';
import { IExercise } from '@dgoudie/isometric-types';
import { useFetchFromApi } from '../../utils/fetch-from-api';
import { useParams } from 'react-router-dom';

const ExerciseDetail = () => {
    const { exerciseName } = useParams();

    const [response, error, loading] = useFetchFromApi<IExercise>(
        `/api/exercise/${exerciseName}`,
        null,
        null,
        false
    );

    return (
        <AppBarWithAppHeaderLayout
            pageTitle={exerciseName!}
            showLoading={loading}
        >
            <pre style={{ whiteSpace: 'pre-wrap' }}>
                {JSON.stringify(response?.data, null, 2)}
            </pre>
        </AppBarWithAppHeaderLayout>
    );
};

export default ExerciseDetail;
