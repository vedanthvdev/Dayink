import { useCallback, useEffect, useRef, useState } from 'react';
import { AppState } from 'react-native';
import { playJelly } from '../../audio/playJelly';
import { catalogs, packsForLevel } from '../../domain/catalog';
import { ensureTodaysWord } from '../../domain/ensureTodaysWord';
import { formatLocalDate, msUntilNextLocalMidnight } from '../../domain/localDate';
import type { ShownYearByWordId } from '../../domain/shownYear';
import type { DailyState, Level } from '../../domain/types';
import {
  readDailySnapshot,
  syncShownYears,
  syncWidgetState,
} from '../../native/widgetBridge';
import {
  loadDailyState,
  loadLevel,
  loadShownYearByWordId,
  saveDailyState,
  saveLevel,
  saveShownYearByWordId,
} from '../../storage/appPreferences';
import {
  mergeDailyStates,
  randomInt,
  snapshotToState,
} from './homeHelpers';

type Args = {
  onShownChange: (shown: ShownYearByWordId) => void;
};

export function useHomeDaily({ onShownChange }: Args) {
  const [ready, setReady] = useState(false);
  const [level, setLevel] = useState<Level | null>(null);
  const [today, setToday] = useState<DailyState | null>(null);
  const [shown, setShown] = useState<ShownYearByWordId>({});
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const localDateRef = useRef(formatLocalDate(new Date()));
  const opGenRef = useRef(0);
  const levelRef = useRef<Level | null>(null);
  const todayRef = useRef<DailyState | null>(null);
  const shownRef = useRef<ShownYearByWordId>({});

  useEffect(() => {
    levelRef.current = level;
  }, [level]);
  useEffect(() => {
    todayRef.current = today;
  }, [today]);
  useEffect(() => {
    shownRef.current = shown;
    onShownChange(shown);
  }, [shown, onShownChange]);

  const bootstrap = useCallback(async (opts?: { quiet?: boolean }) => {
    const gen = ++opGenRef.current;
    try {
      const [savedLevel, savedState, nativeSnapshot, savedShown] = await Promise.all([
        loadLevel(),
        loadDailyState(),
        readDailySnapshot(),
        loadShownYearByWordId(),
      ]);
      if (gen !== opGenRef.current) return;

      const todayStr = formatLocalDate(new Date());
      localDateRef.current = todayStr;
      const nativeToday =
        nativeSnapshot && nativeSnapshot.localDate === todayStr
          ? snapshotToState(nativeSnapshot)
          : null;
      const savedToday = savedState?.localDate === todayStr ? savedState : null;
      const prior =
        mergeDailyStates(savedToday, nativeToday) ?? savedState ?? nativeToday;
      // Only an explicit saved preference unlocks a day; widgets must not choose for the user.
      const preference = savedLevel;

      if (!preference) {
        setLevel(null);
        setToday(null);
        setShown(savedShown);
        setError(null);
        return;
      }

      const next = ensureTodaysWord({
        level: preference,
        catalog: catalogs,
        packs: packsForLevel(preference),
        shownYearByWordId: savedShown,
        state: prior,
        now: new Date(),
        randomInt,
      });
      await Promise.all([
        saveDailyState(next.state),
        saveLevel(preference),
        saveShownYearByWordId(next.shownYearByWordId),
        syncShownYears(next.shownYearByWordId),
        syncWidgetState({ state: next.state, level: preference, reload: true }),
      ]);
      if (gen !== opGenRef.current) return;
      setLevel(preference);
      setToday(next.state);
      setShown(next.shownYearByWordId);
      setError(null);
    } catch {
      if (gen !== opGenRef.current) return;
      if (!opts?.quiet) {
        setError('Couldn’t load today’s word. Try choosing a level again.');
      }
      // Keep last good in-memory history; never wipe on quiet overnight refresh.
    } finally {
      if (gen === opGenRef.current) {
        setReady(true);
      }
    }
  }, []);

  useEffect(() => {
    void bootstrap();
  }, [bootstrap]);

  useEffect(() => {
    const refreshIfNewDay = () => {
      const nowDate = formatLocalDate(new Date());
      if (nowDate !== localDateRef.current) {
        void bootstrap({ quiet: true });
      }
    };

    const sub = AppState.addEventListener('change', (state) => {
      if (state === 'active') refreshIfNewDay();
    });

    let timer: ReturnType<typeof setTimeout> | undefined;
    const scheduleMidnight = () => {
      timer = setTimeout(() => {
        refreshIfNewDay();
        scheduleMidnight();
      }, msUntilNextLocalMidnight());
    };
    scheduleMidnight();

    return () => {
      sub.remove();
      if (timer) clearTimeout(timer);
    };
  }, [bootstrap]);

  const onSelect = useCallback(
    async (nextLevel: Level) => {
      if (busy) return;
      const gen = ++opGenRef.current;
      const snapshot = {
        level: levelRef.current,
        today: todayRef.current,
        shown: shownRef.current,
      };
      setBusy(true);
      setError(null);
      try {
        const [prior, savedShown] = await Promise.all([
          loadDailyState(),
          loadShownYearByWordId(),
        ]);
        if (gen !== opGenRef.current) return;
        const rolled = ensureTodaysWord({
          level: nextLevel,
          catalog: catalogs,
          packs: packsForLevel(nextLevel),
          shownYearByWordId: savedShown,
          state: prior,
          now: new Date(),
          randomInt,
        });
        await Promise.all([
          saveLevel(nextLevel),
          saveDailyState(rolled.state),
          saveShownYearByWordId(rolled.shownYearByWordId),
          syncShownYears(rolled.shownYearByWordId),
          syncWidgetState({
            state: rolled.state,
            level: nextLevel,
            reload: true,
          }),
        ]);
        if (gen !== opGenRef.current) return;
        const levelChanged = snapshot.level !== nextLevel;
        setLevel(nextLevel);
        setToday(rolled.state);
        setShown(rolled.shownYearByWordId);
        if (levelChanged) {
          void playJelly();
        }
      } catch {
        if (gen !== opGenRef.current) return;
        setLevel(snapshot.level);
        setToday(snapshot.today);
        setShown(snapshot.shown);
        setError('Couldn’t lock today’s word. Please try again.');
      } finally {
        if (gen === opGenRef.current) {
          setBusy(false);
        }
      }
    },
    [busy],
  );

  return {
    ready,
    level,
    today,
    busy,
    error,
    onSelect,
  };
}
