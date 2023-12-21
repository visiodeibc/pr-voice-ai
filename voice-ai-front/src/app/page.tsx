'use client'
import * as React from 'react'
import Box from '@mui/material/Box'
import { Button } from '@mui/material'
import { useState } from 'react'

export default function HomePage() {
    const [audioFile, setAudioFile] = useState<Blob | null>(null)
    const [recording, setRecording] = useState<boolean>(false)
    const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(
        null
    )

    const play = () => {
        //TODO blob을 set하는게 아니라 url으로 프로세스 한거를 set하는 방향으로 수정?
        const audioURL = URL.createObjectURL(audioFile!)
        const audio = new Audio(audioURL)
        audio.play()
    }

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
                setAudioFile(blob)
                chunks = []
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
            <Box
                sx={{
                    display: 'grid',
                    gap: 3,
                    gridTemplateRows: 'repeat(3, 1fr)',
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
                <Button
                    variant="contained"
                    sx={{ borderRadius: '14px', height: '40px' }}
                    color={'secondary'}
                    onClick={play}
                >
                    Play
                </Button>
            </Box>
        </Box>
    )
}
