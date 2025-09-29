import softtekLogo from "@/assets/softtek-logo.svg"
import useMessages from "@/hooks/useMessages"
import { Recorder } from "@/components/recorder";
import { convertAudioBlobToBase64 } from "@/lib/utils";

export default function HomePage() {

    const useMessagesHook = useMessages();

    const logMessages = () => {
        console.log("Current messages:", useMessagesHook.messages);
    }

    return (
        <div className="flex min-h-screen w-screen flex-col">
            {/* Header with logo */}
            <div className="relative flex items-center justify-center border-b bg-muted py-2 px-4">
            <div className="absolute left-4">
                <img src={softtekLogo || "/placeholder.svg"} alt="Softtek Logo" className="h-10 py-1 ml-4" />
            </div>
            <h1 className="text-2xl font-bold text-center">Demo Análisis de RFP's con IA</h1>
            </div>
            <div className="flex flex-1 flex-col md:flex-row">
            {/* Sidebar - Responsive width */}
            <div className="flex w-full md:w-[25vw] shrink-0 flex-col items-center justify-center border-b md:border-b-0 md:border-r bg-muted p-6">
                <div className="w-full max-w-md space-y-6">
                <div className="pt-2 border-t">
                    <h2 className="text-center text-lg font-semibold pt-2">O subí tu archivo CSV</h2>
                </div>
                <button onClick={useMessagesHook.getMessages}>
                    Obtener Mensajes
                </button>
                <button onClick={logMessages}>
                    Log Mensajes
                </button>
                <Recorder
                    onSubmit={ async (audioBlob: Blob) => {
                    const payload = { type: "audio", data: audioBlob } as any;
                    console.log("Submitting payload");
                    useMessagesHook.sendAudioMessage(payload);
                    console.log("Submitting audio blob");
                    useMessagesHook.sendAudioMessage(audioBlob);

                    const formData = new FormData();
                    formData.append("audio", audioBlob, "recording.mp3");
                    try {
                        const response = await fetch("http://127.0.0.1:5000/transcribe", {
                        method: "POST",
                        body: formData,
                        });
                        if (!response.ok) {
                        throw new Error("Failed to upload audio");
                        }
                        console.log("Audio sent");
                    } catch (error) {
                        console.error("Error uploading audio:", error);
                    }
                    }}
                />
                </div>
            </div>
            {/* Main content - Responsive width */}
            <div className="w-full md:w-[65vw] shrink-0 p-6">
                <div className="overflow-x-auto">
                <div className="max-h-[calc(100vh-8rem)] overflow-y-auto">
                    Test
                </div>
                </div>
            </div>
            </div>
        </div>
    )
}