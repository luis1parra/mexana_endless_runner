'use client';

import { useEffect, useMemo, useState } from "react";
import Image, { type StaticImageData } from "next/image";
import { Header } from "../components/layout/Header";
import { Footer } from "../components/layout/Footer";
import { api, type RankingEntry } from "../../services/api";
import boy from "../../assets/images/rankingman.png";
import girl from "../../assets/images/rankingwoman.png";

type LeaderBoardEntry = {
  position: number;
  name: string;
  score: number;
  avatar: "H" | "M";
  progress: number;
};

const fallbackRanking: LeaderBoardEntry[] = [
  { position: 1, name: "Ronald77", score: 10000, avatar: "H", progress: 0.95 },
  { position: 2, name: "Rositann", score: 9000, avatar: "M", progress: 0.86 },
  { position: 3, name: "JJcamelo", score: 8000, avatar: "H", progress: 0.74 },
  { position: 4, name: "Lolak982", score: 7000, avatar: "M", progress: 0.62 },
];

const badgeColors: Record<LeaderBoardEntry["avatar"], StaticImageData> = {
  H: boy,
  M: girl,
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
      const rawAvatar =
        typeof entry.avatar === "string" ? entry.avatar.trim().toUpperCase() : null;
      const normalizedAvatar: LeaderBoardEntry["avatar"] =
        rawAvatar === "M" || rawAvatar === "H"
          ? rawAvatar
          : entry.selected
            ? "M"
            : "H";

      return {
        position: entry.posicion ?? index + 1,
        name: entry.nickname ?? `Jugador ${index + 1}`,
        score: normalizedScore,
        avatar: normalizedAvatar,
        progress,
      };
    });
  }, [hasRanking, ranking]);

  const leftRanking = uiRanking.slice(0, 3);
  const rightRanking = hasRanking ? uiRanking : fallbackRanking;

  return (
    <div className="flex min-h-screen flex-col bg-white text-[#0B1E52]">
      <main className="flex mx-auto w-full flex-1 px-2 py-6 lg:px-10 lg:py-16">
        <section className="w-full h-[calc(110vw*(1750/662))] lg:h-auto rounded-[24px] bg-[url('../assets/images/rankingbackground_mobile.png')] bg-cover bg-center bg-no-repeat px-3 py-12 pt-2 text-white lg:bg-[url('../assets/images/gamedinamicbackground.png')] md:px-8 lg:rounded-[48px] lg:px-12">

          <Header
            activeHref="/ranking"
          />

          {error && (
            <div className="mt-6 rounded-xl bg-white/10 px-4 py-3 text-sm font-semibold text-[#FFD2D2]">
              {error}
            </div>
          )}

          <div className="relative mt-8">
            <div>
              <h3 className="text-[20px] font-bold text-white/90 md:text-[22px]">
                Ranking jugadores
              </h3>
              <h1 className="mt-2 text-[32px] font-extrabold italic leading-[1.04] tracking-tight text-white drop-shadow-md md:text-[52px]">
                Clasificación de Jugadores
              </h1>
            </div>

            <div className="flex flex-col lg:flex-row">
              <div className="mt-4 flex-1 flex-col mx-1 lg:flex-3 lg:mx-5">
                {leftRanking.map((player) => (
                  <div
                    key={player.position}
                    className="flex items-center gap-1 px-0 py-4 lg:gap-4 lg:px-5"
                  >
                    <div className="flex h-14 w-8 lg:w-14 items-center justify-center text-3xl font-extrabold text-white">
                      {player.position}
                    </div>
                    <div className="relative h-20 w-20 overflow-visible">
                      <span className="absolute -top-4 left-1/2 z-20 -translate-x-1/2">
                        <svg width="23" height="22" viewBox="0 0 23 22" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path 
                            d="M11.0578 17.6958L5.69738 20.925C5.46058 21.0757 5.21301 21.1403 4.95467 21.1187C4.69634 21.0972 4.4703 21.0111 4.27655 20.8604C4.0828 20.7097 3.9321 20.5216 3.82446 20.296C3.71683 20.0703 3.6953 19.8172 3.75988 19.5365L5.18071 13.4333L0.43384 9.33229C0.218562 9.13854 0.0842284 8.91767 0.0308396 8.66967C-0.0225493 8.42167 -0.00661884 8.1797 0.0786311 7.94375C0.163881 7.70781 0.293048 7.51406 0.466131 7.3625C0.639214 7.21094 0.87602 7.11407 1.17655 7.07188L7.44113 6.52292L9.863 0.775C9.97064 0.516667 10.1377 0.322916 10.3642 0.19375C10.5906 0.0645831 10.8219 0 11.0578 0C11.2937 0 11.5249 0.0645831 11.7514 0.19375C11.9779 0.322916 12.1449 0.516667 12.2526 0.775L14.6745 6.52292L20.939 7.07188C21.2404 7.11493 21.4772 7.2118 21.6495 7.3625C21.8217 7.51319 21.9508 7.70694 22.037 7.94375C22.1231 8.18056 22.1394 8.42296 22.086 8.67096C22.0327 8.91896 21.8979 9.1394 21.6818 9.33229L16.9349 13.4333L18.3557 19.5365C18.4203 19.8163 18.3988 20.0695 18.2911 20.296C18.1835 20.5224 18.0328 20.7106 17.839 20.8604C17.6453 21.0102 17.4193 21.0964 17.1609 21.1187C16.9026 21.1411 16.655 21.0766 16.4182 20.925L11.0578 17.6958Z" 
                            fill="#FFE000"/>
                        </svg>
                      </span>
                      <div className="absolute overflow-hidden">
                        <Image
                          src={badgeColors[player.avatar] || badgeColors["H"]}
                          alt="Avatar"
                          className="h-full w-full object-cover"
                        />
                      </div>
                    </div>
                    <div className="flex flex-1 flex-col">
                      <span className="text-xs font-semibold text-white">
                        {player.name}
                      </span>
                      <div className="mt-2 h-7 w-full overflow-hidden rounded-[5px] border-x-8 border-y-3 border-[var(--cpbarborder)] bg-[var(--cpbarback)]">
                        <div
                          className="h-full rounded-r-[5px] bg-[var(--cpbarfill)]"
                          style={{ width: `${Math.min(player.progress * 100, 100)}%` }}
                        />
                      </div>
                      <div className="text-2xl ml-3 font-extrabold italic text-white">
                        {player.score.toLocaleString("es-CO", {
                          minimumFractionDigits: 0,
                        })}
                      </div>
                    </div>
                    
                  </div>
                ))}
              </div>
              <br/>
            
              <div className="mt-4  flex-1 flex-col mx-0 lg:flex-5 lg:mx-5">
                <div className="relative w-full overflow-hidden rounded-[30px] lg:rounded-[36px] bg-white/40 px-4 py-2 text-[var(--cpdblue)] shadow-[0_25px_45px_rgba(15,31,91,0.35)] backdrop-blur-xs lg:px-6">
                  <div className="absolute inset-3 rounded-[38px] bg-white/70 blur-3xl" />
                  <div className="relative z-1">
                    <div className="my-4 max-h-100 space-y-3 overflow-y-auto scrollbar-custom pr-2">
                      {rightRanking.map((player) => {
                        const avatarSrc = badgeColors[player.avatar] || badgeColors["H"];
                        return (
                          <div
                            key={`table-${player.position}`}
                            className="grid grid-cols-[18px_50px_minmax(0,1fr)_80px] lg:grid-cols-[50px_80px_minmax(0,1fr)_120px] items-center gap-2 lg:gap-3 rounded-[28px] bg-white/0 px-0 py-3 lg:px-6"
                          >
                            <div className="text-xl font-extrabold lg:text-2xl">
                              {player.position}
                            </div>
                            <div className="relative h-14 w-14 lg:h-18 lg:w-18">
                              <Image
                                src={avatarSrc}
                                alt={`Avatar ${player.name}`}
                                className="h-full w-full object-cover"
                              />
                            </div>
                            <div className="truncate text-[15px] text-center font-bold lg:text-[17px]">
                              {player.name}
                            </div>
                            <div className="text-right text-[15px] font-extrabold italic lg:text-[17px]">
                              {player.score.toLocaleString("es-CO", {
                                minimumFractionDigits: 0,
                              })}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* <div className="absolute bottom-6 right-8 hidden flex-col rounded-xl bg-white px-5 py-3 text-xs text-[#495784] shadow-lg sm:flex">
            <span className="font-semibold text-[#0F1F5B]">reCAPTCHA</span>
            <span>Privacidad - Condiciones</span>
          </div> */}
        </section>
      </main>
      <Footer />
    </div>
  );
}
