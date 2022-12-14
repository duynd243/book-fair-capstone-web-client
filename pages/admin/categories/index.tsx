import React, {Fragment, ReactElement, useMemo, useState} from "react";
import {NextPageWithLayout} from "../../_app";
import AdminLayout from "../../../components/Layout/AdminLayout";
import PageHeading from "../../../components/Admin/PageHeading";
import SearchForm from "../../../components/Admin/SearchForm";
import {faker} from "@faker-js/faker/locale/vi";
import CreateButton from "../../../components/Admin/CreateButton";
import Link from "next/link";
import TableHeading from "../../../components/Admin/Table/TableHeading";
import TableHeader from "../../../components/Admin/Table/TableHeader";
import TableBody from "../../../components/Admin/Table/TableBody";
import TableWrapper from "../../../components/Admin/Table/TableWrapper";
import TableData from "../../../components/Admin/Table/TableData";
import {IFakePersonnel} from "../personnels";
import genres from "./[id]/genres";
import {ca} from "date-fns/locale";
import CategoryModal, {
    CategoryModalMode,
} from "../../../components/Modal/CategoryModal";

export const bookCategories = [
    {
        id: 1,
        name: "Văn học",
        percentages: 10,
        genres: [
            {
                id: 1,
                name: "Tiểu thuyết",
            },
            {
                id: 2,
                name: "Truyện ngắn",
            },
        ],
        status: true,
    },
    {
        id: 2,
        name: "Kinh tế",
        percentages: 2,
        genres: [
            {
                id: 1,
                name: "Kinh tế chính trị",
            },
            {
                id: 2,
                name: "Kinh tế xã hội",
            },
            {
                id: 3,
                name: "Kinh tế kinh doanh",
            },
        ],
        status: false,
    },
    {
        id: 3,
        name: "Khoa học",
        percentages: 5,
        genres: [
            {
                id: 1,
                name: "Khoa học tự nhiên",
            },
            {
                id: 2,
                name: "Khoa học xã hội",
            },
        ],
        status: true,
    },
];

const AdminCategoriesPage: NextPageWithLayout = () => {
    const [selectedCategory, setSelectedCategory] = useState<typeof bookCategories[0]>();
    const [showCreateModal, setShowCreateModal] = useState<boolean>(false);
    const [showUpdateModal, setShowUpdateModal] = useState<boolean>(false);

    return (
        <Fragment>
            <PageHeading label="Thể loại sách">
                <SearchForm/>
                <CreateButton
                    label="Thêm thể loại"
                    onClick={() => setShowCreateModal(true)}
                />
            </PageHeading>
            <TableWrapper>
                <TableHeading>
                    <TableHeader>Tên thể loại</TableHeader>
                    <TableHeader textAlignment="text-center">Số lượng chủ đề</TableHeader>
                    <TableHeader textAlignment="text-center">Mức chiết khấu</TableHeader>
                    <TableHeader textAlignment="text-center">Trạng thái</TableHeader>
                    <TableHeader>
                        <span className="sr-only">Edit</span>
                    </TableHeader>
                </TableHeading>
                <TableBody>
                    {bookCategories.map((category) => (
                        <tr key={category.id}>
                            <TableData className="text-sm font-medium">
                                {category.name}
                            </TableData>
                            <TableData textAlignment="text-center" className="text-sm">
                                {category.genres.length}
                            </TableData>
                            <TableData textAlignment="text-center" className="text-sm">
                                {category.percentages}%
                            </TableData>
                            <TableData textAlignment="text-center">
                                {category.status ? (
                                    <span
                                        className="inline-flex rounded-full bg-green-100 px-2 text-xs font-semibold uppercase leading-5 text-green-800">
                    Hoạt động
                  </span>
                                ) : (
                                    <span
                                        className="inline-flex rounded-full bg-red-100 px-2 text-xs font-semibold uppercase leading-5 text-red-800">
                    Bị vô hiệu hóa
                  </span>
                                )}
                            </TableData>
                            <TableData className="text-right text-sm font-medium text-indigo-600 hover:text-indigo-900">
                                <button
                                    onClick={() => {
                                        setSelectedCategory(category);
                                        setShowUpdateModal(true);
                                    }}
                                >
                                    Chỉnh sửa
                                </button>
                                <Link
                                    href={`/admin/categories/${category.id}/genres`}
                                    className="block"
                                >
                                    Xem
                                </Link>
                            </TableData>
                        </tr>
                    ))}
                </TableBody>
            </TableWrapper>

            <CategoryModal
                action={CategoryModalMode.CREATE}
                onClose={() => setShowCreateModal(false)}
                isOpen={showCreateModal}
            />

            <CategoryModal
                action={CategoryModalMode.UPDATE}
                category={selectedCategory}
                onClose={() => setShowUpdateModal(false)}
                isOpen={showUpdateModal}
            />
        </Fragment>
    );
};

AdminCategoriesPage.getLayout = function getLayout(page: ReactElement) {
    return <AdminLayout>{page}</AdminLayout>;
};
export default AdminCategoriesPage;
