import { useState, useEffect } from 'react';

export default function useMessages() {
    const [messages, setMessages] = useState<{ role: string; content: any }[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const getMessages = async () => {
        console.log("Fetching messages...");
        const response = await fetch(`http://127.0.0.1:5000/get_messages`, {
            method: "GET",
            headers: {
            "Content-Type": "application/json",
            }
        })
        const data = await response.json()
        console.log("Received assistant data:", data)
        setMessages(data);
    }

    const sendAudioMessage = async (blob: any) => {
        console.log(typeof blob);
        console.log(blob);
    }

    return { messages, setMessages, isLoading, error, getMessages, sendAudioMessage };
}