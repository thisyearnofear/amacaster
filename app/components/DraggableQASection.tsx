'use client'

import { useState, useEffect } from 'react'
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd'
import type { Cast } from '../types'
import SafeImage from './SafeImage'

// Import styles in a way that works with Next.js
import 'slick-carousel/slick/slick.css'
import 'slick-carousel/slick/slick-theme.css'

// Create a wrapper component for Slider to handle dynamic import
const SliderWrapper = ({
  children,
  settings,
}: {
  children: React.ReactNode
  settings: any
}) => {
  const [SliderComponent, setSliderComponent] = useState<any>(null)

  useEffect(() => {
    import('react-slick').then((mod) => {
      setSliderComponent(() => mod.default)
    })
  }, [])

  if (!SliderComponent) {
    // Return a loading state or the first slide
    return (
      <div className="slider-loading">
        {Array.isArray(children) ? children[0] : children}
      </div>
    )
  }

  return <SliderComponent {...settings}>{children}</SliderComponent>
}

interface AnswerStack {
  id: string
  answers: Cast[]
}

type AnswerEntry = Cast | AnswerStack

interface CustomCSSProperties extends React.CSSProperties {
  '--pair-height'?: string
}

interface DraggableQASectionProps {
  secondTier: Cast[]
  thirdTier: AnswerEntry[]
  isAdmin: boolean
  onOrderChange: (newSecondTier: Cast[], newThirdTier: AnswerEntry[]) => void
}

const isAnswerStack = (
  entry: AnswerEntry | undefined,
): entry is AnswerStack => {
  return entry !== undefined && 'answers' in entry
}

export default function DraggableQASection({
  secondTier,
  thirdTier,
  isAdmin,
  onOrderChange,
}: DraggableQASectionProps) {
  const [localSecondTier, setLocalSecondTier] = useState<Cast[]>(secondTier)
  const [localThirdTier, setLocalThirdTier] = useState<AnswerEntry[]>(thirdTier)
  const [isPairedMode, setIsPairedMode] = useState(window.innerWidth <= 768)
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768)
  const [quickMoveTarget, setQuickMoveTarget] = useState<{
    type: 'question' | 'answer' | 'pair' | null
    index: number
  } | null>(null)

  // Add state for managing current answer indices
  const [currentAnswerIndices, setCurrentAnswerIndices] = useState<{
    [key: string]: number
  }>({})

  // Function to handle answer navigation
  const handleAnswerNavigation = (stackId: string, index: number) => {
    setCurrentAnswerIndices((prev) => ({
      ...prev,
      [stackId]: index,
    }))
  }

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

    if (result.source.droppableId === 'questions') {
      setLocalSecondTier([...localSecondTier])
    } else {
      setLocalThirdTier([...localThirdTier])
    }
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
    } else if (type === 'question') {
      // Move individual question
      const newList = [...localSecondTier]
      const [removed] = newList.splice(fromIndex, 1)
      newList.splice(toIndex, 0, removed)
      setLocalSecondTier(newList)
      onOrderChange(newList, localThirdTier)
    } else {
      // Move individual answer or stack
      const newList = [...localThirdTier]
      const [removed] = newList.splice(fromIndex, 1)
      newList.splice(toIndex, 0, removed)
      setLocalThirdTier(newList)
      onOrderChange(localSecondTier, newList)
    }
    setQuickMoveTarget(null)
  }

  // Slider settings
  const sliderSettings = {
    dots: true,
    infinite: false,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    adaptiveHeight: true,
    arrows: true,
  }

  const handleStackAnswers = (index: number) => {
    const newThirdTier = [...localThirdTier]
    const currentEntry = newThirdTier[index]
    const nextEntry = newThirdTier[index + 1]

    if (!currentEntry || !nextEntry) return

    // If current entry is already a stack, check limit and add
    if (isAnswerStack(currentEntry)) {
      if (currentEntry.answers.length >= 3) {
        // Could add a toast/notification here to inform user of limit
        return
      }
      if (!isAnswerStack(nextEntry)) {
        currentEntry.answers.push(nextEntry)
        newThirdTier.splice(index + 1, 1)
      }
    } else if (!isAnswerStack(nextEntry)) {
      // Create new stack with both entries
      const newStack: AnswerStack = {
        id: `stack-${currentEntry.hash}-${nextEntry.hash}`,
        answers: [currentEntry, nextEntry],
      }
      newThirdTier.splice(index, 2, newStack)
    }

    setLocalThirdTier(newThirdTier)
    onOrderChange(localSecondTier, newThirdTier)
  }

  const handleUnstackAnswer = (stackIndex: number, answerIndex: number) => {
    const newThirdTier = [...localThirdTier]
    const entry = newThirdTier[stackIndex]

    if (!isAnswerStack(entry)) return

    // Now TypeScript knows entry is AnswerStack type
    const removedAnswer = entry.answers[answerIndex]
    entry.answers.splice(answerIndex, 1)

    // If only one answer remains, convert stack back to single answer
    if (entry.answers.length === 1) {
      newThirdTier[stackIndex] = entry.answers[0]
    }

    // Add unstacked answer after the current position
    newThirdTier.splice(stackIndex + 1, 0, removedAnswer)

    setLocalThirdTier(newThirdTier)
    onOrderChange(localSecondTier, newThirdTier)
  }

  const renderAnswerContent = (
    entry: AnswerEntry | undefined,
    index: number,
  ) => {
    if (!entry) return null

    if (!isAnswerStack(entry)) {
      // Single answer render
      return (
        <div className="message-bubble message-bubble-right w-full mt-4">
          <div className="message-header message-header-right">
            <div className="relative w-8 h-8">
              <SafeImage
                src={entry.author.avatar_url}
                alt={entry.author.display_name}
                fill
                className="rounded-full object-cover"
              />
            </div>
            <div>
              <div className="font-medium text-center">
                {entry.author.display_name}
              </div>
              <div className="text-sm text-gray-600 text-center">
                @{entry.author.username}
              </div>
            </div>
          </div>
          <div className="answer-text text-center">{entry.text}</div>
          {isAdmin && (
            <div className="admin-controls">
              <button
                onClick={() => setQuickMoveTarget({ type: 'answer', index })}
                className="quick-move-button quick-move-button-left"
                title="Move this answer"
              >
                ⇄
              </button>
              {index < localThirdTier.length - 1 &&
                !isAnswerStack(localThirdTier[index + 1]) && (
                  <button
                    onClick={() => handleStackAnswers(index)}
                    className="stack-button"
                    title="Stack with next answer"
                  >
                    <span className="stack-icon">
                      <svg
                        viewBox="0 0 24 24"
                        width="16"
                        height="16"
                        fill="currentColor"
                      >
                        <path d="M4 7h16v2H4zm0 5h16v2H4zm0 5h16v2H4z" />
                      </svg>
                    </span>
                  </button>
                )}
            </div>
          )}
        </div>
      )
    }

    // Stacked answers render
    const currentAnswerIndex = currentAnswerIndices[entry.id] || 0
    const currentAnswer = entry.answers[currentAnswerIndex]

    return (
      <div className="answer-stack">
        <div className="stack-container">
          <div className="message-bubble message-bubble-right w-full mt-4">
            <div className="message-content">
              {/* Stack Navigation at Top - Now Centered */}
              {entry.answers.length > 1 && (
                <div className="stack-navigation">
                  <div className="navigation-controls">
                    <button
                      className="stack-nav"
                      onClick={() =>
                        handleAnswerNavigation(entry.id, currentAnswerIndex - 1)
                      }
                      disabled={currentAnswerIndex === 0}
                    >
                      ‹
                    </button>
                    <div className="stack-info">
                      {currentAnswerIndex + 1} of {entry.answers.length}
                    </div>
                    <button
                      className="stack-nav"
                      onClick={() =>
                        handleAnswerNavigation(entry.id, currentAnswerIndex + 1)
                      }
                      disabled={currentAnswerIndex === entry.answers.length - 1}
                    >
                      ›
                    </button>
                  </div>
                </div>
              )}

              {/* Message Header */}
              <div className="message-header message-header-right">
                <div className="relative w-8 h-8">
                  <SafeImage
                    src={currentAnswer.author.avatar_url}
                    alt={currentAnswer.author.display_name}
                    fill
                    className="rounded-full object-cover"
                  />
                </div>
                <div>
                  <div className="font-medium text-center">
                    {currentAnswer.author.display_name}
                  </div>
                  <div className="text-sm text-gray-600 text-center">
                    @{currentAnswer.author.username}
                  </div>
                </div>
              </div>

              {/* Message Text */}
              <div className="answer-text text-center">
                {currentAnswer.text}
              </div>

              {/* Admin Controls at Bottom - Now Centered */}
              {isAdmin && (
                <div className="admin-controls">
                  <div className="control-buttons">
                    <button
                      onClick={() =>
                        setQuickMoveTarget({ type: 'answer', index })
                      }
                      className="control-button"
                      title="Move this stack"
                    >
                      ⇄
                    </button>
                    {entry.answers.length < 3 &&
                      index < localThirdTier.length - 1 &&
                      !isAnswerStack(localThirdTier[index + 1]) && (
                        <button
                          onClick={() => handleStackAnswers(index)}
                          className="control-button"
                          title="Add next answer to stack"
                        >
                          <svg
                            viewBox="0 0 24 24"
                            width="16"
                            height="16"
                            fill="currentColor"
                          >
                            <path d="M4 7h16v2H4zm0 5h16v2H4zm0 5h16v2H4z" />
                          </svg>
                        </button>
                      )}
                    <button
                      onClick={() =>
                        handleUnstackAnswer(index, currentAnswerIndex)
                      }
                      className="control-button"
                      title="Remove this answer from stack"
                    >
                      <svg
                        viewBox="0 0 24 24"
                        width="16"
                        height="16"
                        fill="currentColor"
                      >
                        <path d="M19 13H5v-2h14v2z" />
                      </svg>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Helper function to render answer view without admin controls
  const renderAnswerView = (entry: AnswerEntry | undefined, index: number) => {
    if (!entry) return null

    if (!isAnswerStack(entry)) {
      return (
        <div className="message-bubble message-bubble-right w-full mt-4">
          <div className="message-header message-header-right">
            <div className="relative w-8 h-8">
              <SafeImage
                src={entry.author.avatar_url}
                alt={entry.author.display_name}
                fill
                className="rounded-full object-cover"
              />
            </div>
            <div>
              <div className="font-medium text-center">
                {entry.author.display_name}
              </div>
              <div className="text-sm text-gray-600 text-center">
                @{entry.author.username}
              </div>
            </div>
          </div>
          <div className="answer-text text-center">{entry.text}</div>
        </div>
      )
    }

    const currentAnswerIndex = currentAnswerIndices[entry.id] || 0
    const currentAnswer = entry.answers[currentAnswerIndex]

    return (
      <div className="answer-stack">
        <div className="message-bubble message-bubble-right w-full mt-4">
          <div className="message-header message-header-right">
            <div className="relative w-8 h-8">
              <SafeImage
                src={currentAnswer.author.avatar_url}
                alt={currentAnswer.author.display_name}
                fill
                className="rounded-full object-cover"
              />
            </div>
            <div>
              <div className="font-medium text-center">
                {currentAnswer.author.display_name}
              </div>
              <div className="text-sm text-gray-600 text-center">
                @{currentAnswer.author.username}
              </div>
            </div>
            {entry.answers.length > 1 && (
              <div className="stack-indicator">
                <svg
                  viewBox="0 0 24 24"
                  width="14"
                  height="14"
                  fill="currentColor"
                  className="stack-icon"
                >
                  <path d="M4 7h16v2H4zm0 4h16v2H4zm0 4h16v2H4z" />
                </svg>
                <span>{entry.answers.length}</span>
              </div>
            )}
          </div>
          <div className="answer-text text-center">{currentAnswer.text}</div>
        </div>
        {entry.answers.length > 1 && (
          <div className="stack-navigation">
            <div className="stack-pills">
              {entry.answers.map((_, idx) => (
                <button
                  key={idx}
                  className={`stack-pill ${
                    idx === currentAnswerIndex ? 'active' : ''
                  }`}
                  onClick={() => handleAnswerNavigation(entry.id, idx)}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    )
  }

  const renderPairedMode = () => (
    <div className="qa-grid">
      {localSecondTier.map((question, index) => {
        const answerEntry = localThirdTier[index]
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
              {answerEntry && renderAnswerContent(answerEntry, index)}
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
                              getTextHeight(
                                isAnswerStack(localThirdTier[index])
                                  ? localThirdTier[index]?.answers[0]?.text
                                  : localThirdTier[index]?.text,
                              ),
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
                          {isAdmin && (
                            <div className="admin-controls">
                              <button
                                onClick={() =>
                                  setQuickMoveTarget({
                                    type: 'question',
                                    index,
                                  })
                                }
                                className="quick-move-button quick-move-button-right"
                                title="Move this question"
                              >
                                ⇄
                              </button>
                            </div>
                          )}
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
                      getTextHeight(
                        isAnswerStack(localThirdTier[i])
                          ? localThirdTier[i]?.answers[0]?.text
                          : localThirdTier[i]?.text,
                      ),
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
              {localThirdTier.map((entry, index) => (
                <div
                  key={isAnswerStack(entry) ? entry.id : entry.hash}
                  className="matching-pair"
                >
                  <Draggable
                    draggableId={isAnswerStack(entry) ? entry.id : entry.hash}
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
                              getTextHeight(
                                isAnswerStack(entry)
                                  ? entry.answers[0].text
                                  : entry.text,
                              ),
                            )}px`,
                          } as CustomCSSProperties
                        }
                      >
                        {renderAnswerContent(entry, index)}
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

  // Helper function to estimate text height with more generous spacing
  const getTextHeight = (text: string | undefined): number => {
    if (!text) return 120 // return base height for undefined text

    const baseHeight = 120 // increased minimum height
    const charsPerLine = 40 // reduced chars per line to account for word wrapping
    const lineHeight = 28 // increased line height
    const padding = 100 // increased padding for headers and extra space
    const lines = Math.ceil(text.length / charsPerLine)
    const calculatedHeight = lines * lineHeight + padding

    // Add extra padding for longer texts
    const extraPadding = text.length > 280 ? 40 : 0

    return Math.max(baseHeight, calculatedHeight + extraPadding)
  }

  return (
    <div>
      {!isMobile && (
        <div className="controls-header">
          <div className="controls-legend">
            {isAdmin && (
              <>
                <div className="legend-section">
                  <span className="legend-title">Move:</span>
                  <div className="legend-item">
                    <button className="quick-move-pair-button" disabled>
                      ⇅
                    </button>
                    <span>pair</span>
                  </div>
                  <div className="legend-item">
                    <button className="quick-move-button" disabled>
                      ⇄
                    </button>
                    <span>response</span>
                  </div>
                </div>
                <div className="legend-item">
                  <button className="stack-button" disabled>
                    <svg
                      viewBox="0 0 24 24"
                      width="16"
                      height="16"
                      fill="currentColor"
                    >
                      <path d="M4 6h16v2H4zm0 5h16v2H4zm0 5h16v2H4z" />
                    </svg>
                  </button>
                  <span>Stack responses (max 3)</span>
                </div>
              </>
            )}
          </div>
          <button
            onClick={() => setIsPairedMode(!isPairedMode)}
            className="mode-toggle"
          >
            {isPairedMode ? 'Switch to Matching Mode' : 'Switch to Paired Mode'}
          </button>
        </div>
      )}

      <style jsx>{`
        .answer-stack {
          position: relative;
        }

        .stack-indicator {
          position: absolute;
          top: -8px;
          right: -8px;
          background: #6366f1;
          color: white;
          border-radius: 9999px;
          padding: 2px 6px;
          font-size: 0.75rem;
          z-index: 10;
        }

        .stack-navigation {
          display: flex;
          justify-content: center;
          align-items: center;
          margin-top: 0.5rem;
          padding: 0 1rem;
        }

        .stack-pills {
          display: flex;
          gap: 0.25rem;
          justify-content: center;
        }

        .stack-pill {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: #cbd5e0;
          transition: all 0.2s;
          border: none;
          padding: 0;
          cursor: pointer;
        }

        .stack-pill.active {
          background: #6366f1;
          transform: scale(1.2);
        }

        .admin-controls {
          position: absolute;
          right: -2.5rem;
          top: 50%;
          transform: translateY(-50%);
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .quick-move-button {
          background: white;
          border: 1px solid #6366f1;
          color: #6366f1;
          width: 1.5rem;
          height: 1.5rem;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.2s;
          font-size: 0.875rem;
        }

        .quick-move-button:hover {
          background: #6366f1;
          color: white;
        }

        .quick-move-button-left {
          right: -2.5rem;
        }

        .quick-move-button-right {
          left: -2.5rem;
        }

        .unstack-button {
          background: white;
          border: 1px solid #6366f1;
          color: #6366f1;
          width: 1.5rem;
          height: 1.5rem;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.2s;
          font-size: 0.875rem;
        }

        .unstack-button:hover {
          background: #6366f1;
          color: white;
        }

        @media (max-width: 768px) {
          .stack-navigation {
            padding: 0 0.5rem;
          }

          .stack-pill {
            width: 6px;
            height: 6px;
          }

          .admin-controls {
            right: -2rem;
          }

          .quick-move-button,
          .unstack-button {
            width: 1.25rem;
            height: 1.25rem;
            font-size: 0.75rem;
          }

          .quick-move-button-left {
            right: -2rem;
          }

          .quick-move-button-right {
            left: -2rem;
          }
        }

        .message-bubble {
          min-height: 120px;
          padding: 1rem;
          position: relative;
        }

        .message-bubble-left {
          border-radius: 1rem;
          background-color: #f3f4f6;
          margin-right: 2rem;
        }

        .message-bubble-right {
          border-radius: 1rem;
          background-color: #e0e7ff;
          margin-left: 2rem;
        }

        .stack-button {
          background: white;
          border: 1px solid #6366f1;
          color: #6366f1;
          width: 1.5rem;
          height: 1.5rem;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.2s;
          margin-top: 0.5rem;
        }

        .stack-button:hover {
          background: #6366f1;
          color: white;
        }

        @media (max-width: 768px) {
          .stack-button {
            width: 1.25rem;
            height: 1.25rem;
            font-size: 0.75rem;
          }
        }

        .answer-container {
          position: relative;
          display: flex;
          align-items: stretch;
          overflow: hidden;
        }

        .next-answer-peek {
          position: absolute;
          right: 0;
          top: 0;
          bottom: 0;
          width: 80px;
          background: linear-gradient(to right, transparent, #e0e7ff);
          display: flex;
          align-items: center;
          cursor: pointer;
          opacity: 0.7;
          transition: opacity 0.2s;
        }

        .next-answer-peek:hover {
          opacity: 1;
        }

        .peek-content {
          padding: 0.5rem;
          font-size: 0.75rem;
          color: #4f46e5;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .peek-author {
          font-weight: 600;
          margin-bottom: 0.25rem;
        }

        .peek-text {
          opacity: 0.8;
        }

        .combine-button {
          background: white;
          border: 1px solid #6366f1;
          color: #6366f1;
          width: 1.5rem;
          height: 1.5rem;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.2s;
          font-size: 1rem;
        }

        .combine-button:hover {
          background: #6366f1;
          color: white;
        }

        .combine-icon {
          line-height: 1;
        }

        .stack-indicator {
          position: absolute;
          top: -8px;
          right: -8px;
          background: #6366f1;
          color: white;
          border-radius: 9999px;
          padding: 2px 6px;
          font-size: 0.75rem;
          z-index: 10;
        }

        @media (max-width: 768px) {
          .next-answer-peek {
            width: 60px;
          }

          .combine-button {
            width: 1.25rem;
            height: 1.25rem;
            font-size: 0.875rem;
          }
        }

        .combine-control {
          position: absolute;
          right: -2.5rem;
          bottom: -1.5rem;
          z-index: 20;
        }

        .carousel-container {
          position: relative;
          width: 100%;
          overflow: hidden;
        }

        .carousel-track {
          display: flex;
          transition: transform 0.3s ease;
          width: 100%;
        }

        .carousel-item {
          flex: 0 0 100%;
          width: 100%;
        }

        .carousel-controls {
          position: absolute;
          top: 50%;
          left: 0;
          right: 0;
          transform: translateY(-50%);
          display: flex;
          justify-content: space-between;
          pointer-events: none;
          padding: 0 1rem;
        }

        .carousel-control {
          background: rgba(99, 102, 241, 0.1);
          border: 1px solid #6366f1;
          color: #6366f1;
          width: 2rem;
          height: 2rem;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.2s;
          pointer-events: auto;
          font-size: 1.5rem;
          line-height: 1;
        }

        .carousel-control:hover {
          background: rgba(99, 102, 241, 0.2);
        }

        .carousel-control.prev {
          margin-right: auto;
        }

        .carousel-control.next {
          margin-left: auto;
        }

        @media (max-width: 768px) {
          .combine-control {
            right: -2rem;
            bottom: -1.25rem;
          }

          .carousel-control {
            width: 1.5rem;
            height: 1.5rem;
            font-size: 1.25rem;
          }
        }

        .stack-button {
          background: white;
          border: 1px solid #6366f1;
          color: #6366f1;
          width: 1.5rem;
          height: 1.5rem;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.2s;
          margin-top: 0.5rem;
        }

        .stack-button:hover {
          background: #6366f1;
          color: white;
        }

        .stack-icon {
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .stack-indicator {
          position: absolute;
          top: -8px;
          right: -8px;
          background: #6366f1;
          color: white;
          border-radius: 9999px;
          padding: 2px 6px;
          font-size: 0.75rem;
          z-index: 10;
        }

        :global(.slick-prev),
        :global(.slick-next) {
          z-index: 10;
        }

        :global(.slick-prev) {
          left: -25px;
        }

        :global(.slick-next) {
          right: -25px;
        }

        :global(.slick-dots) {
          bottom: -25px;
        }

        .stack-slide {
          outline: none;
        }

        @media (max-width: 768px) {
          :global(.slick-prev) {
            left: -15px;
          }

          :global(.slick-next) {
            right: -15px;
          }
        }

        .slider-wrapper {
          position: relative;
          margin: 0 25px;
        }

        .slider-wrapper :global(.slick-prev),
        .slider-wrapper :global(.slick-next) {
          z-index: 10;
        }

        .slider-wrapper :global(.slick-prev) {
          left: -25px;
        }

        .slider-wrapper :global(.slick-next) {
          right: -25px;
        }

        .slider-wrapper :global(.slick-dots) {
          bottom: -25px;
        }

        .slider-wrapper :global(.slick-slide) {
          padding: 0 5px;
        }

        .stack-slide {
          outline: none;
        }

        @media (max-width: 768px) {
          .slider-wrapper {
            margin: 0 15px;
          }

          .slider-wrapper :global(.slick-prev) {
            left: -15px;
          }

          .slider-wrapper :global(.slick-next) {
            right: -15px;
          }
        }

        .slider-loading {
          min-height: 120px;
          position: relative;
        }

        .stack-container {
          position: relative;
          width: 100%;
        }

        .stack-carousel {
          position: relative;
          overflow: hidden;
          width: 100%;
        }

        .stack-track {
          display: flex;
          transition: transform 0.3s ease;
          width: 100%;
        }

        .stack-slide {
          flex: 0 0 100%;
          width: 100%;
          padding: 1rem;
        }

        .stack-controls {
          position: absolute;
          top: 50%;
          left: 0;
          right: 0;
          transform: translateY(-50%);
          display: flex;
          justify-content: space-between;
          padding: 0 0.5rem;
          pointer-events: none;
        }

        .stack-nav {
          background: rgba(99, 102, 241, 0.1);
          border: 1px solid #6366f1;
          color: #6366f1;
          width: 2rem;
          height: 2rem;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.2s;
          pointer-events: auto;
          font-size: 1.5rem;
          line-height: 1;
        }

        .stack-nav:hover {
          background: rgba(99, 102, 241, 0.2);
        }

        .stack-navigation {
          position: absolute;
          bottom: -1.5rem;
          left: 0;
          right: 0;
          display: flex;
          justify-content: center;
          padding: 0.5rem 0;
        }

        .stack-pills {
          display: flex;
          gap: 0.25rem;
        }

        .stack-pill {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: #cbd5e0;
          transition: all 0.2s;
          border: none;
          padding: 0;
          cursor: pointer;
        }

        .stack-pill.active {
          background: #6366f1;
          transform: scale(1.2);
        }

        .stack-indicator {
          position: absolute;
          top: -0.5rem;
          right: -0.5rem;
          background: #6366f1;
          color: white;
          border-radius: 9999px;
          padding: 0.125rem 0.375rem;
          font-size: 0.75rem;
          z-index: 10;
        }

        @media (max-width: 768px) {
          .stack-nav {
            width: 1.5rem;
            height: 1.5rem;
            font-size: 1.25rem;
          }

          .stack-pill {
            width: 4px;
            height: 4px;
          }
        }

        .controls-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1.5rem;
          padding: 0.5rem;
          background: #f9fafb;
          border-radius: 0.5rem;
        }

        .controls-legend {
          display: flex;
          gap: 1.5rem;
          align-items: center;
        }

        .legend-item {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.875rem;
          color: #4b5563;
        }

        .legend-item button {
          opacity: 0.7;
          cursor: default;
        }

        .legend-item button:hover {
          background: white;
          color: #6366f1;
        }

        .stack-indicator {
          position: absolute;
          top: -0.5rem;
          right: -0.5rem;
          background: #6366f1;
          color: white;
          border-radius: 9999px;
          padding: 0.25rem 0.375rem;
          font-size: 0.75rem;
          z-index: 10;
          display: flex;
          align-items: center;
          gap: 0.25rem;
        }

        .stack-icon {
          opacity: 0.9;
        }

        .stack-carousel {
          position: relative;
          overflow: hidden;
          width: 100%;
          min-height: 120px;
        }

        .stack-track {
          display: flex;
          transition: transform 0.3s ease;
          width: 100%;
          height: 100%;
        }

        .stack-slide {
          flex: 0 0 100%;
          width: 100%;
          opacity: 0;
          transition: opacity 0.3s ease;
          position: absolute;
          top: 0;
          left: 0;
          padding: 1rem;
        }

        .stack-slide.active {
          opacity: 1;
          position: relative;
        }

        .legend-section {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .legend-title {
          color: #6b7280;
          font-size: 0.875rem;
        }

        .controls-legend {
          display: flex;
          gap: 2rem;
          align-items: center;
        }

        .legend-item {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.875rem;
          color: #4b5563;
        }

        .legend-item button {
          opacity: 0.7;
          cursor: default;
        }

        .stack-more-button {
          position: absolute;
          right: -2.5rem;
          top: 50%;
          transform: translateY(-50%);
          background: white;
          border: 1px solid #6366f1;
          color: #6366f1;
          width: 1.5rem;
          height: 1.5rem;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.2s;
        }

        .stack-more-button:hover {
          background: #6366f1;
          color: white;
        }

        @media (max-width: 768px) {
          .stack-more-button {
            right: -2rem;
            width: 1.25rem;
            height: 1.25rem;
          }
        }

        .stack-navigation {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 0.5rem 1rem;
          border-top: 1px solid rgba(99, 102, 241, 0.1);
          margin-top: 0.5rem;
        }

        .stack-info {
          font-size: 0.875rem;
          color: #6366f1;
        }

        .stack-controls {
          display: flex;
          gap: 0.5rem;
        }

        .stack-nav {
          background: transparent;
          border: none;
          color: #6366f1;
          font-size: 1.25rem;
          padding: 0.25rem;
          cursor: pointer;
          transition: all 0.2s;
          display: flex;
          align-items: center;
          justify-content: center;
          width: 2rem;
          height: 2rem;
          border-radius: 9999px;
        }

        .stack-nav:hover {
          background: rgba(99, 102, 241, 0.1);
        }

        .admin-controls {
          position: absolute;
          right: -2.5rem;
          top: 50%;
          transform: translateY(-50%);
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .stack-button,
        .unstack-button,
        .quick-move-button {
          background: white;
          border: 1px solid #6366f1;
          color: #6366f1;
          width: 1.5rem;
          height: 1.5rem;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.2s;
        }

        .stack-button:hover,
        .unstack-button:hover,
        .quick-move-button:hover {
          background: #6366f1;
          color: white;
        }

        @media (max-width: 768px) {
          .admin-controls {
            right: -2rem;
          }

          .stack-button,
          .unstack-button,
          .quick-move-button {
            width: 1.25rem;
            height: 1.25rem;
          }

          .stack-nav {
            font-size: 1rem;
            width: 1.5rem;
            height: 1.5rem;
          }
        }

        .message-bubble {
          min-height: 120px;
          padding: 1.75rem;
          position: relative;
          display: flex;
          flex-direction: column;
          gap: 1rem;
          margin: 0.75rem 0;
        }

        .message-content {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .stack-navigation {
          display: flex;
          justify-content: center;
          padding: 0.5rem 0;
        }

        .navigation-controls {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          background: rgba(99, 102, 241, 0.05);
          padding: 0.375rem 0.75rem;
          border-radius: 9999px;
        }

        .stack-info {
          font-size: 0.875rem;
          color: #6366f1;
          min-width: 3.5rem;
          text-align: center;
        }

        .admin-controls {
          display: flex;
          justify-content: center;
          padding: 0.5rem 0;
          border-top: 1px solid rgba(99, 102, 241, 0.1);
        }

        .control-buttons {
          display: flex;
          gap: 1rem;
          align-items: center;
        }

        .control-button {
          background: transparent;
          border: 1px solid #6366f1;
          color: #6366f1;
          width: 1.75rem;
          height: 1.75rem;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.2s;
          padding: 0;
        }

        .control-button:hover {
          background: #6366f1;
          color: white;
        }

        .stack-nav {
          background: transparent;
          border: none;
          color: #6366f1;
          font-size: 1.25rem;
          padding: 0;
          cursor: pointer;
          transition: all 0.2s;
          display: flex;
          align-items: center;
          justify-content: center;
          width: 1.5rem;
          height: 1.5rem;
          opacity: 0.7;
        }

        .stack-nav:hover:not(:disabled) {
          opacity: 1;
        }

        .stack-nav:disabled {
          opacity: 0.3;
          cursor: default;
        }

        @media (max-width: 768px) {
          .message-bubble {
            padding: 1.5rem;
          }

          .control-button {
            width: 1.5rem;
            height: 1.5rem;
          }

          .stack-nav {
            font-size: 1rem;
            width: 1.25rem;
            height: 1.25rem;
          }

          .navigation-controls {
            padding: 0.25rem 0.5rem;
          }
        }
      `}</style>

      {isPairedMode ? renderPairedMode() : renderMatchingMode()}
    </div>
  )
}
