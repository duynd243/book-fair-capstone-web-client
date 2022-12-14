import React, { useState, Fragment, ReactElement } from "react";
import { NextPage } from "next";
import AdminLayout from "../../../components/Layout/AdminLayout";
import Image from "next/image";
import { useFormik } from "formik";
import * as Yup from "yup";
import { toast } from "react-hot-toast";
import { getDownloadURL, ref, uploadBytesResumable } from "firebase/storage";
import { useRouter } from "next/router";
import { NextPageWithLayout } from "../../_app";
import { useAuth } from "../../../context/AuthContext";
import { useMutation, useQuery } from "@tanstack/react-query";
import { AuthorService } from "../../../services/AuthorService";
import { CategoryService } from "../../../services/System/CategoryService";
import { IssuerBookService } from "../../../services/Issuer/Issuer_BookService";
import { PublisherService } from '../../../services/System/PublisherService';
import Multiselect from 'multiselect-react-dropdown';
import DynamicForm from './../../../components/DynamicForm';
import CreateButton from "../../../components/Admin/CreateButton";
import AuthorModal, {
  AuthorModalMode,
} from "../../../components/Modal/AuthorModal";
import Link from "next/link";
import {
  IoChevronBack
} from "react-icons/io5";
import { getFormattedPrice } from "../../../utils/helper";





const IssuerCreateBookPage: NextPageWithLayout = () => {
  const { loginUser } = useAuth();
  const [coverPhoto, setCoverPhoto] = useState<File | null>(null);

  const [selectedPublisherId, setSelectedPublisherId] = useState<string | null>(
    null
  );
  const [selectedAuthorId, setSelectedAuthorId] = useState<string | null>(null);

  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(
    null
  );
  const [selectedBookId, setSelectedBookId] = useState<string | null>(
    null
  );
  const publisherService = new PublisherService(loginUser?.accessToken);
  const authorService = new AuthorService(loginUser?.accessToken);
  const categoryService = new CategoryService(loginUser?.accessToken);
  const bookService = new IssuerBookService(loginUser?.accessToken);

  const { data: books } = useQuery(['books'], () =>
    bookService.getBooks$Issuer({
      size: 1000,
    })
  );
  const { data: publishers } = useQuery(['publisher'], () =>
    publisherService.getPublishers({
      size: 1000,
    })
  );
  const { data: authors } = useQuery(['authors'], () =>
    authorService.getAuthors({
      size: 1000,
    })
  );

  const { data: categories } = useQuery(['categories'], () =>
    categoryService.getCategories({
      size: 1000,
    })
  );

  const [selectedAuthor, setSelectedAuthor] = useState<{
    id?: number;
    name?: string;
  }>(); 
  const [showCreateModal, setShowCreateModal] = useState<boolean>(false);
  // const [showUpdateModal, setShowUpdateModal] = useState<boolean>(false);
  const router = useRouter();

  const createBookMutation = useMutation(
    (values: any) => bookService.createBook$Issuer(values),
    {
      onSuccess: () => {
        toast.success('T???o s??ch th??nh c??ng');
        router.push('/issuer/books');
      },
      onError: (error: any) => {
        toast.error(error?.message);
      },
    }
  );
  // const firebaseUploadPromise = (file: File) => {
  //   return new Promise((resolve, reject) => {
  //     const fileName =
  //       Math.random().toString(36).substring(2, 15) +
  //       Math.random().toString(36).substring(2, 15);
  //     // get file extension
  //     const fileExtension = file.name.split('.').pop();
  //     const storageRef = ref(
  //       storage,
  //       `images/${fileName}.${fileExtension}`
  //     );
  //     const task = uploadBytesResumable(storageRef, file);
  //     task.on(
  //       'state_changed',
  //       (snapshot) => { },
  //       (error) => {
  //         reject(error);
  //       },
  //       () => {
  //         getDownloadURL(task.snapshot.ref)
  //           .then((url) => {
  //             resolve(url);
  //           })
  //           .catch((err) => {
  //             reject(err);
  //           });
  //       }
  //     );
  //   });
  // };
  const handleCoverPhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // check file type
      if (!file.type.startsWith("image/")) {
        toast.error("Vui l??ng t???i l??n t???p h??nh ???nh");
        return;
      }
      // check file size
      if (file.size > 1024 * 1024 * 1) {
        toast.error("K??ch th?????c t???p t???i ??a l?? 1MB");
        return;
      }
      setCoverPhoto(file);
    }
  };

  const form = useFormik({
    initialValues: {
      code: "",
      isbn10: "",
      isbn13: "",
      name: "",
      translator: "",
      price: 0,
      description: "",
      language: "",
      size: "",
      unitInStock: 0,
      releasedYear: new Date().getFullYear(),
      page: 1,
      bookInCombo: true,
    },
    validationSchema: Yup.object().shape({
      code: Yup.string().required("M?? s??ch kh??ng ???????c ????? tr???ng"),
      isbn10: Yup.string()
        .required("ISBN10 kh??ng ???????c ????? tr???ng")
        .length(10, "ISBN10 ph???i c?? 10 k?? t???"),
      isbn13: Yup.string()
        .required("ISBN13 kh??ng ???????c ????? tr???ng")
        .length(13, "ISBN13 ph???i c?? 13 k?? t???"),
      name: Yup.string().required("T??n s??ch kh??ng ???????c ????? tr???ng"),
      translator: Yup.string().required("T??n d???ch gi??? kh??ng ???????c ????? tr???ng"),
      price: Yup.number()
        .required("Gi?? kh??ng ???????c ????? tr???ng")
        .min(0, "Gi?? kh??ng ???????c nh??? h??n 0"),
      description: Yup.string().required("M?? t??? kh??ng ???????c ????? tr???ng"),
      language: Yup.string().required("Ng??n ng??? kh??ng ???????c ????? tr???ng"),
      size: Yup.string().required("K??ch th?????c kh??ng ???????c ????? tr???ng"),
      unitInStock: Yup.number()
        .required("S??? l?????ng kh??ng ???????c ????? tr???ng")
        .integer("S??? l?????ng ph???i l?? s??? nguy??n")
        .min(0, "S??? l?????ng kh??ng ???????c nh??? h??n 0"),
      releasedYear: Yup.number()
        .required("N??m xu???t b???n kh??ng ???????c ????? tr???ng")
        .integer("N??m xu???t b???n ph???i l?? s??? nguy??n")
        .min(2010, "N??m xu???t b???n kh??ng ???????c nh??? h??n 2010")
        .max(
          new Date().getFullYear(),
          "N??m xu???t b???n kh??ng ???????c l???n h??n n??m hi???n t???i"
        ),

      page: Yup.number()
        .required("S??? trang kh??ng ???????c ????? tr???ng")
        .min(1, "S??? trang kh??ng ???????c nh??? h??n 1"),
    }),
    onSubmit: async (values) => {
      if (coverPhoto === null) {
        toast.error("Vui l??ng ch???n ???nh b??a");
        return;
      }

      if (!selectedAuthorId) {
        toast.error("Vui l??ng ch???n t??c gi???");
        return;
      }
      if (!selectedPublisherId) {
        toast.error("Vui l??ng ch???n nh?? xu???t b???n");
        return;
      }
      if (!selectedCategoryId) {
        toast.error("Vui l??ng ch???n th??? lo???i");
        return;
      }

      let payload = {
        ...values,
        authors: [Number(selectedAuthorId)],
        categoryId: Number(selectedCategoryId),
        publisherId: Number(selectedPublisherId),
        imageUrl: "",
      };
      // // upload cover photo to firebase
      //
      // firebaseUploadPromise(coverPhoto)
      //   .then(async (url) => {
      //     payload.imageUrl = url as string;
      //     createBookMutation.mutate(payload);
      //   })
      //   .catch((err) => {
      //     toast.error("C?? l???i x???y ra khi t???i ???nh l??n. Vui l??ng th??? l???i");
      //   });
    },
  });

  return (
    <Fragment>
      <div className="mb-6">
        <Link
          className="flex w-fit items-center justify-between rounded border-slate-200 bg-slate-100 px-3.5 py-1.5 text-base font-medium text-slate-600 transition duration-150 ease-in-out hover:border-slate-300 hover:bg-slate-200"
          href="/issuer/books"
        >
          <IoChevronBack size={"17"} />
          <span>Quay l???i</span>
        </Link>
      </div>
      <form
        onSubmit={form.handleSubmit}
        className="mx-auto max-w-6xl space-y-8 divide-y divide-gray-200 bg-white p-10"
      >
        <div className="mb-4 sm:mb-0">
        <h1 className="text-2xl font-bold text-slate-800 md:text-3xl">
          Th??m s??ch l??? ???
        </h1>
      </div>
        <div className="space-y-8 divide-y divide-gray-200">
          <div>
            <div>
              <h3 className="text-lg font-bold leading-6 text-gray-900">
                Th??ng tin chung
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                Th??ng tin c?? b???n v??? s??ch
              </p>
            </div>

            <div className="mt-6 grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
              <div className="sm:col-span-6">
                <label
                  htmlFor="name"
                  className="block text-sm font-medium text-gray-700"
                >
                  T??n s??ch<span className="text-rose-500">*</span>
                </label>
                <div className="mt-1">
                  <input
                    value={form.values.name}
                    onChange={form.handleChange}
                    type="text"
                    name="name"
                    id="name"
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  />
                </div>
                {form.errors.name && form.touched.name && (
                  <div className={"input-error"}>{form.errors.name}</div>
                )}
              </div>

              <div className="sm:col-span-6">
                <label
                  htmlFor="code"
                  className="block text-sm font-medium text-gray-700"
                >
                  M?? s??ch<span className="text-rose-500">*</span>
                </label>
                <div className="mt-1">
                  <input
                  placeholder= "VD: TB001"
                    value={form.values.code}
                    onChange={form.handleChange}
                    type="text"
                    name="code"
                    id="code"
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  />
                </div>
                {form.errors.code && form.touched.code && (
                  <div className={"input-error"}>{form.errors.code}</div>
                )}
              </div>

              <div className="sm:col-span-6">
                <label
                  htmlFor="description"
                  className="block text-sm font-medium text-gray-700"
                >
                  M?? t???<span className="text-rose-500">*</span>
                </label>
                <div className="mt-1">
                  <textarea
                    value={form.values.description}
                    onChange={form.handleChange}
                    id="description"
                    name="description"
                    rows={3}
                    className="block w-full rounded-md border border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  />
                </div>
                {form.errors.description && form.touched.description && (
                  <div className={"input-error"}>{form.errors.description}</div>
                )}
              </div>

              <div className="sm:col-span-6">
                <label
                  htmlFor="cover-photo"
                  className="block text-sm font-medium text-gray-700"
                >
                  ???nh b??a<span className="text-rose-500">*</span>
                </label>
                <div className="mt-1 flex justify-center rounded-md border-2 border-dashed border-gray-300 px-6 pt-5 pb-6">
                  <div className="space-y-1 text-center">
                    {coverPhoto ? (
                      <Image
                        className={
                          "mb-4 w-52 rounded-md object-cover object-center"
                        }
                        width={500}
                        height={500}
                        src={URL.createObjectURL(coverPhoto)}
                        alt={""}
                      />
                    ) : (
                      <svg
                        className="mx-auto h-12 w-12 text-gray-400"
                        stroke="currentColor"
                        fill="none"
                        viewBox="0 0 48 48"
                        aria-hidden="true"
                      >
                        <path
                          d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                          strokeWidth={2}
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    )}
                    <div className="flex justify-center text-sm text-gray-600">
                      <label
                        htmlFor="file-upload"
                        className="relative cursor-pointer rounded-md bg-white font-medium text-indigo-600 focus-within:outline-none focus-within:ring-2 focus-within:ring-indigo-500 focus-within:ring-offset-2 hover:text-indigo-500"
                      >
                        <span>
                          {coverPhoto ? "Ch???n ???nh kh??c" : "T???i ???nh l??n"}
                        </span>
                        <input
                          onChange={(e) => handleCoverPhotoChange(e)}
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
            </div>
          </div>

          <div className="pt-8">
            <div className="mt-6 grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
              <div className="sm:col-span-3">
                <label
                  htmlFor="isbn10"
                  className="block text-sm font-medium text-gray-700"
                >
                  ISBN10<span className="text-rose-500">*</span>
                </label>
                <div className="mt-1">
                  <input
                  placeholder="VD: 0545010225???"
                    value={form.values.isbn10}
                    onChange={form.handleChange}
                    type="text"
                    name="isbn10"
                    id="isbn10"
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  />
                </div>
                {form.errors.isbn10 && form.touched.isbn10 && (
                  <div className={"input-error"}>{form.errors.isbn10}</div>
                )}
              </div>

              <div className="sm:col-span-3">
                <label
                  htmlFor="isbn13"
                  className="block text-sm font-medium text-gray-700"
                >
                  ISBN13<span className="text-rose-500">*</span>
                </label>
                <div className="mt-1">
                  <input
                  placeholder="VD: 9781260013870???"
                    value={form.values.isbn13}
                    onChange={form.handleChange}
                    type="text"
                    name="isbn13"
                    id="isbn13"
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  />
                </div>
                {form.errors.isbn13 && form.touched.isbn13 && (
                  <div className={"input-error"}>{form.errors.isbn13}</div>
                )}
              </div>
              <div className="sm:col-span-3">
                <label
                  htmlFor="price"
                  className="block text-sm font-medium text-gray-700"
                >
                  Gi?? b??a<span className="text-rose-500">*</span>
                </label>
                <div className="mt-1">
                  <input
                  placeholder="10,000???"
                    // value={form.values.price && getFormattedPrice(form.values.price)}
                    value={new Intl.NumberFormat("vi-VN", {
                                    style: "currency",
                                    currency: "VND",
                                }).format(form.values.price)}
                    onChange={form.handleChange}
                    type="text"
                    name="price"
                    id="price"
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  />
                </div>
                {form.errors.price && form.touched.price && (
                  <div className={"input-error"}>{form.errors.price}</div>
                )}
              </div>

              <div className="sm:col-span-3">
                <label
                  htmlFor="size"
                  className="block text-sm font-medium text-gray-700"
                >
                  K??ch th?????c<span className="text-rose-500">*</span>
                </label>
                <div className="mt-1">
                  <input
                    value={form.values.size}
                    onChange={form.handleChange}
                    type="text"
                    name="size"
                    id="size"
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  />
                </div>
                {form.errors.size && form.touched.size && (
                  <div className={"input-error"}>{form.errors.size}</div>
                )}
              </div>
              <div className="sm:col-span-3">
                <label
                  htmlFor="category"
                  className="block text-sm font-medium text-gray-700"
                >
                  Ng??n ng???<span className="text-rose-500">*</span>
                </label>
                <div className="mt-1">
                  <select
                    onChange={(e) => setSelectedBookId(e.target.value)}
                    value={selectedBookId!}
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    name="category"
                    id="category"
                  >
                    {books?.data?.map((book) => (
                      <option value={book?.id} key={book?.id}>
                        {book?.language}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="sm:col-span-3">
                <label
                  htmlFor="unitInStock"
                  className="block text-sm font-medium text-gray-700"
                >
                  S??? l?????ng<span className="text-rose-500">*</span>
                </label>
                <div className="mt-1">
                  <input
                    value={form.values.unitInStock}
                    onChange={form.handleChange}
                    type="number"
                    name="unitInStock"
                    id="unitInStock"
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  />
                </div>
                {form.errors.unitInStock && form.touched.unitInStock && (
                  <div className={"input-error"}>{form.errors.unitInStock}</div>
                )}
              </div>

              <div className="sm:col-span-3">
                <label
                  htmlFor="releasedYear"
                  className="block text-sm font-medium text-gray-700"
                >
                  N??m xu???t b???n<span className="text-rose-500">*</span>
                </label>
                <div className="mt-1">
                  <input
                    value={form.values.releasedYear}
                    onChange={form.handleChange}
                    type="number"
                    name="releasedYear"
                    id="releasedYear"
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  />
                </div>
                {form.errors.releasedYear && form.touched.releasedYear && (
                  <div className={"input-error"}>
                    {form.errors.releasedYear}
                  </div>
                )}
              </div>

              <div className="sm:col-span-3">
                <label
                  htmlFor="page"
                  className="block text-sm font-medium text-gray-700"
                >
                  S??? trang<span className="text-rose-500">*</span>
                </label>
                <div className="mt-1">
                  <input
                    value={form.values.page}
                    onChange={form.handleChange}
                    type="number"
                    name="page"
                    id="page"
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  />
                </div>
                {form.errors.page && form.touched.page && (
                  <div className={"input-error"}>{form.errors.page}</div>
                )}
              </div>

              <div className="sm:col-span-3">
                <label
                  htmlFor="publisher"
                  className="block text-sm font-medium text-gray-700"
                >
                  Nh?? xu???t b???n<span className="text-rose-500">*</span>
                </label>
                <div className="mt-1">
                  <select
                    onChange={(e) => setSelectedPublisherId(e.target.value)}
                    value={selectedPublisherId!}
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    name="publisher"
                    id="publisher"
                  >
                    {publishers?.data?.map((publisher) => (
                      <option value={publisher?.id} key={publisher?.id}>
                        {publisher?.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="sm:col-span-3">
                <label
                  htmlFor="category"
                  className="block text-sm font-medium text-gray-700"
                >
                  Th??? lo???i<span className="text-rose-500">*</span>
                </label>
                <div className="mt-1">
                  <select
                    onChange={(e) => setSelectedCategoryId(e.target.value)}
                    value={selectedCategoryId!}
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    name="category"
                    id="category"
                  >
                    {categories?.data?.map((category) => (
                      <option value={category?.id} key={category?.id}>
                        {category?.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>
          <div className="pt-8">
            <h3 className="text-lg font-bold leading-6 text-gray-900">
              T??c gi??? v?? d???ch gi???
            </h3>
            <div className="mt-6 grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
              <div className="sm:col-span-6">
                <label
                  htmlFor="translator"
                  className="block text-sm font-medium text-gray-700"
                >
                  D???ch gi???<span className="text-rose-500">*</span>
                </label>
                <div className="mt-1">
                  <input
                    value={form.values.translator}
                    onChange={form.handleChange}
                    type="text"
                    name="translator"
                    id="translator"
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  />
                </div>
                {form.errors.translator && form.touched.translator && (
                  <div className={"input-error"}>{form.errors.translator}</div>
                )}
              </div>
            </div>
            <div className="mt-6 grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
              <div className="sm:col-span-6">
                <label
                  htmlFor="author"
                  className="block text-sm font-medium text-gray-700"
                >
                  T??c gi???<span className="text-rose-500">*</span>
                </label>
                <div className="mt-1">
                  {/* <select
                    onChange={(e) => setSelectedAuthorId(e.target.value)}
                    value={selectedAuthorId!}
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    name="author"
                    id="author"
                  >
                    {authors?.data?.map((author) => (
                      <option value={author?.id} key={author?.id}>
                        {author?.name}
                      </option>
                    ))}
                  </select> */}
                  <Multiselect
                    displayValue="key"
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    onKeyPressFn={function noRefCheck() { }}
                    onRemove={function noRefCheck() { }}
                    onSearch={function noRefCheck() { }}
                    onSelect={function noRefCheck() { }}
                    options={authors?.data?.map((author) => ({
                      cat: 'Group 1',
                      key: author?.name,
                    }))}
                    placeholder="Ch???n t??c gi???"
                  />
                </div>
              </div>
              <div className="sm:col-span-6">
              <CreateButton
                    onClick={() => setShowCreateModal(true)}
                    label="Th??m t??c gi???"
                    // align="right"
                  />
              </div>
            </div>
          </div>
          <div className="pt-8">
            <h3 className="text-lg font-bold leading-6 text-gray-900">
              ?????nh d???ng
            </h3>
            <div className="mt-6 grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
            <div className="sm:col-span-6">
                <label
                  htmlFor="author"
                  className="block text-sm font-medium text-gray-700"
                >
                  ?????nh d???ng chung<span className="text-rose-500">*</span>
                </label>
                <div className="mt-1">
                  <Multiselect
                    displayValue="key"
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    onKeyPressFn={function noRefCheck() { }}
                    onRemove={function noRefCheck() { }}
                    onSearch={function noRefCheck() { }}
                    onSelect={function noRefCheck() { }}
                    placeholder="Ch???n ?????nh d???ng"
                    options={[ 
                      { cat: 'Group 1', key: 'S??ch gi???y' },
                      { cat: 'Group 1', key: 'S??ch ??i???n t???' },
                      { cat: 'Group 1', key: 'B??? s??u t???p' },
                    ]}
                  />
                </div>
              </div>
              <div className="sm:col-span-6">
                <label
                  htmlFor="author"
                  className="block text-sm font-medium text-gray-700"
                >
                  ???????ng link URL d??nh cho s??ch ??i???n t???<span className="text-rose-500">*</span>
                </label>
                <div className="mt-1">
                  <DynamicForm align="right" />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="pt-5">
          <div className="flex justify-end">
            <button
            onClick={() => {
              // setSelectedAuthor(author);
              // setShowUpdateModal(true);
          }}
              type="submit"
              className="ml-3 inline-flex justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
            >
              T???o s??ch
            </button>
          </div>
        </div>
      </form>
      <AuthorModal
                action={AuthorModalMode.CREATE}
                onClose={() => setShowCreateModal(false)}
                isOpen={showCreateModal}
                author={selectedAuthor as { id?: number; name?: string }}
            />

            {/* <AuthorModal
                action={AuthorModalMode.UPDATE}
                author={selectedAuthor as { id?: number; name?: string }}
                onClose={() => setShowUpdateModal(false)}
                isOpen={showUpdateModal}
            /> */}
    </Fragment>
  );
};
IssuerCreateBookPage.getLayout = function getLayout(page: ReactElement) {
  return <AdminLayout>{page}</AdminLayout>;
};
export default IssuerCreateBookPage;