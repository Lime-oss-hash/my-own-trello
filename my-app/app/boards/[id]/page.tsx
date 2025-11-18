"use client";
import Navbar from "@/components/navbar";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useBoard } from "@/lib/hooks/useBoards";
import { useParams } from "next/navigation";
import { useState } from "react";

export default function BoardPage() {
    const { id } = useParams<{id: string}>();
    const { board } = useBoard(id);

    const [isEditngTitle, setIsEditingTitle] = useState(false);
    const [newTitle, setNewTitle] = useState("");
    const [newColor, setNewColor] = useState("");
    
    return (
    <div className="min-h-screen bg-gray-50">
        <Navbar 
        boardTitle={board?.title} 
        onEditBoard={() => {
            setIsEditingTitle(true);
        }}
        />
        

        <Dialog open={isEditngTitle} onOpenChange={setIsEditingTitle}>
            <DialogContent>
                
            </DialogContent>
        </Dialog>
    </div>
    );
}