
import { Column, Board } from "@/lib/supabase/models";
import { SupabaseClient } from "@supabase/supabase-js";
// Server side requires await, but the client doesn't need it
// const supabase = createClient();
export const boardService = {
    async getBoards(supabase: SupabaseClient, userId: string): Promise<Board[]> {
        const { data, error } = await supabase
            .from('boards')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: false });
        if (error) {
            console.error('Error fetching boards:', error);
            return [];
        }
        return data || [];
    },

    async createBoard(supabase: SupabaseClient, board: Omit<Board, "id" | "created_at" | "updated_at">): Promise<Board> {
        const { data, error } = await supabase
            .from('boards')
            .insert(board)
            .select()
            .single();
        if (error) {
            console.error('Error creating board:', error);
            throw new Error('Failed to create board');
        }
        return data;
    }
}     
        
export const columnServices ={
    async createColumn(supabase: SupabaseClient, column: Omit<Column, "id" | "created_at">): Promise<Column> {
        const { data, error } = await supabase
            .from('columns')
            .insert(column)
            .select()
            .single();
        if (error) {
            console.error('Error creating column:', error);
            throw new Error('Failed to create column');
        }
        return data;
    }
}


export const boardDataService = {
    async createBoardWithDefaultColumns(supabase: SupabaseClient, boardData: {
        title: string
        description?: string
        color?: string,
        userId: string,
    }): Promise<Board> {
        

       const board = await boardService.createBoard(supabase, {
        title: boardData.title,
        description: boardData.description || null,
        color: boardData.color || 'bg-blue-500',
        user_id: boardData.userId,
       })

       const defaultColumn = [
            {title: "To Do", sort_order: 0},
            {title: "In Progress", sort_order: 1},
            {title: "Review", sort_order: 2},
            {title: "Done", sort_order: 3}

       ]

       await Promise.all(
        defaultColumn.map((column) => {
            columnServices.createColumn(supabase, {
                ...column,
                board_id: board.id,
                user_id: boardData.userId
            })
        })
       )
       return board
    },
};