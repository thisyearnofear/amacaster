'use client'

import { useState, useEffect, useCallback } from 'react'
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd'
import type { Cast, NeynarUser } from '../types'
import SafeImage from './SafeImage'
import { useMatchSubmission } from '../hooks/useMatchSubmission'
import { useAccount } from 'wagmi'
import Image from 'next/image'

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

// Add export to the interface and type definitions
export interface AnswerStack {
  id: string
  answers: Cast[]
}

export type AnswerEntry = Cast | AnswerStack

// Add export to the helper function
export const isAnswerStack = (
  entry: AnswerEntry | undefined,
): entry is AnswerStack => {
  return entry !== undefined && 'answers' in entry
}

interface CustomCSSProperties extends React.CSSProperties {
  '--pair-height'?: string
}

interface DraggableQASectionProps {
  secondTier: Cast[]
  thirdTier: AnswerEntry[]
  isAdmin: boolean
  onOrderChange: (newSecondTier: Cast[], newThirdTier: AnswerEntry[]) => void
  neynarUser?: NeynarUser | null
}

export default function DraggableQASection({
  secondTier,
  thirdTier,
  isAdmin,
  onOrderChange,
  neynarUser,
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

  const {
    submitMatches,
    isLoading: isSubmitting,
    isSuccess: isSubmitted,
    error: submitError,
    isCorrectNetwork,
  } = useMatchSubmission()

  const { isConnected } = useAccount()

  // Define authentication states
  const isLoggedIn = isConnected || !!neynarUser
  const canSubmit = isLoggedIn // During testing phase, any logged-in user can submit
  const canDragAndDrop = isLoggedIn

  // Add connection check to submit handler
  const handleSubmit = useCallback(async () => {
    console.log('Submit button clicked')
    console.log('Connection status:', isConnected)
    console.log('Network status:', isCorrectNetwork)
    console.log('Can submit:', canSubmit)

    if (!isConnected) {
      console.log('Not connected')
      return
    }

    if (!isCorrectNetwork) {
      console.log('Wrong network')
      return
    }

    if (!canSubmit) {
      console.log('Cannot submit - not authorized')
      return
    }

    try {
      console.log('Preparing submission data...')
      // Validate that we have matching pairs
      if (localSecondTier.length === 0 || localThirdTier.length === 0) {
        throw new Error('No matches to submit')
      }

      // Filter out unmatched questions and answers
      const matches = localSecondTier
        .map((question, index) => {
          const answer = localThirdTier[index]
          if (!answer) {
            return []
          }

          if (isAnswerStack(answer)) {
            // For stacked answers, create a match for each answer in the stack
            return answer.answers.map((stackedAnswer) => ({
              questionHash: question.hash,
              answerHash: stackedAnswer.hash,
            }))
          } else {
            // For single answers, create one match
            return [
              {
                questionHash: question.hash,
                answerHash: answer.hash,
              },
            ]
          }
        })
        .flat()
        .filter((match) => match.questionHash && match.answerHash) // Ensure only valid matches are included

      if (matches.length === 0) {
        throw new Error('No valid matches to submit')
      }

      console.log('Final matches array:', matches)

      // Create rankings array (currently just using the order as ranking)
      const rankings = localSecondTier.map((_, index) => index)
      console.log('Rankings array:', rankings)

      // Submit to blockchain
      console.log('Submitting to blockchain...')
      const hash = await submitMatches(
        localSecondTier[0].parent_hash || localSecondTier[0].hash,
        matches,
        rankings,
      )

      console.log('Transaction hash:', hash)
    } catch (error) {
      console.error('Error in handleSubmit:', error)
    }
  }, [
    localSecondTier,
    localThirdTier,
    submitMatches,
    isConnected,
    isCorrectNetwork,
    canSubmit,
  ])

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
    if (!result.destination || !canDragAndDrop) return

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
    if (!canDragAndDrop) return

    // Create copies of the arrays to modify
    const newSecondTier = [...localSecondTier]
    const newThirdTier = [...localThirdTier]

    if (type === 'pair') {
      // Move both question and answer together
      const [removedQuestion] = newSecondTier.splice(fromIndex, 1)
      const [removedAnswer] = newThirdTier.splice(fromIndex, 1)

      newSecondTier.splice(toIndex, 0, removedQuestion)
      newThirdTier.splice(toIndex, 0, removedAnswer)

      setLocalSecondTier(newSecondTier)
      setLocalThirdTier(newThirdTier)
    } else if (type === 'question') {
      // Move just the question
      const [removed] = newSecondTier.splice(fromIndex, 1)
      newSecondTier.splice(toIndex, 0, removed)
      setLocalSecondTier(newSecondTier)
    } else {
      // Move just the answer
      const [removed] = newThirdTier.splice(fromIndex, 1)
      newThirdTier.splice(toIndex, 0, removed)
      setLocalThirdTier(newThirdTier)
    }

    // Update parent component
    onOrderChange(newSecondTier, newThirdTier)
    setQuickMoveTarget(null)
  }

  // Function to render quick move overlay
  const renderQuickMoveOverlay = () => {
    if (!quickMoveTarget) return null

    const maxPosition =
      quickMoveTarget.type === 'pair'
        ? localSecondTier.length
        : quickMoveTarget.type === 'question'
        ? localSecondTier.length
        : localThirdTier.length

    return (
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
                : quickMoveTarget.type === 'question'
                ? 'Question'
                : 'Answer'}{' '}
              to position
            </h3>
            <button
              onClick={() => setQuickMoveTarget(null)}
              className="close-button"
            >
              ✕
            </button>
          </div>
          <div className="quick-actions-grid">
            {Array.from({ length: maxPosition }, (_, i) => (
              <button
                key={i}
                className={`quick-action-button ${
                  i === quickMoveTarget.index ? 'current' : ''
                }`}
                onClick={() =>
                  handleQuickMove(
                    quickMoveTarget.type!,
                    quickMoveTarget.index,
                    i,
                  )
                }
                disabled={i === quickMoveTarget.index}
              >
                {i + 1}
              </button>
            ))}
          </div>
        </div>
      </div>
    )
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
          {canDragAndDrop && (
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
          <div className="message-bubble message-bubble-right stacked w-full mt-4">
            <div className="message-content stacked">
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
              <div className="answer-text stacked text-center">
                {currentAnswer.text}
              </div>

              {/* Admin Controls at Bottom - Now Centered */}
              {canDragAndDrop && (
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
              <div
                className={`numbered-band-text flex items-center justify-center w-8 h-8 rounded-full font-medium ${
                  index < 20
                    ? 'bg-green-100 text-green-700'
                    : 'bg-gray-100 text-gray-700'
                }`}
              >
                {index + 1}
              </div>
              {canDragAndDrop && (
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
                {canDragAndDrop && (
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
                    isDragDisabled={!canDragAndDrop}
                  >
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                        className={`matching-item-container ${
                          snapshot.isDragging ? 'dragging' : ''
                        }`}
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
                          {canDragAndDrop && (
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
                <div className="central-number-content flex flex-col items-center gap-2">
                  <div
                    className={`flex items-center justify-center w-8 h-8 rounded-full font-medium ${
                      i < 20
                        ? 'bg-green-100 text-green-700'
                        : 'bg-gray-100 text-gray-700'
                    }`}
                  >
                    {i + 1}
                  </div>
                  {canDragAndDrop && (
                    <button
                      onClick={() =>
                        setQuickMoveTarget({
                          type: 'pair',
                          index: i,
                        })
                      }
                      className="quick-move-pair-button text-gray-500 hover:text-gray-700 transition-colors"
                      title="Move this pair"
                    >
                      ⇅
                    </button>
                  )}
                </div>
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
                    isDragDisabled={!canDragAndDrop}
                  >
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                        className={`matching-item-container ${
                          snapshot.isDragging ? 'dragging' : ''
                        }`}
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
  const getTextHeight = (
    text: string | undefined,
    isStacked: boolean = false,
  ): number => {
    if (!text) return isStacked ? 200 : 160 // Higher base height for stacked answers

    const baseHeight = isStacked ? 200 : 160 // Higher base for stacked answers
    const charsPerLine = isStacked ? 30 : 35 // More conservative wrapping for stacks
    const lineHeight = isStacked ? 36 : 32 // Increased line height for stacks
    const padding = isStacked ? 180 : 140 // More padding for navigation controls and stack UI
    const lines = Math.ceil(text.length / charsPerLine)
    const calculatedHeight = lines * lineHeight + padding

    // More generous padding for longer texts in stacks
    const extraPadding = isStacked
      ? text.length > 200
        ? 120
        : text.length > 100
        ? 60
        : 20
      : text.length > 200
      ? 80
      : text.length > 100
      ? 40
      : 0

    return Math.max(baseHeight, calculatedHeight + extraPadding)
  }

  // Enhanced submit section - remove duplicate and improve error handling
  const renderSubmitSection = () => {
    if (isAdmin && !isLoggedIn) return null

    // Add debug logs
    console.log('Submit button state:', {
      isLoggedIn,
      isConnected,
      isAdmin,
      canSubmit,
      isCorrectNetwork,
      isSubmitting,
      isSubmitted,
    })

    return (
      <div className="submit-section fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 shadow-lg z-50">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <div className="text-sm text-gray-600">
            {!isLoggedIn ? (
              <span className="text-amber-600">Mix, Match & Rank AMAs</span>
            ) : !isConnected ? (
              <span className="text-amber-600">
                Connect wallet to submit your matches
              </span>
            ) : !isCorrectNetwork ? (
              <span className="text-amber-600">
                Please switch to Optimism Sepolia network
              </span>
            ) : isSubmitting ? (
              <span className="text-indigo-600">Submitting to Optimism...</span>
            ) : isSubmitted ? (
              <span className="text-green-600">
                ✓ Matches submitted successfully
              </span>
            ) : submitError ? (
              <span className="text-red-600">Error: {submitError.message}</span>
            ) : (
              <span>Ready to submit your matches?</span>
            )}
          </div>

          <button
            onClick={() => {
              console.log('Submit button clicked')
              handleSubmit()
            }}
            disabled={
              !canSubmit || !isCorrectNetwork || isSubmitting || isSubmitted
            }
            className={`px-6 py-2 rounded-lg font-medium transition-all ${
              !isLoggedIn
                ? 'bg-gray-100 text-gray-400'
                : !isConnected
                ? 'bg-gray-100 text-gray-400'
                : !isCorrectNetwork
                ? 'bg-amber-100 text-amber-600'
                : isSubmitting
                ? 'bg-indigo-100 text-indigo-400'
                : isSubmitted
                ? 'bg-green-100 text-green-600'
                : submitError
                ? 'bg-red-100 text-red-600'
                : 'bg-indigo-600 text-white hover:bg-indigo-700'
            }`}
          >
            {!isLoggedIn
              ? 'Login to Play'
              : !isConnected
              ? 'Connect Wallet'
              : !isCorrectNetwork
              ? 'Switch Network'
              : isSubmitting
              ? 'Submitting...'
              : isSubmitted
              ? 'Submitted!'
              : submitError
              ? 'Try Again'
              : 'Submit Matches'}
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="pb-20">
      {!isMobile && (
        <div className="controls-header flex justify-center items-center gap-8 mb-6 p-4 bg-gradient-to-r from-purple-50 to-indigo-50 rounded-lg">
          {/* Controls Container */}
          <div className="flex items-center gap-8">
            {/* Move Controls */}
            {isLoggedIn && (
              <div className="flex items-center gap-4">
                <div className="legend-item flex items-center gap-2">
                  <button className="quick-move-pair-button" disabled>
                    ⇅
                  </button>
                  <span>pair</span>
                </div>
                <div className="legend-item flex items-center gap-2">
                  <button className="quick-move-button" disabled>
                    ⇄
                  </button>
                  <span>response</span>
                </div>
              </div>
            )}

            {/* View and Mode Controls */}
            <div className="flex items-center gap-4">
              <a
                href={window.location.href.split('?url=')[1]}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 text-sm bg-white border border-gray-200 rounded-full hover:bg-gray-50 transition-colors flex items-center gap-2"
              >
                <Image
                  src="https://res.cloudinary.com/dsneebaw0/image/upload/v1708031540/farcaster.svg"
                  alt="Farcaster"
                  width={16}
                  height={16}
                  className="w-4 h-4"
                  unoptimized
                />
                View AMA
              </a>

              <button
                onClick={() => setIsPairedMode(!isPairedMode)}
                className="px-4 py-2 text-sm bg-white border border-gray-200 rounded-full hover:bg-gray-50 transition-colors"
              >
                {isPairedMode ? 'Switch to Matching' : 'Switch to Paired'}
              </button>
            </div>

            {/* Stack Controls */}
            {isLoggedIn && (
              <div className="legend-item flex items-center gap-2">
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
            )}
          </div>
        </div>
      )}
      {renderSubmitSection()}
      {renderQuickMoveOverlay()}
      {isPairedMode ? renderPairedMode() : renderMatchingMode()}
    </div>
  )
}
