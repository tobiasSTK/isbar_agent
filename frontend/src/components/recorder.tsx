import { useAudioRecorder } from "@/hooks/useAudioRecorder";
import { useEffect, useState } from "react";
import { FaCircleStop, FaMicrophone } from 'react-icons/fa6'


export const Recorder = ({ onSubmit }: { onSubmit: (audioBlob: Blob) => void }) => {
    const { isRecording, audioBlob, audioUrl, seconds, toggleRecording, clearAudio, formatTime } = useAudioRecorder();
    //const [recordingTime, setRecordingTime] = useState(0);

    const handleSendAudio = () => {
        if (audioBlob) {
            onSubmit(audioBlob);
            // clearAudio();
        }
    };

    const handleRecord = (e: React.MouseEvent) => {
        e.stopPropagation();
        clearAudio();
        toggleRecording();
    };

    return (
        <>
            {/* <h2 className='text-[100px] text-white bg-black p-4 rounded-lg mx-4'>
                {formatTime(seconds)}
            </h2> */}
            <h2>
                {formatTime(seconds)}
            </h2>
            <button onClick={handleRecord}>
                {isRecording ? "Detener" : "Grabar"}
            </button>
            {audioUrl && <audio controls src={audioUrl} />}
            {audioUrl && <button onClick={handleSendAudio}>Enviar</button>}
        </>
    )
}