import { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import Screen from '../../components/Screen';
import Input from '../../components/Input';
import Button from '../../components/Button';
import { colors, radius } from '../../constants/theme';
import { useAuth } from '../../context/AuthContext';
import { getOnboardingData } from '../../services/onboardingService';
import { askGemini, buildMealPlanPrompt, buildQuestionPrompt } from '../../services/geminiService';
import { calcPlan } from '../../utils/nutrition';

export default function AiPlan() {
  const router = useRouter();
  const { user } = useAuth();
  const [ctx, setCtx] = useState(null);
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState('');

  useEffect(() => {
    getOnboardingData(user.id)
      .then(({ profile, goals }) => profile && goals && setCtx({ profile, goals, plan: calcPlan(profile, goals) }))
      .catch((e) => setError(e.message));
  }, [user.id]);

  const run = async (kind, prompt) => {
    setBusy(kind);
    setError('');
    setAnswer('');
    const res = await askGemini(prompt);
    setBusy('');
    if (res.ok) setAnswer(res.text);
    else setError(res.error);
  };

  const onPlan = () => run('plan', buildMealPlanPrompt(ctx.profile, ctx.goals, ctx.plan));
  const onAsk = () => {
    if (!question.trim()) return setError('Type a question first.');
    run('ask', buildQuestionPrompt(question.trim(), ctx.profile, ctx.goals, ctx.plan));
  };

  return (
    <Screen>
      <Pressable onPress={() => router.back()}><Text style={styles.back}>← Back</Text></Pressable>
      <Text style={styles.title}>AI Coach ✨</Text>
      <Text style={styles.sub}>Powered by Gemini, personalized to your goals and allergies.</Text>

      {!ctx && !error ? <ActivityIndicator color={colors.primary} /> : null}

      {ctx ? (
        <>
          <Button title="Generate today's meal plan" onPress={onPlan} loading={busy === 'plan'} disabled={!!busy} />

          <Text style={styles.or}>or ask a question</Text>
          <Input value={question} onChangeText={setQuestion} placeholder="e.g. High-protein snack ideas?" autoCapitalize="sentences" multiline style={{ height: 80, paddingTop: 12, textAlignVertical: 'top' }} />
          <Button title="Ask" variant="outline" onPress={onAsk} loading={busy === 'ask'} disabled={!!busy} />
        </>
      ) : null}

      {error ? <Text style={styles.error}>{error}</Text> : null}
      {answer ? (
        <View style={styles.card}>
          <Text style={styles.answer}>{answer}</Text>
          <Text style={styles.note}>AI suggestions are not medical advice.</Text>
        </View>
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  back: { color: colors.primary, fontWeight: '700', marginBottom: 12 },
  title: { fontSize: 28, fontWeight: '800', color: colors.text },
  sub: { color: colors.muted, marginTop: 6, marginBottom: 22 },
  or: { textAlign: 'center', color: colors.muted, marginVertical: 16 },
  error: { color: colors.error, marginTop: 14 },
  card: { backgroundColor: colors.card, borderRadius: radius.lg, padding: 18, marginTop: 18, borderWidth: 1, borderColor: colors.border },
  answer: { color: colors.text, lineHeight: 22 },
  note: { color: colors.muted, fontSize: 11, marginTop: 12 },
});
