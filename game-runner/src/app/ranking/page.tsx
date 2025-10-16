'use client';

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { Header } from "../components/layout/Header";
import { Footer } from "../components/layout/Footer";
import homeBackground from "../../assets/images/homebackground.png";
import { api, type RankingEntry } from "../../services/api";

type LeaderBoardEntry = {
  position: number;
  name: string;
  score: number;
  avatar: "boy" | "girl";
  progress: number;
};

const fallbackRanking: LeaderBoardEntry[] = [
  { position: 1, name: "Ronald77", score: 10000, avatar: "boy", progress: 0.95 },
  { position: 2, name: "Rositann", score: 9000, avatar: "girl", progress: 0.86 },
  { position: 3, name: "JJcamelo", score: 8000, avatar: "boy", progress: 0.74 },
  { position: 4, name: "Lolak982", score: 7000, avatar: "girl", progress: 0.62 },
];

const badgeColors: Record<LeaderBoardEntry["avatar"], string> = {
  boy: "from-[#3C6BFF] to-[#2644C4]",
  girl: "from-[#F36AAE] to-[#D44487]",
};

export default function RankingPage() {
  const [ranking, setRanking] = useState<RankingEntry[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isCancelled = false;

    const loadRanking = async () => {
      try {
        setError(null);
        let idUser: string | number | undefined;

        try {
          const rawSession = window.localStorage.getItem("session");
          if (rawSession) {
            const parsed = JSON.parse(rawSession) as { id_user_game?: string | number };
            if (parsed?.id_user_game !== undefined && parsed.id_user_game !== null) {
              idUser = parsed.id_user_game;
            }
          }
        } catch {
          // Ignoramos errores de parsing/lectura del storage
        }

        const response = await api.fetchRanking({ n: 10, id_user_game: idUser });
        if (!isCancelled) {
          setRanking(response?.ranking ?? []);
        }
      } catch (err) {
        if (!isCancelled) {
          setError(
            err instanceof Error ? err.message : "No fue posible obtener el ranking.",
          );
        }
      }
    };

    loadRanking();

    return () => {
      isCancelled = true;
    };
  }, []);

  const hasRanking = ranking.length > 0;

  const uiRanking = useMemo<LeaderBoardEntry[]>(() => {
    if (!hasRanking) {
      return fallbackRanking;
    }

    const maxScore = ranking.reduce(
      (max, entry) => Math.max(max, entry.sumatoria ?? 0),
      0,
    );

    const sorted = [...ranking].sort((a, b) => {
      const posA = typeof a.posicion === "number" ? a.posicion : Number.POSITIVE_INFINITY;
      const posB = typeof b.posicion === "number" ? b.posicion : Number.POSITIVE_INFINITY;
      return posA - posB;
    });

    return sorted.map((entry, index) => {
      const normalizedScore = typeof entry.sumatoria === "number" ? entry.sumatoria : 0;
      const progress =
        maxScore > 0 ? Math.min(Math.max(normalizedScore / maxScore, 0), 1) : 0;

      return {
        position: entry.posicion ?? index + 1,
        name: entry.nickname ?? `Jugador ${index + 1}`,
        score: normalizedScore,
        avatar: entry.selected ? "girl" : "boy",
        progress,
      };
    });
  }, [hasRanking, ranking]);

  const leftRanking = uiRanking.slice(0, 3);
  const rightRanking = hasRanking ? uiRanking : fallbackRanking;

  return (
    <div className="flex min-h-screen flex-col bg-[#E6F1FF] text-[#0B1E52]">
      <main className="mx-auto w-full max-w-[1200px] flex-1 px-6 py-12 lg:px-10 lg:py-16">
        <section className="relative overflow-hidden rounded-[48px] bg-gradient-to-r from-[#1A2798] via-[#2F4DD7] to-[#4065FF] px-8 py-12 text-white shadow-[0_30px_60px_rgba(25,53,140,0.28)] md:px-12 lg:px-16">
          <div className="pointer-events-none absolute -left-28 top-24 h-64 w-64 rounded-full bg-white/15 blur-3xl" />
          <div className="pointer-events-none absolute -right-28 -top-24 h-80 w-80 rounded-full bg-[#6AA4FF]/40 blur-3xl" />
          <div className="pointer-events-none absolute right-28 bottom-24 h-48 w-48 rounded-full bg-[#9FC0FF]/30 blur-2xl" />
          <Header activeHref="/ranking" registerHref="#" loginHref="#" />

          {error && (
            <div className="mt-6 rounded-xl bg-white/10 px-4 py-3 text-sm font-semibold text-[#FFD2D2]">
              {error}
            </div>
          )}

          <div className="relative mt-14 grid gap-12 lg:grid-cols-[minmax(0,540px)_minmax(0,360px)]">
            <div>
              <p className="text-lg font-semibold text-white/80">
                Ranking jugadores
              </p>
              <h1 className="mt-2 text-[52px] font-black leading-[1.05] tracking-tight text-white drop-shadow-md md:text-[64px]">
                Clasificacion de Jugadores
              </h1>
              <div className="mt-10 flex flex-col gap-6">
                {leftRanking.map((player) => (
                  <div
                    key={player.position}
                    className="flex items-center gap-4 rounded-[32px] bg-white/10 px-5 py-4 backdrop-blur-sm"
                  >
                    <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-[#FFD86F] to-[#FFAE34] text-2xl font-bold text-[#0B1E52] shadow-[0_6px_12px_rgba(0,0,0,0.15)]">
                      {player.position}
                    </div>
                    <div className="relative h-16 w-16 overflow-hidden rounded-[20px] bg-gradient-to-br from-white/40 to-white/10">
                      <div
                        className={`absolute inset-1 rounded-[16px] bg-gradient-to-br ${badgeColors[player.avatar]} shadow-[0_8px_12px_rgba(21,58,173,0.35)]`}
                      />
                    </div>
                    <div className="flex-1">
                      <div className="text-lg font-semibold text-white">
                        {player.name}
                      </div>
                      <div className="mt-2 h-4 w-full overflow-hidden rounded-full bg-white/20">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-[#7CF3A8] to-[#2DD572]"
                          style={{ width: `${Math.min(player.progress * 100, 100)}%` }}
                        />
                      </div>
                    </div>
                    <div className="text-2xl font-black text-white">
                      {player.score.toLocaleString("es-CO", {
                        minimumFractionDigits: 0,
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="flex flex-col gap-10">
              <div className="relative overflow-hidden rounded-[36px] shadow-[0_25px_45px_rgba(25,53,140,0.35)]">
                <Image
                  src={homeBackground}
                  alt="Jugadores celebrando la frescura Mexsana"
                  className="h-auto w-full object-cover"
                  sizes="(max-width: 1024px) 100vw, 360px"
                />
              </div>
              <div className="relative overflow-hidden rounded-[40px] bg-white/15 px-6 py-8 text-[#11308F] shadow-[0_20px_40px_rgba(12,35,106,0.35)] backdrop-blur">
                <div className="absolute inset-4 rounded-[36px] bg-white/30 blur-3xl" />
                <div className="relative z-10 space-y-4">
                  {rightRanking.map((player) => (
                    <div
                      key={player.position}
                      className="flex items-center justify-between gap-3 rounded-[24px] bg-white/80 px-4 py-3 text-sm font-semibold text-[#11308F] shadow-[0_12px_24px_rgba(17,48,143,0.25)]"
                    >
                      <span className="text-lg font-bold">{player.position}</span>
                      <div className="flex items-center gap-3">
                        <div className="relative h-12 w-12 overflow-hidden rounded-[16px] bg-gradient-to-br from-white/40 to-white/10">
                          <div
                            className={`absolute inset-1 rounded-[12px] bg-gradient-to-br ${badgeColors[player.avatar]} shadow-[0_8px_12px_rgba(21,58,173,0.35)]`}
                          />
                        </div>
                        <span>{player.name}</span>
                      </div>
                      <span className="text-lg font-bold">
                        {player.score.toLocaleString("es-CO", {
                          minimumFractionDigits: 0,
                        })}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="absolute bottom-6 right-8 hidden flex-col rounded-xl bg-white px-5 py-3 text-xs text-[#495784] shadow-lg sm:flex">
            <span className="font-semibold text-[#0F1F5B]">reCAPTCHA</span>
            <span>Privacidad - Condiciones</span>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}

