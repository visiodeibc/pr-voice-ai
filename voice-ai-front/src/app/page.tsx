'use client'
import * as React from 'react'
import { useEffect, useRef, useState } from 'react'
import Box from '@mui/material/Box'
import { Button, TextField } from '@mui/material'
import PlayArrowIcon from '@mui/icons-material/PlayArrow'

import WaveSurfer from 'wavesurfer.js'
import toWav from 'audiobuffer-to-wav'
import * as sdk from 'microsoft-cognitiveservices-speech-sdk'

export default function HomePage() {
    const waveformRef = useRef(null)
    const [waveSurfer, setWaveSurfer] = useState<WaveSurfer | null>(null)
    const [audioFile, setAudioFile] = useState<Blob | null>(null)

    const [recording, setRecording] = useState<boolean>(false)
    const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(
        null
    )

    const [test, setTest] = useState<File | null>(null)

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0]
        if (!file) {
            return
        }
        setTest(file)
    }

    const readFileAsArrayBuffer = (file: Blob): Promise<ArrayBuffer> => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader()
            reader.onload = () => {
                if (reader.result instanceof ArrayBuffer) {
                    resolve(reader.result)
                } else {
                    reject(new Error('Failed to read file as ArrayBuffer.'))
                }
            }
            reader.onerror = () => {
                reject(new Error('Error reading file as ArrayBuffer.'))
            }
            reader.readAsArrayBuffer(file)
        })
    }

    const transcribe = async () => {
        if (audioFile) {
            const arrayBuffer = await readFileAsArrayBuffer(audioFile) //reader.result as ArrayBuffer
            const audioContext = new AudioContext()

            const audioBuffer = await audioContext.decodeAudioData(arrayBuffer)
            const speechConfig = sdk.SpeechConfig.fromSubscription(
                '0b5365b325b04b50949a4f7d0ddfb846',
                'southeastasia'
            )
            speechConfig.speechRecognitionLanguage = 'en-US'
            const wav = toWav(audioBuffer)
            const audioConfig = sdk.AudioConfig.fromWavFileInput(
                Buffer.from(wav)
            )
            const speechRecognizer = new sdk.SpeechRecognizer(
                speechConfig,
                audioConfig
            )
            await speechRecognizer.recognizeOnceAsync((result) => {
                switch (result.reason) {
                    case sdk.ResultReason.RecognizedSpeech:
                        console.log(`RECOGNIZED: Text=${result.text}`)
                        break
                    case sdk.ResultReason.NoMatch:
                        console.log('NOMATCH: Speech could not be recognized.')
                        break
                    case sdk.ResultReason.Canceled:
                        const cancellation =
                            sdk.CancellationDetails.fromResult(result)
                        console.log(`CANCELED: Reason=${cancellation.reason}`)

                        if (
                            cancellation.reason == sdk.CancellationReason.Error
                        ) {
                            console.log(
                                `CANCELED: ErrorCode=${cancellation.ErrorCode}`
                            )
                            console.log(
                                `CANCELED: ErrorDetails=${cancellation.errorDetails}`
                            )
                            console.log(
                                'CANCELED: Did you set the speech resource key and region values?'
                            )
                        }
                        break
                }
                speechRecognizer.close()
            })
        }
    }

    useEffect(() => {
        transcribe()
    }, [test])

    const play = () => {
        !!waveSurfer && waveSurfer.play()
    }

    const handl = async () => {
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

            newMediaRecorder.ondataavailable = function (e: BlobEvent) {
                chunks.push(e.data)
            }

            newMediaRecorder.onstop = function () {
                const blob = new Blob(chunks, {
                    type: 'audio/ogg; codecs=opus',
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
            <input type="file" onChange={handleFileChange} />
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
                                <Button
                                    variant="contained"
                                    sx={{
                                        borderRadius: '14px',
                                        height: '40px',
                                        marginLeft: '10px',
                                    }}
                                    color={'primary'}
                                    onClick={transcribe}
                                >
                                    {'Transcribe'}
                                </Button>
                            </Box>
                        )}
                        <Button
                            variant="contained"
                            sx={{ borderRadius: '14px', height: '40px' }}
                            color={recording ? 'error' : 'primary'}
                            onClick={handl}
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
