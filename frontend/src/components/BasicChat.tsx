import { useEffect, useRef, useState } from 'react';
import { io, type Socket } from 'socket.io-client';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';

import { Button } from './ui/Button';
import { EasterEggPanel, type EasterEgg } from './easter-eggs/EasterEggPanel';
import { basicChatClasses } from '@/styles/gameChatClasses';
import type { ChatMessage } from '@/type/user.types';

import { createPortal } from 'react-dom';

type BasicChatProps = {
	onClose: () => void;
};

type ChatException = {
	message?: string | string[];
};

const easterEggCommands: Record<string, EasterEgg> = {
	'/rick': 'rick',
	'/matrix': 'matrix',
	'/neofetch': 'neofetch',
	'/nuke': 'nuke',
};

function getChatErrorCode(error: ChatException): string | null {
	const message = Array.isArray(error.message)
		? error.message[0]
		: error.message;

	if (typeof message === 'string' && message.startsWith('ERR_CHAT_')) {
		return message;
	}

	return null;
}

export function BasicChat({ onClose }: BasicChatProps) {
	const { t } = useTranslation();

	const [content, setContent] = useState('');
	const [messages, setMessages] = useState<ChatMessage[]>([]);
	const [connected, setConnected] = useState(false);
	const [easterEgg, setEasterEgg] = useState<EasterEgg | null>(null);

	const clientRef = useRef<Socket | null>(null);
	const bottomRef = useRef<HTMLDivElement>(null);

	/**
	 * Opens the chat socket and registers chat event listeners.
	 *
	 * @returns Cleanup function that disconnects the socket.
	 */
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

		client.on('disconnect', () => {
			setConnected(false);
		});

		client.on('chat_message', (message: ChatMessage) => {
			setMessages((previousMessages) => [...previousMessages, message]);
		});

		client.on('connect_error', (error: Error) => {
			if (import.meta.env.DEV) {
				console.warn('[ChatSocket] connection error:', error.message);
			}
		});

		client.on('exception', (error: ChatException) => {
			const code = getChatErrorCode(error);

			toast.error(code ? t(`backend.${code}`) : t('chat.errors.default'));
		});

		return () => {
			client.disconnect();
			clientRef.current = null;
		};
	}, [t]);

	useEffect(() => {
		bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
	}, [messages]);

	/**
	 * Checks whether a message is a local easter egg command.
	 *
	 * @param text - Trimmed chat input text.
	 * @returns True when the command was handled locally.
	 * @remarks Easter egg commands are local-only and are not sent to the backend chat socket.
	 */
	function tryRunEasterEgg(text: string): boolean {
		const command = text.toLowerCase();
		const egg = easterEggCommands[command];

		if (!egg) {
			return false;
		}

		setEasterEgg(egg);
		setContent('');

		return true;
	}

	/**
	 * Sends a chat message or handles a local easter egg command.
	 *
	 * @returns Nothing.
	 */
	function sendMessage(): void {
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
		<>
			<section className={basicChatClasses.container}>
				{/* Chat header */}
				<div className="flex justify-between items-center p-2">
					<div className="flex items-center gap-2">
						<h1>Chat</h1>

						<span className="relative flex size-3">
							{connected ? (
								<>
									<span className={basicChatClasses.onlinePing} />
									<span className={basicChatClasses.onlineDot} />
								</>
							) : (
								<span className={basicChatClasses.offlineDot} />
							)}
						</span>
					</div>

					<button
						type="button"
						onClick={onClose}
						className="text-white hover:text-red-400"
					>
						✕
					</button>
				</div>

				{/* Chat messages */}
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

					<div ref={bottomRef} />
				</div>

				{/* Message input */}
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

			{easterEgg &&
				createPortal(
					<EasterEggPanel
						type={easterEgg}
						onClose={() => setEasterEgg(null)}
					/>,
					document.body,
				)}
		</>
	);
}
