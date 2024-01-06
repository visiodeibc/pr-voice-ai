'use client'
import * as React from 'react'
import { useEffect, useRef, useState } from 'react'
import Box from '@mui/material/Box'
import { Button, TextField } from '@mui/material'
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
        <>
            <Box
                sx={{
                    padding: '20px',
                    bgcolor: 'background.paper',
                    borderRadius: '12px',
                    boxShadow: 2,
                }}
            >
                <Box
                    sx={{
                        display: 'flex',
                        flexDirection: 'column',
                    }}
                >
                    <Box sx={{ fontSize: 'h6.fontSize', fontWeight: 'bold' }}>
                        Recording
                    </Box>
                    <Box
                        sx={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            margin: '20px',
                        }}
                    >
                        {audioFile && (
                            <Box
                                sx={{
                                    display: 'flex',
                                    flexDirection: 'row',
                                    padding: '20px',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                }}
                            >
                                <Box
                                    ref={waveformRef}
                                    style={{
                                        width: '200px',
                                        marginRight: '20px',
                                    }}
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
            </Box>
            <Box
                sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    padding: '20px',
                    marginTop: '20px',
                    borderRadius: '12px',
                    bgcolor: 'background.paper',
                    boxShadow: 2,
                }}
            >
                <Box sx={{ fontSize: 'h6.fontSize', fontWeight: 'bold' }}>
                    Transcription
                </Box>
                <TextField
                    sx={{ marginTop: '20px' }}
                    id="outlined-multiline-static"
                    label="transcribed text"
                    multiline
                    rows={4}
                    value={'TODO'}
                    variant="filled"
                    aria-readonly
                />
            </Box>
        </>
    )
}
