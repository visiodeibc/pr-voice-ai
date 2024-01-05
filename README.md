# pr-voice-ai

voice app that uses ai to summarize, extract and search necessary information.

## Specs

- Hovering plus button to record
- Screens
  - Recording Screen
    - record start button
    - record representation / animation
    - after stop recording transcribe to text
    - after transcribing summarize the content
    - after summary extract useful tags
  - List of recordings containing screen
    - can be sorted
      - according to time of recording
    - list tile of recording
    - on the tile it shows [? need to think about it]
      - main tag [first]
    - Search Feature
- Features
  - Summary
    - buttet points
    - less than 10 sentences, each sentences less than 15 words
  - Tags
    - maximum 5 tags
    - sorted in accordance of importance and relevancy

## TODOs

1. Create Record Feature
   1. Create record button / record
      1. ~~While recording transcribe recording into text~~ -> after finishing it process
      2. ✅ create audio wave and play button
      3. ✅ create text field for transcrption
      4. When pressed save/send audio file to transcribe -> [using azure speech to text api](https://speech.microsoft.com/portal?tenantid=46e6417b-2f4f-4253-8c9b-490614c78bb9)
   2. When file is received run summary prompt
   3. Write summary propmt to the screen

## How / Execution
