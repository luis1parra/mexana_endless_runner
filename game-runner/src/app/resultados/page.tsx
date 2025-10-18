'use client';

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import rankingMan from "@/assets/images/rankingman.png";
import rankingWoman from "@/assets/images/rankingwoman.png";
import { LoginModal } from "@/components/modals/LoginModal";
import { api, type LastScoreEntry, type LastScoreResponse } from "@/services/api";

type SessionSnapshot = {
  idUserGame?: string;
  idFactura?: string;
  nickname?: string;
};

type ScoreViewModel = {
  nickname: string;
  avatar: "H" | "M";
  score: number | null;
  record: number | null;
  position: number | null;
};

const avatarImages: Record<ScoreViewModel["avatar"], { image: typeof rankingMan; alt: string }> = {
  H: { image: rankingMan, alt: "Avatar masculino de Mexsana" },
  M: { image: rankingWoman, alt: "Avatar femenino de Mexsana" },
};

const defaultScore: ScoreViewModel = {
  nickname: "Jugador Mexsana",
  avatar: "H",
  score: null,
  record: null,
  position: null,
};

const sanitizeNumber = (value: unknown): number | null => {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }
  if (typeof value === "string") {
    const normalized = value.replace(/\./g, "").replace(/,/g, ".");
    const parsed = Number.parseFloat(normalized);
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
};

const sanitizeAvatar = (value: unknown): ScoreViewModel["avatar"] => {
  return value === "M" ? "M" : "H";
};

const sanitizeNickname = (...candidates: Array<unknown>): string => {
  for (const candidate of candidates) {
    if (typeof candidate === "string" && candidate.trim().length > 0) {
      return candidate.trim();
    }
  }
  return defaultScore.nickname;
};

const extractEntry = (response: LastScoreResponse | null | undefined): LastScoreEntry | null => {
  if (!response) {
    return null;
  }
  if (response.last_score && typeof response.last_score === "object") {
    return response.last_score;
  }
  if (response.data && typeof response.data === "object") {
    return response.data;
  }
  return response;
};

export default function ResultadosPage() {
  const [score, setScore] = useState<ScoreViewModel>(defaultScore);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isLoginOpen, setIsLoginOpen] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    let isSubscribed = true;

    const loadScore = async () => {
      let storedSession: SessionSnapshot = {};
      try {
        setIsLoading(true);
        setError(null);

        try {
          const rawSession = window.localStorage.getItem("session");
          if (rawSession) {
            const parsed = JSON.parse(rawSession) as {
              id_user_game?: string | number;
              id_factura?: string | number;
              nickname?: string;
            };
            storedSession = {
              idUserGame:
                parsed?.id_user_game !== undefined && parsed.id_user_game !== null
                  ? String(parsed.id_user_game)
                  : undefined,
              idFactura:
                parsed?.id_factura !== undefined && parsed.id_factura !== null
                  ? String(parsed.id_factura)
                  : undefined,
              nickname: typeof parsed?.nickname === "string" ? parsed.nickname : undefined,
            };
          }
        } catch {
          storedSession = {};
        }

        if (!isSubscribed) return;

        if (!storedSession.idUserGame && !storedSession.idFactura) {
          setScore((prev) => ({
            ...prev,
            nickname: sanitizeNickname(storedSession.nickname),
          }));
          setError(
            "No encontramos informacion de tu ultima partida. Vuelve a iniciar sesion para jugar.",
          );
          setIsLoading(false);
          return;
        }

        const response = await api.fetchLastScore({
          id_user_game: storedSession.idUserGame ?? undefined,
        });
        if (!isSubscribed) return;

        const entry = extractEntry(response);
        const sanitizedScore: ScoreViewModel = {
          nickname: sanitizeNickname(entry?.nickname, storedSession.nickname),
          avatar: sanitizeAvatar(entry?.avatar),
          score: sanitizeNumber(entry?.sumatoria),
          record: sanitizeNumber(entry?.puntaje),
          position: sanitizeNumber(entry?.posicion),
        };
        setScore(sanitizedScore);
      } catch (err) {
        if (!isSubscribed) return;
        setError(
          err instanceof Error
            ? err.message
            : "No fue posible obtener los resultados de tu ultima partida.",
        );
        setScore((prev) => ({
          ...prev,
          nickname: sanitizeNickname(prev.nickname, storedSession.nickname),
        }));
      } finally {
        if (isSubscribed) {
          setIsLoading(false);
        }
      }
    };

    loadScore();

    return () => {
      isSubscribed = false;
    };
  }, []);

  const avatarAsset = useMemo(() => avatarImages[score.avatar], [score.avatar]);

  const formatPoints = (value: number | null, options?: { signed?: boolean }) => {
    if (value === null) {
      return "--";
    }
    const formatted = Math.abs(value).toLocaleString("es-CO", {
      minimumFractionDigits: 0,
    });
    if (!options?.signed) {
      return formatted;
    }
    if (value > 0) return `+${formatted}`;
    if (value < 0) return `-${formatted}`;
    return formatted;
  };

  return (
    <div className="flex min-h-screen flex-col bg-[#4FA6FF] text-white">
      <main className="mx-auto flex w-full flex-1 items-center justify-center px-6 py-12">
        <section className="w-full max-w-[1100px] rounded-[48px] bg-[#64B6FF] px-6 py-10 shadow-[0_40px_90px_rgba(14,73,178,0.35)] md:px-10 lg:px-16">
          <div className="grid gap-10 lg:grid-cols-[minmax(0,360px)_minmax(0,1fr)] lg:items-center">
            <div className="flex flex-col items-center gap-8">
              <div className="w-full overflow-hidden bg-[#2963F0] p-6 shadow-[0_25px_45px_rgba(13,59,168,0.4)]">
                <div className="relative aspect-square w-full overflow-hidden bg-white/10">
                  <Image
                    src={avatarAsset.image}
                    alt={avatarAsset.alt}
                    className="h-full w-full object-cover"
                    sizes="(max-width: 1024px) 100vw, 360px"
                    priority
                  />
                </div>
              </div>
              <div className="flex flex-col items-center">
                <div className="rounded-[24px] bg-[#1D4CD8] px-8 py-3 text-center shadow-[0_18px_32px_rgba(16,60,173,0.35)]">
                  <div className="text-3xl font-black leading-none">
                    {score.position !== null ? score.position : "--"}
                  </div>
                  <div className="mt-1 text-sm font-semibold uppercase tracking-[0.22em] text-white/85">
                    Puesto
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-8">
              <div>
                <p className="text-xl font-bold text-white/85 md:text-2xl">{score.nickname}</p>
                <h1 className="mt-2 text-[52px] font-black italic leading-[1] text-[#1B3BD7] drop-shadow-[0_10px_25px_rgba(19,55,180,0.35)] md:text-[64px]">
                  Tus resultados
                </h1>
              </div>

              <div className="flex flex-col gap-6">
                <div className="rounded-[36px] bg-[#234DDC] px-6 py-6 shadow-[0_22px_44px_rgba(15,65,184,0.35)] sm:px-8">
                  <div className="text-lg font-semibold uppercase tracking-wide text-white/90">
                    Puntuacion
                  </div>
                  <div className="mt-4 rounded-full bg-[#FFD730] px-6 py-3 text-center text-3xl font-black text-[#1F3FCF] shadow-[inset_0_-6px_0_rgba(0,0,0,0.08)] sm:text-[34px]">
                    {formatPoints(score.score)}
                  </div>
                </div>

                <div className="rounded-[36px] bg-[#234DDC] px-6 py-6 shadow-[0_22px_44px_rgba(15,65,184,0.35)] sm:px-8">
                  <div className="text-lg font-semibold uppercase tracking-wide text-white/90">
                    Nuevo record
                  </div>
                  <div className="mt-4 rounded-full bg-[#FFD730] px-6 py-3 text-center text-3xl font-black text-[#1F3FCF] shadow-[inset_0_-6px_0_rgba(0,0,0,0.08)] sm:text-[34px]">
                    {formatPoints(score.record, { signed: true })}
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-6">
                <Link
                  href="/ranking"
                  className="inline-flex w-full items-center justify-center rounded-full bg-[#1D4CD8] px-8 py-4 text-lg font-semibold text-white shadow-[0_20px_40px_rgba(17,60,175,0.35)] transition hover:bg-[#163EC2] sm:w-auto"
                >
                  Ver ranking
                </Link>
                <button
                  type="button"
                  onClick={() => setIsLoginOpen(true)}
                  className="inline-flex w-full items-center justify-center rounded-full border border-white px-8 py-4 text-lg font-semibold text-white/90 transition hover:bg-white/10 sm:w-auto"
                >
                  Jugar de nuevo
                </button>
              </div>

              {(isLoading || error) && (
                <div className="rounded-[28px] bg-white/15 px-5 py-4 text-sm font-medium text-white/90 shadow-[0_10px_26px_rgba(16,60,173,0.25)]">
                  {isLoading
                    ? "Cargando tus ultimos resultados..."
                    : error ?? "No fue posible obtener los resultados. Intenta nuevamente en unos momentos."}
                </div>
              )}
            </div>
          </div>
        </section>
      </main>

      <LoginModal open={isLoginOpen} onClose={() => setIsLoginOpen(false)} />
    </div>
  );
}
