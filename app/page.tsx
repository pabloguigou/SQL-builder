"use client";

import React, { useState, DragEvent } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { motion } from "framer-motion";

type QueryBlock = {
  id: number;
  clause: string;
  value: string;
};

const defaultClauses: string[] = [
  "SELECT",
  "FROM",
  "WHERE",
  "JOIN",
  "LEFT JOIN",
  "RIGHT JOIN",
  "GROUP BY",
  "HAVING",
  "ORDER BY",
  "LIMIT",
  "OFFSET",
  "UNION",
  "CASE WHEN",
  "AND",
  "OR",
];

export default function SQLBuilder() {
  const [clauses, setClauses] = useState<string[]>(defaultClauses);
  const [queryBlocks, setQueryBlocks] = useState<QueryBlock[]>([]);
  const [newClause, setNewClause] = useState<string>("");
  const [dragIndex, setDragIndex] = useState<number | null>(null);

  const handleDragStartClause = (
    e: React.DragEvent<HTMLDivElement> | MouseEvent | TouchEvent | PointerEvent,
    clause: string
  ) => {
    const de = e as unknown as React.DragEvent<HTMLDivElement>;
    de.dataTransfer?.setData("clause", clause);
  };

  const handleDropClause = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const clause = e.dataTransfer.getData("clause");
    if (!clause) return;

    setQueryBlocks((prev) => [
      ...prev,
      { id: Date.now(), clause, value: "" },
    ]);
  };

  const allowDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const updateValue = (id: number, value: string) => {
    setQueryBlocks((prev) =>
      prev.map((b) => (b.id === id ? { ...b, value } : b))
    );
  };

  const removeBlock = (id: number) => {
    setQueryBlocks((prev) => prev.filter((b) => b.id !== id));
  };

  const addClause = () => {
    if (!newClause.trim()) return;
    setClauses([...clauses, newClause.toUpperCase()]);
    setNewClause("");
  };

  const handleBlockDragStart = (index: number) => {
    setDragIndex(index);
  };

  const handleBlockDrop = (index: number) => {
    if (dragIndex === null || dragIndex === index) return;

    const updated = [...queryBlocks];
    const draggedItem = updated.splice(dragIndex, 1)[0];
    updated.splice(index, 0, draggedItem);

    setQueryBlocks(updated);
    setDragIndex(null);
  };

  const buildSQL = (): string => {
    return queryBlocks
      .map((b) => `${b.clause} ${b.value}`.trim())
      .join("\n");
  };

  const copySQL = async () => {
    await navigator.clipboard.writeText(buildSQL());
  };

  return (
    <div className="grid grid-cols-3 gap-4 p-6">
      <Card className="col-span-1 p-4">
        <h2 className="text-xl font-bold mb-4">Clauses</h2>
        <div className="space-y-2 max-h-[400px] overflow-y-auto">
          {clauses.map((clause, idx) => (
            <motion.div
              key={idx}
              draggable
              onDragStart={(e) => handleDragStartClause(e, clause)}
              className="p-2 bg-gray-100 rounded-xl cursor-grab shadow"
              whileHover={{ scale: 1.03 }}
            >
              {clause}
            </motion.div>
          ))}
        </div>

        <div className="mt-4 space-y-2">
          <Input
            placeholder="Add new clause"
            value={newClause}
            onChange={(e) => setNewClause(e.target.value)}
          />
          <Button onClick={addClause} className="w-full">
            Add Clause
          </Button>
        </div>
      </Card>

      <Card
        className="col-span-2 p-4 min-h-[500px]"
        onDrop={handleDropClause}
        onDragOver={allowDrop}
      >
        <h2 className="text-xl font-bold mb-4">Query Playground</h2>
        <div className="space-y-3">
          {queryBlocks.map((block, index) => (
            <motion.div
              key={block.id}
              draggable
              onDragStart={() => handleBlockDragStart(index)}
              onDragOver={allowDrop}
              onDrop={() => handleBlockDrop(index)}
              className="flex gap-2 items-center bg-white p-3 rounded-2xl shadow cursor-move"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <span className="font-semibold min-w-[120px]">
                {block.clause}
              </span>
              <Input
                placeholder="Add values or custom SQL"
                value={block.value}
                onChange={(e) => updateValue(block.id, e.target.value)}
              />
              <Button
                variant="destructive"
                onClick={() => removeBlock(block.id)}
              >
                Remove
              </Button>
            </motion.div>
          ))}
        </div>

        <div className="mt-6">
          <h3 className="font-bold mb-2">Generated SQL</h3>
          <pre className="bg-gray-100 p-3 rounded-xl whitespace-pre-wrap">
            {buildSQL()}
          </pre>
          <Button className="mt-2" onClick={copySQL}>
            Copy SQL
          </Button>
        </div>
      </Card>
    </div>
  );
}
