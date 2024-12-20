/* eslint-disable */

export const AllTypesProps: Record<string,any> = {
	Subscription:{
		onlineStatusChanged:{

		},
		onReceivedKeySharingTransactionPublicKey:{

		},
		onReceivedKeySharingTransactionEncryptedKey:{

		},
		onKeySharingTransactionSuccess:{

		}
	},
	Role: "enum" as const,
	UserQueryInput:{

	},
	Query:{
		users:{
			input:"UserQueryInput"
		},
		myChat:{

		}
	},
	CreateUserInput:{

	},
	Mutation:{
		createUser:{
			input:"CreateUserInput"
		},
		loginUser:{
			input:"LoginUserInput"
		},
		updateTypingStatus:{

		},
		verifyEmail:{
			input:"VerifyEmailInput"
		},
		updateUser:{
			input:"UpdateUserInput"
		},
		createUserChat:{
			input:"CreateChatInput"
		},
		deleteUserChat:{
			input:"DeleteUserChatInput"
		},
		updateChat:{
			input:"UpdateChatInput"
		},
		addUserToChat:{
			input:"AddUserToChatInput"
		},
		sendMessage:{
			input:"SendMessageInput"
		},
		readMessage:{

		},
		sendKeySharingTransaction:{
			input:"SendKeySharingTransactionInput"
		},
		sendKeySharingTransactionPublicKey:{
			input:"SendKeySharingTransactionPublicKeyInput"
		},
		sendKeySharingTransactionEncryptedKey:{
			input:"SendKeySharingTransactionEncryptedKeyInput"
		},
		sendKeySharingTransactionSuccess:{
			input:"SendKeySharingTransactionSuccessInput"
		}
	},
	LoginUserInput:{

	},
	VerifyEmailInput:{

	},
	File: `scalar.File` as const,
	UpdateUserInput:{
		avatar:"File"
	},
	DateTime: `scalar.DateTime` as const,
	Chat:{
		messages:{

		}
	},
	CreateChatInput:{

	},
	DeleteUserChatInput:{

	},
	UpdateChatInput:{
		avatar:"File"
	},
	AddUserToChatInput:{

	},
	UploadedEncryptedFileInput:{

	},
	SendMessageInput:{
		files:"UploadedEncryptedFileInput"
	},
	SendKeySharingTransactionInput:{

	},
	SendKeySharingTransactionPublicKeyInput:{

	},
	SendKeySharingTransactionEncryptedKeyInput:{

	},
	SendKeySharingTransactionSuccessInput:{

	}
}

export const ReturnTypes: Record<string,any> = {
	Subscription:{
		wsConnectionInitial:"Boolean",
		typingStatusUpdated:"UserTypingStatus",
		onlineStatusChanged:"Boolean",
		userUpdated:"User",
		chatUpdated:"Chat",
		chatCreated:"Chat",
		chatDeleted:"ID",
		newMessage:"Message",
		messageUpdated:"Message",
		unreadMessagesCountChange:"UnreadMessagesCount",
		onIncomingKeySharingTransaction:"IncomingKeySharingTransaction",
		onReceivedKeySharingTransactionPublicKey:"String",
		onReceivedKeySharingTransactionEncryptedKey:"String",
		onKeySharingTransactionSuccess:"Boolean"
	},
	AuthPayload:{
		token:"String",
		user:"User"
	},
	User:{
		id:"ID",
		username:"String",
		displayName:"String",
		avatar:"String",
		email:"String",
		emailVerified:"Boolean",
		role:"Role",
		chats:"Chat",
		isOnline:"Boolean"
	},
	Query:{
		users:"User",
		me:"User",
		myChats:"Chat",
		myChat:"Chat"
	},
	Mutation:{
		createUser:"User",
		createGuestUser:"AuthPayload",
		loginUser:"AuthPayload",
		refreshToken:"AuthPayload",
		updateTypingStatus:"Boolean",
		sendEmailVerification:"Boolean",
		verifyEmail:"Boolean",
		updateUser:"Boolean",
		logoutUser:"Boolean",
		createUserChat:"Chat",
		deleteUserChat:"Boolean",
		updateChat:"Boolean",
		addUserToChat:"Boolean",
		sendMessage:"Boolean",
		readMessage:"Boolean",
		sendKeySharingTransaction:"ID",
		sendKeySharingTransactionPublicKey:"Boolean",
		sendKeySharingTransactionEncryptedKey:"Boolean",
		sendKeySharingTransactionSuccess:"Boolean"
	},
	File: `scalar.File` as const,
	UserTypingStatus:{
		userId:"ID",
		chatId:"ID",
		isTyping:"Boolean"
	},
	DateTime: `scalar.DateTime` as const,
	Chat:{
		id:"ID",
		name:"String",
		avatar:"String",
		owner_id:"ID",
		updated_at:"DateTime",
		unread_messages_count:"Int",
		users:"User",
		messages:"Message"
	},
	MessageFile:{
		id:"ID",
		message_id:"ID",
		chat_id:"ID",
		file_name:"String",
		file_size:"Int",
		file_type:"String",
		file_url:"String",
		upload_timestamp:"String"
	},
	Message:{
		id:"ID",
		chat_id:"ID",
		user_id:"ID",
		type:"String",
		is_read:"Boolean",
		content:"String",
		timestamp:"String",
		disable_encryption:"Boolean",
		files:"MessageFile"
	},
	UnreadMessagesCount:{
		chatId:"ID",
		unreadCount:"Int"
	},
	IncomingKeySharingTransaction:{
		chatId:"ID",
		senderId:"ID",
		transactionId:"ID"
	}
}

export const Ops = {
query: "Query" as const,
	mutation: "Mutation" as const,
	subscription: "Subscription" as const
}