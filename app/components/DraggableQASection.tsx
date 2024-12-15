'use client'

import { useState, useEffect } from 'react'
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd'
import type { Cast } from '../types'
import SafeImage from './SafeImage'

interface CustomCSSProperties extends React.CSSProperties {
  '--pair-height'?: string
}

interface DraggableQASectionProps {
  secondTier: Cast[]
  thirdTier: Cast[]
  isAdmin: boolean
  onOrderChange: (newSecondTier: Cast[], newThirdTier: Cast[]) => void
}

export default function DraggableQASection({
  secondTier,
  thirdTier,
  isAdmin,
  onOrderChange,
}: DraggableQASectionProps) {
  const [localSecondTier, setLocalSecondTier] = useState(secondTier)
  const [localThirdTier, setLocalThirdTier] = useState(thirdTier)
  const [isPairedMode, setIsPairedMode] = useState(window.innerWidth <= 768)
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768)
  const [quickMoveTarget, setQuickMoveTarget] = useState<{
    type: 'question' | 'answer' | 'pair' | null
    index: number
  } | null>(null)

  // Handle mobile detection and paired mode
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth <= 768
      setIsMobile(mobile)
      if (mobile) {
        setIsPairedMode(true)
      }
    }
    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const handleDragEnd = (result: any) => {
    if (!result.destination || !isAdmin) return

    const sourceList =
      result.source.droppableId === 'questions'
        ? localSecondTier
        : localThirdTier
    const destList =
      result.destination.droppableId === 'questions'
        ? localSecondTier
        : localThirdTier

    const [removed] = sourceList.splice(result.source.index, 1)
    destList.splice(result.destination.index, 0, removed)

    setLocalSecondTier([...localSecondTier])
    setLocalThirdTier([...localThirdTier])
    onOrderChange(localSecondTier, localThirdTier)
  }

  const handleQuickMove = (
    type: 'question' | 'answer' | 'pair',
    fromIndex: number,
    toIndex: number,
  ) => {
    if (type === 'pair') {
      // Move the entire pair
      const newSecondTier = [...localSecondTier]
      const newThirdTier = [...localThirdTier]

      const [removedQuestion] = newSecondTier.splice(fromIndex, 1)
      const [removedAnswer] = newThirdTier.splice(fromIndex, 1)

      newSecondTier.splice(toIndex, 0, removedQuestion)
      newThirdTier.splice(toIndex, 0, removedAnswer)

      setLocalSecondTier(newSecondTier)
      setLocalThirdTier(newThirdTier)
      onOrderChange(newSecondTier, newThirdTier)
    } else {
      // Move individual question or answer
      const list = type === 'question' ? localSecondTier : localThirdTier
      const newList = [...list]
      const [removed] = newList.splice(fromIndex, 1)
      newList.splice(toIndex, 0, removed)

      if (type === 'question') {
        setLocalSecondTier(newList)
        onOrderChange(newList, localThirdTier)
      } else {
        setLocalThirdTier(newList)
        onOrderChange(localSecondTier, newList)
      }
    }
    setQuickMoveTarget(null)
  }

  const renderPairedMode = () => (
    <div className="qa-grid">
      {localSecondTier.map((question, index) => {
        const answer = localThirdTier[index]
        return (
          <div key={question.hash} className="qa-pair">
            <div className="numbered-band">
              <span className="numbered-band-text">#{index + 1}</span>
              {isAdmin && (
                <button
                  onClick={() => setQuickMoveTarget({ type: 'pair', index })}
                  className="quick-move-pair-button ml-2"
                  title="Move this pair"
                >
                  ⇅
                </button>
              )}
            </div>
            <div className="qa-pair-content">
              {/* Question */}
              <div className="message-bubble message-bubble-left w-full">
                <div className="message-header">
                  <div className="relative w-8 h-8">
                    <SafeImage
                      src={question.author.avatar_url}
                      alt={question.author.display_name}
                      fill
                      className="rounded-full object-cover"
                    />
                  </div>
                  <div>
                    <div className="font-medium text-center">
                      {question.author.display_name}
                    </div>
                    <div className="text-sm text-gray-600 text-center">
                      @{question.author.username}
                    </div>
                  </div>
                </div>
                <div className="question-text text-center">{question.text}</div>
                {isAdmin && (
                  <button
                    onClick={() =>
                      setQuickMoveTarget({ type: 'question', index })
                    }
                    className="quick-move-button quick-move-button-right"
                    title="Move this question"
                  >
                    ⇄
                  </button>
                )}
              </div>

              {/* Answer */}
              {answer && (
                <div className="message-bubble message-bubble-right w-full mt-4">
                  <div className="message-header message-header-right">
                    <div className="relative w-8 h-8">
                      <SafeImage
                        src={answer.author.avatar_url}
                        alt={answer.author.display_name}
                        fill
                        className="rounded-full object-cover"
                      />
                    </div>
                    <div>
                      <div className="font-medium text-center">
                        {answer.author.display_name}
                      </div>
                      <div className="text-sm text-gray-600 text-center">
                        @{answer.author.username}
                      </div>
                    </div>
                  </div>
                  <div className="answer-text text-center">{answer.text}</div>
                  {isAdmin && (
                    <button
                      onClick={() =>
                        setQuickMoveTarget({ type: 'answer', index })
                      }
                      className="quick-move-button quick-move-button-left"
                      title="Move this answer"
                    >
                      ⇄
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        )
      })}

      {/* Quick Move Overlay */}
      {quickMoveTarget !== null && (
        <div
          className="quick-actions-overlay"
          onClick={() => setQuickMoveTarget(null)}
        >
          <div
            className="quick-actions-content"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="quick-actions-header">
              <h3>
                Move{' '}
                {quickMoveTarget.type === 'pair'
                  ? 'Pair'
                  : quickMoveTarget.type}{' '}
                to position
              </h3>
              <button onClick={() => setQuickMoveTarget(null)}>✕</button>
            </div>
            <div className="quick-actions-grid">
              {Array.from(
                {
                  length:
                    quickMoveTarget.type === 'pair'
                      ? localSecondTier.length
                      : quickMoveTarget.type === 'question'
                      ? localSecondTier.length
                      : localThirdTier.length,
                },
                (_, i) => (
                  <button
                    key={i}
                    className="quick-action-button"
                    onClick={() =>
                      handleQuickMove(
                        quickMoveTarget.type!,
                        quickMoveTarget.index,
                        i,
                      )
                    }
                  >
                    {i + 1}
                  </button>
                ),
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )

  // Function to render the matching mode content
  const renderMatchingMode = () => (
    <DragDropContext onDragEnd={handleDragEnd}>
      <div className="matching-grid">
        {/* Questions Column */}
        <Droppable droppableId="questions">
          {(provided) => (
            <div
              ref={provided.innerRef}
              {...provided.droppableProps}
              className="matching-column"
            >
              <h3 className="text-xl font-semibold mb-4 text-center">
                Questions
              </h3>
              {localSecondTier.map((cast, index) => (
                <div key={cast.hash} className="matching-pair">
                  <Draggable
                    draggableId={cast.hash}
                    index={index}
                    isDragDisabled={!isAdmin}
                  >
                    {(provided) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                        className="matching-item-container"
                        style={
                          {
                            ...provided.draggableProps.style,
                            '--pair-height': `${Math.max(
                              getTextHeight(cast.text),
                              getTextHeight(localThirdTier[index]?.text || ''),
                            )}px`,
                          } as CustomCSSProperties
                        }
                      >
                        <div className="message-bubble message-bubble-left">
                          <div className="message-header">
                            <div className="relative w-8 h-8">
                              <SafeImage
                                src={cast.author.avatar_url}
                                alt={cast.author.display_name}
                                fill
                                className="rounded-full object-cover"
                              />
                            </div>
                            <div>
                              <div className="font-medium text-center">
                                {cast.author.display_name}
                              </div>
                              <div className="text-sm text-gray-600 text-center">
                                @{cast.author.username}
                              </div>
                            </div>
                          </div>
                          <div className="cast-content text-center">
                            {cast.text}
                          </div>
                        </div>
                      </div>
                    )}
                  </Draggable>
                </div>
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>

        {/* Central Numbers Column */}
        <div className="central-numbers-column">
          {Array.from(
            { length: Math.max(localSecondTier.length, localThirdTier.length) },
            (_, i) => (
              <div
                key={i}
                className="central-number"
                style={
                  {
                    '--pair-height': `${Math.max(
                      getTextHeight(localSecondTier[i]?.text || ''),
                      getTextHeight(localThirdTier[i]?.text || ''),
                    )}px`,
                  } as CustomCSSProperties
                }
              >
                <div className="central-number-content">{i + 1}</div>
              </div>
            ),
          )}
        </div>

        {/* Answers Column */}
        <Droppable droppableId="answers">
          {(provided) => (
            <div
              ref={provided.innerRef}
              {...provided.droppableProps}
              className="matching-column"
            >
              <h3 className="text-xl font-semibold mb-4 text-center">
                Answers
              </h3>
              {localThirdTier.map((cast, index) => (
                <div key={cast.hash} className="matching-pair">
                  <Draggable
                    draggableId={cast.hash}
                    index={index}
                    isDragDisabled={!isAdmin}
                  >
                    {(provided) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                        className="matching-item-container"
                        style={
                          {
                            ...provided.draggableProps.style,
                            '--pair-height': `${Math.max(
                              getTextHeight(localSecondTier[index]?.text || ''),
                              getTextHeight(cast.text),
                            )}px`,
                          } as CustomCSSProperties
                        }
                      >
                        <div className="message-bubble message-bubble-right">
                          <div className="message-header message-header-right">
                            <div className="relative w-8 h-8">
                              <SafeImage
                                src={cast.author.avatar_url}
                                alt={cast.author.display_name}
                                fill
                                className="rounded-full object-cover"
                              />
                            </div>
                            <div>
                              <div className="font-medium text-center">
                                {cast.author.display_name}
                              </div>
                              <div className="text-sm text-gray-600 text-center">
                                @{cast.author.username}
                              </div>
                            </div>
                          </div>
                          <div className="cast-content text-center">
                            {cast.text}
                          </div>
                        </div>
                      </div>
                    )}
                  </Draggable>
                </div>
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </div>
    </DragDropContext>
  )

  // Helper function to estimate text height
  const getTextHeight = (text: string): number => {
    const baseHeight = 100 // minimum height
    const charsPerLine = 50
    const lineHeight = 24
    const lines = Math.ceil(text.length / charsPerLine)
    return Math.max(baseHeight, lines * lineHeight + 80) // 80px for padding and headers
  }

  return (
    <div>
      {/* Mode Toggle - Only show on desktop */}
      {!isMobile && (
        <div className="flex justify-end mb-4 md:mb-6">
          <button
            onClick={() => setIsPairedMode(!isPairedMode)}
            className="mode-toggle"
          >
            {isPairedMode ? 'Switch to Matching Mode' : 'Switch to Paired Mode'}
          </button>
        </div>
      )}

      {isPairedMode ? renderPairedMode() : renderMatchingMode()}
    </div>
  )
}
