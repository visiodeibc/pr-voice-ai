'use client'
import * as React from 'react'
import { useEffect, useRef, useState } from 'react'
import Box from '@mui/material/Box'
import { Button } from '@mui/material'
import WaveSurfer from 'wavesurfer.js'
import PlayArrowIcon from '@mui/icons-material/PlayArrow'

export default function HomePage() {
    const waveformRef = useRef(null)
    const [waveSurfer, setWaveSurfer] = useState<WaveSurfer | null>(null)
    const [audioFile, setAudioFile] = useState<Blob | null>(null)
    const [recording, setRecording] = useState<boolean>(false)
    const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(
        null
    )

    const play = () => {
        !!waveSurfer && waveSurfer.play()
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

    useEffect(() => {
        if (waveSurfer) {
            waveSurfer.destroy()
        }
        if (audioFile) {
            const wave = WaveSurfer.create({
                container: waveformRef.current || '',
                waveColor: 'violet',
                progressColor: 'purple',
            })
            console.log(waveformRef.current)
            const audioUrl = URL.createObjectURL(audioFile)
            if (wave) {
                wave.load(audioUrl)
                wave.on('ready', function () {
                    URL.revokeObjectURL(audioUrl)
                })
            }
            setWaveSurfer(wave)
        }

        return () => {
            if (waveSurfer) {
                waveSurfer.destroy()
            }
        }
    }, [audioFile])

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
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 3,
                    justifyContent: 'space-between',
                }}
            >
                {audioFile && (
                    <Box
                        sx={{
                            display: 'flex',
                            flexDirection: 'row',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                        }}
                    >
                        <div
                            ref={waveformRef}
                            style={{ width: '200px', marginRight: '20px' }}
                        />
                        <Button
                            variant="contained"
                            sx={{
                                borderRadius: '14px',
                                height: '40px',
                            }}
                            color={'secondary'}
                            onClick={play}
                            disabled={!audioFile}
                        >
                            <PlayArrowIcon />
                        </Button>
                    </Box>
                )}
                <Button
                    variant="contained"
                    sx={{ borderRadius: '14px', height: '40px' }}
                    color={recording ? 'error' : 'primary'}
                    onClick={handleClick}
                >
                    {recording ? 'Stop' : 'Record'}
                </Button>
            </Box>
        </Box>
    )
}
