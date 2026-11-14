
import { useRef } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
  KeyboardAvoidingView,
  Pressable,
  Text,
  TextInput,
  View,
} from 'react-native';

import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

import { colors } from '../../constants/theme';
import { useAuth } from '../../context/AuthContext';

import { useAiChat, SUGGESTIONS } from '../../hooks/useAiChat';

import { styles } from '../../styles/Ai_chat_ui.style';
import { MealCard } from '../../components/MealCard';

const r = (n) => Math.round(Number(n) || 0);

export default function AiChat() {
  const router = useRouter();
  const { user } = useAuth();
  const listRef = useRef(null);

  const {
    ctx,
    eaten,
    left,
    messages,
    input,
    setInput,
    image,
    setImage,
    busy,
    loading,
    send,
    onPhoto,
    logMeal,
  } = useAiChat(user?.id);

  // Render individual chat messages
  const renderItem = ({ item }) => {
    const mine = item.role === 'user';

    return (
      <View style={[styles.row, mine ? styles.rowMine : styles.rowAi]}>
        <View
          style={[
            styles.bubble,
            mine ? styles.bubbleMine : styles.bubbleAi,
            item.isError && styles.bubbleErr,
          ]}
        >
          {item.image ? (
            <Image source={{ uri: item.image }} style={styles.photo}
            />
          ) : null}

          {item.text ? (
            <Text
              style={[styles.text, mine && { color: colors.white }, item.isError && { color: colors.error },
              ]}   >
              {item.text}
            </Text>
          ) : null}

          {item.meal ? (<MealCard meal={item.meal} logged={item.logged} onLog={() => logMeal(item)} />) : null}
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safe}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable
          onPress={() => router.back()}
          hitSlop={10}
        >
          <Text style={styles.back}>←</Text>
        </Pressable>

        <View style={{ flex: 1 }}>
          <Text style={styles.title}>AI Coach ✨</Text>

          {ctx ? (
            <Text style={styles.sub}>
              {r(eaten)} / {ctx.plan.calories} kcal today · {r(left)} left
            </Text>
          ) : null}
        </View>
      </View>

      <KeyboardAvoidingView style={{ flex: 1 }} behavior="padding"   >
        {/* Chat messages */}
        {loading && messages.length === 0 ? (
          <View style={styles.center}>
            <ActivityIndicator color={colors.primary} />
          </View>
        ) : (
          <FlatList
            ref={listRef}
            data={messages}
            keyExtractor={(item) => item.id}
            renderItem={renderItem}
            contentContainerStyle={styles.list}
            onContentSizeChange={() =>
              listRef.current?.scrollToEnd({ animated: true })
            }
            keyboardShouldPersistTaps="handled"
            ListFooterComponent={
              <View>
                {busy ? (
                  <View style={[styles.row, styles.rowAi]}>
                    <View style={[styles.bubble, styles.bubbleAi, {
                      flexDirection: 'row', alignItems: 'center',
                      gap: 8,
                    },
                    ]}
                    >
                      <ActivityIndicator
                        size="small"
                        color={colors.primary}
                      />
                      <Text style={styles.text}>
                        {image ? 'Analyzing your meal…' : 'Thinking…'}
                      </Text>
                    </View>
                  </View>
                ) : null}

                {messages.length <= 1 && ctx ? (
                  <View style={styles.chips}>
                    {SUGGESTIONS.map((suggestion) => (
                      <Pressable
                        key={suggestion}
                        style={styles.chip}
                        onPress={() => send(suggestion)}
                        disabled={busy}
                      >
                        <Text style={styles.chipText}>
                          {suggestion}
                        </Text>
                      </Pressable>
                    ))}
                  </View>
                ) : null}
              </View>
            }
          />
        )}

        {/* Image preview */}
        {image ? (
          <View style={styles.preview}>
            <Image
              source={{ uri: image.uri }}
              style={styles.previewImg}
            />

            <Text style={styles.previewText}>
              Photo attached. Add a note (optional) and send.
            </Text>

            <Pressable
              onPress={() => setImage(null)}
              hitSlop={10}
            >
              <Text style={styles.remove}>✕</Text>
            </Pressable>
          </View>
        ) : null}

        {/* Message composer */}
        <View style={styles.composer}>
          <Pressable
            onPress={onPhoto}
            style={styles.iconBtn}
            disabled={busy || loading}
          >
            <Text style={styles.icon}>📷</Text>
          </Pressable>

          <TextInput
            value={input}
            onChangeText={setInput}
            placeholder="Ask anything about nutrition…"
            placeholderTextColor="#9DB3A5"
            style={styles.input}
            multiline
            editable={!busy && !loading}
          />

          <Pressable
            onPress={() => send()}
            disabled={busy || loading || (!input.trim() && !image)}
            style={[
              styles.send,
              (busy || loading || (!input.trim() && !image)) && {
                opacity: 0.4,
              },
            ]}
          >
            <Text style={styles.sendText}>↑</Text>
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
