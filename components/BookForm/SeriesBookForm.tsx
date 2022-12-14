import React, {Fragment, useCallback, useEffect, useMemo, useState} from 'react'
import {useCreateComboStore} from "../../stores/CreateComboStore";
import shallow from "zustand/shallow";
import {useQuery} from "@tanstack/react-query";
import axios from "axios";
import {useRouter} from "next/router";
import {useFormik} from "formik";
import * as Yup from "yup";
import Form, {defaultInputClass} from "../Form";
import SelectBox from "../SelectBox";
import TableHeading from "../Admin/Table/TableHeading";
import TableHeader from "../Admin/Table/TableHeader";
import TableBody from "../Admin/Table/TableBody";
import {randomBooks} from "../../pages/admin/books";
import {faker} from "@faker-js/faker/locale/vi";
import {IBookResponse} from "../../types/response/IBookResponse";
import TableData from "../Admin/Table/TableData";
import Image from "next/image";
import {getAvatarFromName} from "../../utils/helper";
import TableWrapper from "../Admin/Table/TableWrapper";
import ErrorMessage from "../Form/ErrorMessage";
import ConfirmModal from "../Modal/ConfirmModal";
import {toast} from "react-hot-toast";
import CreateButton from "../Admin/CreateButton";
import TransitionModal from "../Modal/TransitionModal";
import {BsSearch} from "react-icons/bs";
import EmptyState, {EMPTY_STATE_TYPE} from "../EmptyState";
import Modal from "../Modal/Modal";
import Link from "next/link";

type Props = {
    formMode: 'create' | 'edit';
}

interface IGenre {
    id: number;
    name: string;
    parentId?: number;
    displayIndex?: number;
    status?: boolean;
}

const SeriesBookForm: React.FC<Props> = ({formMode}) => {
    const [formValues, setFormValues] = useCreateComboStore(state => [state.formValues, state.setFormValues],
        shallow);
    const {data: genres, isLoading: genresLoading} = useQuery(['genres'], async () => {
        const res = await axios.get<IGenre[]>('https://server.boek.live/api/genres/child-genres');
        return res.data;
    });
    const getSelectedGenre = useCallback((id: number) => {
        return genres?.find(genre => genre.id === id);
    }, [genres]);

    const [selectedGenre, setSelectedGenre] = useState<IGenre | null>(() => {
        return getSelectedGenre(Number(formValues.genreId)) ?? null;
    });


    const [selectedBooks, setSelectedBooks] = useState<typeof randomBooks>(() => {
        return formValues.selectedBooks ?? [];
    });
    const [toDeleteBook, setToDeleteBook] = useState<typeof randomBooks[0] | null>(null);
    const [showDeleteModal, setShowDeleteModal] = useState<boolean>(false);
    const [showAddBookModal, setShowAddBookModal] = useState<boolean>(false);
    const [searchBookQuery, setSearchBookQuery] = useState<string>('');


    const searchBooks = useMemo(() => {
        return randomBooks.filter(book => book.name.toLowerCase().includes(searchBookQuery.toLowerCase()));
    }, [searchBookQuery]);


    const router = useRouter();
    const form = useFormik(
        {
            initialValues: {
                ...formValues,
            },
            validationSchema: Yup.object({
                code: Yup.string().required('M?? series kh??ng ???????c ????? tr???ng'),
                name: Yup.string().required('T??n series kh??ng ???????c ????? tr???ng'),
                isbn10: Yup.string()
                    .length(10, 'ISBN10 ph???i c?? 10 k?? t???')
                    .matches(/^(97(8|9))?\d{9}(\d|X)$/, 'ISBN10 kh??ng h???p l???'),
                isbn13: Yup.string()
                    .length(13, 'ISBN13 ph???i c?? 13 k?? t???')
                    .matches(/^(97(8|9))?\d{9}(\d|X)$/, 'ISBN13 kh??ng h???p l??? (b???t ?????u b???ng 978 ho???c 979)'),
                releasedYear: Yup.number()
                    .required('N??m ph??t h??nh kh??ng ???????c ????? tr???ng')
                    .integer('N??m ph??t h??nh ph???i l?? s??? nguy??n')
                    .min(2000, ({min}) => `N??m ph??t h??nh ph???i l???n h??n ho???c b???ng ${min}`)
                    .max(new Date().getFullYear(), ({max}) => `N??m ph??t h??nh ph???i nh??? h??n ho???c b???ng ${max}`),
                coverPrice: Yup.number()
                    .required('Gi?? b??a kh??ng ???????c ????? tr???ng')
                    .min(0, ({min}) => `Gi?? b??a ph???i l???n h??n ho???c b???ng ${min}`),
                genreId: Yup.number().required('Th??? lo???i kh??ng ???????c ????? tr???ng'),
                description: Yup.string().required('M?? t??? kh??ng ???????c ????? tr???ng'),
                selectedBooks: Yup.array().min(1, 'Series ph???i c?? ??t nh???t 1 s??ch'),
            }),
            onSubmit: (values) => {
                //router.push('/issuer/campaigns');
            },
        }
    )

    const handleAddBook = useCallback((book: typeof randomBooks[0]) => {

        if (selectedBooks.find(b => b.id === book.id)) {
            toast.error('S??ch ???? t???n t???i trong danh s??ch');
            return;
        }
        setSelectedBooks(prev => {
            const newBooks = [...prev, book];
            form.setFieldValue('selectedBooks', newBooks);
            return newBooks;
        });
        toast.success('Th??m s??ch th??nh c??ng');
        setShowAddBookModal(false);
    }, [form, selectedBooks]);

    const handleDeleteBook = useCallback((book: typeof randomBooks[0]) => {
        setToDeleteBook(null);
        setSelectedBooks(prev => {
            const newState = prev.filter(b => b.id !== book.id);
            form.setFieldValue('selectedBooks', newState);
            return newState;
        });
    }, [form]);

    useEffect(() => {
        setFormValues(form.values);
    }, [form.values, setFormValues]);

    return (
        <Fragment>
            <div className='bg-white border mx-auto max-w-6xl p-10'>
                {/*Back button*/}
                {/*<button*/}
                {/*    className='bg-slate-200 hover:bg-slate-300 text-gray-800 text-sm font-medium py-2 px-4 rounded inline-flex gap-2 items-center'>*/}
                {/*    <BiArrowBack/>*/}
                {/*    <span>Quay l???i</span>*/}
                {/*</button>*/}

                <h1 className='text-2xl font-bold text-slate-800 md:text-3xl mb-6'>
                    {formMode === 'create' ? 'Th??m' : 'S???a'} s??ch series ???
                </h1>

                <form onSubmit={form.handleSubmit}>

                    <Form.GroupLabel label={'Th??ng tin chung'} description={'Th??ng tin chung v??? series s??ch'}/>
                    <div className='space-y-4 mt-3'>
                        <Form.Input placeholder={'VD: S0001'}
                                    formikForm={form}
                                    required={true}
                                    fieldName={'code'}
                                    label={'M?? series'}/>
                        <Form.Input placeholder={'Nh???p t??n series'}
                                    formikForm={form}
                                    required={true}
                                    fieldName={'name'}
                                    label={'T??n series'}/>
                        <div className='grid sm:grid-cols-2 gap-y-4 gap-x-4'>
                            <Form.Input placeholder={'Nh???p ISBN10'}
                                        uppercase={true}
                                        maxLength={10}
                                        formikForm={form}
                                        fieldName={'isbn10'}
                                        label={'ISBN10'}/>
                            <Form.Input placeholder={'Nh???p ISBN13'}
                                        uppercase={true}
                                        maxLength={13}
                                        formikForm={form}
                                        fieldName={'isbn13'}
                                        label={'ISBN13'}/>
                        </div>
                        <div className='grid sm:grid-cols-2 gap-y-4 gap-x-4'>
                            <Form.Input placeholder={'Nh???p n??m ph??t h??nh'}
                                        required={true}
                                        inputType={'number'}
                                        formikForm={form}
                                        fieldName={'releasedYear'}
                                        label={'N??m ph??t h??nh'}/>
                            <Form.Input placeholder={'Nh???p gi?? b??a'}
                                        required={true}
                                        inputType={'number'}
                                        formikForm={form}
                                        fieldName={'coverPrice'}
                                        label={'Gi?? b??a (??)'}/>
                        </div>
                        <Form.Label label={'???nh s???n ph???m'} required={true}/>
                        <div
                            className="mt-1 flex justify-center rounded-md border-2 border-dashed border-gray-300 px-6 pt-5 pb-6">
                            <div className="space-y-1 text-center">
                                <svg
                                    className="mx-auto h-12 w-12 text-gray-400"
                                    stroke="currentColor"
                                    fill="none"
                                    viewBox="0 0 48 48"
                                    aria-hidden="true"
                                >
                                    <path
                                        d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                                        strokeWidth="2"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                    ></path>
                                </svg>
                                <div className="flex justify-center text-sm text-gray-600">
                                    <label
                                        htmlFor="file-upload"
                                        className="relative cursor-pointer rounded-md bg-white font-medium text-indigo-600 focus-within:outline-none focus-within:ring-2 focus-within:ring-indigo-500 focus-within:ring-offset-2 hover:text-indigo-500"
                                    >
                                        <span>T???i ???nh l??n</span>
                                        <input
                                            id="file-upload"
                                            name="file-upload"
                                            type="file"
                                            className="sr-only"
                                        />
                                    </label>
                                </div>
                                <p className="text-xs text-gray-500">
                                    PNG, JPG, GIF t???i ??a 1MB
                                </p>
                            </div>
                        </div>

                    </div>
                    <Form.Divider/>
                    <Form.GroupLabel label={'Th??? lo???i'} description='Th??? lo???i chung c???a series s??ch'/>
                    <div className='mt-3'>
                        <Form.Label label={'Th??? lo???i'} required={true}/>
                    </div>
                    <SelectBox
                        placeholder={genresLoading ? '??ang t???i...' : 'Ch???n th??? lo???i'}
                        value={selectedGenre}
                        onChange={(value) => {
                            if (value) {
                                setSelectedGenre(value);
                                form.setFieldValue('genreId', value?.id);
                            }
                        }}
                        dataSource={genres}
                        displayKey={'name'}
                    />
                    {form.errors.genreId && form.touched.genreId && (
                        <ErrorMessage>
                            {form.errors.genreId}
                        </ErrorMessage>
                    )}
                    <Form.Divider/>
                    <Form.GroupLabel label={'M?? t???'} description='M?? t??? v??? series s??ch'/>
                    <div className='mt-3'>
                        <Form.Input placeholder={'Nh???p m?? t???'}
                                    isTextArea={true}
                                    formikForm={form}
                                    required={true}
                                    fieldName={'description'}
                                    label={'M?? t???'}/>
                    </div>

                    <Form.Divider/>
                    <Form.GroupLabel label={'Ch???n s??ch'} description='Ch???n nh???ng s??ch c??ng th??? lo???i cho series'/>
                    <div className='mt-3'>
                        <div className='flex justify-end mb-4 gap-4'>
                            <CreateButton label={'Th??m s??ch'}
                                          onClick={() => {
                                              setShowAddBookModal(true);
                                          }}
                            />
                        </div>
                        <TableWrapper>
                            <TableHeading>
                                <TableHeader>M?? s??ch</TableHeader>
                                <TableHeader>T??n s??ch</TableHeader>
                                <TableHeader>Gi?? s??ch</TableHeader>
                                <TableHeader>Nh?? xu???t b???n</TableHeader>
                                <TableHeader>?????nh d???ng</TableHeader>
                                <TableHeader>
                                    <span className="sr-only">Edit</span>
                                </TableHeader>
                            </TableHeading>
                            <TableBody>
                                {selectedBooks.length > 0 ? selectedBooks.map((book, index) => {
                                    faker.datatype.boolean();
                                    faker.datatype.number({min: 0, max: randomBooks.length - 1});
                                    const fakeBook: IBookResponse = {
                                        id: index,
                                        code: `B${faker.datatype.number({
                                            min: 10000,
                                            max: 99999,
                                        })}`,

                                        publisher: {
                                            name: faker.company.name(),
                                        },
                                        isbn10: faker.datatype.number({
                                            min: 1000000000,
                                            max: 9999999999,
                                        }).toString(),
                                        isbn13: faker.datatype.number({
                                            min: 1000000000000,
                                            max: 9999999999999,
                                        }).toString(),
                                        releasedYear: faker.datatype.number({
                                                min: 2010,
                                                max: 2022,
                                            }
                                        ),
                                    };
                                    return (
                                        <tr key={index}>
                                            <TableData className="text-sm font-medium uppercase text-gray-500">
                                                {fakeBook.code}
                                            </TableData>
                                            <TableData className='max-w-72'>
                                                <div className="flex gap-4 items-center">
                                                    <Image
                                                        width={500}
                                                        height={500}
                                                        className="h-20 w-16 object-cover"
                                                        src={book.imageUrl || ''}
                                                        alt=""
                                                    />
                                                    <div
                                                        className="text-sm max-w-56 text-ellipsis overflow-hidden font-medium text-gray-900">
                                                        {book.name}
                                                    </div>
                                                </div>
                                            </TableData>
                                            <TableData className="text-sm font-semibold text-emerald-600">
                                                {new Intl.NumberFormat("vi-VN", {
                                                    style: "currency",
                                                    currency: "VND",
                                                }).format(faker.datatype.number())}
                                            </TableData>
                                            <TableData>
                                                <div className="flex items-center">
                                                    <div className="h-10 w-10 flex-shrink-0">
                                                        <Image
                                                            width={100}
                                                            height={100}
                                                            className="h-10 w-10 rounded-full"
                                                            src={getAvatarFromName(fakeBook.publisher?.name)}
                                                            alt=""
                                                        />
                                                    </div>
                                                    <div className="ml-4">
                                                        <div className="text-sm text-gray-900">
                                                            {fakeBook.publisher?.name}
                                                        </div>
                                                    </div>
                                                </div>
                                            </TableData>
                                            <TableData textAlignment="text-center" className="text-sm text-gray-500">
                                                <select className={defaultInputClass}>
                                                    <option value="1">S??ch gi???y</option>
                                                    <option value="2">S??ch audio</option>
                                                    <option value="3">S??ch ??i???n t???</option>
                                                </select>
                                            </TableData>
                                            <TableData className="text-right text-sm font-medium">
                                                <button
                                                    onClick={() => {
                                                        setToDeleteBook(book);
                                                        setShowDeleteModal(true);
                                                    }}
                                                    className="text-rose-600 hover:text-rose-800"
                                                >
                                                    Xo??
                                                </button>
                                            </TableData>
                                        </tr>
                                    );
                                }) : <tr>
                                    <TableData colSpan={6} textAlignment={'text-center'}
                                               className="text-sm font-medium leading-10 uppercase text-gray-500 ">
                                        Ch??a c?? s??ch n??o ???????c ch???n
                                    </TableData>
                                </tr>}
                            </TableBody>
                        </TableWrapper>

                        {form.errors.selectedBooks && form.touched.selectedBooks && (
                            <ErrorMessage>
                                {form.errors.selectedBooks}
                            </ErrorMessage>
                        )}
                    </div>

                    <button
                        type={'submit'}
                        className='bg-slate-200 hover:bg-slate-300 text-gray-800 text-sm font-medium py-2 px-4 rounded inline-flex gap-2 items-center mt-5'>
                        <span>T???o series</span>
                    </button>
                </form>
            </div>

            <ConfirmModal isOpen={showDeleteModal}
                          onClose={() => setShowDeleteModal(false)}
                          onConfirm={() => {
                              if (toDeleteBook) {
                                  handleDeleteBook(toDeleteBook);
                                  toast.success('Xo?? s??ch kh???i series th??nh c??ng');
                              }
                              setShowDeleteModal(false);
                          }}
                          title={`Xo?? ${toDeleteBook?.name}`}
                          content={'B???n c?? ch???c ch???n mu???n xo?? s??ch n??y kh???i series?'}
                          confirmText={'Xo??'}
            />


            <TransitionModal
                maxWidth={'max-w-3xl'}
                isOpen={showAddBookModal}
                closeOnOverlayClick={true} onClose={() => {
                setShowAddBookModal(false);
                setSearchBookQuery('');
            }}>
                <div className='rounded-xl overflow-hidden'>
                    <div>
                        <BsSearch
                            className="pointer-events-none absolute top-3.5 left-4 h-5 w-5 text-gray-400"/>
                        <input
                            type="text"
                            placeholder="T??m ki???m s??ch"
                            className="h-12 w-full border-0 pl-11 pr-4 text-sm text-gray-800 placeholder-gray-400 focus:ring-0"
                            value={searchBookQuery}
                            onChange={(e) => setSearchBookQuery(e.target.value)}
                        />
                    </div>
                    <div className='overflow-y-auto h-96'>
                        {searchBooks.length > 0 ? searchBooks.map((book, index) => {
                            return (
                                <div

                                    onClick={() => {
                                        handleAddBook(book);
                                    }}
                                    key={index} className="flex justify-between p-4 border-b border-gray-300">
                                    <div className='flex gap-4'>
                                        <Image
                                            width={500}
                                            height={500}
                                            className="h-20 w-16 object-cover"
                                            src={book.imageUrl || ''}
                                            alt=""
                                        />
                                        <div>
                                            <div
                                                className='bg-blue-500 text-white py-1 px-2 w-fit mb-1 rounded text-xs'>{`B${faker.datatype.number({
                                                min: 10000,
                                                max: 99999,
                                            })}`}
                                            </div>
                                            <div className="text-sm font-medium text-gray-900 mb-1">{book.name}</div>
                                            <div
                                                className="text-sm font-medium text-gray-500">NXB: {faker.company.name()}</div>
                                        </div>
                                    </div>
                                    <div className="text-sm font-semibold text-emerald-600">
                                        {new Intl.NumberFormat("vi-VN", {
                                                style: "currency",
                                                currency: "VND",
                                            }
                                        ).format(faker.datatype.number())}
                                    </div>
                                </div>
                            );
                        }) : <EmptyState status={EMPTY_STATE_TYPE.SEARCH_NOT_FOUND} keyword={searchBookQuery}/>}
                    </div>

                    <Modal.Footer>
                        <div className="flex flex-wrap justify-end space-x-2">
                            <button
                                onClick={() => {
                                    setShowAddBookModal(false);
                                }}
                                className="m-btn bg-gray-100 text-slate-600 hover:bg-gray-200"
                            >
                                ????ng
                            </button>
                            <Link
                                href='/issuer/books/create'
                                className="m-btn bg-indigo-600 text-white hover:bg-indigo-700"
                            >
                                T???o s??ch m???i
                            </Link>
                        </div>
                    </Modal.Footer>
                </div>

            </TransitionModal>
        </Fragment>
    );
}

export default SeriesBookForm