'use client'

import { memo } from 'react'
import Image from 'next/image'
import { formatDate } from '../utils/formatDate'
import type { QAItemProps } from '../types'

const QAItem = memo(
  ({ question, answer, amaUser, userAvatar }: QAItemProps) => {
    return (
      <div className="space-y-6 w-full">
        {/* Question - Left side */}
        <div className="flex items-start gap-3 max-w-[80%]">
          <Image
            src={question.author.avatar_url || '/default-avatar.png'}
            alt={question.author.display_name}
            width={40}
            height={40}
            className="rounded-full flex-shrink-0"
            onError={(e) => {
              const target = e.target as HTMLImageElement
              target.src = '/default-avatar.png'
            }}
          />
          <div className="flex-1">
            <div className="message-bubble message-bubble-left">
              <div className="message-metadata mb-2">
                <span className="font-medium">
                  {question.author.display_name}
                </span>
                <span className="text-gray-500">@{question.author.fname}</span>
                <span className="text-gray-400">•</span>
                <span className="text-gray-500 text-sm">
                  {formatDate(question.timestamp)}
                </span>
              </div>
              <p className="question-text">{question.text}</p>
              <div className="flex items-center gap-4 text-sm text-gray-500 mt-2">
                <span>{question.reactions.recasts_count} recasts</span>
                <span>•</span>
                <span>{question.reactions.likes_count} likes</span>
              </div>
            </div>
          </div>
        </div>

        {/* Answer - Right side */}
        {answer && (
          <div className="flex items-start gap-3 max-w-[80%] ml-auto">
            <div className="flex-1">
              <div className="message-bubble message-bubble-right">
                <div className="message-metadata mb-2 justify-end">
                  <span className="font-medium text-purple-900">
                    {amaUser.display_name}
                  </span>
                  <span className="text-purple-700">@{amaUser.fname}</span>
                  <span className="text-purple-400">•</span>
                  <span className="text-purple-700 text-sm">
                    {formatDate(answer.timestamp)}
                  </span>
                </div>
                <p className="answer-text text-purple-900">{answer.text}</p>
                <div className="flex items-center gap-4 text-sm text-purple-700 mt-2 justify-end">
                  <span>{answer.reactions.recasts_count} recasts</span>
                  <span>•</span>
                  <span>{answer.reactions.likes_count} likes</span>
                </div>
              </div>
            </div>
            <Image
              src={userAvatar || '/default-avatar.png'}
              alt={amaUser.display_name}
              width={40}
              height={40}
              className="rounded-full flex-shrink-0"
              onError={(e) => {
                const target = e.target as HTMLImageElement
                target.src = '/default-avatar.png'
              }}
            />
          </div>
        )}
      </div>
    )
  },
)

QAItem.displayName = 'QAItem'

export default QAItem
