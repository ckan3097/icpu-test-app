import React, { useEffect, useState } from 'react';
import { useChannel } from "./AblyReactEffect";
import styles from './AblyChatComponent.module.css';
import ReactMarkdown from "react-markdown";

// Set AI related constants -> set the model in pages/api/openai.js
const AI_HANDLE = "@ai"
const AI_COLOR = "#000000"
const SYSTEM_MESSAGE = {
  role: "system",
  content: `You are a helpful, expert assistant participating in a collaborative group chat for a university-led final-year group unit. Your role is to assist with research, support effective collaboration, encourage academic integrity, and facilitate productive teamwork across an interdisciplinary group. Your responsibilities include:
    1. Insight and Research Support
      - Provide clear, concise answers to factual questions when asked.
      - Offer relevant background information, research context, or clarification on technical concepts.
      - Where appropriate, guide users toward resources rather than giving direct solutions.

    2. Team Coordination
      - Act as a moderator, organiser, or delegator when group discussions lack structure or direction.
      - Help distribute tasks based on group members' strengths and academic backgrounds.
      - Encourage inclusive decision-making and ensure all voices are acknowledged.

    3. Academic Integrity
      - Never complete full assignments or write code solutions intended for assessment.
      - If a request appears to relate to a marked task, prompt the group to clarify before proceeding.
      - Promote learning by guiding the team through problem-solving processes without doing the work for them.

    4. Group Awareness
      - All users identify themselves using initials (e.g., “AJ:”, “IS:”). Track these to maintain group dynamics and respond accurately.
      - Keep responses concise—ideally under 500 words—and encourage iterative group contributions.

Your goal is to help the team build practical skills in communication, delegation, research, and collaboration, without compromising academic integrity or the intent of the learning experience.`,
};

const AblyChatComponent = () => {

  let inputBox = null;
  let messageEnd = null;

  // State for user input, received messages, and OpenAI response fetching status.
  const [messageText, setMessageText] = useState("");
  const [receivedMessages, setMessages] = useState([]);
  const [fetchingopenaiResponse, setFetchingopenaiResponse] = useState(false);
  const [chatHistory, setChatHistory] = useState([]);

  // Check if message text is empty (whitespace only).
  const messageTextIsEmpty = messageText.trim().length === 0;

  // Generate a random user color and initials.
  const [userColor, setUserColor] = useState(
    "#" + Math.floor(Math.random() * 16777215).toString(16)
  );
  const [userInitials, setUserInitials] = useState(generateRandomInitials());

   // generate a random set of initials
  function generateRandomInitials() {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const firstInitial = chars[Math.floor(Math.random() * chars.length)];
    const secondInitial = chars[Math.floor(Math.random() * chars.length)];
    return firstInitial + secondInitial;
  }

  // ensure color contrast of fake initials and background look good
  function getContrastTextColor(color) {
    const hexColor = color.replace("#", "");
    const red = parseInt(hexColor.substr(0, 2), 16);
    const green = parseInt(hexColor.substr(2, 2), 16);
    const blue = parseInt(hexColor.substr(4, 2), 16);
    const brightness = (red * 299 + green * 587 + blue * 114) / 1000;
    return brightness > 128 ? "black" : "white";
  }

   // Initialize channel, subscribe to messages, and update received messages.
  const [channel, ably] = useChannel("chat-demo", (message) => {
    const history = receivedMessages.slice(-199);
    setMessages([...history, message]);
  });

   // Fetch chat history on component mount.
  useEffect(() => {
    const fetchChannelHistory = async () => {
      try {
        const historyPage = await channel.history({ limit: 20 });
        const historyMessages = historyPage.items.reverse();
        setMessages(receivedMessages => [...receivedMessages, ...historyMessages]);
      } catch (error) {
        console.error('Error fetching channel history:', error);
      }
    };

    fetchChannelHistory();
  }, [channel]);

  // Determine if a message should trigger an OpenAI response.
  const isopenaiTrigger = (message) => {
    return message.includes(AI_HANDLE); 
  };

  // Send an OpenAI response.
  const sendopenaiResponse = async (triggerText) => {
  try {
    setFetchingopenaiResponse(true);

    // Format full chat history for OpenAI
    const fullHistoryMessages = receivedMessages.slice(-200).map((msg) => ({
      role:
        msg.data.initials === "AI" 
          ? "assistant"
          : "user",
      content: 
        msg.data.initials === "AI"
          ? String(msg.data.text)
          : `${msg.data.initials}: ${String(msg.data.text)}`, 
    }));

    // Add the latest user message
    fullHistoryMessages.push({
      role: "user",
      content: `${String(triggerText.initials)}: ${String(triggerText.content)}`,
    });

    // Combine message sent to AI to include the system message and message history
    const fullMessages = [SYSTEM_MESSAGE, ...fullHistoryMessages];

    // Get response
    const response = await fetch("/api/openai", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages: fullMessages }),
    });

    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`);
    }

    // Output that AI response
    const data = await response.json();
    channel.publish({
      name: "chat-message",
      data: {
        text: data.response.replace(/^([A-Z]{2,3}|@?AI):\s+/i, ''),
        color: AI_COLOR,
        initials: "AI",
      },
    });
    } catch (error) {
      console.error("Error fetching OpenAI response:", error);
    } finally {
      setFetchingopenaiResponse(false);
    }
  };


  // Send a chat message and trigger OpenAI response if applicable.
  const sendChatMessage = async (messageText) => {
    const userMessage = { role: 'user', 
                          content: messageText,
                          initials: userInitials};
    setChatHistory(prev => [...prev, userMessage]);

    channel.publish({
      name: "chat-message",
      data: { text: messageText, color: userColor, initials: userInitials },
    });

    // Send and await AI response if triggered
    if (isopenaiTrigger(messageText)) {
      await sendopenaiResponse(userMessage);
    }

    // Clear users message text
    setMessageText("");
  };

  // Send message when send button clicked.
  const handleFormSubmission = (event) => {
    event.preventDefault();
    sendChatMessage(messageText);
  };

  // Send message on enter, but not on shift+enter.
  const handleKeyDown = (event) => {
    if (event.key === 'Enter' && !event.shiftKey && !messageTextIsEmpty) {
      event.preventDefault();
      sendChatMessage(messageText);
    }
  };

  // Render messages and handle OpenAI responses.
  const messages = receivedMessages.map((message, index) => {
  const author = message.data.initials === "AI" ? "ai" : (message.connectionId === ably.connection.id ? "me" : "other");
  const isGPTMessage = message.data.text.startsWith("openai: ");
  const textColor = getContrastTextColor(message.data.color);
  const className = `${isGPTMessage ? styles.openaiMessage : styles.message} ${author === "me" ? styles.messageSentByMe : styles.messageSentByOthers}`;

  // Set the font color based on the message author.
  const fontColor = author === "me" ? "#FFFFFF" : "#000000";

  // Set the alignment based on the message author.
  const justifyContent = author === "me" ? "flex-end" : "flex-start";

  return (
    <div
      key={index}
      className={`${styles.messageWrapper} ${author === "me" ? styles.messageSentByMe : styles.messageSentByOthers}`}
      style={{ justifyContent: justifyContent }}
    >
      <div
        className={styles.colorSquare}
        style={{ backgroundColor: message.data.color, color: textColor }}
      >
        {message.data.initials}
      </div>
      <div
          className={className}
          data-author={author}
          style={{ color: fontColor }}
        >
          <div className={styles.markdown}>
            <ReactMarkdown>{message.data.text}</ReactMarkdown>
          </div>
        </div>
    </div>
  );
});

  // Scroll to the most recent message.
  useEffect(() => {
    messageEnd?.scrollIntoView({ behavior: "smooth" });
  });

  // Render the chat interface.
  return (
    <div className={styles.chatHolder}>
      <div className={styles.chatText}>
        {messages}
        {fetchingopenaiResponse && (
          <span className={styles.fetchingMessage}>
            Fetching response from OpenAI...
          </span>
        )}
        <div ref={(element) => { messageEnd = element; }}></div>
      </div>
      <form onSubmit={handleFormSubmission} className={styles.form}>
        <textarea
          ref={(element) => { inputBox = element; }}
          value={messageText}
          placeholder="Type a message!"
          onChange={e => setMessageText(e.target.value)}
          onKeyDown={handleKeyDown}
          className={styles.textarea}
        ></textarea>
        <button type="submit" className={styles.button} disabled={messageTextIsEmpty}>Send</button>
      </form>
    </div>
  )
}
export default AblyChatComponent;