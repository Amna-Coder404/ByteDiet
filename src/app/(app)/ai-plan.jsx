import { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator, Alert, FlatList, Image, KeyboardAvoidingView, Pressable, StyleSheet, Text, TextInput, View,
} from 'react-native';
import * as ImageManipulator from 'expo-image-manipulator';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import { colors, radius } from '../../constants/theme';
import { useAuth } from '../../context/AuthContext';
import { getOnboardingData } from '../../services/onboardingService';
import { addMeal, getTodayMeals, sumMeals } from '../../services/mealService';
import { analyzeMeal, buildSystemPrompt, chatWithAI } from '../../services/geminiService';
import { calcPlan } from '../../utils/nutrition';

const SUGGESTIONS = ['How many calories do I have left today?', 'Meal ideas for dinner', 'High-protein snack ideas'];
const r = (n) => Math.round(Number(n) || 0);

function MealCard({ meal, logged, onLog }) {
  const total = meal.total ?? {};
  return (
    <View style={styles.meal}>
      <Text style={styles.mealTitle}>{meal.meal_name || 'Meal'}</Text>
      {(meal.items ?? []).map((it, i) => (
        <View key={i} style={styles.itemRow}>
          <Text style={styles.itemName} numberOfLines={2}>{it.name}{it.portion ? ` (${it.portion})` : ''}</Text>
          <Text style={styles.itemKcal}>{r(it.calories)} kcal</Text>
        </View>
      ))}
      <View style={styles.totalRow}>
        <Text style={styles.totalLabel}>Total</Text>
        <Text style={styles.totalKcal}>{r(total.calories)} kcal</Text>
      </View>
      <Text style={styles.macros}>P {r(total.protein_g)}g · C {r(total.carbs_g)}g · F {r(total.fat_g)}g</Text>
      {meal.note ? <Text style={styles.note}>{meal.note}</Text> : null}
      <Pressable onPress={onLog} disabled={logged} style={[styles.logBtn, logged && { backgroundColor: colors.primaryLight }]}>
        <Text style={[styles.logText, logged && { color: colors.primaryDark }]}>{logged ? '✓ Added to today' : 'Add to today’s log'}</Text>
      </Pressable>
      <Text style={styles.estimate}>Estimate only. Portions are guessed from the photo.</Text>
    </View>
  );
}

export default function AiChat() {
  const router = useRouter();
  const { user } = useAuth();
  const listRef = useRef(null);
  const idRef = useRef(1);
  const nextId = () => String(idRef.current++);

  const [ctx, setCtx] = useState(null);
  const [eaten, setEaten] = useState(0);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [image, setImage] = useState(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    Promise.all([getOnboardingData(user.id), getTodayMeals(user.id)])
      .then(([{ profile, goals }, meals]) => {
        if (!profile || !goals) return;
        setCtx({ profile, goals, plan: calcPlan(profile, goals) });
        setEaten(sumMeals(meals).calories);
        setMessages([{
          id: nextId(), role: 'model', local: true,
          text: `Hi ${profile.name.split(' ')[0]}! 👋 Send me a photo of your meal and I’ll estimate the calories, or ask me anything about your nutrition.`,
        }]);
      })
      .catch((e) => setMessages([{ id: nextId(), role: 'model', local: true, isError: true, text: e.message }]));
  }, [user.id]);

  const pick = useCallback(async (camera) => {
    try {
      let res;
      if (camera) {
        const perm = await ImagePicker.requestCameraPermissionsAsync();
        if (!perm.granted) return Alert.alert('Camera permission needed', 'Allow camera access in your phone settings, or choose from the gallery.');
        res = await ImagePicker.launchCameraAsync({ quality: 0.5 });
      } else {
        res = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], quality: 0.5 });
      }
      if (res.canceled || !res.assets?.[0]?.uri) return;

      // Shrink the photo so it uploads and processes faster
      const small = await ImageManipulator.manipulateAsync(
        res.assets[0].uri,
        [{ resize: { width: 768 } }],
        { compress: 0.6, base64: true, format: ImageManipulator.SaveFormat.JPEG }
      );
      setImage({ uri: small.uri, base64: small.base64, mimeType: 'image/jpeg' });
    } catch (e) {
      Alert.alert('Could not open photo', e.message);
    }
  }, []);

  const onPhoto = () =>
    Alert.alert('Add a photo of your food', undefined, [
      { text: 'Take photo', onPress: () => pick(true) },
      { text: 'Choose from gallery', onPress: () => pick(false) },
      { text: 'Cancel', style: 'cancel' },
    ]);

  const send = async (override) => {
    const text = (typeof override === 'string' ? override : input).trim();
    if ((!text && !image) || busy || !ctx) return;

    const hasPhoto = !!image;
    const userMsg = { id: nextId(), role: 'user', text, image: image?.uri };
    const history = [...messages, userMsg];
    const attached = hasPhoto ? { mimeType: image.mimeType, data: image.base64 } : undefined;

    setMessages(history);
    setInput('');
    setImage(null);
    setBusy(true);

    const system = buildSystemPrompt(ctx.profile, ctx.goals, ctx.plan, eaten);

    // Photo: meal analysis
    if (hasPhoto) {
      const res = await analyzeMeal({ role: 'user', text: text || 'Estimate the calories in this meal.', image: attached }, system);
      setBusy(false);
      if (!res.ok) return setMessages((m) => [...m, { id: nextId(), role: 'model', isError: true, text: res.error }]);
      if (res.meal.is_food === false) {
        return setMessages((m) => [...m, { id: nextId(), role: 'model', text: res.meal.note || 'I could not see any food there.' }]);
      }
      return setMessages((m) => [...m, { id: nextId(), role: 'model', meal: res.meal }]);
    }

    // Text only: normal chat
    let api = history
      .filter((m) => !m.local && !m.isError)
      .slice(-6)
      .map((m) => ({
        role: m.role,
        text: m.meal ? `Meal analysis: ${m.meal.meal_name}, about ${r(m.meal.total?.calories)} kcal.` : m.text,
      }))
      .filter((m) => m.text);

    // Gemini expects the conversation to start with a user message
    while (api.length && api[0].role !== 'user') api.shift();

    // Merge consecutive messages from the same role
    api = api.reduce((acc, m) => {
      const last = acc[acc.length - 1];
      if (last && last.role === m.role) last.text += '\n' + m.text;
      else acc.push({ ...m });
      return acc;
    }, []);

    const res = await chatWithAI(api, system);
    setBusy(false);
    setMessages((m) => [...m, { id: nextId(), role: 'model', isError: !res.ok, text: res.ok ? res.text : res.error }]);
  };

  const logMeal = async (msg) => {
    const res = await addMeal(user.id, msg.meal);
    if (!res.ok) return Alert.alert('Could not save', res.error);
    setMessages((ms) => ms.map((m) => (m.id === msg.id ? { ...m, logged: true } : m)));
    setEaten((e) => e + r(msg.meal.total?.calories));
  };

  const renderItem = ({ item }) => {
    const mine = item.role === 'user';
    return (
      <View style={[styles.row, mine ? styles.rowMine : styles.rowAi]}>
        <View style={[styles.bubble, mine ? styles.bubbleMine : styles.bubbleAi, item.isError && styles.bubbleErr]}>
          {item.image ? <Image source={{ uri: item.image }} style={styles.photo} /> : null}
          {item.text ? <Text style={[styles.text, mine && { color: colors.white }, item.isError && { color: colors.error }]}>{item.text}</Text> : null}
          {item.meal ? <MealCard meal={item.meal} logged={item.logged} onLog={() => logMeal(item)} /> : null}
        </View>
      </View>
    );
  };

  const left = ctx ? ctx.plan.calories - eaten : 0;

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={10}><Text style={styles.back}>←</Text></Pressable>
        <View style={{ flex: 1 }}>
          <Text style={styles.title}>AI Coach ✨</Text>
          {ctx ? <Text style={styles.sub}>{r(eaten)} / {ctx.plan.calories} kcal today · {r(left)} left</Text> : null}
        </View>
      </View>

      <KeyboardAvoidingView style={{ flex: 1 }} behavior="padding">
        {!ctx && messages.length === 0 ? (
          <View style={styles.center}><ActivityIndicator color={colors.primary} /></View>
        ) : (
          <FlatList
            ref={listRef}
            data={messages}
            keyExtractor={(m) => m.id}
            renderItem={renderItem}
            contentContainerStyle={styles.list}
            onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: true })}
            keyboardShouldPersistTaps="handled"
            ListFooterComponent={
              <View>
                {busy ? (
                  <View style={[styles.row, styles.rowAi]}>
                    <View style={[styles.bubble, styles.bubbleAi, { flexDirection: 'row', alignItems: 'center', gap: 8 }]}>
                      <ActivityIndicator size="small" color={colors.primary} />
                      <Text style={styles.text}>{image ? 'Analyzing your meal…' : 'Thinking…'}</Text>
                    </View>
                  </View>
                ) : null}
                {messages.length <= 1 && ctx ? (
                  <View style={styles.chips}>
                    {SUGGESTIONS.map((s) => (
                      <Pressable key={s} style={styles.chip} onPress={() => send(s)}><Text style={styles.chipText}>{s}</Text></Pressable>
                    ))}
                  </View>
                ) : null}
              </View>
            }
          />
        )}

        {image ? (
          <View style={styles.preview}>
            <Image source={{ uri: image.uri }} style={styles.previewImg} />
            <Text style={styles.previewText}>Photo attached. Add a note (optional) and send.</Text>
            <Pressable onPress={() => setImage(null)} hitSlop={10}><Text style={styles.remove}>✕</Text></Pressable>
          </View>
        ) : null}

        <View style={styles.composer}>
          <Pressable onPress={onPhoto} style={styles.iconBtn} disabled={busy}><Text style={styles.icon}>📷</Text></Pressable>
          <TextInput
            value={input}
            onChangeText={setInput}
            placeholder="Ask anything about nutrition…"
            placeholderTextColor="#9DB3A5"
            style={styles.input}
            multiline
            editable={!busy}
          />
          <Pressable onPress={() => send()} disabled={busy || (!input.trim() && !image)} style={[styles.send, (busy || (!input.trim() && !image)) && { opacity: 0.4 }]}>
            <Text style={styles.sendText}>↑</Text>
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  header: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 16, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: colors.border, backgroundColor: colors.card },
  back: { fontSize: 24, color: colors.primary, fontWeight: '700' },
  title: { fontSize: 18, fontWeight: '800', color: colors.text },
  sub: { fontSize: 12, color: colors.muted, marginTop: 1 },
  list: { padding: 14, paddingBottom: 8 },
  row: { marginBottom: 10, flexDirection: 'row' },
  rowMine: { justifyContent: 'flex-end' },
  rowAi: { justifyContent: 'flex-start' },
  bubble: { maxWidth: '86%', borderRadius: 18, padding: 12 },
  bubbleMine: { backgroundColor: colors.primary, borderBottomRightRadius: 4 },
  bubbleAi: { backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, borderBottomLeftRadius: 4 },
  bubbleErr: { borderColor: colors.error },
  text: { color: colors.text, fontSize: 15, lineHeight: 21 },
  photo: { width: 200, height: 200, borderRadius: 12, marginBottom: 8 },
  meal: { marginTop: 4, minWidth: 230 },
  mealTitle: { fontSize: 16, fontWeight: '800', color: colors.text, marginBottom: 8 },
  itemRow: { flexDirection: 'row', justifyContent: 'space-between', gap: 10, marginBottom: 4 },
  itemName: { flex: 1, color: colors.text, fontSize: 13 },
  itemKcal: { color: colors.muted, fontSize: 13 },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', borderTopWidth: 1, borderTopColor: colors.border, marginTop: 6, paddingTop: 8 },
  totalLabel: { fontWeight: '800', color: colors.text },
  totalKcal: { fontWeight: '800', color: colors.primaryDark },
  macros: { color: colors.muted, fontSize: 12, marginTop: 4 },
  note: { color: colors.text, fontSize: 12, marginTop: 8 },
  logBtn: { backgroundColor: colors.primary, borderRadius: radius.sm, paddingVertical: 10, alignItems: 'center', marginTop: 10 },
  logText: { color: colors.white, fontWeight: '700' },
  estimate: { color: colors.muted, fontSize: 10, marginTop: 6 },
  chips: { marginTop: 8, gap: 8 },
  chip: { alignSelf: 'flex-start', borderWidth: 1.5, borderColor: colors.border, backgroundColor: colors.card, borderRadius: 999, paddingHorizontal: 14, paddingVertical: 9 },
  chipText: { color: colors.primaryDark, fontWeight: '600', fontSize: 13 },
  preview: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 14, paddingVertical: 8, backgroundColor: colors.card, borderTopWidth: 1, borderTopColor: colors.border },
  previewImg: { width: 48, height: 48, borderRadius: 8 },
  previewText: { flex: 1, color: colors.muted, fontSize: 12 },
  remove: { color: colors.error, fontSize: 18, fontWeight: '700' },
  composer: { flexDirection: 'row', alignItems: 'flex-end', gap: 8, padding: 10, backgroundColor: colors.card, borderTopWidth: 1, borderTopColor: colors.border },
  iconBtn: { width: 40, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.bg, borderWidth: 1, borderColor: colors.border },
  icon: { fontSize: 18 },
  input: { flex: 1, maxHeight: 110, minHeight: 44, borderWidth: 1.5, borderColor: colors.border, borderRadius: 22, paddingHorizontal: 14, paddingTop: 11, paddingBottom: 11, fontSize: 15, color: colors.text, backgroundColor: colors.bg },
  send: { width: 44, height: 44, borderRadius: 22, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' },
  sendText: { color: colors.white, fontSize: 22, fontWeight: '800' },
});