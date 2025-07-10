export interface Comment {
    _id: string;
    name: string;
    email: string;
    message: string;
    createdAt: string;
}

export interface Blog {
    _id: string;
    title: string;
    description: string;
    image: string;
    createdAt: string;
    updatedAt: string;
    comments: Comment[];
    __v: number;
    commentCount: number;
}

export interface BlogApiResponse {
    status: boolean;
    message: string;
    results: number;
    totalPages: number;
    currentPage: number;
    data: Blog[];
}
