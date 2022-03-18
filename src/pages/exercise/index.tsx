import * as Yup from 'yup';

import { ErrorMessage, Field, Form, Formik } from 'formik';
import { Navigate, useParams } from 'react-router-dom';

import AppBarWithAppHeaderLayout from '../../components/AppBarWithAppHeaderLayout/AppBarWithAppHeaderLayout';
import Button from '../../components/Button/Button';
import { IExercise } from '@dgoudie/isometric-types';
import Loader from '../../components/Loader/Loader';
import RouteLoader from '../../components/RouteLoader/RouteLoader';
import SetCountPickerField from '../../components/SetCountPickerField/SetCountPickerField';
import classNames from 'classnames';
import { getFormikInitiallyTouchedFields } from '../../utils/formik-initially-touched';
import styles from './index.module.scss';
import { useFetchFromApi } from '../../utils/fetch-from-api';

const ExerciseSchema = Yup.object().shape({
    name: Yup.string().required('Name is required'),
    breakTimeInSeconds: Yup.number()
        .integer('Break Time must be a whole number')
        .positive('Break Time must be more than zero')
        .max(300, 'Break Time must be less than 5 minutes')
        .required('Break Time is required'),
    setCount: Yup.number()
        .integer('Set Count must be a number')
        .positive('Set Count must be more than zero')
        .max(5, 'Set Count cannot be higher than 5')
        .required('Set Count is required'),
});

const ExerciseDetail = () => {
    const { exerciseName } = useParams();

    const [response, error, loading] = useFetchFromApi<IExercise>(
        `/api/exercise/${exerciseName}`,
        null,
        null,
        false
    );

    let child = <RouteLoader />;

    if (!loading) {
        const standardFormInputStyles = classNames(
            'standard-form-input',
            styles.input
        );
        child = (
            <div className={styles.root}>
                <Formik
                    initialTouched={getFormikInitiallyTouchedFields(
                        response!.data
                    )}
                    initialValues={response!.data}
                    validationSchema={ExerciseSchema}
                    onSubmit={(values) => {
                        console.log(values);
                    }}
                >
                    {(formik) => {
                        const { isValid, isSubmitting, resetForm } = formik;
                        return (
                            <Form>
                                <label htmlFor='name'>Name</label>
                                <Field
                                    autoFocus
                                    id='name'
                                    name='name'
                                    className={standardFormInputStyles}
                                    disabled={isSubmitting}
                                />
                                <ErrorMessage
                                    name='name'
                                    component='span'
                                    className={styles.errorMessage}
                                />
                                <label htmlFor='breakTimeInSeconds'>
                                    Break Time Between Sets (In Seconds)
                                </label>
                                <Field
                                    type='number'
                                    id='breakTimeInSeconds'
                                    name='breakTimeInSeconds'
                                    className={standardFormInputStyles}
                                    disabled={isSubmitting}
                                />
                                <ErrorMessage
                                    name='breakTimeInSeconds'
                                    component='span'
                                    className={styles.errorMessage}
                                />
                                <label htmlFor='setCount'>Set Count</label>
                                <SetCountPickerField
                                    name='setCount'
                                    disabled={isSubmitting}
                                />
                                <ErrorMessage
                                    name='setCount'
                                    component='span'
                                    className={styles.errorMessage}
                                />

                                <div className={styles.buttonBar}>
                                    <Button
                                        type='button'
                                        onClick={() => resetForm()}
                                        disabled={isSubmitting}
                                    >
                                        <i className='fa-solid fa-rotate-left'></i>
                                        Reset
                                    </Button>
                                    <Button
                                        primary
                                        type='submit'
                                        disabled={!isValid || isSubmitting}
                                    >
                                        <i className='fa-solid fa-floppy-disk'></i>
                                        Save
                                    </Button>
                                </div>
                            </Form>
                        );
                    }}
                </Formik>
            </div>
        );
    }

    if (!!error) {
        return <Navigate to={'/error'} />;
    }

    return (
        <AppBarWithAppHeaderLayout pageTitle={exerciseName!}>
            {child}
        </AppBarWithAppHeaderLayout>
    );
};

export default ExerciseDetail;
