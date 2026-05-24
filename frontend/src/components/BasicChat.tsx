import { useEffect, useRef, useState } from 'react';
import { Button } from './ui/Button';
import { io, type Socket } from 'socket.io-client';
import type { ChatMessage } from '@/type/user.types';
import { useTranslation } from 'react-i18next';
import { EasterEggPanel, type EasterEgg } from './easter-eggs/EasterEggPanel';
import { basicChatClasses } from '@/styles/gameChatClasses';

type BasicChatProps = {
	onClose: () => void;
};

type ChatException = {
	message?: string | string[];
};

export function BasicChat({ onClose }: BasicChatProps) {
	const [content, setContent] = useState('');
	const [messages, setMessages] = useState<ChatMessage[]>([]);
	const [connected, setConnected] = useState(false);
	const clientRef = useRef<Socket | null>(null);
	const bottomRef = useRef<HTMLDivElement>(null);

	const [easterEgg, setEasterEgg] = useState<EasterEgg | null>(null);

	const { t } = useTranslation();

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

		client.on('chat_message', (message: ChatMessage) => {
			setMessages((prev) => [...prev, message]);
		});

		client.on('connect_error', (error: Error) => {
			console.error('chat socket error:', error.message);
		});

		client.on('exception', (error: ChatException) => {
			console.error('Chat exception:', error.message);
		});

		return () => {
			client.disconnect();
			clientRef.current = null;
		};
	}, []);

	useEffect(() => {
		bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
	}, [messages]);

	function tryRunEasterEgg(text: string): boolean {
		const command = text.toLowerCase();

		const commands: Record<string, EasterEgg> = {
			'/rick': 'rick',
			'/matrix': 'matrix',
			'/neofetch': 'neofetch',
			'/nuke': 'nuke',
		};

		const egg = commands[command];

		if (!egg) {
			return false;
		}

		setEasterEgg(egg);
		setContent('');
		return true;
	}

	function sendMessage() {
		const text = content.trim();

		if (!clientRef.current || !connected || text.length === 0) {
			return;
		}

		if (tryRunEasterEgg(text)) {
			return;
		}

		clientRef.current.emit('chat_send', {
			content: text,
		});

		setContent('');
	}

	return (
		<section className={basicChatClasses.container}>
			<div className="flex justify-between items-center p-2">
				<div className="flex items-center gap-2">
					<h1>Chat</h1>
					<span className="relative flex size-3">
						{connected ? (
							<>
								<span className={basicChatClasses.onlinePing}></span>
								<span className={basicChatClasses.onlineDot}></span>
							</>
						) : (
							<span className={basicChatClasses.offlineDot}></span>
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

						<div className={basicChatClasses.messageText}>
							{message.content}
						</div>
					</div>
				))}

				{easterEgg && (
					<EasterEggPanel type={easterEgg} onClose={() => setEasterEgg(null)} />
				)}

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
					placeholder={t('chat.placeholder', { count: 500 })}
					maxLength={500}
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
