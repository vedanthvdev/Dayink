import { StyleSheet } from 'react-native';
import { fonts } from '../../theme/typography';

export const quizStyles = StyleSheet.create({
  gradient: { flex: 1 },
  safe: { flex: 1, backgroundColor: 'transparent' },
  centered: { alignItems: 'center', justifyContent: 'center' },
  inner: {
    flexGrow: 1,
    paddingHorizontal: 22,
    paddingTop: 16,
    paddingBottom: 36,
  },
  back: {
    fontSize: 15,
    fontFamily: fonts.bodySemi,
    marginBottom: 18,
  },
  title: {
    fontSize: 40,
    fontFamily: fonts.display,
    letterSpacing: -1,
  },
  subtitle: {
    marginTop: 8,
    fontSize: 16,
    lineHeight: 24,
    fontFamily: fonts.body,
  },
  meter: {
    marginTop: 22,
    borderRadius: 18,
    borderWidth: 1,
    padding: 16,
  },
  meterTitle: {
    fontSize: 16,
    fontFamily: fonts.bodySemi,
  },
  meterBody: {
    marginTop: 6,
    fontSize: 14,
    fontFamily: fonts.body,
  },
  meterStrong: {
    marginTop: 4,
    fontSize: 15,
    fontFamily: fonts.bodySemi,
  },
  pausedCard: {
    marginTop: 16,
    borderRadius: 18,
    borderWidth: 1.5,
    padding: 16,
  },
  sectionLabel: {
    marginTop: 22,
    marginBottom: 10,
    fontSize: 13,
    letterSpacing: 0.4,
    textTransform: 'uppercase',
    fontFamily: fonts.bodySemi,
  },
  rowGap: { gap: 10 },
  choiceCard: {
    borderRadius: 16,
    borderWidth: 1.5,
    padding: 16,
  },
  choiceTitle: {
    fontSize: 17,
    fontFamily: fonts.body,
  },
  choiceBody: {
    marginTop: 4,
    fontSize: 14,
    lineHeight: 20,
    fontFamily: fonts.body,
  },
  levelRow: { gap: 8 },
  levelChip: {
    borderRadius: 14,
    borderWidth: 1.5,
    paddingVertical: 12,
    paddingHorizontal: 14,
  },
  levelChipText: {
    fontSize: 15,
    fontFamily: fonts.bodySemi,
    textAlign: 'center',
  },
  error: {
    marginTop: 14,
    fontSize: 14,
    lineHeight: 20,
    fontFamily: fonts.body,
  },
  limitNote: {
    marginTop: 14,
    fontSize: 14,
    lineHeight: 20,
    fontFamily: fonts.body,
  },
  primaryButton: {
    marginTop: 22,
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: 'center',
  },
  primaryButtonText: {
    fontSize: 16,
    fontFamily: fonts.bodySemi,
  },
  secondaryButton: {
    paddingVertical: 12,
    alignItems: 'center',
  },
  secondaryButtonText: {
    fontSize: 15,
    fontFamily: fonts.bodySemi,
  },
  progressRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  progress: {
    fontSize: 14,
    fontFamily: fonts.bodySemi,
  },
  link: {
    fontSize: 14,
    fontFamily: fonts.bodySemi,
  },
  card: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 18,
  },
  reportCard: {
    marginTop: 28,
    borderRadius: 22,
    borderWidth: 1,
    paddingVertical: 28,
    paddingHorizontal: 24,
    gap: 22,
  },
  reportEyebrow: {
    fontSize: 12,
    letterSpacing: 1.4,
    textTransform: 'uppercase',
    fontFamily: fonts.bodySemi,
    marginBottom: 4,
  },
  reportBlock: {
    gap: 8,
  },
  reportSplit: {
    flexDirection: 'row',
    gap: 24,
  },
  reportHalf: {
    flex: 1,
    gap: 8,
  },
  reportLabel: {
    fontSize: 13,
    letterSpacing: 0.6,
    textTransform: 'uppercase',
    fontFamily: fonts.bodySemi,
  },
  reportScore: {
    fontSize: 40,
    fontFamily: fonts.display,
    letterSpacing: -1,
  },
  reportValue: {
    fontSize: 20,
    fontFamily: fonts.body,
  },
  reportNote: {
    marginTop: 6,
    fontSize: 15,
    lineHeight: 22,
    fontFamily: fonts.body,
  },
  definition: {
    fontSize: 17,
    lineHeight: 25,
    fontFamily: fonts.bodySemi,
  },
  choices: { marginTop: 18, gap: 10 },
  answer: {
    borderRadius: 14,
    borderWidth: 1.5,
    paddingVertical: 12,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  answerLabel: {
    fontSize: 14,
    fontFamily: fonts.body,
    width: 22,
  },
  answerWord: {
    flex: 1,
    fontSize: 17,
    fontFamily: fonts.body,
  },
  feedbackBox: { marginTop: 18 },
  feedbackOk: {
    fontSize: 17,
    fontFamily: fonts.bodySemi,
    marginBottom: 10,
  },
  feedbackBad: {
    fontSize: 17,
    fontFamily: fonts.bodySemi,
  },
  feedbackCorrect: {
    marginTop: 6,
    marginBottom: 10,
    fontSize: 15,
    lineHeight: 22,
    fontFamily: fonts.body,
  },
  reviewNav: {
    marginTop: 18,
    flexDirection: 'row',
    gap: 10,
  },
  reviewNavButton: {
    flex: 1,
    borderRadius: 16,
    borderWidth: 1.5,
    paddingVertical: 14,
    alignItems: 'center',
  },
});
