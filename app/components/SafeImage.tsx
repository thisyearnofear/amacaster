'use client'

import Image from 'next/image'
import { useState } from 'react'

interface SafeImageProps {
  src: string
  alt: string
  width: number
  height: number
  className?: string
}

export default function SafeImage({
  src,
  alt,
  width,
  height,
  className,
}: SafeImageProps) {
  const [error, setError] = useState(false)

  if (error) {
    return (
      <Image
        src="/default-avatar.png"
        alt={alt}
        width={width}
        height={height}
        className={className}
      />
    )
  }

  return (
    <Image
      src={src}
      alt={alt}
      width={width}
      height={height}
      className={className}
      onError={() => setError(true)}
    />
  )
}
