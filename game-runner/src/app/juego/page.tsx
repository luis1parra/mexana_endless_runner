"use client";
import { useEffect, useMemo, useState } from "react";
import Image, { type StaticImageData } from "next/image";
import { InvalidInvoiceModal } from "@/components/modals/InvalidInvoiceModal";
import logo from "@/assets/images/logo_mexsana.png";
import avatarBoy from "@/assets/images/avatarman.png";
import avatarGirl from "@/assets/images/avatarwoman.png";
import avatarBoyThumb from "@/assets/images/avatarman_tumb.png";
import avatarGirlThumb from "@/assets/images/avatarwoman_tumb.png";
import { Info } from "@/assets/icons";
import { useRouter } from "next/navigation";
import { api } from "@/services/api";
import type { ScorePayload } from "@/services/api";

type AvatarKey = "boy" | "girl";

type AvatarInfo = {
  image: StaticImageData;
  thumb: StaticImageData;
  label: string;
};

const avatars: Record<AvatarKey, AvatarInfo> = {
  boy: {
    image: avatarBoy,
    thumb: avatarBoyThumb,
    label: "Hombre Mexsana",
  },
  girl: {
    image: avatarGirl,
    thumb: avatarGirlThumb,
    label: "Mujer Mexsana",
  },
};

const fallbackNickname = "Jugador Mexsana";

export default function JuegoPage() {
  const [nickname, setNickname] = useState(fallbackNickname);
  const [selectedAvatar, setSelectedAvatar] = useState<AvatarKey>("boy");
  const [showGame, setShowGame] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [sessionIdUserGame, setSessionIdUserGame] = useState<string | number | null>(null);
  const [isStartingGame, setIsStartingGame] = useState(false);
  const [startError, setStartError] = useState<string | null>(null);
  const [tutorialQS, setTutorialQS] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    try {
      const rawSession = window.localStorage.getItem("session");
      if (!rawSession) {
        return;
      }

      const parsed = JSON.parse(rawSession) as {
        nickname?: unknown;
        selected?: unknown;
        avatar?: unknown;
        avatar_preference?: unknown;
        id_user_game?: unknown;
      };

      if (typeof parsed.nickname === "string" && parsed.nickname.trim().length > 0) {
        setNickname(parsed.nickname.trim());
      }

      if (parsed.avatar === "girl" || parsed.avatar === "boy") {
        setSelectedAvatar(parsed.avatar);
      } else if (parsed.avatar === "M" || parsed.avatar === "H") {
        setSelectedAvatar(parsed.avatar === "M" ? "girl" : "boy");
      } else if (parsed.avatar_preference === "girl" || parsed.avatar_preference === "boy") {
        setSelectedAvatar(parsed.avatar_preference);
      } else if (typeof parsed.selected === "boolean") {
        setSelectedAvatar(parsed.selected ? "girl" : "boy");
      }

      if (typeof parsed.id_user_game === "string" || typeof parsed.id_user_game === "number") {
        setSessionIdUserGame(parsed.id_user_game);
      }
    } catch {
      // Ignoramos errores de lectura/parseo del storage.
    }
  }, []);

  // Bridge para que el juego (iframe) envíe el puntaje y esperemos la respuesta
  useEffect(() => {
    if (typeof window === "undefined") return;
    const g = window as unknown as { __submitScore?: (payload: ScorePayload) => Promise<unknown> } & Window;
    g.__submitScore = async (payload: ScorePayload) => {
      return await api.submitScore(payload);
    };
    return () => {
      try {
        delete g.__submitScore;
      } catch {
        // ignore
      }
    };
  }, []);

  // Leer querystring del cliente sin useSearchParams para evitar Suspense en build
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const params = new URLSearchParams(window.location.search || "");
      const t = params.get("enableTutorial");
      if (t !== null && t !== undefined) {
        setTutorialQS(String(t));
      }
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    try {
      const rawSession = window.localStorage.getItem("session");
      const session = rawSession ? (JSON.parse(rawSession) as Record<string, unknown>) : {};
      const avatarCode = selectedAvatar === "girl" ? "M" : "H";
      session.avatar = avatarCode;
      session.avatar_preference = selectedAvatar;
      session.selected = selectedAvatar === "girl";
      window.localStorage.setItem("session", JSON.stringify(session));
    } catch {
      // Ignoramos errores de escritura en el storage.
    }
  }, [selectedAvatar]);

  const activeAvatar = useMemo(() => avatars[selectedAvatar], [selectedAvatar]);
  const selectedAvatarCode = selectedAvatar === "girl" ? "M" : "H";

  const handleStartGame = async () => {
    if (isStartingGame) {
      return;
    }

    setStartError(null);

    let idUserGame: string | number | null = sessionIdUserGame ?? null;

    if (typeof window !== "undefined") {
      try {
        const rawSession = window.localStorage.getItem("session");
        if (rawSession) {
          const parsed = JSON.parse(rawSession) as { id_user_game?: string | number };
          if (parsed?.id_user_game !== undefined && parsed.id_user_game !== null && parsed.id_user_game !== "") {
            idUserGame = parsed.id_user_game;
            setSessionIdUserGame(parsed.id_user_game);
          }
        }
      } catch {
        // Ignoramos errores al re-leer el storage para no bloquear el flujo.
      }
    }

    if (idUserGame === null || idUserGame === undefined || (typeof idUserGame === "string" && idUserGame.trim().length === 0)) {
      setStartError("No encontramos tu sesión activa. Vuelve a ingresar para jugar.");
      return;
    }

    setIsStartingGame(true);

    try {
      const response = await api.updateAvatar({
        id_user_game: idUserGame,
        avatar: selectedAvatarCode,
      });

      const possibleError =
        typeof response === "object" && response !== null
          ? [response.error, response.data && typeof response.data === "object" ? (response.data as { error?: unknown }).error : undefined].find(
              (message) => typeof message === "string" && message.trim().length > 0,
            )
          : undefined;

      if (possibleError) {
        throw new Error(String(possibleError).trim());
      }

      if (
        typeof response === "object" &&
        response !== null &&
        ((response.success !== undefined && response.success === false) || (response.data && typeof response.data === "object" && (response.data as { success?: unknown }).success === false))
      ) {
        throw new Error("No fue posible actualizar tu avatar.");
      }

      // Exponer selección también en window por si se usa fuera del iframe
      // Nota: el juego corre en un iframe con su propio window; pasamos el valor por querystring.
      window.PLAYER_VARIANT = selectedAvatar;
      setShowGame(true);
    } catch (error) {
      setStartError(error instanceof Error ? error.message : "No fue posible iniciar el juego.");
    } finally {
      setIsStartingGame(false);
    }
  };

  if (showGame) {
    return (
      <div className="min-h-screen bg-black">
        <iframe
          src={`../game/index.html?player_variant=${encodeURIComponent(selectedAvatar)}${tutorialQS ? `&tutorial=${encodeURIComponent(tutorialQS)}` : ""}`}
          title="Mexsana Endless Runner"
          className="h-screen w-full border-0"
          allow="autoplay; fullscreen"
        />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-white text-[#0B1E52]">
      <main className="flex mx-auto w-full flex-1 px-2 py-6 lg:px-10 lg:py-16">
        <section className="relative w-full rounded-[24px] bg-white bg-[url('../assets/images/juegobackground_mobile.png')] bg-cover bg-center bg-no-repeat px-3 py-12 pt-2 text-white lg:bg-[url('../assets/images/gamedinamicbackground.png')] md:px-8 lg:rounded-[48px] lg:px-12">
          <div className="relative z-10 w-full justify-center px-0">
            <div className="flex w-full flex-col my-1">
              {/* <div className="flex items-center justify-center text-3xl font-black text-white drop-shadow-lg md:text-4xl"> */}
              <div className="w-1/5 min-w-[130px] max-w-[550px] absolute left-1/2 -top-3 transform -translate-x-1/2 bg-white px-8 py-2 rounded-b-[50px] lg:px-10">
                <Image src={logo} alt="Mexsana" />
              </div>

               <section className="relative top-10 bg-white/0 relative mt-10 flex flex-1 flex-col md:flex-row md:items-center lg:gap-16">
                <div className="bg-red-400/0 relative hidden flex-col items-center text-center md:w-[40%] md:flex">
                  <span className="text-lg font-semibold text-white/85">{activeAvatar.label}</span>
                  <div className="relative mt-8 w-full">
                    <Image
                      src={activeAvatar.image}
                      alt={activeAvatar.label}
                      className="w-full object-contain drop-shadow-[0_25px_45px_rgba(5,21,76,0.48)]"
                      sizes="(max-width: 1024px) 80vw, 360px"
                      priority
                    />
                  </div>
                </div>

                <div className="relative mt-10 flex flex-1 flex-col gap-8 lg:mt-0">
                  <div>
                    <p className="text-xl font-semibold text-white/90">¡Hola {nickname || fallbackNickname}!</p>
                    <h1 className="mt-3 text-[48px] font-black leading-[1.05] md:text-[56px] lg:text-[64px]">Escoge tu avatar Favorito</h1>
                    <p className="mt-5 w-full text-base leading-relaxed text-white/85 md:text-lg">
                      Selecciona tu avatar preferido y da inicio a la recolección de los Big Promos de Mexsana por toda la ciudad.
                    </p>
                  </div>

                  <div className="flex flex-row self-center md:self-start">
                    {(Object.keys(avatars) as AvatarKey[]).map((key) => {
                      const avatarOption = avatars[key];
                      const isActive = key === selectedAvatar;
                      return (
                        <button
                          key={key}
                          type="button"
                          onClick={() => setSelectedAvatar(key)}
                          className={`cursor-pointer rounded-[10px] mx-3 p-1 transition-all focus:outline-none focus-visible:ring-4 focus-visible:ring-white/40 ${
                            isActive ? "border-white bg-white text-[#1A2798] shadow-[0_20px_40px_rgba(11,33,110,0.35)]" : "border-transparent bg-white/18 text-white hover:bg-white/28"
                          }`}
                          aria-pressed={isActive}>
                          <div className="flex flex-col items-center">
                            <Image src={avatarOption.thumb} alt={avatarOption.label} className="w-28 object-contain rounded-[8px]" />
                          </div>
                        </button>
                      );
                    })}
                  </div>

                  <div className="bg-blue-400/0 relative flex flex-col items-center text-center max-w-[300px] self-center md:w-[40%] md:hidden">
                    <span className="text-lg font-semibold text-white/85">{activeAvatar.label}</span>
                    <div className="relative mt-4 w-full">
                      <Image
                        src={activeAvatar.image}
                        alt={activeAvatar.label}
                        className={`w-full object-contain drop-shadow-[0_25px_45px_rgba(5,21,76,0.48)] ${selectedAvatarCode=='H'?'bg-[var(--cpthumbh)]/90':'bg-[var(--cpthumbm)]/90'}`}
                        sizes="(max-width: 1024px) 80vw, 360px"
                        priority
                      />
                    </div>
                  </div>

                  <div className="flex flex-col gap-6">
                    <div className="flex items-start gap-3 rounded-[32px] bg-white/90 px-6 py-5 text-[#11308F] shadow-[0_25px_45px_rgba(11,37,117,0.28)]">
                      <span className="pt-2"><Info /></span>
                      <p className="text-sm leading-relaxed md:text-base">
                        Nota: Una vez que ingreses a la partida, no podrás salir del juego. Si lo haces, perderás la oportunidad de jugar y tendrás que ingresar una nueva factura.
                      </p>
                    </div>

                    <div className="flex flex-row-reverse self-center md:self-end">
                      <button
                        type="button"
                        onClick={handleStartGame}
                        disabled={isStartingGame}
                        className={`cursor-pointer w-fit rounded-full px-10 py-4 text-lg font-semibold text-[var(--cpdblue)] shadow-[0_22px_44px_rgba(12,35,106,0.35)] transition ${
                          isStartingGame ? "cursor-not-allowed bg-white/80 text-[#1D3FCE]/70" : "bg-white hover:bg-[#F2F6FF]"
                        }`}
                        aria-busy={isStartingGame}>
                        {isStartingGame ? "Iniciando..." : "Iniciar juego"}
                      </button>

                      {startError && <p className="max-w-md rounded-[24px] bg-white/90 px-5 py-3 text-sm font-semibold text-[#D52D2D] shadow-[0_12px_24px_rgba(12,35,106,0.2)]">{startError}</p>}

                      {/* <button
                        type="button"
                        onClick={() => setIsModalOpen(true)}
                        className="cursor-pointer mx-5 w-fit rounded-full bg-white px-10 py-4 text-lg font-semibold text-[#1D3FCE] shadow-[0_22px_44px_rgba(12,35,106,0.35)] transition hover:bg-[#F2F6FF]">
                        Factura Inválida
                      </button> */}
                    </div>
                  </div>
                </div>
              </section>
            </div>
          </div>
        </section>
      </main>
      <InvalidInvoiceModal open={isModalOpen} onClose={() => setIsModalOpen(false)} onBackToStart={() => router.push("/")} />
    </div>
  );
}
