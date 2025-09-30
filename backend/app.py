from typing import Dict, Any, List
from flask import Flask, request
from flask_cors import CORS
from openai import AzureOpenAI, OpenAI
from dotenv import load_dotenv
import os
import time
import json

load_dotenv()
AZURE_OPENAI_ENDPOINT = os.getenv("AZURE_OPENAI_ENDPOINT")
AZURE_OPENAI_KEY = os.getenv("AZURE_OPENAI_KEY")
AZURE_OPENAI_API_VERSION = os.getenv("AZURE_OPENAI_API_VERSION")
OPENAI_ENDPOINT = os.getenv("OPENAI_ENDPOINT")
client = AzureOpenAI(
    azure_endpoint=AZURE_OPENAI_ENDPOINT,
    api_key=AZURE_OPENAI_KEY,
    api_version=AZURE_OPENAI_API_VERSION
)
print(f"Using OpenAI key: {AZURE_OPENAI_KEY}")
THREAD_ID = "thread_0AYHtxJTGKgaD1a5hXiyaR43"
openai_client = OpenAI(
    api_key=AZURE_OPENAI_KEY,
    base_url=f'{AZURE_OPENAI_ENDPOINT}/openai/v1/'
)

agent_response_schema = {
	"type": "json_schema",
	"name": "IsbarResponse",
	"schema": {
		"type": "object",
		"properties": {
			"Identificar": {
				"type": "string",
				"description": "Quién es el doctor y a que paciente representa"
			},
            "Situacion": {
				"type": "string",
				"description": "La razón por la que se comunica, la principal preocupación clínica o el problema."
			},
            "Antecedentes": {
				"type": "string",
				"description": "Información relevante del historial del paciente, como síntomas o tratamientos previos."
			},
            "Evaluacion": {
				"type": "string",
				"description": "Qué se considera que es el problema, incluyendo signos vitales, hallazgos del examen físico y cualquier otra observación relevante."
			},
            "Recomendacion": {
				"type": "string",
				"description": "Lo que se necesita o se solicita para el paciente, ya sea una acción específica, una prueba o una sugerencia de tratamiento."
			}
		},
		"required": ["Identificar", "Situacion", "Antecedentes", "Evaluacion", "Recomendacion"],
		"additionalProperties": False
	}
}

ISBAR_SYSTEM_PROMPT = """
Eres un agente util de salud, y tu tarea es ayudar al medico y depurar lo que cuente para cumplir con la norma ISBAR.
La norma ISBAR es una herramienta de comunicación estandarizada utilizada principalmente en entornos de salud para transferir información de manera efectiva y segura, especialmente en situaciones de atención crítica. 
El acrónimo significa Identificar, Situación, Antecedentes, Evaluación y Recomendación, lo que proporciona un marco estructurado para asegurar que la información esencial no se omita y que se mantenga la continuidad de la atención, mejorando así la seguridad del paciente y reduciendo los errores.
Al momento de depurar deberas ir identificando cada una de las secciones de la norma ISBAR y extrayendo la información relevante que el medico haya proporcionado.
Si el medico no ha proporcionado información para alguna de las secciones, simplemente deja esa sección con un string vacio en el resultado final.
"""

app = Flask(__name__)
CORS(app)

@app.route('/transcribe', methods=['POST'])
def transcribe():
    return {"Identificar":"Doctor de Unidad de Cardiología respecto al Sr. Juan Pérez.","Situacion":"El paciente muestra dificultad respiratoria aguda con saturación de oxígeno baja al 88%.","Antecedentes":"Paciente ingresado hace tres días por neumonía, evolución estable hasta ahora.","Evaluacion":"Condición empeorada; evaluación inicial incluye dificultad respiratoria, saturación y presión arterial.","Recomendacion":"Se solicita radiografía de tórax urgente y análisis de gases en sangre."}
    try:
        # Recbir audio en base64
        # audio_base64 = request.json["audio_base64"]
        # import base64
        # import io
        # clean_base64 = audio_base64.split(',')[1] if ',' in audio_base64 else audio_base64
        # padded_base64 = clean_base64 + '=' * (4 - len(clean_base64) % 4)
        # audio_bytes = base64.b64decode(padded_base64)
        # audio_file = io.BytesIO(audio_bytes)
        # audio_file.name = 'audio.wav'
        # transcript = client.audio.transcriptions.create(
        #     model="whisper",
        #     file=(audio_file.name, audio_file),
        #     language='es'
        # )

        if 'audio' in request.files:
            audio_file = request.files['audio']
            # Use the in-memory file directly without saving to disk
            audio_file.stream.seek(0)
            transcript = client.audio.transcriptions.create(
                model="whisper",
                file=(audio_file.filename, audio_file.stream)
            )
        else:
            print("No audio file found in request.")
            # file = open("./assets/test_audio.mp3", "rb")
            # transcript = client.audio.transcriptions.create(
            #     model="whisper",
            #     file=file
            # )
            return {"error": "No audio file found in request."}, 400
        # print(f"Transcript: {transcript.text}")
        response = openai_client.responses.create(
            model='gpt-4o',
            instructions=ISBAR_SYSTEM_PROMPT,
            input=transcript.text,
            text={"format": agent_response_schema}
        )
        response_object = response.output[0].content[0].text
        print(f"Response object: {response_object}")
        return response_object, 200
    except Exception as e:
        print(f"Error: {e}")
        return {"error": e}, 400

@app.route('/get_patients', methods=['GET'])
def get_patients():
    try:
        with open('./assets/patients.json', 'r', encoding='utf-8') as f:
            patients = json.load(f)
        return patients, 200
    except Exception as e:
        print(f"Error reading patients.json: {e}")
        return {"error": "Could not read patients.json"}, 500
    
@app.route('/get_patient_notes', methods=['GET'])
def get_patient_notes():
    try:
        with open('./assets/patients.json', 'r', encoding='utf-8') as f:
            patients = json.load(f)
        return patients
    except Exception as e:
        print(f"Error reading patients.json: {e}")
        return {"error": "Could not read patients.json"}, 500

@app.route('/get_messages', methods=['GET'])
def get_messages():
    messages = client.beta.threads.messages.list(
        thread_id=THREAD_ID
    )
    response = []
    for message in messages:
        try:
            #print(f"Message ID: {message.id}, Role: {message.role}")
            message_dict = {
                "id": message.id,
                "role": message.role,
                "content": [content.text.value for content in message.content]
            }
            response.append(message_dict)
            # for message_content in message.content:
            #     print(f"Content: {message_content.text.value}")
        except Exception as e:
            print(f"Error printing message: {e}")
    return response

@app.route('/new_message', methods=['GET'])
def new_message():
    message = client.beta.threads.messages.create(
        thread_id=THREAD_ID,
        role="user",
        content="Que documentos tienes disponibles?"
    )
    try: 
        # response = client.responses.create(
        #     model="gpt-4.1",
        #     input="Tell me a three sentence bedtime story about a unicorn."
        # )
        run = client.beta.threads.runs.create(
            thread_id=THREAD_ID,
            assistant_id="asst_l0eCOmUBBMAc4PkI6ujGxkaF"
        )
        while run.status in ['queued', 'in_progress', 'cancelling']:
            time.sleep(0.5)
            run = client.beta.threads.runs.retrieve(
                thread_id=THREAD_ID,
                run_id=run.id
            )
        if run.status == 'completed':
            messages = client.beta.threads.messages.list(
                thread_id=THREAD_ID
            )
            response = []
            for message in messages:
                try:
                    #print(f"Message ID: {message.id}, Role: {message.role}")
                    message_dict = {
                        "id": message.id,
                        "role": message.role,
                        "content": [content.text.value for content in message.content]
                    }
                    response.append(message_dict)
                    # for message_content in message.content:
                    #     print(f"Content: {message_content.text.value}")
                except Exception as e:
                    print(f"Error printing message: {e}")
        else:
            response = []
            print(f"Run failed with status: {run.status}")
        # response = "Run completed successfully."
    except Exception as e:
        print(f"Error: {e}")
        response = []
    return response