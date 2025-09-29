import { useState, useRef } from "react";

export const useAudioRecorder = () => {
    const [isRecording, setIsRecording] = useState(false)
    const [audioBlob, setAudioBlob] = useState<Blob | null>(null)
    const [audioUrl, setAudioUrl] = useState<string>('')
    const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null)
    const [audioChunks, setAudioChunks] = useState<Blob[]>([])
    const [seconds, setSeconds] = useState(0)

    const startRecording = async () => {
        try {
            setSeconds(0);
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const recorder = new MediaRecorder(stream);
            setMediaRecorder(recorder);

            const audioChunks: BlobPart[] = [];
            recorder.ondataavailable = (event) => {
                if (event.data.size > 0){
                    audioChunks.push(event.data)
                }
            };

            const timer = setInterval(() => {
                setSeconds(prev => prev + 1)
            }, 1000)

            recorder.onstop = () => {
                const blob = new Blob(audioChunks, { type: "audio/mp3" });
                setAudioBlob(blob);
                const url = URL.createObjectURL(blob)
                setAudioUrl(url)
                stream.getTracks().forEach((track) => track.stop());
                setAudioChunks([]);
                clearTimeout(timer)
            };

            recorder.start();
            setIsRecording(true);
        } catch (error) {
            console.error("Error al acceder al micrófono:", error);
        }
    };

    const stopRecording = () => {
        if (mediaRecorder && isRecording) {
            mediaRecorder.stop();
            setIsRecording(false);
            setMediaRecorder(null);
        }
    };

    const formatTime = (totalSeconds: number) => {
        const hours = Math.floor(totalSeconds / 3600)
        const minutes = Math.floor((totalSeconds % 3600)/60)
        const secs = totalSeconds % 60

        return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2,"0")}:${String(secs).padStart(2,"0")}`
    }

    const toggleRecording = async () => {
        if (isRecording) {
            stopRecording();
        } else {
            await startRecording();
        }
    };

    const clearAudio = () => setAudioBlob(null);

    return {
        isRecording,
        audioBlob,
        seconds,
        audioUrl,
        startRecording,
        stopRecording,
        toggleRecording,
        clearAudio,
        formatTime
    };
}