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
  const [lockPairs, setLockPairs] = useState(true)
  const [showQuickActions, setShowQuickActions] = useState(false)
  const [selectedItem, setSelectedItem] = useState<{
    item: Cast
    type: 'question' | 'answer'
    index: number
  } | null>(null)

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

    // Handle pair swapping
    if (source.droppableId === 'qa-pairs') {
      const newSecondTier = Array.from(secondTier)
      const newThirdTier = Array.from(thirdTier)

      const [removedQuestion] = newSecondTier.splice(source.index, 1)
      const [removedAnswer] = newThirdTier.splice(source.index, 1)

      newSecondTier.splice(destination.index, 0, removedQuestion)
      newThirdTier.splice(destination.index, 0, removedAnswer)

      setSecondTier(newSecondTier)
      setThirdTier(newThirdTier)

      if (onOrderChange) {
        onOrderChange(newSecondTier, newThirdTier)
      }
      return
    }

    // Handle individual item swapping
    if (source.droppableId === destination.droppableId) {
      // Moving within the same column
      const items =
        source.droppableId === 'questions' ? [...secondTier] : [...thirdTier]
      const [reorderedItem] = items.splice(source.index, 1)
      items.splice(destination.index, 0, reorderedItem)

      if (source.droppableId === 'questions') {
        setSecondTier(items)
      } else {
        setThirdTier(items)
      }

      if (onOrderChange) {
        onOrderChange(
          source.droppableId === 'questions' ? items : secondTier,
          source.droppableId === 'questions' ? thirdTier : items,
        )
      }
    } else {
      // Moving between columns
      const sourceItems =
        source.droppableId === 'questions' ? [...secondTier] : [...thirdTier]
      const destItems =
        destination.droppableId === 'questions'
          ? [...secondTier]
          : [...thirdTier]

      const [movedItem] = sourceItems.splice(source.index, 1)
      const removedItem = destItems[destination.index]
      destItems.splice(destination.index, 1, movedItem)

      if (removedItem) {
        sourceItems.splice(source.index, 0, removedItem)
      }

      if (source.droppableId === 'questions') {
        setSecondTier(sourceItems)
        setThirdTier(destItems)
      } else {
        setSecondTier(destItems)
        setThirdTier(sourceItems)
      }

      if (onOrderChange) {
        onOrderChange(
          source.droppableId === 'questions' ? sourceItems : destItems,
          source.droppableId === 'questions' ? destItems : sourceItems,
        )
      }
    }
  }

  const toggleLockPairs = () => {
    setLockPairs((prev) => !prev)
  }

  const handleQuickAction = (targetIndex: number) => {
    if (!selectedItem) return

    const { item, type, index } = selectedItem
    const sourceArray = type === 'question' ? secondTier : thirdTier
    const newArray = [...sourceArray]

    // Remove from current position
    newArray.splice(index, 1)
    // Insert at new position
    newArray.splice(targetIndex, 0, item)

    if (type === 'question') {
      setSecondTier(newArray)
    } else {
      setThirdTier(newArray)
    }

    if (onOrderChange) {
      onOrderChange(
        type === 'question' ? newArray : secondTier,
        type === 'question' ? thirdTier : newArray,
      )
    }

    setShowQuickActions(false)
    setSelectedItem(null)
  }

  const renderQuickActions = () => {
    if (!showQuickActions) return null

    const totalPairs = Math.max(secondTier.length, thirdTier.length)
    return (
      <div className="quick-actions-overlay">
        <div className="quick-actions-content">
          <div className="quick-actions-header">
            <h3 className="text-lg font-medium">
              Move {selectedItem?.type === 'question' ? 'Question' : 'Answer'}{' '}
              to Position:
            </h3>
            <button
              onClick={() => setShowQuickActions(false)}
              className="text-gray-500 hover:text-gray-700"
            >
              ✕
            </button>
          </div>
          <div className="quick-actions-grid">
            {Array.from({ length: totalPairs }).map((_, index) => (
              <button
                key={index}
                onClick={() => handleQuickAction(index)}
                className="quick-action-button"
              >
                #{index + 1}
              </button>
            ))}
          </div>
        </div>
      </div>
    )
  }

  const renderDraggableItem = (
    item: Cast,
    index: number,
    type: 'question' | 'answer',
  ) => (
    <Draggable
      key={`${item.hash}-${type}`}
      draggableId={`${item.hash}-${type}`}
      index={index}
      isDragDisabled={!isAdmin}
    >
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          className={`draggable-item ${snapshot.isDragging ? 'dragging' : ''}`}
        >
          <div
            className={`message-bubble ${
              type === 'question'
                ? 'message-bubble-left'
                : 'message-bubble-right'
            }`}
          >
            {isAdmin && (
              <button
                onClick={() => {
                  setSelectedItem({ item, type, index })
                  setShowQuickActions(true)
                }}
                className="quick-move-button"
                title="Quick Move"
              >
                #️⃣
              </button>
            )}
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
          </div>
        </div>
      )}
    </Draggable>
  )

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <div className="qa-grid">
        {isAdmin && !isMobile && (
          <button
            onClick={toggleLockPairs}
            className="lock-toggle-button mb-4 px-4 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors flex items-center justify-center gap-2"
          >
            {lockPairs ? (
              <>
                <span className="text-xl">🔒</span>
                <span>Paired Mode</span>
              </>
            ) : (
              <>
                <span className="text-xl">🔓</span>
                <span>Matching Mode</span>
              </>
            )}
          </button>
        )}

        {lockPairs || isMobile ? (
          // Paired Mode (Locked)
          <Droppable droppableId="qa-pairs">
            {(provided) => (
              <div
                ref={provided.innerRef}
                {...provided.droppableProps}
                className="qa-column droppable-area"
              >
                {secondTier.map((question, index) => (
                  <div key={`pair-${index}`} className="qa-pair">
                    <div className="numbered-band">
                      <span className="numbered-band-text">#{index + 1}</span>
                      {isAdmin && (
                        <div className="pair-actions">
                          <button className="vote-button" title="Move Up">
                            ⬆️
                          </button>
                          <button className="vote-button" title="Move Down">
                            ⬇️
                          </button>
                        </div>
                      )}
                    </div>
                    <div className="qa-pair-content">
                      {renderDraggableItem(question, index * 2, 'question')}
                      {thirdTier[index] &&
                        renderDraggableItem(
                          thirdTier[index],
                          index * 2 + 1,
                          'answer',
                        )}
                    </div>
                  </div>
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        ) : (
          // Matching Mode (Unlocked) - Desktop Only
          <div className="matching-grid">
            {/* Questions Column */}
            <div className="matching-column">
              <h2 className="text-lg font-medium mb-4 text-center">
                Questions
              </h2>
              <Droppable droppableId="questions">
                {(provided) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className="qa-column droppable-area space-y-4"
                  >
                    {secondTier.map((item, index) => (
                      <div
                        key={`question-container-${index}`}
                        className="matching-item-container"
                      >
                        {renderDraggableItem(item, index, 'question')}
                      </div>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </div>

            {/* Central Numbers Column */}
            <div className="central-numbers-column">
              {secondTier.map((_, index) => (
                <div key={`number-${index}`} className="central-number">
                  #{index + 1}
                </div>
              ))}
            </div>

            {/* Answers Column */}
            <div className="matching-column">
              <h2 className="text-lg font-medium mb-4 text-center">Answers</h2>
              <Droppable droppableId="answers">
                {(provided) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className="qa-column droppable-area space-y-4"
                  >
                    {thirdTier.map((item, index) => (
                      <div
                        key={`answer-container-${index}`}
                        className="matching-item-container"
                      >
                        {renderDraggableItem(item, index, 'answer')}
                      </div>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </div>
          </div>
        )}
        {renderQuickActions()}
      </div>
    </DragDropContext>
  )
}

export default DraggableQASection
