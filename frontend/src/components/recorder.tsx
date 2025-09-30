import { useAudioRecorder } from "@/hooks/useAudioRecorder";
import { useEffect, useState } from "react";
import { FaCircleStop, FaMicrophone } from 'react-icons/fa6'
import { Mic } from "lucide-react"
import { Button } from "@/components/ui/button"


export const Recorder = ({ onSubmit }: { onSubmit: (audioBlob: Blob) => void }) => {
    const { isRecording, audioBlob, audioUrl, seconds, toggleRecording, clearAudio, formatTime } = useAudioRecorder();
    //const [recordingTime, setRecordingTime] = useState(0);

    const handleSendAudio = (blob = null) => {
        if (audioBlob) {
            onSubmit(audioBlob);
            // clearAudio();
        }
        if(blob){
            console.log("Sending blob from param");
            onSubmit(blob);
            // clearAudio();
        }
    };

    const handleRecord = async (e: React.MouseEvent) => {
        e.stopPropagation();
        clearAudio();
        toggleRecording().then((blob) => {
            if(blob){
                handleSendAudio(blob);
            }
        });
    };

    return (
        // <>
        //     {/* <h2 className='text-[100px] text-white bg-black p-4 rounded-lg mx-4'>
        //         {formatTime(seconds)}
        //     </h2> */}
        //     <h2>
        //         {formatTime(seconds)}
        //     </h2>
        //     <button onClick={handleRecord}>
        //         {isRecording ? "Detener" : "Grabar"}
        //     </button>
        //     {audioUrl && <audio controls src={audioUrl} />}
        //     {audioUrl && <button onClick={handleSendAudio}>Enviar</button>}
        // </>
        <>
            <Button
                size="lg"
                className="w-16 h-16 rounded-full bg-accent hover:bg-accent/90 text-accent-foreground shadow-lg"
                onClick={handleRecord}
            >
                {isRecording ? <FaCircleStop className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
            </Button>
            {audioUrl && <button onClick={handleSendAudio}>Enviar</button>}
        </>
    )
}