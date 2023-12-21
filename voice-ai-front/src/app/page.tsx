'use client'
import * as React from 'react'
import Box from '@mui/material/Box'
import { Button } from '@mui/material'
import { useState } from 'react'

export default function HomePage() {
    const [recording, setRecording] = useState(false)
    const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(
        null
    )

    const handleClick = async () => {
        if (!recording) {
            if (
                !navigator.mediaDevices ||
                !navigator.mediaDevices.getUserMedia
            ) {
                console.log('getUserMedia not supported on your browser!')
                return
            }
            const stream = await navigator.mediaDevices.getUserMedia({
                audio: true,
            })
            const newMediaRecorder = new MediaRecorder(stream)
            let chunks: BlobPart[] = []

            newMediaRecorder.ondataavailable = function (e) {
                chunks.push(e.data)
            }

            newMediaRecorder.onstop = function () {
                const blob = new Blob(chunks, {
                    type: 'audio/ogg; codecs=opus',
                })
                console.log('Blob properties:', {
                    size: blob.size,
                    type: blob.type,
                })
                chunks = []
                const audioURL = URL.createObjectURL(blob)
                const audio = new Audio(audioURL)
                audio.play()
            }
            newMediaRecorder.start()
            setMediaRecorder(newMediaRecorder)
        } else {
            if (mediaRecorder) {
                mediaRecorder.stop()
            }
        }
        setRecording(!recording)
    }
    return (
        <Box
            sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                bgcolor: 'background.paper',
                borderRadius: '12px',
                boxShadow: 2,
                minHeight: '40vh',
            }}
        >
            <Button
                variant="contained"
                sx={{ borderRadius: '14px', height: '40px' }}
                color={recording ? 'error' : 'primary'}
                onClick={handleClick}
            >
                Record
            </Button>
        </Box>
    )
}
