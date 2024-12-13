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
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    setSecondTier(initialSecondTier)
    setThirdTier(initialThirdTier)
  }, [initialSecondTier, initialThirdTier])

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768)
    }
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  const onDragEnd = (result: any) => {
    if (!result.destination || !isAdmin) return

    const { source, destination } = result

    // Create new arrays to work with
    const newSecondTier = Array.from(secondTier)
    const newThirdTier = Array.from(thirdTier)

    // Get the source and destination arrays
    const sourceArray =
      source.droppableId === 'questions' ? newSecondTier : newThirdTier
    const destArray =
      destination.droppableId === 'questions' ? newSecondTier : newThirdTier

    // Handle moving within the same column
    if (source.droppableId === destination.droppableId) {
      const items = Array.from(sourceArray)
      const [reorderedItem] = items.splice(source.index, 1)
      items.splice(destination.index, 0, reorderedItem)

      if (source.droppableId === 'questions') {
        setSecondTier(items)
      } else {
        setThirdTier(items)
      }
    } else {
      // Handle moving between columns
      const sourceItems = Array.from(sourceArray)
      const destItems = Array.from(destArray)
      const [movedItem] = sourceItems.splice(source.index, 1)
      destItems.splice(destination.index, 0, movedItem)

      if (source.droppableId === 'questions') {
        setSecondTier(sourceItems)
        setThirdTier(destItems)
      } else {
        setSecondTier(destItems)
        setThirdTier(sourceItems)
      }
    }

    if (onOrderChange) {
      onOrderChange(
        source.droppableId === 'questions' ? newSecondTier : newThirdTier,
        source.droppableId === 'questions' ? newThirdTier : newSecondTier,
      )
    }
  }

  const renderDraggableItem = (
    item: Cast,
    index: number,
    type: 'question' | 'answer',
  ) => (
    <Draggable
      key={item.hash}
      draggableId={item.hash}
      index={index}
      isDragDisabled={!isAdmin}
    >
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          className={`draggable-item ${
            snapshot.isDragging ? 'opacity-50' : ''
          }`}
        >
          <div
            className={`message-bubble ${
              type === 'question'
                ? 'message-bubble-left'
                : 'message-bubble-right'
            }`}
          >
            <div
              className={`message-header ${
                type === 'answer' ? 'message-header-right' : ''
              }`}
            >
              <Image
                src={item.author.avatar_url || '/default-avatar.png'}
                alt={item.author.display_name}
                width={32}
                height={32}
                className="message-avatar"
              />
              <div
                className={`message-metadata ${
                  type === 'answer' ? 'justify-end' : ''
                }`}
              >
                <span
                  className={`font-medium ${
                    type === 'answer' ? 'text-purple-900' : ''
                  }`}
                >
                  {item.author.display_name}
                </span>
                <span
                  className={
                    type === 'answer' ? 'text-purple-700' : 'text-gray-500'
                  }
                >
                  @{item.author.fname}
                </span>
                <span
                  className={
                    type === 'answer' ? 'text-purple-400' : 'text-gray-400'
                  }
                >
                  •
                </span>
                <span
                  className={
                    type === 'answer'
                      ? 'text-purple-700 text-sm'
                      : 'text-gray-500 text-sm'
                  }
                >
                  {new Date(item.timestamp).toLocaleDateString()}
                </span>
              </div>
            </div>
            <p
              className={type === 'question' ? 'question-text' : 'answer-text'}
            >
              {item.text}
            </p>
            {isAdmin && <div className="drag-indicator" />}
          </div>
        </div>
      )}
    </Draggable>
  )

  // For mobile, create interleaved pairs
  const mobilePairs = secondTier.map((question, index) => ({
    question,
    answer: thirdTier[index],
  }))

  if (isMobile) {
    return (
      <DragDropContext onDragEnd={onDragEnd}>
        <div>
          <Droppable droppableId="mobile-list">
            {(provided) => (
              <div
                ref={provided.innerRef}
                {...provided.droppableProps}
                className="space-y-4"
              >
                {mobilePairs.map((pair, index) => (
                  <div key={index} className="space-y-4">
                    {pair.question &&
                      renderDraggableItem(pair.question, index * 2, 'question')}
                    {pair.answer &&
                      renderDraggableItem(pair.answer, index * 2 + 1, 'answer')}
                  </div>
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </div>
      </DragDropContext>
    )
  }

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <div>
        {/* Column Headers */}
        <div className="grid grid-cols-2 mb-8">
          <h2 className="qa-title qa-title-questions">Questions</h2>
          <h2 className="qa-title qa-title-answers">Answers</h2>
        </div>

        <div className="qa-grid">
          {/* Questions Column */}
          <Droppable droppableId="questions">
            {(provided) => (
              <div
                ref={provided.innerRef}
                {...provided.droppableProps}
                className="qa-column droppable-area"
              >
                {secondTier.map((item, index) =>
                  renderDraggableItem(item, index, 'question'),
                )}
                {provided.placeholder}
              </div>
            )}
          </Droppable>

          {/* Answers Column */}
          <Droppable droppableId="answers">
            {(provided) => (
              <div
                ref={provided.innerRef}
                {...provided.droppableProps}
                className="qa-column droppable-area"
              >
                {thirdTier.map((item, index) =>
                  renderDraggableItem(item, index, 'answer'),
                )}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </div>
      </div>
    </DragDropContext>
  )
}

export default DraggableQASection
