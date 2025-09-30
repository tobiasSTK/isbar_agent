import { Header } from "@/components/header"
import { GroceryDropdown } from "@/components/grocery-dropdown"
import { Mic } from "lucide-react"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger} from '@/components/ui/dropdown-menu'
import { Recorder } from "@/components/recorder";
import useMessages from "@/hooks/useMessages"
import { useEffect, useState } from "react";
import { useAudioRecorder } from "@/hooks/useAudioRecorder";

const groceryContent = `Weekly Essentials:
Milk, Bread, Eggs, Butter, Cheese, Yogurt, Bananas, Apples

Dinner Party:
Salmon, Asparagus, Wine, Olive Oil, Garlic, Lemons, Fresh Herbs, Dessert

Breakfast Items:
Oatmeal, Berries, Honey, Orange Juice, Coffee, Granola, Almond Milk

Snacks & Treats:
Chips, Nuts, Dark Chocolate, Crackers, Hummus, Fresh Fruit, Popcorn`

export default function Page() {

    const { audioUrl, seconds, toggleRecording, clearAudio, formatTime } = useAudioRecorder();
    const [notasIsbar, setNotasIsbar] = useState([])
    const [selectedPatient, setSelectedPatient] = useState(0)
    const [selectedPatientName, setSelectedPatientName] = useState("Seleccionar paciente")
    const [patients, setPatients] = useState([])

    useEffect(() => {
        const fetchData = async () => {
            const response = await fetch("http://127.0.0.1:5000/get_patients", {
                method: "GET",
            });
            if (!response.ok) {
                throw new Error("Failed to upload audio");
            }
            let patients = await response.json()
            console.log("Patients:", patients);
            setPatients(patients)
            setSelectedPatientName(patients[0].name)
            setNotasIsbar(patients[0]?.notes)
        }
        fetchData().catch(console.error);
    },[])

    useEffect(() => {
        setSelectedPatientName(patients[selectedPatient]?.name)
        setNotasIsbar(patients[selectedPatient]?.notes)
    },[selectedPatient])

    const useMessagesHook = useMessages();
    
    const logMessages = () => {
        console.log("Current messages:", useMessagesHook.messages);
    }

  return (
    <div className="min-h-screen bg-background flex flex-col font-sans antialiased">
      <Header />

      <div className="px-4 pt-6 pb-2 text-center">
        <h1 className="text-2xl font-semibold text-foreground">Hello, Alex</h1>
      </div>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
            <Button variant="outline">{selectedPatientName}</Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56" align="start">
            {patients.filter((patient) => patient.id != selectedPatient).map((patient, idx) => (
                <DropdownMenuItem 
                    key={idx} 
                    onSelect={() => {
                        setSelectedPatient(idx)
                    }}
                >
                    {patient.name} - {patient.id}
                </DropdownMenuItem>
            ))}
        </DropdownMenuContent>
      </DropdownMenu>

      <div className="flex-1 overflow-y-auto px-4 py-6">
        <div className="space-y-4">
          {/* <GroceryDropdown title="Grocery Lists" content={groceryContent} /> */}
          {notasIsbar ? notasIsbar.map((element, idx) => (
            // <div key={idx}>{element}</div>
            <GroceryDropdown key={idx} title={element.date} content={"Identificar: " + element.isbar.Identificar + "\nSituacion: " + element.isbar.Situacion + "\nAntecedentes: " + element.isbar.Antecedentes + "\nEvaluacion: " + element.isbar.Evaluacion + "\nRecomendacion: " + element.isbar.Recomendacion} />
          )) : <div>No hay notas ISBAR disponibles.</div>}
        </div>
      </div>

      <div className="flex justify-center pb-8 pt-4">
        {/* <Button
          size="lg"
          className="w-16 h-16 rounded-full bg-accent hover:bg-accent/90 text-accent-foreground shadow-lg"
        >
          <Mic className="w-6 h-6" />
        </Button> */}
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
                let isbar = await response.json()
                //{"Identificar":"Doctor de Unidad de Cardiología respecto al Sr. Juan Pérez.","Situacion":"El paciente muestra dificultad respiratoria aguda con saturación de oxígeno baja al 88%.","Antecedentes":"Paciente ingresado hace tres días por neumonía, evolución estable hasta ahora.","Evaluacion":"Condición empeorada; evaluación inicial incluye dificultad respiratoria, saturación y presión arterial.","Recomendacion":"Se solicita radiografía de tórax urgente y análisis de gases en sangre."}
                let isbarString = "Identificar: " + isbar.Identificar + "\nSituacion: " + isbar.Situacion + "\nAntecedentes: " + isbar.Antecedentes + "\nEvaluacion: " + isbar.Evaluacion + "\nRecomendacion: " + isbar.Recomendacion
                setNotasIsbar(prevNotas => [isbarString, ...prevNotas]);
            } catch (error) {
                console.error("Error uploading audio:", error);
            }
            }}
        />
      </div>
    </div>
  )
}