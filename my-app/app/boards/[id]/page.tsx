"use client";
import Navbar from "@/components/navbar";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useBoard } from "@/lib/hooks/useBoards";
import { Label } from "@radix-ui/react-label";
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
            setNewTitle(board?.title ?? "")
            setNewColor(board?.color ?? "")
            setIsEditingTitle(true);
        }}
        />
        

        <Dialog open={isEditngTitle} onOpenChange={setIsEditingTitle}>
            <DialogContent className="w-[95vw] max-w-[425px] mx-auto">
                <DialogHeader>
                    <DialogTitle>Edit Board</DialogTitle>
                </DialogHeader>
                <form>
                    <div>
                        <Label>Board Title</Label>
                        <Input 
                        id="boardTitle" 
                        value={newTitle}
                        placeholder="Enter board title..." 
                        required
                        />
                    </div>

                </form>
            </DialogContent>
        </Dialog>
    </div>
    );
}