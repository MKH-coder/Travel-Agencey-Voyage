import { 
  collection, 
  doc, 
  setDoc, 
  getDocs, 
  query, 
  where, 
  onSnapshot, 
  updateDoc, 
  Timestamp,
  deleteDoc
} from 'firebase/firestore';
import { firestoreDb } from './firebase.ts';
import { SupportMessage, SupportConversationSummary } from '../types.ts';

const LOCAL_STORAGE_KEY = 'voyage_support_messages_cache';

export class ChatSupportService {
  /**
   * Retrieves all locally cached messages
   */
  static getLocalMessages(): SupportMessage[] {
    try {
      const data = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (!data) return [];
      return JSON.parse(data);
    } catch {
      return [];
    }
  }

  /**
   * Saves messages array to local storage
   */
  static saveLocalMessages(messages: SupportMessage[]): void {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(messages));
      window.dispatchEvent(new CustomEvent('voyage_support_messages_updated'));
    } catch {
      // ignore
    }
  }

  /**
   * Sends a new support message (from either Client or Admin)
   * Saves to local cache immediately and syncs with Firestore
   */
  static async sendMessage(params: {
    userId: string;
    userEmail: string;
    userName: string;
    senderRole: 'CLIENT' | 'ADMIN';
    senderId: string;
    senderName: string;
    text: string;
    listingContext?: { id: string; title: string };
  }): Promise<SupportMessage> {
    const messageId = `msg_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
    const nowIso = new Date().toISOString();

    const newMessage: SupportMessage = {
      id: messageId,
      userId: params.userId,
      userEmail: params.userEmail,
      userName: params.userName || params.userEmail.split('@')[0],
      senderRole: params.senderRole,
      senderId: params.senderId,
      senderName: params.senderName,
      text: params.text.trim(),
      timestamp: nowIso,
      readByAdmin: params.senderRole === 'ADMIN',
      readByClient: params.senderRole === 'CLIENT',
      listingContext: params.listingContext,
    };

    // 1. Optimistic Local Save
    const current = this.getLocalMessages();
    const updated = [...current.filter(m => m.id !== messageId), newMessage];
    this.saveLocalMessages(updated);

    // 2. Sync to Cloud Firestore
    try {
      const docRef = doc(firestoreDb, 'support_messages', messageId);
      await setDoc(docRef, {
        ...newMessage,
        syncedAt: Timestamp.now(),
      });
    } catch (err) {
      console.warn('Firestore sendMessage fallback to local:', err);
    }

    return newMessage;
  }

  /**
   * Subscribes to messages for a specific signed-in client user in real time
   */
  static subscribeToUserMessages(
    userId: string,
    callback: (messages: SupportMessage[]) => void
  ): () => void {
    // Deliver local cached messages immediately
    const initialLocal = this.getLocalMessages()
      .filter(m => m.userId === userId)
      .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
    callback(initialLocal);

    // Firestore Live Realtime Listener
    try {
      const q = query(
        collection(firestoreDb, 'support_messages'),
        where('userId', '==', userId)
      );

      const unsubscribe = onSnapshot(
        q,
        (snapshot) => {
          const remoteMessages: SupportMessage[] = [];
          snapshot.forEach(docSnap => {
            remoteMessages.push(docSnap.data() as SupportMessage);
          });

          // Merge with local cache
          const allLocal = this.getLocalMessages();
          const otherUsersMessages = allLocal.filter(m => m.userId !== userId);
          
          const combined = [...otherUsersMessages, ...remoteMessages];
          this.saveLocalMessages(combined);

          const sorted = remoteMessages.sort(
            (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
          );
          callback(sorted);
        },
        (error) => {
          console.warn('Firestore onSnapshot user messages error (using local):', error);
          const fallback = this.getLocalMessages()
            .filter(m => m.userId === userId)
            .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
          callback(fallback);
        }
      );

      return unsubscribe;
    } catch (err) {
      console.warn('Firestore subscribe error:', err);
      return () => {};
    }
  }

  /**
   * Subscribes to ALL conversation threads for the Admin Portal in real time
   */
  static subscribeToAllConversations(
    callback: (conversations: SupportConversationSummary[]) => void
  ): () => void {
    const buildSummaries = (messages: SupportMessage[]): SupportConversationSummary[] => {
      const map = new Map<string, SupportMessage[]>();
      messages.forEach(m => {
        const userKey = m.userId || m.userEmail || 'guest';
        const list = map.get(userKey) || [];
        list.push(m);
        map.set(userKey, list);
      });

      const summaries: SupportConversationSummary[] = [];
      map.forEach((userMsgs, uId) => {
        const sorted = userMsgs.sort(
          (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
        );
        const last = sorted[sorted.length - 1];
        const unreadCount = sorted.filter(m => !m.readByAdmin && m.senderRole === 'CLIENT').length;

        summaries.push({
          userId: uId,
          userEmail: last.userEmail,
          userName: last.userName || last.userEmail.split('@')[0],
          lastMessage: last,
          unreadCount,
          messages: sorted,
        });
      });

      // Sort conversations with most recent activity first
      return summaries.sort(
        (a, b) => new Date(b.lastMessage.timestamp).getTime() - new Date(a.lastMessage.timestamp).getTime()
      );
    };

    // Initial local delivery
    callback(buildSummaries(this.getLocalMessages()));

    try {
      const q = collection(firestoreDb, 'support_messages');
      const unsubscribe = onSnapshot(
        q,
        (snapshot) => {
          const remote: SupportMessage[] = [];
          snapshot.forEach(docSnap => {
            remote.push(docSnap.data() as SupportMessage);
          });

          this.saveLocalMessages(remote);
          callback(buildSummaries(remote));
        },
        (error) => {
          console.warn('Firestore subscribeToAllConversations error:', error);
          callback(buildSummaries(this.getLocalMessages()));
        }
      );

      return unsubscribe;
    } catch (err) {
      console.warn('Firestore subscribeToAllConversations catch:', err);
      return () => {};
    }
  }

  /**
   * Marks all client messages from a user as read by the admin
   */
  static async markConversationAsReadByAdmin(userId: string): Promise<void> {
    const all = this.getLocalMessages();
    let changed = false;

    const updated = all.map(m => {
      if (m.userId === userId && !m.readByAdmin) {
        changed = true;
        // Fire async update to firestore doc
        const docRef = doc(firestoreDb, 'support_messages', m.id);
        updateDoc(docRef, { readByAdmin: true }).catch(() => {});
        return { ...m, readByAdmin: true };
      }
      return m;
    });

    if (changed) {
      this.saveLocalMessages(updated);
    }
  }

  /**
   * Marks all admin messages to a user as read by that client
   */
  static async markConversationAsReadByClient(userId: string): Promise<void> {
    const all = this.getLocalMessages();
    let changed = false;

    const updated = all.map(m => {
      if (m.userId === userId && !m.readByClient) {
        changed = true;
        const docRef = doc(firestoreDb, 'support_messages', m.id);
        updateDoc(docRef, { readByClient: true }).catch(() => {});
        return { ...m, readByClient: true };
      }
      return m;
    });

    if (changed) {
      this.saveLocalMessages(updated);
    }
  }

  /**
   * Returns total unread messages count for a client user
   */
  static getClientUnreadCount(userId: string): number {
    return this.getLocalMessages().filter(
      m => m.userId === userId && m.senderRole === 'ADMIN' && !m.readByClient
    ).length;
  }

  /**
   * Returns total unread messages count across all users for admin
   */
  static getAdminUnreadCount(): number {
    return this.getLocalMessages().filter(
      m => m.senderRole === 'CLIENT' && !m.readByAdmin
    ).length;
  }
}
