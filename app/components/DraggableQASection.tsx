'use client'

import { useState, useEffect } from 'react'
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd'
import Image from 'next/image'
import { Cast } from '../types'

interface DraggableQASectionProps {
  secondTier: Cast[]
  thirdTier: Cast[]
  isAdmin: boolean
  onOrderChange?: (newSecondTier: Cast[], newThirdTier: Cast[]) => void
}

const DraggableQASection = ({
  secondTier: initialSecondTier,
  thirdTier: initialThirdTier,
  isAdmin,
  onOrderChange,
}: DraggableQASectionProps) => {
  const [secondTier, setSecondTier] = useState(initialSecondTier)
  const [thirdTier, setThirdTier] = useState(initialThirdTier)

  useEffect(() => {
    setSecondTier(initialSecondTier)
    setThirdTier(initialThirdTier)
  }, [initialSecondTier, initialThirdTier])

  const onDragEnd = (result: any) => {
    if (!result.destination || !isAdmin) return

    const sourceList =
      result.source.droppableId === 'questions' ? secondTier : thirdTier
    const destList =
      result.destination.droppableId === 'questions' ? secondTier : thirdTier

    const [removed] = sourceList.splice(result.source.index, 1)
    destList.splice(result.destination.index, 0, removed)

    setSecondTier([...secondTier])
    setThirdTier([...thirdTier])

    if (onOrderChange) {
      onOrderChange(secondTier, thirdTier)
    }
  }

  // Create pairs of questions and answers
  const pairs = secondTier.map((question, index) => ({
    question,
    answer: thirdTier[index] || null,
  }))

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <div>
        {/* Column Headers */}
        <div className="grid grid-cols-2 mb-8">
          <h2 className="qa-title qa-title-questions">Questions</h2>
          <h2 className="qa-title qa-title-answers">Answers</h2>
        </div>

        {/* QA Pairs */}
        <Droppable droppableId="pairs">
          {(provided) => (
            <div
              ref={provided.innerRef}
              {...provided.droppableProps}
              className="space-y-8"
            >
              {pairs.map((pair, index) => (
                <Draggable
                  key={pair.question.hash}
                  draggableId={pair.question.hash}
                  index={index}
                  isDragDisabled={!isAdmin}
                >
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      {...provided.dragHandleProps}
                      className="grid grid-cols-2 gap-8"
                    >
                      {/* Question */}
                      <div className="message-bubble message-bubble-left">
                        <div className="message-metadata">
                          <span className="font-medium">
                            {pair.question.author.display_name}
                          </span>
                          <span className="text-gray-500">
                            @{pair.question.author.fname}
                          </span>
                          <span className="text-gray-400">•</span>
                          <span className="text-gray-500 text-sm">
                            {new Date(
                              pair.question.timestamp,
                            ).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="question-text">{pair.question.text}</p>
                      </div>

                      {/* Answer */}
                      {pair.answer && (
                        <div className="message-bubble message-bubble-right">
                          <div className="message-metadata justify-end">
                            <span className="font-medium text-purple-900">
                              {pair.answer.author.display_name}
                            </span>
                            <span className="text-purple-700">
                              @{pair.answer.author.fname}
                            </span>
                            <span className="text-purple-400">•</span>
                            <span className="text-purple-700 text-sm">
                              {new Date(
                                pair.answer.timestamp,
                              ).toLocaleDateString()}
                            </span>
                          </div>
                          <p className="answer-text">{pair.answer.text}</p>
                        </div>
                      )}
                    </div>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </div>
    </DragDropContext>
  )
}

export default DraggableQASection
