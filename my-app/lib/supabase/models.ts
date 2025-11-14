export interface Board {
    id: string;
    title:  string;
    description:    string  | null;
    color: string;
    user_id: string;
    created_at: string;
}

export interface Column {
    id: string;
    title: string;
    board_id: string;
    sort_order: number;
    created_at: string;
    user_id: string;
}

export interface Task {
    id: string;
    title: string;
    column_id: string;
    description: string  | null;
    assignee: string  | null;
    due_date: string  | null;
    priority: 'low' | 'medium' | 'high';
    sort_order: number;
    created_at: string;
    updated_at: string;
}