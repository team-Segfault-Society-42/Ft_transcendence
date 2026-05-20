import { useEffect, useRef, useState } from 'react';
import { Button } from './ui/Button';
import { io, type Socket } from 'socket.io-client';
import type { ChatMessage } from '@/type/user.types';

type BasicChatProps = {
	onClose: () => void;
};

export function BasicChat({ onClose }: BasicChatProps) {
	const [content, setContent] = useState('');
	const [messages, setMessages] = useState<ChatMessage[]>([]);
	const [connected, setConnected] = useState(false);
	const clientRef = useRef<Socket | null>(null);
	const bottomRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		const client = io(`${window.location.origin}/chat`, {
			path: '/socket.io/',
			transports: ['websocket'],
			withCredentials: true,
		});
		clientRef.current = client;

		client.on('connect', () => {
			setConnected(true);
		});
		client.on('disconnect', () => setConnected(false));

		client.on('chat_message', (message) => {
			setMessages((prev) => [...prev, message]);
		});

		client.on('connect_error', (error) => {
			console.error('chat socket error:', error.message);
		});

		client.on('chat_error', (error) => {
			console.error('Error:', error.error);
		});

		return () => {
			client.disconnect();
			clientRef.current = null;
		};
	}, []);

	useEffect(() => {
		bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
	}, [messages]);

	function sendMessage() {
		const text = content.trim();

		if (!clientRef.current || text.length === 0) {
			return;
		}

		clientRef.current.emit('chat_send', {
			content: text,
		});

		setContent('');
	}

	return (
		<section className="flex flex-col h-full w-full max-w-[320px] overflow-hidden">
			<div className="flex justify-between items-center p-2">
				<div className="flex items-center gap-2">
					<h1>Chat</h1>
					<span className="relative flex size-3">
						{connected ? (
							<>
								<span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-700 opacity-75"></span>
								<span className="relative inline-flex size-3 rounded-full bg-green-600"></span>
							</>
						) : (
							<span className="relative inline-flex size-3 rounded-full bg-red-500"></span>
						)}
					</span>
				</div>
				<button onClick={onClose} className="text-white hover:text-red-400">
					✕
				</button>
			</div>

			<div className="flex-1 overflow-y-auto px-2">
				{messages.map((message) => (
					<div key={message.id} className="mb-2 w-full">
						<div className="flex items-center gap-1">
							<span className="text-gray-400 text-[10px] shrink-0">
								{new Date(message.createdAt).toLocaleTimeString([], {
									hour: '2-digit',
									minute: '2-digit',
								})}
							</span>
							<span className="text-fuchsia-400 font-bold text-sm truncate">
								@{message.user.username}:
							</span>
						</div>

						<div className="min-w-0 max-w-full whitespace-pre-wrap wrap-anywhere text-sm leading-snug text-white">
							{message.content}
						</div>
					</div>
				))}
				<div ref={bottomRef} />
			</div>

			<div className="flex items-end gap-2 p-2">
				<textarea
					value={content}
					onChange={(event) => setContent(event.target.value)}
					onKeyDown={(event) => {
						if (event.key === 'Enter' && !event.shiftKey) {
							event.preventDefault();
							sendMessage();
						}
					}}
					placeholder="Message (max 500 characters)"
					rows={4}
					className="flex-1 border p-2 resize-none"
				/>

				<Button
					onClick={sendMessage}
					disabled={!connected || content.trim().length === 0}
					className="hover:scale-100 shrink-0"
				>
					{'>'}
				</Button>
			</div>
		</section>
	);
}
