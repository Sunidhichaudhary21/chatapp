import { useState, useRef, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useSearchUser } from "@/hooks/use-users";
import { useMessages, useSendMessage } from "@/hooks/use-messages";
import { Layout } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Search, Send, User, MessageSquareOff, Smile, Paperclip, Sparkles, Image as ImageIcon, X } from "lucide-react";
import { format } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";
import EmojiPicker, { EmojiClickData } from "emoji-picker-react";

interface ChatPartner {
  id: number;
  username: string;
}

export default function ChatPage() {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeChat, setActiveChat] = useState<ChatPartner | null>(null);
  const [messageInput, setMessageInput] = useState("");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const { data: searchResult, isLoading: isSearching } = useSearchUser(searchQuery);
  const { data: messages, isLoading: isMessagesLoading } = useMessages(activeChat?.id);
  const { mutate: sendMessage, isPending: isSending } = useSendMessage();

  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom of messages
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  // Close emoji picker when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (showEmojiPicker && !target.closest('.emoji-picker-container')) {
        setShowEmojiPicker(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showEmojiPicker]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
  };

  const handleSelectUser = (selectedUser: ChatPartner) => {
    if (selectedUser.id === user?.id) return; // Can't chat with self
    setActiveChat(selectedUser);
    setSearchQuery(""); // Clear search
  };

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeChat || (!messageInput.trim() && !selectedImage)) return;

    let content = messageInput.trim();
    if (selectedImage) {
      content = selectedImage + (content ? `\n${content}` : "");
    }

    sendMessage({
      receiverId: activeChat.id,
      content,
    });
    setMessageInput("");
    setSelectedImage(null);
    setShowEmojiPicker(false);
  };

  const handleEmojiClick = (emojiData: EmojiClickData) => {
    setMessageInput(prev => prev + emojiData.emoji);
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <Layout>
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 h-[calc(100vh-8rem)]">
        
        {/* Sidebar / User Search */}
        <Card className="col-span-1 md:col-span-4 lg:col-span-3 flex flex-col overflow-hidden border-border/50 shadow-lg shadow-black/5 rounded-2xl">
          <div className="p-4 border-b bg-muted/30">
            <form onSubmit={handleSearch} className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Find people by username..."
                className="pl-9 h-11 rounded-xl bg-background border-border/50 focus:ring-primary/20"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </form>
          </div>

          <ScrollArea className="flex-1 p-2">
            <div className="space-y-1">
              {searchQuery.length > 0 ? (
                // Search Results State
                <div className="p-2">
                  <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 px-2">Search Results</h3>
                  {isSearching ? (
                     <div className="flex items-center justify-center py-8">
                       <div className="w-6 h-6 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
                     </div>
                  ) : searchResult ? (
                    <button
                      onClick={() => handleSelectUser(searchResult)}
                      className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-muted/50 transition-colors text-left group"
                    >
                      <Avatar className="h-10 w-10 border-2 border-transparent group-hover:border-primary/20 transition-all">
                        <AvatarFallback className="bg-primary/10 text-primary font-bold">
                          {searchResult.username[0].toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-semibold text-sm">{searchResult.username}</p>
                        <p className="text-xs text-muted-foreground">Click to start chatting</p>
                      </div>
                    </button>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground text-sm">
                      No user found with that username
                    </div>
                  )}
                </div>
              ) : (
                // Recent Chats / Empty State
                // Note: In a real app, we would fetch recent conversations list here
                <div className="p-4 text-center">
                  <div className="w-16 h-16 rounded-full bg-muted mx-auto mb-4 flex items-center justify-center">
                    <User className="w-8 h-8 text-muted-foreground/50" />
                  </div>
                  <h3 className="font-medium text-foreground">Find a friend</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Search for a username above to start a conversation.
                  </p>
                </div>
              )}
            </div>
          </ScrollArea>
        </Card>

        {/* Chat Window */}
        <Card className="col-span-1 md:col-span-8 lg:col-span-9 flex flex-col overflow-hidden border-border/50 shadow-lg shadow-black/5 rounded-2xl relative bg-white/50 backdrop-blur-sm">
          {activeChat ? (
            <>
              {/* Chat Header */}
              <div className="p-4 border-b bg-white/80 backdrop-blur-md flex items-center justify-between sticky top-0 z-10">
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10 border border-border">
                    <AvatarFallback className="bg-gradient-to-br from-indigo-500 to-purple-600 text-white font-bold">
                      {activeChat.username[0].toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h2 className="font-bold text-base leading-none">{activeChat.username}</h2>
                    <span className="text-xs text-green-600 font-medium flex items-center gap-1 mt-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                      Active Now
                    </span>
                  </div>
                </div>
              </div>

              {/* Messages Area */}
              <ScrollArea className="flex-1 p-4 bg-slate-50/50">
                <div className="flex flex-col gap-4 min-h-full justify-end pb-4">
                  {isMessagesLoading ? (
                    <div className="flex justify-center py-10">
                      <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
                    </div>
                  ) : messages && messages.length > 0 ? (
                    messages.map((msg, idx) => {
                      const isMe = msg.senderId === user?.id;
                      const isLast = idx === messages.length - 1;
                      
                      return (
                        <motion.div
                          key={msg.id}
                          initial={{ opacity: 0, y: 10, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          transition={{ duration: 0.2 }}
                          className={`flex ${isMe ? "justify-end" : "justify-start"}`}
                        >
                          <div className={`max-w-[75%] md:max-w-[60%] flex flex-col ${isMe ? "items-end" : "items-start"}`}>
                            <div
                              className={`px-5 py-3 rounded-2xl shadow-sm text-sm relative group overflow-hidden ${
                                isMe
                                  ? "bg-gradient-to-br from-primary to-indigo-600 text-white rounded-tr-sm"
                                  : "bg-white border border-border/60 text-foreground rounded-tl-sm"
                              }`}
                            >
                              {msg.content.startsWith('data:image/') ? (
                                <div className="space-y-2">
                                  {msg.content.split('\n').map((line, idx) => 
                                    line.startsWith('data:image/') ? (
                                      <img 
                                        key={idx}
                                        src={line} 
                                        alt="Shared" 
                                        className="max-w-[300px] max-h-[300px] rounded-lg object-cover"
                                      />
                                    ) : line ? (
                                      <p key={idx}>{line}</p>
                                    ) : null
                                  )}
                                </div>
                              ) : (
                                msg.content
                              )}
                            </div>
                            <span className="text-[10px] text-muted-foreground mt-1 px-1">
                              {msg.createdAt ? format(new Date(msg.createdAt), "h:mm a") : "Just now"}
                            </span>
                          </div>
                          {isLast && <div ref={scrollRef} />}
                        </motion.div>
                      );
                    })
                  ) : (
                    <div className="flex flex-col items-center justify-center py-12 text-center opacity-60">
                      <div className="w-20 h-20 bg-indigo-50 rounded-full flex items-center justify-center mb-4">
                        <Sparkles className="w-10 h-10 text-indigo-300" />
                      </div>
                      <p className="text-muted-foreground">No messages yet.</p>
                      <p className="text-sm text-muted-foreground/70">Say hello to start the conversation!</p>
                    </div>
                  )}
                </div>
              </ScrollArea>

              {/* Input Area */}
              <div className="p-4 bg-white border-t">
                <form onSubmit={handleSend} className="flex items-end gap-3 max-w-4xl mx-auto">
                  <div className="flex-1 relative">
                    {selectedImage && (
                      <div className="mb-2 relative inline-block">
                        <img 
                          src={selectedImage} 
                          alt="Preview" 
                          className="max-w-[200px] max-h-[200px] rounded-lg border-2 border-primary/20"
                        />
                        <Button
                          type="button"
                          size="icon"
                          variant="destructive"
                          className="absolute -top-2 -right-2 h-6 w-6 rounded-full"
                          onClick={() => setSelectedImage(null)}
                        >
                          <X className="w-3 h-3" />
                        </Button>
                      </div>
                    )}
                    <Input
                      placeholder="Type your message..."
                      className="min-h-[50px] py-3 pl-4 pr-24 rounded-xl border-border/60 focus:ring-primary/20 bg-slate-50"
                      value={messageInput}
                      onChange={(e) => setMessageInput(e.target.value)}
                    />
                    <div className="absolute right-2 top-1/2 -translate-y-1/2 flex gap-1">
                      <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleImageSelect}
                        accept="image/*"
                        className="hidden"
                        aria-label="Upload image"
                      />
                      <Button 
                        type="button" 
                        size="icon" 
                        variant="ghost" 
                        className="h-8 w-8 text-muted-foreground hover:text-primary"
                        onClick={() => fileInputRef.current?.click()}
                      >
                        <ImageIcon className="w-4 h-4" />
                      </Button>
                      <div className="relative emoji-picker-container">
                        <Button 
                          type="button" 
                          size="icon" 
                          variant="ghost" 
                          className="h-8 w-8 text-muted-foreground hover:text-primary"
                          onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                        >
                          <Smile className="w-4 h-4" />
                        </Button>
                        {showEmojiPicker && (
                          <div className="absolute bottom-12 right-0 z-50">
                            <EmojiPicker onEmojiClick={handleEmojiClick} />
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  <Button 
                    type="submit" 
                    size="icon" 
                    className="h-[50px] w-[50px] rounded-xl shrink-0 shadow-md shadow-primary/20"
                    disabled={(!messageInput.trim() && !selectedImage) || isSending}
                    variant="gradient"
                  >
                    <Send className="w-5 h-5 ml-0.5" />
                  </Button>
                </form>
              </div>
            </>
          ) : (
            // Empty Chat State
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-slate-50/30">
              <div className="relative mb-6 group">
                <div className="absolute inset-0 bg-primary/20 rounded-full blur-2xl group-hover:bg-primary/30 transition-all duration-500" />
                <div className="relative bg-white p-6 rounded-3xl shadow-xl shadow-indigo-100 border border-indigo-50">
                  <MessageSquareOff className="w-12 h-12 text-primary/80" />
                </div>
              </div>
              <h2 className="text-2xl font-display font-bold text-foreground mb-2">
                Your Messages
              </h2>
              <p className="text-muted-foreground max-w-sm mb-8">
                Select a conversation from the sidebar or search for a user to start chatting instantly.
              </p>
              
              <div className="flex gap-2">
                <div className="h-2 w-2 rounded-full bg-slate-200 animate-bounce [animation-delay:-0.3s]" />
                <div className="h-2 w-2 rounded-full bg-slate-200 animate-bounce [animation-delay:-0.15s]" />
                <div className="h-2 w-2 rounded-full bg-slate-200 animate-bounce" />
              </div>
            </div>
          )}
        </Card>
      </div>
    </Layout>
  );
}
